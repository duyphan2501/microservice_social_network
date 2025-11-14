import multer from "multer";
import path from "path";
import fs from "fs"

// Thư mục lưu file tạm thời
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = "uploads/";
    // Kiểm tra và tạo thư mục nếu nó không tồn tại
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, filename);
  },
});

// uploadImage.js
const imageFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp|jfif/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype.toLowerCase());
  if (extname && mimetype) cb(null, true);
  else cb(new Error("Only image files are allowed"));
};

const uploadImg = multer({ storage, fileFilter: imageFilter });

// uploadFile.js
const docFilter = (req, file, cb) => {
  const allowedTypes = /pdf|doc|docx|ppt|xlsx|txt/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype.toLowerCase());
  if (extname && mimetype) cb(null, true);
  else cb(new Error("Only document files are allowed"));
};

const uploadDoc = multer({ storage, fileFilter: docFilter });

export const mediaFilter = (req, file, cb) => {
    // Cho phép cả ảnh và video
    const allowedImageTypes = /jpeg|jpg|png|gif|webp|jfif/;
    const allowedVideoTypes = /mp4|avi|mkv|mov|wmv|flv|webm/;

    const extname = 
        allowedImageTypes.test(path.extname(file.originalname).toLowerCase()) ||
        allowedVideoTypes.test(path.extname(file.originalname).toLowerCase());
        
    const mimetype = 
        allowedImageTypes.test(file.mimetype.toLowerCase()) ||
        allowedVideoTypes.test(file.mimetype.toLowerCase());

    if (extname && mimetype) cb(null, true);
    else cb(new Error("Chỉ cho phép file ảnh hoặc video hợp lệ."));
};

const uploadMedia = multer({ storage, fileFilter: mediaFilter });


export { uploadImg, uploadDoc, uploadMedia };
