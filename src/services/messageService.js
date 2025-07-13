import { MessageModel } from "../models/messageModel.js";


export class MessageService {
    static async sendMessage(messageData) {
        try {
            const post = await MessageModel.createMessage(messageData);
            return post;
        } catch (error) {
            console.error('Error in createPost:', error);
            throw error;
        }
    }

    static async getAllMessages({ page, limit, search, status }) {


        try {
            const messages = await MessageModel.findMany(page, limit, search, status)

            return messages;
        } catch (error) {
            console.error('Error fetching messages:', error);
            throw error;
        }
    }
    static async getById(id) {
        try {
            const message = await MessageModel.findById(id);
            return message;
        }
        catch (error) {
            console.error('Error fetching message by ID:', error);
            throw error;
        }
    }

    static async deleteMessage(id) {
        try {
            const deletedMessage = await MessageModel.deleteById(id);
            return deletedMessage;
        } catch (error) {
            console.error('Error deleting message:', error);
            throw error;
        }
    }

    static async updateMessage(id, updateData) {
        try {
            const updatedMessage = await MessageModel.update(id, updateData);
            return updatedMessage;
        } catch (error) {
            console.error('Error updating message:', error);
            throw error;
        }
    }
}