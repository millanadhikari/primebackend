import cloudinary from '../config/cloudinary.js';
import prisma from '../config/database.js';
import { getAssignedClientEmailTemplate } from '../services/emailService.js';
import { extractPublicId } from '../utils/cloudinaryUtils.js';
import { hashPassword } from '../utils/password.js';
import { ActivitiesModel } from './activitiesModel.js';
import { NotificationModel } from './notificationModel.js';

/**
 * User Model - Handles all database operations for users
 */
export class ClientModel {

    static async createClient(clientData) {
        console.log('Registering client with data:', clientData);
        const {
            firstName,
            middleName,
            lastName,
            email,
            phone,
            address,
            gender,
            dob,
            maritalStatus,
            religion,
            nationality,
            languageSpoken,
            generalInformation,
            usefulInformation,
            ndisNumber,
            agedCareRecipientId,
            referenceNumber,
            poNumber,
            clientType,
            teams,
            documents,
            forms,
            profilePictureUrl,
        } = clientData;

        // const clientCreateData = {
        //     firstName,
        //     middleName,
        //     lastName,
        //     email,
        //     phone,
        //     address,
        //     gender,
        //     dob,
        //     maritalStatus,
        //     religion,
        //     nationality,
        //     languageSpoken,
        //     generalInformation,
        //     usefulInformation,
        //     ndisNumber,
        //     agedCareRecipientId,
        //     referenceNumber,
        //     poNumber,
        //     clientType,
        //     team,
        //     documents,
        //     forms,
        //     profilePictureUrl,
        // };

        function sanitizeClientData(rawData) {
            const fieldsToKeep = [
                "firstName",
                "middleName",
                "lastName",
                "email",
                "phone",
                "address",
                "gender",
                "dob",
                "maritalStatus",
                "religion",
                "nationality",
                "languageSpoken",
                "generalInfo",
                "usefulInfo",
                "ndisNumber",
                "agedCareId",
                "referenceNumber",
                "poNumber",
                "clientType",
                "smsReminders",
                "invoiceTravel",
                "status",
                "teams",
                "documents",
                "forms",
                "contacts",
                "profilePictureUrl",
            ];

            const sanitized = {};
            for (const field of fieldsToKeep) {
                const value = rawData[field];

                // Convert arrays to Prisma connect format
                if (["teams", "documents", "forms", "contacts"].includes(field)) {
                    if (Array.isArray(value) && value.length > 0) {
                        sanitized[field] = {
                            connect: value.map((id) => ({ id })),
                        };
                    }
                }
                // Handle booleans
                else if (["smsReminders", "invoiceTravel"].includes(field)) {
                    sanitized[field] = typeof value === 'boolean' ? value : false;
                }
                // Everything else
                else {
                    sanitized[field] = value ?? null;
                }
            }

            return sanitized;
        }
        const cleanData = sanitizeClientData(clientData.clientData);
        try {
            console.log('Cleaned client data:', cleanData);
            const client = await prisma.client.create({
                data: cleanData,
                select: {
                    id: true,
                    email: true,
                    firstName: true,
                    lastName: true,
                    createdAt: true,

                }
            });
            await ActivitiesModel.createActivity({
                type: "CLIENT_ADDED",
                description: `New client registered`,
                userId: client.id, // Replace with actual admin ID or context
                userRole: 'CLIENT',
                userName: `${client.firstName} ${client.lastName}`,

                status: "INFO",
                targetType: "client",
                targetId: client.id,
            });

            return client;
        } catch (error) {
            if (error.code === 'P2002') {
                throw new Error('User with this email already exists');
            }
            throw error;
        }
    }

    static async findAll({ page = 1, limit = 10, search = '', ageGroup = 'All', status = 'all', user }) {
        const take = parseInt(limit, 10);
        const skip = (parseInt(page, 10) - 1) * take;
        const filters = [];

        // 🔍 Search by name, email, phone
        if (search) {
            filters.push({
                OR: [
                    { firstName: { contains: search, mode: 'insensitive' } },
                    { lastName: { contains: search, mode: 'insensitive' } },

                    { email: { contains: search, mode: 'insensitive' } },
                    { phone: { contains: search, mode: 'insensitive' } },
                ],
            });
        }

        // 🧒👩 Age group
        if (ageGroup === 'Adults') {
            filters.push({ age: { gte: 18 } });
        } else if (ageGroup === 'Children') {
            filters.push({ age: { lt: 18 } });
        }

        // 🟢🔴 Status
        if (status === 'active' || status === 'inactive') {
            filters.push({ status });
        }

        // ✅ Only return assigned clients for non-admin users
        if (user?.role !== 'ADMIN') {
            console.log("Applying assigned user filter for user ID:", user);
            filters.push({
                assignedUsers: {
                    some: { id: user.userId },
                },
            });
        }
        const where = filters.length ? { AND: filters } : {};

        const [clients, total] = await Promise.all([
            prisma.client.findMany({
                where,
                take,
                skip,
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                    status: true,
                    phone: true,
                    dob: true,
                    // Add other summary fields if needed (e.g., createdAt)
                },
            }),
            prisma.client.count({ where }),
        ]);

