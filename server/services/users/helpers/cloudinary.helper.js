import fs from "fs";
import cloudinary from "../config/cloudinary.config.js";

const uploadFileToCloudinary = async (filePath, folderName = "uploads") => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: folderName,
      width: 400,
      height: 400,
      crop: "fill",
    });

    // Xóa file tạm trên server
    fs.unlinkSync(filePath);

    return {
      url: result.secure_url,
      public_id: result.public_id,
    };
  } catch (err) {
    // Xóa file tạm nếu upload fail
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    throw err;
  }
};

export { uploadFileToCloudinary };
