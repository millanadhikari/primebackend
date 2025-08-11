import { NotificationModel } from "../models/notificationModel.js";


export class NotificationService {
    static async createNotification(notificationData) {
        const { userId, message, type } = notificationData;

        if (!userId || !message) {
            throw new Error('User ID and message are required');
        }

        try {
            const notification = await NotificationModel.create({
                data: {
                    userId,
                    message,
                    type,
                    readStatus: false,
                },
            });
            return notification;
        } catch (error) {
            console.error('Error creating notification:', error);
            throw new Error('Failed to create notification');
        }
    }

    // Get all notifications for a user
    static async getNotificationsByUserId(userId) {
        if (!userId) {
            throw new Error('User ID is required');
        }

        try {
            const notifications = await NotificationModel.findAll(userId)
            return notifications;
        } catch (error) {
            console.error('Error fetching notifications:', error);
            throw new Error('Failed to fetch notifications');
        }
    }

    // Mark a notification as read
    static async markAsRead(notificationId, userId) {
        if (!notificationId || !userId) {
            throw new Error('Notification ID and User ID are required');
        }

        try {
            const notification = await NotificationModel.update(notificationId, userId);

            return notification;
        } catch (error) {
            console.error('Error marking notification as read:', error);
            throw new Error('Failed to mark notification as read');
        }
    }

    // Mark all notifications as read for a user
    static async markAllAsRead(userId) {
        if (!userId) {
            throw new Error('User ID is required');
        }

        try {
            const notifications = await NotificationModel.updateAll(userId);


            return notifications.map(notification => ({ ...notification, readStatus: true }));
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
            throw new Error('Failed to mark all notifications as read');
        }
    }

    // delete a notification by ID
    static async deleteNotificationById(notificationId, userId) {
        if (!notificationId || !userId) {
            throw new Error('Notification ID and User ID are required');
        }

        try {
            const deletedNotification = await NotificationModel.deleteById(notificationId, userId);
            return deletedNotification;
        } catch (error) {
            console.error('Error deleting notification:', error);
            throw new Error('Failed to delete notification');
        }
    }

    // clear all notifications for a user
    static async clearAllNotifications(userId) {
        console.log("Clearing all notifications for user a ID:", userId);
        if (!userId) {
            throw new Error('User ID is required');
        }

        try {
            const deletedNotifications = await NotificationModel.clearAll(userId);
            return deletedNotifications;
        } catch (error) {
            console.error('Error clearing all notifications:', error);
            throw new Error('Failed to clear all notifications');
        }
    }
}