import prisma from "../config/database.js";


// Import socket.io instance from server.js or pass it into this service
let io;
export function setSocketInstance(socketIoInstance) {
    io = socketIoInstance;
}
export class NotificationModel {
    static async create(notificationData) {
        console.log("Creating notification with data:", notificationData);
        try {
            const notification = await prisma.notification.create({
                data: {
                    userId: notificationData.userId,
                    title: notificationData.title ?? null,
                    message: notificationData.message,
                    type: notificationData.type,
                    actionUrl: notificationData.actionUrl ?? null,
                    avatar: notificationData.avatar ?? null,
                    clientId: notificationData.clientId ?? null, // ✅ allow clientId
                    metadata: notificationData.metadata ?? null,
                    readStatus: notificationData.readStatus ?? false,
                    createdAt: notificationData.createdAt ?? new Date()
                },
                select: {
                    id: true,
                    userId: true,
                    title: true,
                    message: true,
                    type: true,
                    actionUrl: true,
                    avatar: true,
                    clientId: true,
                    metadata: true,
                    readStatus: true,
                    createdAt: true
                }
            });

            // Emit real-time notification to connected user
            if (io) {
                io.to(`user_${notification.userId}`).emit('notification', notification);
            }

            return notification;
        } catch (error) {
            console.error('Error creating notification:', error);
            throw error;
        }
    }

    // Fetch all notifications for a user
    static async findAll(userId) {
        console.log("Fetching notifications for user ID:", userId);
        try {
            const notifications = await prisma.notification.findMany({
                where: { userId },
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    userId: true,
                    message: true,
                    actionUrl: true,
                    type: true,
                    readStatus: true,
                    createdAt: true,
                }
            });
            return notifications;
        } catch (error) {
            console.error('Error fetching notifications:', error);
            throw error;
        }
    }

    // mark notification as read
    static async update(notificationId, userId) {
        console.log("Updating notification ID:", notificationId, "for user ID:", userId);
        try {
            const notification = await prisma.notification.update({
                where: { id: notificationId, userId },
                data: { readStatus: true },
                select: {

                    readStatus: true,

                }
            });

            // Emit real-time update to connected user
            if (io && notification.userId) {
                io.to(`user:${notification.userId}`).emit('notificationUpdated', notification);
            }

            return notification;
        } catch (error) {
            console.error('Error updating notification:', error);
            throw error;
        }
    }

    // Mark all notifications as read for a user
    static async updateAll(userId) {
        console.log("Marking all notifications as read for user ID:", userId);
        try {
            const notifications = await prisma.notification.updateMany({
                where: { userId, readStatus: false },
                data: { readStatus: true },
                select: {
                    id: true,
                    userId: true,
                    message: true,
                    type: true,
                    readStatus: true,
                    createdAt: true,
                }
            });

            // Emit real-time update to connected user
            if (io && userId) {
                io.to(`user:${userId}`).emit('allNotificationsRead', notifications);
            }

            return notifications;
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
            throw error;
        }
    }

    // Delete a notification by ID
    static async deleteById(notificationId, userId) {

        try {
            const deletedNotification = await prisma.notification.delete({
                where: { id: notificationId, userId },
                select: {
                    id: true,
                    userId: true,
                    message: true,
                    type: true,
                    readStatus: true,
                    createdAt: true,
                }
            });

            // Emit real-time deletion to connected user
            if (io && deletedNotification.userId) {
                io.to(`user:${deletedNotification.userId}`).emit('notificationDeleted', deletedNotification);
            }

            return deletedNotification;
        } catch (error) {
            console.error('Error deleting notification:', error);
            throw error;
        }
    }

    // clear all notifications for a user
    static async clearAll(userId) {
        console.log("Clearing all notifications for user ID:", userId);
        try {
            const deletedNotifications = await prisma.notification.deleteMany({
                where: { userId },
            });

            // Emit real-time clear to connected user
            if (io && userId) {
                io.to(`user:${userId}`).emit('allNotificationsCleared');
            }

            return deletedNotifications;
        } catch (error) {
            console.error('Error clearing all notifications:', error);
            throw error;
        }
    }
}