
import prisma from "../config/database.js";


export class ActivitiesModel {
    static roleLabel(roleEnum) {
        if (!roleEnum) return null;
        switch (roleEnum) {
            case "ADMIN": return "Administrator";
            case "COORDINATOR": return "Care Coordinator";
            case "STAFF": return "Staff Member";
            case "CLIENT": return "Client";
            case "SYSTEM": return "System";
            default: return roleEnum;
        }
    }


    static async createActivity({ type, description, status, userId, userRole, userName, targetId, targetType }) {
        try {
         
            return await prisma.activity.create({
                data: {
                    type,
                    description,
                    status,
                    // userId: null,
                    userRole,   // stored for quick dashboard access
                    userName,    // optional, avoids join later
                    targetId,
                    targetType

                }
            });

        } catch (error) {
            console.error("Error creating activity:", error);
            throw error;
        }
    }



    static async getActivities(currentUser, req, res, next) {
        try {
            const currentUser = req.user; // from auth middleware
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 20;
            const offset = (page - 1) * limit;

            // Fetch activities from DB with pagination
            const activities = await prisma.activity.findMany({
                orderBy: { createdAt: "desc" },
                skip: offset,
                take: limit,
            });

            // Role-based filtering
            const filtered = activities.filter((a) => {
                if (currentUser.role !== "ADMIN" && a.type === "USER_CREATED") {
                    return false;
                }
                return true;
            });

            // Directly return items in frontend-ready format
            const response = filtered.map((a) => ({
                id: a.id,
                type: a.type, // Prisma enum string
                description: a.description,
                userId: a.userId,
                userRole: a.userRole || "SYSTEM",
                userName: a.userName || "System",
                createdAt: a.createdAt,
                status: a.status,
                targetType: a.targetType,
                targetId: a.targetId,
                meta: a.meta,
                actionUrl:
                    a.targetType && a.targetId
                        ? `/crm/${a.targetType.toLowerCase()}s/${a.targetId}`
                        : null,
            }));

            res.json({
                status: "success",
                data: {
                    activities: response,
                    pagination: {
                        page,
                        limit,
                        total: filtered.length,
                        hasMore: filtered.length === limit,
                    },
                },
            });
        } catch (error) {
            next(error);
        }
    };


    // Helper to get user-friendly role label

}
