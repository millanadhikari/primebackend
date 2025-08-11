import express from 'express';
import { NotificationContoller } from '../controllers/notificationController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Retrieve all notifications for logged-in user
router.get('/', authenticateToken, NotificationContoller.getNotifications);

// Endpoint to send/create a notification
router.post('/notify', NotificationContoller.createNotification);

// Mark all notifications as read
router.patch('/read-all', authenticateToken, NotificationContoller.markAllAsRead);



// Mark a single notification as readnotificationController.markAsRead
router.patch('/:id/read', authenticateToken, NotificationContoller.markAsRead);


// Clear all notifications
router.delete('/clear', authenticateToken, NotificationContoller.clearAllNotifications);
// Delete a single notification
router.delete('/:id', authenticateToken, NotificationContoller.deleteNotification);


export default router
