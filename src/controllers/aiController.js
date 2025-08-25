import openai from "../config/openaiClient.mjs";
import { AiService } from "../services/aiService.js";


export class AiController {
    static async generateContent(req, res) {
        try {
            const { title, excerpt, author, type, tags } = req.body;

            if (!title || !author) {
                return res.status(400).json({ error: "Title and author are required" });
            }
            // Here you would integrate with your AI service to generate content
            // For example, using OpenAI's API or any other AI service
            const generatedContent = await AiService.generateContent({ title, excerpt, author, type, tags });

            return res.status(200).json({ content: generatedContent });
        } catch (error) {
            console.error('Error generating content:', error);
            return res.status(500).json({ error: 'Failed to generate content' });
        }
    }

    static async generateImage(req, res) {
        const { prompt, n = 2, size = "1024x1024" } = req.body;

        if (!prompt) {
            return res.status(400).json({ error: "Prompt is required to generate images" });
        }

        try {
            const response = await openai.createImage({
                prompt,
                n,
                size,
            });

            const images = response.data.data.map((img) => img.url);
            res.json({ images });
        } catch (error) {
            console.error("Error generating images:", error);
            res.status(500).json({ error: "Failed to generate images" });
        }
    }

}