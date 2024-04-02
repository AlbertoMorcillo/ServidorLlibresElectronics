import express from 'express'; 
import { google } from 'googleapis';
import GDrive from './public/js/GDrive.js';
import fs from 'fs';
import multer from 'multer';
import { DOMParser } from 'xmldom';
import JSZip from 'jszip';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const upload = multer({ dest: 'uploads/' });
const app = express();
const port = 8080;
const idCarpetaDrive = '1N3RNMxqqS708J03uatXP2U4lFDOQP2_E';

app.use(express.json());

const config = JSON.parse(fs.readFileSync('./config.json', 'utf8'));

const oauth2Client = new google.auth.OAuth2(
  config.oauth2Credentials.client_id,
  config.oauth2Credentials.client_secret,
  config.oauth2Credentials.redirect_uri
);

oauth2Client.setCredentials({
  refresh_token: config.oauth2Credentials.refresh_token
});

const gdrive = new GDrive(oauth2Client);

app.get('/files', async (req, res) => {
  try {
    const files = await gdrive.obtenerArchivos(idCarpetaDrive);
    res.json(files);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error al recuperar los archivos');
  }
});

app.post('/cargarEbook', upload.single('file'), async (req, res) => {
  let accio = req.body.accio;
  let archiu = req.file;

  if(accio == "cargarEbook"){
    try {
      console.log(archiu.path, archiu.mimetype, archiu.originalname);
      const file = await gdrive.guardarArchivo(archiu.path, archiu.mimetype, "1N3RNMxqqS708J03uatXP2U4lFDOQP2_E", archiu.originalname);
      res.json(file);
    } catch (error) {
      res.status(500).send('Error creando archivo');
    }
  }
});

app.delete('/file/:id', async (req, res) => {
  const { id } = req.params;
  
  try {

    const localFilePath = `./uploads/${id}.epub`;

    await gdrive.borrarArchivo(id);

    // Verifica si el archivo local existe y bórralo
    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
      console.log(`Archivo local ${id}.epub eliminado.`);
    } else {
      console.log(`Archivo local ${id}.epub no se encontró, puede que ya haya sido eliminado.`);
    }

    res.json({ message: 'El archivo ha sido eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar el archivo:', error);
    res.status(500).send('Error al eliminar el archivo');
  }
});



app.get('/read-book/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const response = await gdrive.obtenerArchivo(id);
    const rutaLocal = `./uploads/${id}.epub`;
    
    if (!fs.existsSync('./uploads/')) {
      fs.mkdirSync('./uploads/');
    }

    if (response.data && response.data.pipe) {
      const dest = fs.createWriteStream(rutaLocal);
      response.data.pipe(dest);

      dest.on('finish', async () => {
        const data = fs.readFileSync(rutaLocal);
        const zip = new JSZip();
        const capituloUrls = await descomprimirEpub(data, id);
        res.json({ capituloUrls });
      });

      dest.on('error', (err) => {
        console.error('Error al escribir el archivo ePub en el servidor:', err);
        res.status(500).send('Error al procesar el archivo');
      });
    } else {
      throw new Error('Response data is not a stream');
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Error al recuperar el archivo');
  }
});

app.get('/file/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const response = await gdrive.obtenerArchivo(id);
    const rutaLocal = `./uploads/${id}.epub`;

    if (!fs.existsSync('./uploads/')) {
      fs.mkdirSync('./uploads/');
    }

    if (response && response.pipe) {
      const dest = fs.createWriteStream(rutaLocal);
      response.pipe(dest);

      dest.on('finish', () => {
        res.download(rutaLocal); // Descargar el archivo
      });

      dest.on('error', (err) => {
        console.error('Error al escribir el archivo ePub en el servidor:', err);
        res.status(500).send('Error al procesar el archivo');
      });
    } else {
      throw new Error('Response data is not a stream');
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Error al recuperar el archivo');
  }
});

