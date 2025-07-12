import cloudinary from '../config/cloudinary.js';
import prisma from '../config/database.js';
import { extractPublicId } from '../utils/cloudinaryUtils.js';

export class BlogModel {
    static async createPost(postData) {
        // Simulate database operation
        const cleanData = postData
        console.log("Creating post with data:", cleanData);
        try {
            const post = await prisma.blog.create({
                data: cleanData,
                select: {
                    id: true,
                    title: true,
                    content: true,
                    createdAt: true,
                    updatedAt: true,
                }
            });

        } catch (error) {
            console.error('Error in createPost:', error);
            throw error;
        }
    }

    static async findAll({ page = 1, limit = 10, search = '', status = 'all', type = 'all' }) {
        const take = parseInt(limit, 10);
        const skip = (parseInt(page, 10) - 1) * take;

        const filters = [];

        // 🔍 Search by name, email, phone
        if (search) {
            filters.push({
                OR: [
                    { author: { contains: search, mode: 'insensitive' } },
                    { title: { contains: search, mode: 'insensitive' } },


                ],
            });
        }

        if (status !== 'all') {
            filters.push({
                status: {
                    equals: status,
                    mode: 'insensitive',
                }
            });
        }

        if (type !== 'all') {
            filters.push({
                type: {
                    equals: type,
                    mode: 'insensitive',
                }
            });
        }

        const where = filters.length ? { AND: filters } : {};
        const [blogs, total] = await Promise.all([
            prisma.blog.findMany({
                where,
                take,
                skip,
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    title: true,
                    author: true,
                    type: true,
                    status: true,
                    excerpt: true,
                    publishDate: true,
                    isFeatured: true,

                    // Add other summary fields if needed (e.g., createdAt)
                },
            }),
            prisma.blog.count({ where }),
        ]);

        return {
            blogs: blogs,
            pagination: {
                total,
                page: parseInt(page, 10),
                limit: parseInt(limit, 10),
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    static async findById(id) {
        // Simulate fetching a post by ID
        console.log(`Fetching post with ID: ${id}`);
        return prisma.blog.findUnique({
            where: { id },
            select: {
                id: true,
                title: true,
                content: true,
                excerpt: true,
                author: true,
                type: true,
                status: true,
                publishDate: true,
                featuredImage: true,
                tags: true,
                metaTitle: true,
                metaDescription: true,
                isFeatured: true,
                slug: true,
                createdAt: true,
                updatedAt: true,
            }
        })
    }

    static async update(postId, updateData) {
        try {
            if (updateData.isFeatured === true) {
                await prisma.$transaction(async (tx) => {
                    // Clear previous featured blog(s) except current postId
                    await tx.blog.updateMany({
                        where: {
                            isFeatured: true,
                            id: { not: postId },
                        },
                        data: { isFeatured: false },
                    });

                    // Update current blog post
                    await tx.blog.update({
                        where: { id: postId },
                        data: updateData,
                        select: {
                            id: true,
                            title: true,
                            content: true,
                            updatedAt: true,
                        },
                    });
                });
            } else {
                await prisma.blog.update({
                    where: { id: postId },
                    data: updateData,
                    select: {
                        id: true,
                        title: true,
                        content: true,
                        updatedAt: true,
                    },
                });
            }
            return ({ message: "Blog updated" });
        } catch (error) {
            console.log({ error: error.message });
        }
    }


    static async deleteById(id) {
        const blog = await prisma.blog.findUnique({
            where: { id: id },

        })
        console.log("Blog to delete:", blog);
        if (blog.featuredImage) {
            const publicId = extractPublicId(blog.imagePublicId);
            await cloudinary.uploader.destroy(publicId);
        }

        try {
            return await prisma.blog.delete({
                where: { id },
                select: {
                    id: true,
                    title: true,
                }
            });

        } catch (error) {
            console.error('Error deleting post:', error);
            throw error;
        }
    }
}