import cloudinary from "../configs/cloudinary.config.js";
import fs from "fs";
import ENV from "./env.helper.js";
import ngrok from "ngrok"

// Hàm hiện tại của bạn cho file nhỏ (ảnh, v.v.)
async function uploadFiles(files, options) {
  try {
    const fileArray = Array.isArray(files) ? files : [files];

    const uploadPromises = fileArray.map(async (file, index) => {
      // Vẫn sử dụng upload() cho các file nhỏ/ảnh
      const result = await cloudinary.uploader.upload(file.path, options);

      fs.unlink(file.path, (err) => {
        if (err) console.error("Error deleting file:", err);
      });

      return {
        index: index,
        url: result.secure_url,
        publicId: result.public_id,
      };
    });

    const resultsWithIndex = await Promise.all(uploadPromises);
    return resultsWithIndex.sort((a, b) => a.index - b.index);
  } catch (error) {
    throw error;
  }
}

async function uploadVideoLarge(files, options = {}) {
  try {
    const fileArray = Array.isArray(files) ? files : [files];
    const uploadPromises = fileArray.map((file, index) => {
      return new Promise((resolve, reject) => {
        cloudinary.uploader.upload_large(
          file.path,
          {
            resource_type: "video",
            ...options,
          },
          (error, result) => {
            fs.unlink(file.path, (err) => {
              if (err) console.error("Error deleting local file:", err);
            });

            if (error) {
              console.error(`Lỗi upload file index ${index}:`, error);
              return reject(error);
            }

            if (!result || !result.secure_url || !result.public_id) {
              return reject(new Error("Cloudinary did not return expected result."));
            }

            resolve({
              index,
              url: result.secure_url,
              publicId: result.public_id,
            });
          }
        );
      });
    });

    const results = await Promise.all(uploadPromises);
    return results.sort((a, b) => a.index - b.index);

  } catch (error) {
    console.error("Lỗi trong quá trình uploadVideoLarge:", error);
    throw error;
  }
}



export { uploadFiles, uploadVideoLarge };
