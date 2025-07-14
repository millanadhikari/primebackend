import express from "express";
import { getCloudinaryUsage, getNeonUsage } from "../config/cloudinary.js";

const router = express.Router()

//Get cloudinary usage

router.get("/", async (req, res) => {
    try {
        const response = await getCloudinaryUsage()
        if (!response) {
            return res.status(response.status).json({ error: 'Failed to fetch Cloudinary usage' });
        }


        return res.json(response);
    } catch (error) {
        console.error('Cloundary usage error', error)
        res.status(500).json({ error: 'Internal server error' });
    }
})

router.get("/neon", async (req, res) => {
    try {
        const response = await getNeonUsage()
        if (!response) {
            return res.status(response.status).json({ error: 'Failed to fetch neon usage' });
        }


        return res.json(response);
    } catch (error) {
        console.error('Neon usage error', error)
        res.status(500).json({ error: 'Internal server error' });
    }
})

export default router