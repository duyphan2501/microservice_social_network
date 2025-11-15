import cloudinary from "../configs/cloudinary.config.js"
import fs from "fs"

async function uploadFiles(files, options) {
  try {
    const fileArray = Array.isArray(files) ? files : [files];

    const uploadPromises = fileArray.map(async (file, index) => { 
      const result = await cloudinary.uploader.upload(file.path, options);

      fs.unlink(file.path, (err) => {
        if (err) console.error("Error deleting file:", err);
      });

      return { 
        index: index, 
        url: result.secure_url, 
        publicId: result.public_id 
      };
    });

    const resultsWithIndex = await Promise.all(uploadPromises);

    return resultsWithIndex.sort((a, b) => a.index - b.index);

  } catch (error) {
    throw error;
  }
}

export default uploadFiles