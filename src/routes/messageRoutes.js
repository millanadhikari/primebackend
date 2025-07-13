import express from "express";
import { MessageController } from "../controllers/messageController.js";

const router = express.Router();

//Create Message
router.post("/send", MessageController.sendMessage);

//Get all messages  
router.get("/", MessageController.getAllMessages);

// Get a message by ID  
router.get('/:id', MessageController.getById);

// Update a message (if needed, you can implement this in the controller)
router.put('/:id', MessageController.updateMessage); // Uncomment if you implement update functionality

// Delete a message
router.delete('/:id', MessageController.deleteMessage);

export default router;