// middleware/upload.js
import multer from "multer";
import path from "path";
import fs from "fs";

const __dirname = path.resolve();

// REAL directory path
const uploadDir = path.join(__dirname, "public", "uploads");

// Create folder if it doesn't exist
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const newFileName = Date.now() + path.extname(file.originalname);
    cb(null, newFileName);
  },
});

function fileFilter(req, file, cb) {
  if (!file.mimetype.startsWith("image/")) {
    return cb(new Error("Only image files are allowed!"), false);
  }
  cb(null, true);
}

const limits = {
  fileSize: 5 * 1024 * 1024, // 5MB
};

export const uploadCategory = multer({ storage, fileFilter, limits });
