
import { NotificationService } from "../services/notificationService.js";


export class NotificationContoller {

    static async createNotification(req, res) {
        try {
            const { userId, message, type } = req.body;
            if (!userId || !message) {
                return res.status(400).json({ error: 'User ID and message are required' });
            }
            const notification = await NotificationService.createNotification({
                data: {
                    userId,
                    message,
                    type,
                    readStatus: false,
                },
            });

            return res.status(201).json(notification);
        } catch (error) {
            console.error('Error creating notification:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }

    // get all notifications for a user
    static async getNotifications(req, res) {
        console.log('Fetching notifications for user', req.user.userId);
        try {
            const userId = req.user.userId; // Assuming user ID is stored in req.user
            if (!userId) {
                return res.status(400).json({ error: 'User ID is required' });
            }

            const notifications = await NotificationService.getNotificationsByUserId(userId);
            return res.status(200).json(notifications);
        } catch (error) {
            console.error('Error fetching notifications:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }

    // funntion for markasread
    static async markAsRead(req, res) {
        try {
            const userId = req.user.userId;
            const notificationId = req.params.id;
            if (!notificationId) {
                return res.status(400).json({ error: 'Notification ID is required' });
            }
            console.log('Marking notification as read:', notificationId, 'for user:', userId);
            // Assuming NotificationService has a method to mark as read
            const updatedNotification = await NotificationService.markAsRead(notificationId, userId);
            if (!updatedNotification) {
                return res.status(404).json({ error: 'Notification not found' });
            }

            return res.status(200).json(updatedNotification);
        } catch (error) {
            console.error('Error marking notification as read:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }

    // function for marking all notifications as read
    static async markAllAsRead(req, res) {
        try {
            const userId = req.user.userId; // Assuming user ID is stored in req.user
            if (!userId) {
                return res.status(400).json({ error: 'User ID is required' });
            }

            const updatedNotifications = await NotificationService.markAllAsRead(userId);
            if (!updatedNotifications) {
                return res.status(404).json({ error: 'Notification not found' });
            }

            return res.status(200).json({ message: 'All notifications marked as read' });
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }

    // function for deleting a notification
    static async deleteNotification(req, res) {
        try {
            const userId = req.user.userId; // Assuming user ID is stored in req.user
            const notificationId = req.params.id;
            if (!notificationId) {
                return res.status(400).json({ error: 'Notification ID is required' });
            }

            const deletedNotification = await NotificationService.deleteNotificationById(notificationId, userId);
            if (!deletedNotification) {
                return res.status(404).json({ error: 'Notification not found' });
            }

            return res.status(200).json({ message: 'Notification deleted successfully' });
        } catch (error) {
            console.error('Error deleting notification:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }

    // clear all notifications for a user
    static async clearAllNotifications(req, res) {
        try {
            const userId = req.user.userId; // Assuming user ID is stored in req.user
            if (!userId) {
                return res.status(400).json({ error: 'User ID is required' });
            }

            const clearedNotifications = await NotificationService.clearAllNotifications(userId);
            return res.status(200).json({ message: 'All notifications cleared successfully', clearedCount: clearedNotifications });
        } catch (error) {
            console.error('Error clearing all notifications:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }
}