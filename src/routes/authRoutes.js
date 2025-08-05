
import express from 'express';
import { AuthController } from '../controllers/authController.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Public routes (no authentication required)
router.post('/signup', AuthController.signup);
router.post('/login', AuthController.login);
router.post('/forgot-password', AuthController.forgotPassword);
router.post('/reset-password', AuthController.resetPassword);
router.get('/health', AuthController.healthCheck);

// Routes that require refresh token (from cookie)
router.post('/refresh-token', AuthController.refreshToken);
router.post('/logout', AuthController.logout);

// Protected routes (require access token)
router.use(authenticateToken); // All routes below require authentication

// User profile routes
router.get('/me', AuthController.getCurrentUser);
router.get('/profile', AuthController.getProfile);
router.put('/profile', AuthController.updateProfile);
router.post('/change-password', AuthController.changePassword);
router.post('/logout-all', AuthController.logoutAll);

router.delete('/:id', AuthController.deleteUserById);

// Admin-only routes (example for future use)
router.get('/users', requireAdmin, AuthController.getAllUsers);
// router.delete('/users/:id', requireAdmin, AuthController.deleteUser);

//Admin or Cordinator routes GEt users by ID
router.get('/users/:id', requireAdmin, AuthController.getUserById);

//Admin Update user by ID
router.put('/users/:id', requireAdmin, AuthController.updateUserById);

export default router;
