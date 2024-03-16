import { google } from 'googleapis';

class GDrive {
  constructor(auth) {
    this.drive = google.drive({ version: 'v3', auth });
  }

  async listFiles() {
    const res = await this.drive.files.list({
      fields: 'files(id, name, mimeType, parents)'
    });
    return res.data.files;
  }

  async createFile(name, mimeType, content) {
    const fileMetadata = {
      name: name,
    };

    const media = {
      mimeType: mimeType,
      body: content,
    };

    const res = await this.drive.files.create({
      resource: fileMetadata,
      media: media,
      fields: 'id',
    });

    return res.data;
  }

  async deleteFile(fileId) {
    const res = await this.drive.files.delete({
      fileId: fileId,
    });

    return res.data;
  }
}

export default GDrive;