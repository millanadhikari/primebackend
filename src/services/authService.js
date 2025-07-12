import { UserModel } from '../models/userModel.js';
import { comparePassword } from '../utils/password.js';
import { generateTokens, verifyRefreshToken, generateSecureToken } from '../utils/jwt.js';

export class AuthService {
    static async register(userData) {
        const { email, password, role } = userData;

        if (!email || !password) throw new Error('Email and password are required');

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) throw new Error('Invalid email format');

        if (password.length < 6) throw new Error('Password must be at least 6 characters long');

        // if (role === 'COORDINATOR' && (!userData.department || !userData.region)) {
        //     throw new Error('Department and region are required for coordinators');
        // }

        // if (role === 'CLIENT' && !userData.company) {
        //     throw new Error('Company is required for clients');
        // }

        const user = await UserModel.createUser(userData);
        const tokens = generateTokens(user);

        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);

        await UserModel.storeRefreshToken(user.id, tokens.refreshToken, expiresAt);

        return { user, tokens };
    }

    static async login(email, password, ipAddress = null, userAgent = null) {
        if (!email || !password) throw new Error('Email and password are required');

        const user = await UserModel.findByEmail(email);
        if (!user || !user.isActive) throw new Error('Invalid email or password');

        const isPasswordValid = await comparePassword(password, user.password);
        if (!isPasswordValid) throw new Error('Invalid email or password');

        const { password: _, ...userWithoutPassword } = user;
        const tokens = generateTokens(userWithoutPassword);

        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);

        await UserModel.storeRefreshToken(user.id, tokens.refreshToken, expiresAt, ipAddress, userAgent);

        return { user: userWithoutPassword, tokens };
    }

    static async refreshToken(refreshToken) {
        if (!refreshToken) throw new Error('Refresh token is required');

        const decoded = verifyRefreshToken(refreshToken);
        const storedToken = await UserModel.findRefreshToken(refreshToken);
        if (!storedToken || storedToken.expiresAt < new Date()) {
            await UserModel.deleteRefreshToken(refreshToken);
            throw new Error('Refresh token expired or invalid');
        }

        if (!storedToken.user.isActive) {
            await UserModel.deleteRefreshToken(refreshToken);
            throw new Error('User account is deactivated');
        }

        const tokens = generateTokens(storedToken.user);

        await UserModel.deleteRefreshToken(refreshToken);

        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);

        await UserModel.storeRefreshToken(storedToken.user.id, tokens.refreshToken, expiresAt);

        return { user: storedToken.user, tokens };
    }

    static async logout(refreshToken) {
        try {
            if (refreshToken) await UserModel.deleteRefreshToken(refreshToken);
            return true;
        } catch (error) {
            console.error('Logout error:', error);
            return true;
        }
    }

    static async logoutAllDevices(userId) {
        await UserModel.deleteAllRefreshTokens(userId);
        return true;
    }

    static async forgotPassword(email) {
        if (!email) throw new Error('Email is required');

        const user = await UserModel.findByEmail(email);
        if (!user) return { message: 'If email exists, reset instructions have been sent' };

        const resetToken = generateSecureToken();
        const resetExpires = new Date();
        resetExpires.setHours(resetExpires.getHours() + 1);

        await UserModel.setPasswordResetToken(email, resetToken, resetExpires);

        return { message: 'Reset instructions sent to email' };
    }

    static async resetPassword(token, newPassword) {
        if (!token || !newPassword) throw new Error('Token and new password are required');
        if (newPassword.length < 6) throw new Error('Password must be at least 6 characters long');

        const user = await UserModel.findByPasswordResetToken(token);
        if (!user) throw new Error('Invalid or expired reset token');

        await UserModel.updatePassword(user.id, newPassword);
        await UserModel.clearPasswordResetToken(user.id);
        await UserModel.deleteAllRefreshTokens(user.id);

        return true;
    }

    static async changePassword(userId, currentPassword, newPassword) {
        if (!currentPassword || !newPassword) throw new Error('Current and new passwords are required');
        if (newPassword.length < 6) throw new Error('New password must be at least 6 characters long');

        const user = await UserModel.findById(userId);
        if (!user) throw new Error('User not found');

        const userWithPassword = await UserModel.findByEmail(user.email);
        if (!userWithPassword) throw new Error('User not found');

        const isValid = await comparePassword(currentPassword, userWithPassword.password);
        if (!isValid) throw new Error('Current password is incorrect');

        await UserModel.updatePassword(userId, newPassword);
        await UserModel.deleteAllRefreshTokens(userId);

        return true;
    }

    static async getUserProfile(userId) {
        const user = await UserModel.findById(userId);
        if (!user) throw new Error('User not found');
        return user;
    }

    static async updateProfile(userId, updateData) {

        const { password, role, adminLevel, permissions, ...safeUpdateData } = updateData;
        return await UserModel.updateUser(userId, safeUpdateData);
    }

    static async updateUser(userId, updateData) {
        // const { password, role, adminLevel, permissions, ...safeUpdateData } = updateData;
        return await UserModel.updateUser(userId, updateData);
    }



    static async deleteById(id) {
        return await UserModel.deleteById(id);
    }

    static async getAllUsers(filters) {
        return await UserModel.findAllWithFilters(filters);
    }
}
