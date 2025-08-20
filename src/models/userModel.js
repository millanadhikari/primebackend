import cloudinary from '../config/cloudinary.js';
import prisma from '../config/database.js';
import { sendWelcomeEmail } from '../services/emailService.js';
import { hashPassword } from '../utils/password.js';
import { ActivitiesModel } from './activitiesModel.js';
/**
 * User Model - Handles all database operations for users
 */
export class UserModel {
    static async createUser(userData) {
        const { email, password, defaultPassword, role, ...roleSpecificData } = userData;

        const hashedPassword = await hashPassword(password);

        let userCreateData = {
            email,
            password: hashedPassword,
            defaultPassword,
            role: role || 'CLIENT',
            isFirstLogin: true, // Default to true for new users
        };



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
                    status: true,
                    isVerified: true,
                    createdAt: true,
                    updatedAt: true,
                    isFirstLogin: true,
                }
            });
            // 📌 Create a corresponding Activity log
            await ActivitiesModel.createActivity({
                type: "USER_CREATED",
                description: `New user account created`,
                userId: user.id, // Replace with actual admin ID or context
                userRole: user.role,
                userName: `${user.firstName} ${user.lastName}`,
                targetType: "staff",
                targetId: String(user.id),

                status: "SUCCESS"
            });
            await sendWelcomeEmail(userCreateData.email, userCreateData.firstName, userCreateData.defaultPassword);
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
                phone: true,
                address: true,
                emergencyContact: true,
                adminLevel: true,
                permissions: true,
                gender: true,
                department: true,
                region: true,
                clientId: true,
                languageSpoken: true,
                company: true,
                isActive: true,
                isVerified: true,
                createdAt: true,
                updatedAt: true,
                profileImage: true,
                profileImagePublicId: true, // Include Cloudinary public ID
                licenseNumber: true,
                specialization: true,
                joinedDate: true,
                lastLogin: true,
                twoFactorEnabled: true,
                emailNotifications: true,
                smsNotifications: true,
                dob: true,
                kinEmail: true,
                kinPhone: true,
                kinName: true,
                kinRelation: true,
                isFirstLogin: true,


            }
        });
    }

    static async updateUser(id, updateData) {
        const { id: userId, createdAt, ...safeUpdateData } = updateData;
        console.log('Updating user with data 2:', safeUpdateData);
        console.log('User ID:', id);
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
                gender: true,
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


    static async deleteById(id) {
        const user = await prisma.user.findUnique({
            where: { id: id },
            include: { documents: true },
        });

        if (user.profileImage) {
            const publicId = extractPublicId(user.profileImagePublicId);
            await cloudinary.uploader.destroy(publicId);
        }

        for (const doc of user.documents) {
            if (doc.imagePublicId) {
                await cloudinary.uploader.destroy(doc.imagePublicId);
            }
        }
        try {
            return await prisma.user.delete({
                where: { id },
                select: {
                    id: true,
                },
            });
        } catch (error) {
            // Return null instead of throwing for "record not found"
            if (error.code === 'P2025') {
                return null;
            }
            throw error;
        }
    }

    static async findAllWithFilters({ page, limit, search, status }) {
        const skip = (page - 1) * limit;

        const where = {
            AND: [
                // Search by name or email
                {
                    OR: [
                        { firstName: { contains: search, mode: 'insensitive' } },
                        { lastName: { contains: search, mode: 'insensitive' } },
                        { email: { contains: search, mode: 'insensitive' } },
                    ],
                },
                // Optional status filter
                status ? { status } : {},
                // Optional date range filter
            ],
        };

        const [users, total] = await Promise.all([
            prisma.user.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                    status: true,
                    role: true,
                    createdAt: true,
                    phone: true,
                    employmentType: true,
                    joinedDate: true,

                },
            }),
            prisma.user.count({ where }),
        ]);

        return {
            users,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
}
