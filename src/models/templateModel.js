import prisma from "../config/database.js";


export class TemplateModel {
    static async createTemplate(templateData) {
        try {
            // Assuming a database operation to create a template
            const newTemplate = await prisma.formTemplate.create({
                data: templateData,
            });
            return newTemplate
        } catch (error) {
            console.error('Error creating template:', error);
            throw error;
        }

    }

    static async findAll({ page = 1, limit = 10, nameFilter = '' }) {
        const take = parseInt(limit, 10);
        const skip = (parseInt(page, 10) - 1) * take;

        const where = nameFilter
            ? {
                name: {
                    contains: nameFilter,
                    mode: 'insensitive',
                },
            }
            : {};

        try {
            // Get total count for pagination metadata
            const totalDocuments = await prisma.formTemplate.count({ where });

            // Fetch templates with pagination and filtering
            const templates = await prisma.formTemplate.findMany({
                where,
                skip,
                take, // use take here, not pageSize
                orderBy: {
                    updatedAt: 'desc', // sort newest first
                },
            });

            return {
                total: totalDocuments,
                page,
                pageSize: take, // pageSize = take
                totalPages: Math.ceil(totalDocuments / take),
                data: templates, // return templates, not documents
            };
        } catch (error) {
            console.error('Error fetching templates:', error);
            throw error;
        }
    }

    static async findById(id) {
        try {
            const template = await prisma.formTemplate.findUnique({
                where: { id },
            });
            return template;
        } catch (error) {
            console.error('Error fetching template by ID:', error);
            throw error;
        }
    }

    static async update(id, updateData) {
        try {
            const updatedTemplate = await prisma.formTemplate.update({
                where: { id },
                data: updateData,
            });
            return updatedTemplate;
        } catch (error) {
            console.error('Error updating template:', error);
            throw error;
        }
    }
}