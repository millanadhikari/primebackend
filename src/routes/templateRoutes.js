import express from "express";
import { TemplateController } from "../controllers/templateController.js";

const router = express.Router();

//Create Message
router.post("/", TemplateController.createTemplate);

router.get("/", TemplateController.getAllTemplates); // Assuming you have a method to get all templates

router.get("/:id", TemplateController.getTemplateById); // Assuming you have a method to get a template by ID
 
router.put("/:id", TemplateController.updateTemplateById); // Assuming you have a method to update a template by ID

// // Update a message (if needed, you can implement this in the controller)
// router.put('/:id', MessageController.updateMessage); // Uncomment if you implement update functionality

// // Delete a message
// router.delete('/:id', MessageController.deleteMessage);

export default router;