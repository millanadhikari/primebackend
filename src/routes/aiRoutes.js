import express from "express";
import { AiController } from "../controllers/aiController.js";


const router = express.Router();
router.post('/generate-content', AiController.generateContent);
router.post('/generate-image', AiController.generateImage); // Assuming you have a method for image generation




export default router