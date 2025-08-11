import { TemplateModel } from "../models/templateModel.js";


export class TemplateService {
    static async createTemplate(templateData) {
        try {
            // Assuming TemplateModel is defined similarly to MessageModel
            const newTemplate = await TemplateModel.createTemplate(templateData);
            return newTemplate;
        } catch (error) {
            console.error('Error creating template:', error);
            throw error;
        }
    }

    static async getAllTemplates({ page, limit, nameFilter }) {
        try {
            // Implement pagination and filtering logic here
            const templates = await TemplateModel.findAll({ page, limit, nameFilter });
            return templates;
        } catch (error) {
            console.error('Error fetching templates:', error);
            throw error;
        }
    }

    static async getTemplateById(id) {
        try {
            const template = await TemplateModel.findById(id);
            return template;
        } catch (error) {
            console.error('Error fetching template by ID:', error);
            throw error;
        }
    }

    static async updateTemplateById(id, updateData) {
        console.log('Updating template with ID:', id, 'with data:', updateData);
        try {
            const updatedTemplate = await TemplateModel.update(id, updateData);
            return updatedTemplate;
        } catch (error) {
            console.error('Error updating template:', error);
            throw error;
        }
    }
}