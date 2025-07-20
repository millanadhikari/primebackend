

import { AuthService } from '../services/authService.js';

/**
 * Authentication Controller - Handles HTTP requests for authentication
 */
export class AuthController {
    /**
     * Register a new user
     * POST /api/auth/signup
     */
    static async signup(req, res, next) {
        try {
            const userData = req.body;
            console.log('User registration data:', userData);
            const ipAddress = req.ip || req.connection.remoteAddress;
            const userAgent = req.get('User-Agent');

            const result = await AuthService.register(userData);

            res.cookie('refreshToken', result.tokens.refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            });

            res.status(201).json({
                status: 'success',
                message: 'User registered successfully',
                data: {
                    user: result.user,
                    accessToken: result.tokens.accessToken,
                },
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Login user
     * POST /api/auth/login
     */
    static async login(req, res, next) {
        console.log('Login request body:', req.body);
        try {
            const { email, password } = req.body;
            const ipAddress = req.ip || req.connection.remoteAddress;
            const userAgent = req.get('User-Agent');

            const result = await AuthService.login(email, password, ipAddress, userAgent);

            res.cookie('refreshToken', result.tokens.refreshToken, {
                httpOnly: true,
                secure: true, // ✅ force it on Render
                sameSite: "none", // ✅ allow cross-site cookies
                maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            });

            res.status(200).json({
                status: 'success',
                message: 'Login successful',
                data: {
                    user: result.user,
                    accessToken: result.tokens.accessToken,
                },
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Refresh access token
     * POST /api/auth/refresh-token
     */
    // static async refreshToken(req, res, next) {
    //     try {
    //         const refreshToken = req.cookies.refreshToken;

    //         if (!refreshToken) {
    //             return res.status(401).json({
    //                 status: 'error',
    //                 message: 'Refresh token not provided',
    //             });
    //         }

    //         const result = await AuthService.refreshToken(refreshToken);

    //         res.cookie('refreshToken', result.tokens.refreshToken, {
    //             httpOnly: true,
    //             secure: process.env.NODE_ENV === 'production',
    //             sameSite: 'strict',
    //             maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    //         });

    //         res.status(200).json({
    //             status: 'success',
    //             message: 'Token refreshed successfully',
    //             data: {
    //                 accessToken: result.tokens.accessToken,
    //             },
    //         });
    //     } catch (error) {
    //         res.clearCookie('refreshToken');
    //         next(error);
    //     }
    // }
    static async refreshToken(req, res, next) {
        try {
            const refreshToken = req.cookies.refreshToken;

            if (!refreshToken) {
                return res.status(401).json({
                    status: 'error',
                    message: 'Refresh token not provided',
                });
            }

            const result = await AuthService.refreshToken(refreshToken);

            res.cookie('refreshToken', result.tokens.refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 7 * 24 * 60 * 60 * 1000,
            });

            res.status(200).json({
                status: 'success',
                message: 'Token refreshed successfully',
                data: {
                    accessToken: result.tokens.accessToken,
                },
            });
        } catch (error) {
            console.error('Refresh token error:', error);
            res.clearCookie('refreshToken');

            // Handle P2025 and other refresh token errors
            if (error.code === 'P2025' || error.message?.includes('Invalid') || error.message?.includes('expired')) {
                return res.status(401).json({
                    status: 'error',
                    message: 'Invalid or expired refresh token',
                });
            }

            console.error('Error during token refresh:', error);
            next(error);
        }
    }
    /**
     * Logout user
     * POST /api/auth/logout
     */
    static async logout(req, res, next) {
        try {
            const refreshToken = req.cookies.refreshToken;
            console.log('Logout attempt with token:', refreshToken ? 'present' : 'missing');

            if (refreshToken) {
                await AuthService.logout(refreshToken);
                console.log('Token deleted successfully');
            }

            res.clearCookie('refreshToken');
            res.status(200).json({
                status: 'success',
                message: 'Logout successful',
            });
        } catch (error) {
            console.error('Logout error:', error.code, error.message);
            res.clearCookie('refreshToken');

            // Don't fail logout if token was already gone
            if (error.code === 'P2025') {
                return res.status(200).json({
                    status: 'success',
                    message: 'Logout successful',
                });
            }

            next(error);
        }
    }
    /**
     * Logout from all devices
     * POST /api/auth/logout-all
     */
    static async logoutAll(req, res, next) {
        try {
            const userId = req.user.userId;

            await AuthService.logoutAllDevices(userId);
            res.clearCookie('refreshToken');

            res.status(200).json({
                status: 'success',
                message: 'Logout from all devices successful',
            });
        } catch (error) {
            res.clearCookie('refreshToken');
            next(error);
        }
    }

    /**
     * Forgot password
     * POST /api/auth/forgot-password
     */
    static async forgotPassword(req, res, next) {
        try {
            const { email } = req.body;

            if (!email) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Email is required',
                });
            }

            const result = await AuthService.forgotPassword(email);

            res.status(200).json({
                status: 'success',
                message: result.message,
                ...(process.env.NODE_ENV === 'development' && { resetToken: result.resetToken }),
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Reset password
     * POST /api/auth/reset-password
     */
    static async resetPassword(req, res, next) {
        try {
            const { token, password } = req.body;

            if (!token || !password) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Token and password are required',
                });
            }

            await AuthService.resetPassword(token, password);

            res.status(200).json({
                status: 'success',
                message: 'Password reset successful',
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Change password
     * POST /api/auth/change-password
     */
    static async changePassword(req, res, next) {
        console.log('Change password request body:', req.body);
        try {
            const { currentPassword, newPassword } = req.body;
            const userId = req.user.userId;

            if (!currentPassword || !newPassword) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Current password and new password are required',
                });
            }

            await AuthService.changePassword(userId, currentPassword, newPassword);

            res.status(200).json({
                status: 'success',
                message: 'Password changed successfully',
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get user profile
     * GET /api/auth/profile
     */
    static async getProfile(req, res, next) {
        try {
            const userId = req.user.userId;


            const user = await AuthService.getUserProfile(userId);

            res.status(200).json({
                status: 'success',
                data: { user },
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Update user profile
     * PUT /api/auth/profile
     */
    static async updateProfile(req, res, next) {
        try {
            const userId = req.user.userId;
            const updateData = req.body;

            const updatedUser = await AuthService.updateProfile(userId, updateData);

            res.status(200).json({
                status: 'success',
                message: 'Profile updated successfully',
                data: { user: updatedUser },
            });
        } catch (error) {
            next(error);
        }
    }

    static async updateUserById(req, res, next) {
        try {
            const userId = req.params.id
            const updateData = req.body;
            console.log('Update data for user 1:', updateData);
            const updatedUser = await AuthService.updateUser(userId, updateData);

            res.status(200).json({
                status: 'success',
                message: 'Profile updated successfully',
                data: { user: updatedUser },
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get current user info
     * GET /api/auth/me
     */
    static async getCurrentUser(req, res, next) {
        console.log('Current user request:', req.user);
        try {
            const userId = req.user.userId;
            const user = await AuthService.getUserProfile(userId);

            res.status(200).json({
                status: 'success',
                data: {
                    user,
                    tokenInfo: {
                        userId: req.user.userId,
                        email: req.user.email,
                        role: req.user.role,
                    },
                },
            });
        } catch (error) {
            next(error);
        }
    }
    // Delete user profile
    static async deleteUserById(req, res, next) {
        try {
            const { id } = req.params;

            const deletedUser = await AuthService.deleteById(id);

            if (!deletedUser) {
                return res.status(404).json({
                    status: 'fail',
                    message: 'User not found',
                });
            }

            res.status(200).json({
                status: 'success',
                message: 'User deleted successfully',
                data: {
                    id: deletedUser.id,
                },
            });
        } catch (error) {
            next(error);
        }
    }

    static async getAllUsers(req, res, next) {
        try {
            const {
                page = 1,
                limit = 10,
                search = '',
                status,

            } = req.query;

            const filters = {
                page: Number(page),
                limit: Number(limit),
                search,
                status,

            };

            const result = await AuthService.getAllUsers(filters);

            res.status(200).json({
                status: 'success',
                message: 'Users fetched successfully',
                data: result,
            });
        } catch (error) {
            next(error);
        }
    }

    static async getUserById(req, res, next) {
        try {
            const { id } = req.params;
            const user = await AuthService.getUserProfile(id);

            if (!user) {
                return res.status(404).json({
                    status: 'fail',
                    message: 'Staff not found',
                });
            }

            res.status(200).json({
                status: 'success',
                message: 'Staff fetched successfully',
                data: { user },
            });
        } catch (error) {
            next(error);
        }
    }
    /**
     * Health check
     * GET /api/auth/health
     */
    static async healthCheck(req, res, next) {
        try {
            res.status(200).json({
                status: 'success',
                message: 'Auth service is healthy',
                timestamp: new Date().toISOString(),
                service: 'authentication-api',
            });
        } catch (error) {
            next(error);
        }
    }
}
