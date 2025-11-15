import createHttpError from "http-errors";
import uploadFiles from "../helpers/upload.js";

const MESSAGE_IMAGES_FOLDER = "message_images";

const uploadMessageImages = async (req, res, next) => {
  try {
    const images = req.files;

    if (!images || !images.length === 0)
      throw createHttpError.BadRequest("Không có file ảnh nào được cung cấp.");

    const options = {
      folder: MESSAGE_IMAGES_FOLDER,
      use_filename: true,
      unique_filename: false,
      overwrite: true,
    };

    const uploadedResults = await uploadFiles(images, options);

    const uploadedImages = uploadedResults.map((item) => ({
      ...item,
      type: "image",
    }));

    res.status(200).json({
      message: "Upload thành công",
      uploadedImages,
    });
  } catch (error) {
    next(error);
  }
};

export { uploadMessageImages };
