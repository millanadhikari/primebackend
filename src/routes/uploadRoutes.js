// /routes/upload.js
import express from 'express'
const router = express.Router();
import { parser } from '../middleware/multer.js';
import { deleteFileFromCloudinary } from '../config/cloudinary.js';


router.post("/", parser.single("file"), (req, res) => {
    try {
        const url = req.file?.path;
        const publicId = req.file?.filename; // 🔥 This is the Cloudinary public_id

        if (!url || !publicId) {
            return res.status(400).json({ error: "Upload failed: missing data" });
        }

        return res.status(200).json({ url, publicId });
    } catch (error) {
        console.error("Upload error:", error);
        return res.status(500).json({ error: "Upload failed" });
    }
});


router.delete("/", async (req, res) => {
    const { publicId } = req.body;

    if (!publicId) {
        return res.status(400).json({ error: "publicId is required" });
    }

    try {
        const result = await deleteFileFromCloudinary(publicId);
        res.status(200).json({ message: "Deleted successfully", result });
    } catch (error) {
        res.status(500).json({ error: "Delete failed", details: error.message });
    }
});

export default router;
