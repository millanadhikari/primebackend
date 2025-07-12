import { BlogModel } from "../models/blogModel.js";

export class BlogService {
    static async createPost(postData) {
        try {
            const post = await BlogModel.createPost(postData);
            return post;
        } catch (error) {
            console.error('Error in createPost:', error);
            throw error;
        }
    }

    static async getAllPosts(page, limit, search, status, type) {
        try {
            const posts = await BlogModel.findAll(page, limit, search, status, type);
            return posts;
        } catch (error) {
            console.error('Error fetching blog posts:', error);
            throw error;
        }
    }

    // ✅ New method for fetching by ID
    static async getById(id) {
        return await BlogModel.findById(id);
    }

    static async updatePost(postId, updateData) {
        return await BlogModel.update(postId, updateData);
    }

    static async deleteById(id) {
        return await BlogModel.deleteById(id);
    }

    // Update a blog post
    static async updatePost(postId, updateData) {
        try {
            const updatedPost = await BlogModel.update(postId, updateData);
            return updatedPost;
        } catch (error) {
            console.error('Error updating blog post:', error);
            throw error;
        }
    }
}