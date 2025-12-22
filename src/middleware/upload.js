const multer = require('multer');
const path = require('path');
const fs = require('fs');
const ALLOWED_MIME_TYPES = [
    'application/pdf',
    'application/msword', 
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg',
    'image/png',
    'image/jpg'
];
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = 'uploads/portfolios/';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir); 
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});
const fileFilter = (req, file, cb) => {
   if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
        cb(null, true); 
    } else {
        cb(new Error('Tipe file tidak didukung. Mohon unggah PDF, DOCX, atau Gambar.'), false);
    }
};

const uploadPortofolio = multer({
    storage: storage,
    limits: { fileSize: 1024 * 1024 * 5 }, 
    fileFilter: fileFilter
});

module.exports = uploadPortofolio;