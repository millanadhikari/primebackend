import { MessageService } from "../services/messageService.js";

export class MessageController {
    /**
     * Send a message
     * POST /api/message/send
     */
    static async sendMessage(req, res, next) {
        try {
            const message = req.body;



            const result = await MessageService.sendMessage(message);

            res.status(201).json({
                status: 'success',
                message: 'Message created successfully',
                data: {
                    post: result,
                },
            });
        } catch (error) {
            next(error);
        }
    }

    // Get all messages
    static async getAllMessages(req, res, next) {
        console.log('Fetching all messages', req.query);
        try {
            const { page = 1, limit = 10, search = '', status='' } = req.query;

            const result = await MessageService.getAllMessages({ page, limit, search, status });

            res.status(200).json({
                status: 'success',
                message: 'Messages fetched successfully',
                data: result,
            });
        } catch (error) {
            next(error);
        }
    }

    // Get a message by ID
    static async getById(req, res, next) {
        try {
            const { id } = req.params;

            const message = await MessageService.getById(id);

            if (!message) {
                return res.status(404).json({
                    status: 'error',
                    message: 'Message not found',
                });
            }

            res.status(200).json({
                status: 'success',
                data: {
                    message,
                },
            });
        } catch (error) {
            next(error);
        }
    }

    //Update a message
    static async updateMessage(req, res, next) {
        try {
            const { id } = req.params;
            const updateData = req.body;

            const message = await MessageService.getById(id);

            if (!message) {
                return res.status(404).json({
                    status: 'error',
                    message: 'Message not found',
                });
            }

            const updatedMessage = await MessageService.updateMessage(id, updateData);

            res.status(200).json({
                status: 'success',
                message: 'Message updated successfully',
                data: {
                    message: updatedMessage,
                },
            });
        } catch (error) {
            next(error);
        }
    }
    // Delete a message
    static async deleteMessage(req, res, next) {
        try {
            const { id } = req.params;

            const message = await MessageService.getById(id);

            if (!message) {
                return res.status(404).json({
                    status: 'error',
                    message: 'Message not found',
                });
            }

            await MessageService.deleteMessage(id);

            res.status(200).json({
                status: 'success',
                message: 'Message deleted successfully',
            });
        } catch (error) {
            next(error);
        }
    }
}