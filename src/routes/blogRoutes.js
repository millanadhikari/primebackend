import express from 'express';
import { BlogController } from '../controllers/blogController.js';

const router = express.Router()
router.post('/create', BlogController.createPost);
router.get('/', BlogController.getAllPosts);
router.get('/:id', BlogController.getById);

// Update a blog post   
router.put('/:id', BlogController.updatePost);

// Delete a blog post
router.delete('/:id', BlogController.deletePost);
export default router;