// Descomprimir archivo .epub
async function descomprimirEpub(rutaLocal, id) {
  const rutaDestino = `./public/ebooks/${id}/`;

  // Crear carpeta de destino si no existe
  if (!fs.existsSync(rutaDestino)) {
    fs.mkdirSync(rutaDestino, { recursive: true });
  }

  // Leer el archivo EPUB
  const epubData = fs.readFileSync(rutaLocal);
  const zip = new JSZip();
  await zip.loadAsync(epubData);

  // Función para extraer los archivos del zip a disco
  async function extraerYGuardar(zipObj, rutaDestino) {
    const zipEntries = Object.keys(zipObj.files);
    for (let entryName of zipEntries) {
      const entry = zipObj.files[entryName];
      if (!entry.dir) {
        const content = await entry.async('nodebuffer');
        const fullPath = path.join(rutaDestino, entryName);
        fs.mkdirSync(path.dirname(fullPath), { recursive: true });
        fs.writeFileSync(fullPath, content);
      }
    }
  }

  await extraerYGuardar(zip, rutaDestino);

  // Acceder a container.xml y content.opf
  const containerXmlContent = await zip.file("META-INF/container.xml").async("string");
  const rutaContentOpf = /full-path="([^"]+)"/.exec(containerXmlContent)[1];
  const contentOpf = await zip.file(rutaContentOpf).async("string");

  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(contentOpf, 'text/xml');

  const capituloUrls = [];
  const spineItems = xmlDoc.getElementsByTagName('itemref');

  for (let i = 0; i < spineItems.length; i++) {
    const idref = spineItems[i].getAttribute('idref');
    const itemElement = xmlDoc.getElementById(idref);
    if (itemElement) {
      const href = itemElement.getAttribute('href');
      capituloUrls.push(`${rutaDestino}${href}`);
    }
  }

  return capituloUrls;
}

app.post('/folder', async (req, res) => {
  try {
    const { name, parentId } = req.body;
    const folder = await gdrive.crearCarpeta(name, parentId);
    res.json(folder);
  } catch (error) {
    res.status(500).send('Error creando carpeta');
  }
});

let usuaris = [];

app.use(express.static('public'));

app.get('/', (req, res) => {
  const base = 'http://' + req.headers.host + '/';
  const url = new URL(req.url, base);

  let filename = "." + url.pathname;
  if (filename == "./") filename += "index.html";

  if (existsSync(filename)) {
      console.log("------\nEnviant " + filename);
      const contentType = tipusArxiu(filename);
      if (contentType) {
          readFile(filename, (err, data) => {
              if (err) {
                  res.status(500).send('Error reading the file');
              } else {
                  res.setHeader('Content-Type', contentType);
                  res.send(data);
              }
          });
      } else {
          res.status(500).send('Unknown file type');
      }
  } else {
      res.status(404).send('File not found');
  }
});

app.delete('/uploads/:id', (req, res) => {
  const { id } = req.params;
  const rutaArchivo = path.join(__dirname, 'uploads', `${id}.epub`);

  try {
      if (fs.existsSync(rutaArchivo)) {
          fs.unlinkSync(rutaArchivo);
          res.send({ message: 'Archivo local eliminado con éxito.' });
      } else {
          res.status(404).send({ message: 'Archivo no encontrado.' });
      }
  } catch (error) {
      res.status(500).send({ message: 'Error al eliminar el archivo local.' });
  }
});


app.post('/loginUsuari', (req, res) => {
  let data = req.body;
  console.log(data);
  if (data.accio === "login") {
      let user = data.user;
      let isAdmin = data.isAdmin;
      if (user !== '') {
          //! IMPLEMENTAR LA LÓGICA DE AUTENTICACIÓN DE USUARIOS AQUÍ
          res.json({
              accio: "loginSuccess",
              isAdmin: isAdmin,
              message: `Bienvenido/a, ${user}${isAdmin ? ' (Admin)' : ''}`,
          });
      } else {
          res.status(400).json({
              accio: "loginFailed",
              message: "Por favor, ingrese un nombre de usuario."
          });
      }
  } else {
     
      res.status(400).json({
          accio: "unknownAction",
          message: "Acción desconocida."
      });
  }
});

app.get('/drive-folder-id', (req, res) => {
  res.json({ id: idCarpetaDrive });
});

app.get('/load-files', async (req, res) => {
  try {
    const drive = google.drive({ version: 'v3', auth: oauth2Client });
    const response = await drive.files.list({
      q: `'${idCarpetaDrive}' in parents`,
    });
    res.json(response.data.files);
  } catch (error) {
    res.status(500).send(error);
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});