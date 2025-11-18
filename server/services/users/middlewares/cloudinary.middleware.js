import multer from "multer";
import cloudinary from "../config/cloudinary.config.js";
import fs from "fs";
import path from "path";

// Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = "uploads/";
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  },
});

// File filter
const imageFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp|jfif/;
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );
  const mimetype = allowedTypes.test(file.mimetype.toLowerCase());
  if (extname && mimetype) cb(null, true);
  else cb(new Error("Only image files are allowed"));
};

// Middleware Multer
const uploadImg = multer({ storage, fileFilter: imageFilter });

export { uploadImg };
