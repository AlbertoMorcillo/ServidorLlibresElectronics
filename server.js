import express from 'express'; 
import { google } from 'googleapis'; 
import GDrive from './public/js/GDrive.js';
import fs from 'fs'; // Import fs for reading the config file

const app = express();
const port = 8080;

// Load OAuth2 credentials from config file
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
  const files = await gdrive.listFiles();
  res.json(files);
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
