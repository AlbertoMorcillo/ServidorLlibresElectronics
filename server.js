import express from 'express'; 
import { google } from 'googleapis';
import GDrive from './public/js/GDrive.js';
import fs from 'fs';
import multer from 'multer';
const upload = multer({ dest: 'uploads/' });

const app = express();
const port = 8080;

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
    const files = await gdrive.listarArchivos();
    res.json(files);
  } catch (error) {
    res.status(500).send('Error retrieving files');
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
  try {
    const { id } = req.params;
    const response = await gdrive.borrarArchivo(id);
    res.json(response);
  } catch (error) {
    res.status(500).send('Error eliminando archivo');
  }
});

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

app.post('/loginUsuari', (req, res) => {
  let miss = req.body;
  console.log(miss);
  if(miss.accio == "login"){
      let user = miss.user;
      if(user != ''){
          usuaris.push(user);
          res.send({accio: "urlHome", url: "view/home.html"});
      }
  }
});


app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