        const sanitized = clients.map(({ password, ...safe }) => safe);

        return {
            clients: sanitized,
            pagination: {
                total,
                page: parseInt(page, 10),
                limit: parseInt(limit, 10),
                totalPages: Math.ceil(total / limit),
            },
        };
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
        return await prisma.client.findUnique({
            where: { id },
            select: {
                id: true,
                title: true,
                firstName: true,
                middleName: true,
                lastName: true,
                phone: true,
                email: true,
                address: true,
                gender: true,
                dob: true,
                maritalStatus: true,
                religion: true,
                nationality: true,
                languageSpoken: true,
                status: true,
                profilePictureUrl: true,
                generalInfo: true,
                usefulInfo: true,
                ndisNumber: true,
                agedCareId: true,
                referenceNumber: true,
                poNumber: true,
                clientType: true,
                smsReminders: true,
                invoiceTravel: true,
                createdAt: true,
                updatedAt: true,

                // Uncomment if you want to include relations
                teams: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                documents: {
                    select: {
                        id: true,
                        name: true,
                        url: true,
                    },
                },
                forms: {
                    select: {
                        id: true,
                        title: true,
                        client: true,
                    },
                },
                contacts: {
                    select: {
                        id: true,
                        title: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        contactNumber: true,
                        address: true,
                        relation: true,
                        companyName: true,
                        purchaseOrder: true,
                        referenceNumber: true,
                        isPrimary: true,
                        isBilling: true,
                        clientId: true,
                        createdAt: true,
                        updatedAt: true,
                        client: true,
                    },
                },
                assignedUsers: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        role: true,
                        isActive: true,
                    },
                },
            },
        });
    }

    // static async update(clientId, updateData) {
    //     // const {createdAt, ...safeUpdateData } = updateData
    //     const id = clientId

    //     return await prisma.client.update({
    //         where: { id },
    //         data: updateData,
    //         select: {
    //             id: true,
    //             email: true,
    //             firstName: true,
    //             lastName: true,

    //         }
    //     });
    // }
    static async update(clientId, updateData) {
        const id = clientId;

        // 1. Fetch existing assigned users
        const existingClient = await prisma.client.findUnique({
            where: { id },
            include: { assignedUsers: true },
        });

        if (!existingClient) throw new Error("Client not found.");

        // 2. Handle document deletion if requested
        if (updateData.documents?.delete) {
            const docsToDelete = updateData.documents.delete;
            for (const doc of docsToDelete) {
                await prisma.document.deleteMany({
                    where: { id: doc.id, clientId: id },
                });
            }
            delete updateData.documents.delete;
        }

        let newAssignedUserIds = [];

        // 3. Detect new assignments
        if (updateData.assignedUsers) {
            const { connect = [], disconnect = [] } = updateData.assignedUsers;
            const currentIds = existingClient.assignedUsers.map((u) => u.id);
            newAssignedUserIds = connect
                .map((u) => u.id)
                .filter((id) => !currentIds.includes(id));

            updateData.assignedUsers = {
                ...(connect.length > 0 && { connect }),
                ...(disconnect.length > 0 && { disconnect }),
            };
        }

        // 4. Update client
        const updatedClient = await prisma.client.update({
            where: { id },
            data: updateData,
            select: { id: true, email: true, firstName: true, lastName: true },
        });

        // 5. Notify and email new assignees
        if (newAssignedUserIds.length > 0) {
            const newUsers = await prisma.user.findMany({
                where: { id: { in: newAssignedUserIds } },
            });

            for (const user of newUsers) {
                try {
                    // 5a. Send email
                    console.log(`📧 Sending client assignment email to ${user.email}`);
                    await getAssignedClientEmailTemplate({
                        staffEmail: user.email,
                        staffName: `${user.firstName} ${user.lastName}`,
                        clientName: `${updatedClient.firstName} ${updatedClient.lastName}`,
                        clientEmail: updatedClient.email,
                    });

                    // 5b. Create notification and emit real-time 
                    await NotificationModel.create({
                        userId: user.id,
                        title: "Client Assigned",
                        message: `You have been assigned to client "${updatedClient.firstName} ${updatedClient.lastName}".`,
                        type: 'client_assignment',
                        clientId: updatedClient.id,
                        actionUrl: `/ crm/clients/${updatedClient.id}`,
                        metadata: { clientName: `${updatedClient.firstName} ${updatedClient.lastName}` }
                    });
                } catch (error) {
                    console.error(`❌ Failed to notify/send email to ${user.email}:`, error);
                }
            }
        } else {
            console.log("ℹ️ No new users assigned. No emails or notifications sent.");
        }

        return updatedClient;
    }


    static async deleteById(id) {
        const client = await prisma.client.findUnique({
            where: { id: id },
            include: { documents: true },
        });

        if (client.profilePictureUrl) {
            const publicId = extractPublicId(client.profileImagePublicId);
            await cloudinary.uploader.destroy(publicId);
        }

        for (const doc of client.documents) {
            if (doc.imagePublicId) {
                await cloudinary.uploader.destroy(doc.imagePublicId);
            }
        }
        try {
            return await prisma.client.delete({
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
}
