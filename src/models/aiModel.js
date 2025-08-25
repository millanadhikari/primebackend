import openai from "../config/openaiClient.mjs";

export class AiModel {
    static async generateContent({ title, excerpt, author, type, tags, res }) {
        if (!title || !author) {
            return res.status(400).json({ error: "Title and author are required" });
        }

        try {
            const prompt = `
      Write a professional blog post titled "${title}".
      Introduction: ${excerpt || ""}
      Author: ${author}.
      Type: ${type}.
      Tags: ${tags.join(", ")}.
      Include sections: Introduction, Key benefits, Best practices, Conclusion.
    `;

            // Correct OpenAI SDK method for v4:
            const completion = await openai.chat.completions.create({
                model: "gpt-3.5-turbo",
                messages: [
                    { role: "system", content: "You write professional blog posts." },
                    { role: "user", content: prompt },
                ],
                max_tokens: 1500,
            });

            const content = completion.choices[0].message.content || "";
            const slug = title.toLowerCase().replace(/\s+/g, "-");

            // Return JSON response (no DB save here)
            return res.json({ content, slug, title, author, type, excerpt, tags });
        } catch (error) {
            console.error("Error generating content:", error);
            return res.status(500).json({ error: "Failed to generate content" });
        }
    }

}