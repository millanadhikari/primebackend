import prisma from '../config/database.js';
import { hashPassword } from '../utils/password.js';

/**
 * User Model - Handles all database operations for users
 */
export class UserModel {
    static async createUser(userData) {
        const { email, password, role, ...roleSpecificData } = userData;

        const hashedPassword = await hashPassword(password);

        let userCreateData = {
            email,
            password: hashedPassword,
            role: role || 'CLIENT'
        };

        switch (role) {
            case 'ADMIN':
                userCreateData.adminLevel = roleSpecificData.adminLevel || 'STANDARD';
                userCreateData.permissions = roleSpecificData.permissions || [];
                break;
            case 'COORDINATOR':
                userCreateData.department = roleSpecificData.department;
                userCreateData.region = roleSpecificData.region;
                break;
            case 'CLIENT':
                userCreateData.clientId = roleSpecificData.clientId;
                userCreateData.company = roleSpecificData.company;
                break;
        }

        if (roleSpecificData.firstName) userCreateData.firstName = roleSpecificData.firstName;
        if (roleSpecificData.lastName) userCreateData.lastName = roleSpecificData.lastName;

        try {
            const user = await prisma.user.create({
                data: userCreateData,
                select: {
                    id: true,
                    email: true,
                    role: true,
                    firstName: true,
                    lastName: true,
                    adminLevel: true,
                    permissions: true,
                    department: true,
                    region: true,
                    clientId: true,
                    company: true,
                    isActive: true,
                    isVerified: true,
                    createdAt: true,
                    updatedAt: true
                }
            });

            return user;
        } catch (error) {
            if (error.code === 'P2002') {
                throw new Error('User with this email already exists');
            }
            throw error;
        }
    }

    static async findByEmail(email) {
        return await prisma.user.findUnique({
            where: { email },
            include: {
                refreshTokens: true
            }
        });
    }

    static async findById(id) {
        return await prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                email: true,
                role: true,
                firstName: true,
                lastName: true,
                adminLevel: true,
                permissions: true,
                department: true,
                region: true,
                clientId: true,
                company: true,
                isActive: true,
                isVerified: true,
                createdAt: true,
                updatedAt: true,
                profileImage: true
            }
        });
    }

    static async updateUser(id, updateData) {
        const { password, id: userId, createdAt, ...safeUpdateData } = updateData;

        return await prisma.user.update({
            where: { id },
            data: safeUpdateData,
            select: {
                id: true,
                email: true,
                role: true,
                firstName: true,
                lastName: true,
                adminLevel: true,
                permissions: true,
                department: true,
                region: true,
                clientId: true,
                company: true,
                isActive: true,
                isVerified: true,
                updatedAt: true,
                profileImage: true
            }
        });
    }

    static async updatePassword(id, newPassword) {
        const hashedPassword = await hashPassword(newPassword);

        await prisma.user.update({
            where: { id },
            data: { password: hashedPassword }
        });

        return true;
    }

    static async setPasswordResetToken(email, token, expires) {
        await prisma.user.update({
            where: { email },
            data: {
                resetPasswordToken: token,
                resetPasswordExpires: expires
            }
        });

        return true;
    }

    static async findByPasswordResetToken(token) {
        return await prisma.user.findFirst({
            where: {
                resetPasswordToken: token,
                resetPasswordExpires: {
                    gt: new Date()
                }
            }
        });
    }

    static async clearPasswordResetToken(id) {
        await prisma.user.update({
            where: { id },
            data: {
                resetPasswordToken: null,
                resetPasswordExpires: null
            }
        });

        return true;
    }

    static async storeRefreshToken(userId, token, expiresAt, ipAddress = null, userAgent = null) {
        return await prisma.refreshToken.create({
            data: {
                token,
                userId,
                expiresAt,
                ipAddress,
                userAgent
            }
        });
    }

    static async findRefreshToken(token) {
        return await prisma.refreshToken.findUnique({
            where: { token },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        role: true,
                        isActive: true
                    }
                }
            }
        });
    }

    static async deleteRefreshToken(token) {
        await prisma.refreshToken.delete({
            where: { token }
        });

        return true;
    }

    static async deleteAllRefreshTokens(userId) {
        await prisma.refreshToken.deleteMany({
            where: { userId }
        });

        return true;
    }

    static async cleanupExpiredTokens() {
        const result = await prisma.refreshToken.deleteMany({
            where: {
                expiresAt: {
                    lt: new Date()
                }
            }
        });

        return result.count;
    }
}
