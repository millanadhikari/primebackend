import { BlogService } from "../services/blogService.js";


export class BlogController {
    /**
     * Create a new blog post
     * POST /api/blog/create
     */
    static async createPost(req, res, next) {
        try {
            const postData = req.body;

            const result = await BlogService.createPost(postData);

            res.status(201).json({
                status: 'success',
                message: 'Blog post created successfully',
                data: {
                    post: result,
                },
            });
        } catch (error) {
            next(error);
        }
    }

    // Get all blog posts
    static async getAllPosts(req, res, next) {
        try {
            const { page = 1, limit = 10, search = '', status = 'all', type = 'all' } = req.query;

            const result = await BlogService.getAllPosts({ page, limit, search, status, type });

            res.status(200).json({
                status: 'success',
                message: 'Blog posts fetched successfully',
                data: result,
            });
        } catch (error) {
            next(error);
        }
    }

    // Get a blog post by ID
    static async getById(req, res, next) {
        try {
            const { id } = req.params;

            const post = await BlogService.getById(id);

            if (!post) {
                return res.status(404).json({
                    status: 'error',
                    message: 'Blog post not found',
                });
            }

            res.status(200).json({
                status: 'success',
                data: {
                    post,
                },
            });
        } catch (error) {
            next(error);
        }
    }

    // Update a blog post
    static async updatePost(req, res, next) {
        try {
            const { id } = req.params;
            const updateData = req.body;

            const updatedPost = await BlogService.updatePost(id, updateData);

            if (!updatedPost) {
                return res.status(404).json({
                    status: 'error',
                    message: 'Blog post not found',
                });
            }

            res.status(200).json({
                status: 'success',
                message: 'Blog post updated successfully',
                data: {
                    post: updatedPost,
                },
            });
        } catch (error) {
            next(error);
        }
    }

    // Delete a blog post
    static async deletePost(req, res, next) {
        console.log("Delete post called", req.params);
        try {
            const { id } = req.params;

            const result = await BlogService.deleteById(id);

            if (!result) {
                return res.status(404).json({
                    status: 'error',
                    message: 'Blog post not found',
                });
            }

            res.status(200).json({
                status: 'success',
                message: 'Blog post deleted successfully',
            });
        } catch (error) {
            next(error);
        }
    }
}