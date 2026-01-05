import multer from "multer";
import path from "path";
import fs from "fs";
import crypto from "crypto";

const uploadDir = path.join(
  process.cwd(),
  "public",
  "uploads",
  "variants"
);

// ensure folder exists
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, uploadDir);
  },
  filename(req, file, cb) {
    cb(
      null,
      crypto.randomUUID() + path.extname(file.originalname)
    );
  },
});

function fileFilter(req, file, cb) {
  if (!file.mimetype.startsWith("image/")) {
    return cb(new Error("Only image files allowed"), false);
  }
  cb(null, true);
}

export const uploadVariantImagesFile = multer({
  storage,
  fileFilter,
});
