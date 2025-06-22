// src/middleware/auth.js - JWT authentication middleware

import { verifyAccessToken, extractTokenFromHeader } from '../utils/jwt.js';
import { UserModel } from '../models/userModel.js';

/**
 * Middleware to verify JWT access token.
 * Attaches user info to req.user if valid.
 */
export const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const token = extractTokenFromHeader(authHeader);

        if (!token) {
            return res.status(401).json({
                status: 'error',
                message: 'Access token required',
            });
        }

        const decoded = verifyAccessToken(token);

        const user = await UserModel.findById(decoded.userId);
        if (!user || !user.isActive) {
            return res.status(401).json({
                status: 'error',
                message: 'Invalid token or user not found',
            });
        }

        req.user = {
            userId: decoded.userId,
            email: decoded.email,
            role: decoded.role,
            userDetails: user,
        };

        next();
    } catch (error) {
        return res.status(401).json({
            status: 'error',
            message: 'Invalid or expired access token',
        });
    }
};

/**
 * Middleware to check if user has specific role.
 * @param {string|Array<string>} roles - Required role(s)
 */
export const requireRole = (roles) => {
    console.log('roles', roles)
    return (req, res, next) => {
        console.log('requireRole middleware initialized with roles:', req.user);
        if (!req.user) {
            return res.status(401).json({
                status: 'error',
                message: 'Authentication required',
            });
        }

        const allowedRoles = Array.isArray(roles) ? roles : [roles];

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                status: 'error',
                message: 'Insufficient permissions',
            });
        }

        next();
    };
};

// Preset role-based middleware
export const requireAdmin = requireRole('ADMIN');
export const requireCoordinatorOrAdmin = requireRole(['COORDINATOR', 'ADMIN']);
export const requireAnyRole = requireRole(['CLIENT', 'COORDINATOR', 'ADMIN']);

/**
 * Optional authentication middleware.
 * Attaches user info if token is provided and valid, but doesn't require it.
 */
export const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const token = extractTokenFromHeader(authHeader);

        if (token) {
            try {
                const decoded = verifyAccessToken(token);
                const user = await UserModel.findById(decoded.userId);

                if (user && user.isActive) {
                    req.user = {
                        userId: decoded.userId,
                        email: decoded.email,
                        role: decoded.role,
                        userDetails: user,
                    };
                }
            } catch {
                // Token invalid - continue without req.user
            }
        }

        next();
    } catch {
        next();
    }
};
