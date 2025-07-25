import { parse } from "dotenv";
import prisma from "../config/database.js";


export class MessageModel {
    static async createMessage(messageData) {
        console.log("Creating message with data:", messageData);
        try {
            const message = await prisma.message.create({
                data: messageData,
                select: {
                    id: true,
                    name: true,
                    receivedAt: true,

                }
            })
            return message

        } catch (error) {
            console.error('Error creating message:', error);
            throw error;
        }
    }

    // Fetch all messages with pagination and search
    static async findAll(
        page = '1',
        limit = '10',
        search = '',
        status = 'all',
    ) {
        const take = parseInt(limit, 10);
        const skip = (parseInt(page, 10) - 1) * take;

        const filters = [];

        const safeSearch = typeof search === "string" ? search : "";
        const safeStatus = typeof status === "string" ? status : "all";

        if (safeSearch) {
            filters.push({
                OR: [
                    { name: { contains: safeSearch, mode: "insensitive" } },
                    { email: { contains: safeSearch, mode: "insensitive" } },
                    { phone: { contains: safeSearch, mode: "insensitive" } },
                ],
            });
        }

        // if (safeStatus !== "all") {
        //     filters.push({
        //         status: {
        //             equals: safeStatus.toLowerCase(),
        //         },
        //     });
        // }

        const where = filters.length ? { AND: filters } : {};

        const [messages, totalCount] = await Promise.all([
            prisma.message.findMany({
                where,
                take,
                skip,
                orderBy: { receivedAt: "desc" },
            }),
            prisma.message.count({ where }),
        ]);

        return {
            messages,
            pagination: {
                total: totalCount,
                page: parseInt(page, 10),
                limit: take,
                totalPages: Math.ceil(totalCount / take),
            },
        };
    }


    // Fetch a message by ID
    static async findById(id) {
        try {
            const message = await prisma.message.findUnique({
                where: { id },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    phone: true,
                    service: true,
                    message: true,
                    preferredContact: true,
                    isRead: true,
                    isStarred: true,
                    isArchived: true,
                    priority: true,
                    category: true,
                    receivedAt: true,
                }
            });

            if (!message) {
                throw new Error(`Message with ID ${id} not found`);
            }

            return message;
        } catch (error) {
            console.error('Error fetching message by ID:', error);
            throw error;
        }
    }

    // Delete a message by ID
    static async deleteById(id) {
        try {
            const deletedMessage = await prisma.message.delete({
                where: { id },
            });

            return deletedMessage;
        } catch (error) {
            console.error('Error deleting message:', error);
            throw error;
        }
    }

    static async update(id, updateData) {
        try {
            const updatedMessage = await prisma.message.update({
                where: { id },
                data: updateData,
                select: {
                    id: true,
                    name: true,
                    email: true,
                    phone: true,
                    service: true,
                    message: true,
                    preferredContact: true,
                    isRead: true,
                    isStarred: true,
                    isArchived: true,
                    priority: true,
                    category: true,
                    receivedAt: true,
                }
            });

            return updatedMessage;
        } catch (error) {
            console.error('Error updating message:', error);
            throw error;
        }
    }
}