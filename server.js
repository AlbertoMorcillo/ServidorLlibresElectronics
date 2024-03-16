import express from 'express'; 
import { google } from 'googleapis'; 
import GDrive from './public/js/GDrive.js';
import fs from 'fs'; 

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

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
