const multer = require('multer');
const path = require('path');

const UPLOADS_DIR = path.join(__dirname, '../public/uploads');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|webp/;
  const valid = allowed.test(path.extname(file.originalname).toLowerCase()) && allowed.test(file.mimetype);
  cb(valid ? null : new Error('Solo se permiten imágenes (jpg, png, webp)'), valid);
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });

module.exports = { upload };
