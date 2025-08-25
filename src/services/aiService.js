import { AiModel } from "../models/aiModel.js";

export class AiService {
    static async generateContent({ title, excerpt, author, type, tags }) {
        try {
            if (!title) {
                throw new Error('title is required');
            }

            // Here you would integrate with your AI service to generate content
            // For example, using OpenAI's API or any other AI service
            const generatedContent = await AiModel.generateContent({ title, excerpt, author, type, tags });

            return generatedContent;
        } catch (error) {
            console.error('Error generating content:', error);
            throw error; // Propagate the error to be handled by the controller
        }
    }
}