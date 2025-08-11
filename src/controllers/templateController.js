import { TemplateService } from "../services/templateService.js";

export class TemplateController {

    static async createTemplate(req, res, next) {
        try {
            const templateData = req.body;

            // Validate required fields
            if (!templateData.name || !templateData.fields) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Template name and content are required',
                });
            }

            const newTemplate = await TemplateService.createTemplate(templateData);

            res.status(201).json({
                status: 'success',
                message: 'Template created successfully',
                data: {
                    template: newTemplate,
                },
            });
        } catch (error) {
            next(error);
        }
    }

    // Get all templates
    static async getAllTemplates(req, res, next) {
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const nameFilter = req.query.nameFilter || ''; try {
            const templates = await TemplateService.getAllTemplates({ page, limit, nameFilter });

            res.status(200).json({
                status: 'success',
                message: 'Templates fetched successfully',
                data: {
                    templates,
                },
            });
        } catch (error) {
            next(error);
        }
    }
    // Get a template by ID
    static async getTemplateById(req, res, next) {
        console.log('Fetching template by ID:', req.params.id);
        try {
            const { id } = req.params;

            const template = await TemplateService.getTemplateById(id);

            if (!template) {
                return res.status(404).json({
                    status: 'error',
                    message: 'Template not found',
                });
            }

            res.status(200).json({
                status: 'success',
                message: 'Template fetched successfully',
                data: {
                    template,
                },
            });
        } catch (error) {
            next(error);
        }
    }

    // Update a template by ID
    static async updateTemplateById(req, res, next) {
        try {
            const { id } = req.params;
            const templateData = req.body;

            // Validate required fields
            if (!templateData.name || !templateData.fields) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Template name and content are required',
                });
            }

            const updatedTemplate = await TemplateService.updateTemplateById(id, templateData);

            if (!updatedTemplate) {
                return res.status(404).json({
                    status: 'error',
                    message: 'Template not found',
                });
            }

            res.status(200).json({
                status: 'success',
                message: 'Template updated successfully',
                data: {
                    template: updatedTemplate,
                },
            });
        } catch (error) {
            next(error);
        }
    }
}