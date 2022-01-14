require('dotenv').config();
const express = require('express');
const cloudinary = require('cloudinary').v2;
const multer = require('multer');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image')) {
      cb(null, true);
    } else {
      cb(new Error('Not an image! Please upload only images.'), false);
    }
  },
});

const app = express();

app.post('/images', upload.single('image'), async (req, res, next) => {
  try {
    if (!req.file) {
      throw new Error('Please upload an image');
    }

    const uploaded = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream({ folder: 'my-photos' }, (uploadError, result) => {
          if (uploadError) {
            reject(uploadError);
          } else {
            resolve(result);
          }
        })
        .end(req.file.buffer); // Upload Buffer
    });

    res.json(uploaded);
  } catch (error) {
    next(error);
  }
});

app.use((err, req, res, next) => {
  console.log(err);
  return res.status(500).json({
    message: err.message,
    stack: err.stack,
  });
});

app.listen(5000, () => {
  console.log('Listening on port 5000');
});
