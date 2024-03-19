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
    const files = await gdrive.listFiles();
    res.json(files);
  } catch (error) {
    res.status(500).send('Error retrieving files');
  }
});

app.post('/file', async (req, res) => {
  try {
    const { name, mimeType, content } = req.body;
    const file = await gdrive.createFile(name, mimeType, content);
    res.json(file);
  } catch (error) {
    res.status(500).send('Error creating file');
  }
});

app.delete('/file/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const response = await gdrive.deleteFile(id);
    res.json(response);
  } catch (error) {
    res.status(500).send('Error deleting file');
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

app.post('/cargarEbook', upload.single('file'), (req, res) => {
  let accio = req.body.accio;
  let file = req.file; // file is now in req.file

  if(accio == "cargarEbook"){
    peticio.append("file", archiu);
    //Upload file to Google Drive
    gdrive.createFile(file.originalname, file.mimetype, fs.readFileSync(file.path))
      .then((file) => {
        console.log("Uploaded file: " + file.name);
      })
      .catch((error) => {
        console.error(error);
        res.status(500).send('Error uploading file');
      });
      
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
