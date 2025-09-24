// server/index.js
const express = require('express');
const multer = require('multer');
const AWS = require('aws-sdk');
const cors = require('cors');
const app = express();
const upload = multer();

// R2 credentials and config
const s3 = new AWS.S3({
  endpoint: 'https://e3d5fb1ebe387d015b27453489d60473.r2.cloudflarestorage.com',
  accessKeyId: 'b6fd281404f86a28d6e5737b41ad0ccc',
  secretAccessKey: '0cd0c9307239b422b7a1556050ec18a426b277d1647fbe94cadd1312c7bedf4d',
  signatureVersion: 'v4',
  region: 'auto'
});

app.use(cors());

app.post('/api/upload-to-r2', upload.single('file'), async (req, res) => {
  const file = req.file;
  const filename = req.body.filename;
  if (!file || !filename) {
    return res.status(400).json({ error: 'File and filename required' });
  }
  try {
    await s3.putObject({
      Bucket: 'aayiram-bathery',
      Key: filename,
      Body: file.buffer,
      ContentType: file.mimetype,
      ACL: 'public-read'
    }).promise();
    const url = `https://pub-1560e47becfe44d3abc923d667d603c2.r2.dev/aayiram-bathery/${filename}`;
    console.log(`Uploaded to R2: ${filename} (${url})`);
    res.json({ url });
  } catch (err) {
    console.error('R2 upload error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(3001, () => console.log('Backend running on port 3001'));
