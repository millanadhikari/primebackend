import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";  // add .js extension

const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: "crm_uploads",
        allowed_formats: ["jpg", "jpeg", "png", "pdf", "docx"],
    },
});

const parser = multer({ storage });

export { parser };