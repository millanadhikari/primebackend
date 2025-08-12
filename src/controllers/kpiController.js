
import prisma from "../config/database.js";


export class KpiController {
    static async getKpiData(req, res, next) {
        try {
            // Call the method correctly; don't override `res`
            const newClientsKPI = await KpiController.getTotalClientsKPI();
            const newUsersKPI = await KpiController.getTotalActiveUsersKPI();
            const newMessagesKPI = await KpiController.getTotalMessagesKPI();



            console.log('KPI Data:', newClientsKPI, newUsersKPI, newMessagesKPI);

            const kpiData = {
                totalClients: newClientsKPI,             // Example static data
                activeUsers: newUsersKPI,             // Example static data
                newMessages: newMessagesKPI,             // Example static data
                // notificationsSent: 200,       // Example static data
                // newClients: newClientsKPI     // Dynamic KPI from Prisma
            };

            return res.status(200).json({
                status: 'success',
                message: 'KPI data fetched successfully',
                data: kpiData,
            });
        } catch (error) {
            next(error);
        }
    }

    //     const adminKPIs = {
    //   totalClients: { value: 1284, change: 8.2, trend: "up" as const },
    //   activeUsers: { value: 47, change: 12.5, trend: "up" as const },
    //   newMessages: { value: 23, change: -5.3, trend: "down" as const },
    //   todayActivities: { value: 156, change: 15.8, trend: "up" as const }
    // };

    static async getTotalClientsKPI() {
        const now = new Date();
        // Get total clients currently
        const totalClientsNow = await prisma.client.count();
        // Start of current month
        const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        // Start of last month
        const startOfLastMonth = new Date(startOfThisMonth);
        startOfLastMonth.setMonth(startOfLastMonth.getMonth() - 1);

        // End of last month = Start of this month
        const endOfLastMonth = startOfThisMonth; // exclusive upper bound for query
        // Get total clients as of start of this month (i.e., created before this month)
        const totalClientsLastMonth = await prisma.client.count({
            where: {
                createdAt: {
                    gte: startOfLastMonth,   // first day of last month
                    lt: endOfLastMonth       // first day of this month
                }
            }
        });

        // If the previous total is zero, treat change as 0 to avoid division by zero
        const change = totalClientsLastMonth === 0
            ? 0
            : ((totalClientsNow - totalClientsLastMonth) / totalClientsLastMonth) * 100;

        // Determine trend
        const trend = change > 0 ? 'up' : change < 0 ? 'down' : 'neutral';

        return {
            value: totalClientsNow,
            change: parseFloat(change.toFixed(2)),
            trend
        };
    }

    static async getTotalActiveUsersKPI() {
        const now = new Date();

        // Get total active users now (all-time active)
        const totalActiveUsersNow = await prisma.user.count({
            where: { isActive: true }
        });

        // Start of current month
        const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        // Start of last month
        const startOfLastMonth = new Date(startOfThisMonth);
        startOfLastMonth.setMonth(startOfLastMonth.getMonth() - 1);

        // End of last month = Start of this month
        const endOfLastMonth = startOfThisMonth; // exclusive upper bound

        // Count active users that existed in last month
        const totalActiveUsersLastMonth = await prisma.user.count({
            where: {
                isActive: true,
                createdAt: {
                    gte: startOfLastMonth,
                    lt: endOfLastMonth
                }
            }
        });

        // Calculate percentage change compared to last month
        const change = totalActiveUsersLastMonth === 0
            ? 0
            : ((totalActiveUsersNow - totalActiveUsersLastMonth) / totalActiveUsersLastMonth) * 100;

        // Determine trend
        const trend = change > 0 ? 'up' : change < 0 ? 'down' : 'neutral';

        return {
            value: totalActiveUsersNow,
            change: parseFloat(change.toFixed(2)),
            trend
        };
    }

    static async getTotalMessagesKPI() {
        const now = new Date();

        // Total messages now (all-time)
        const totalMessagesNow = await prisma.message.count();

        // Start of this month
        const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        // Start of last month
        const startOfLastMonth = new Date(startOfThisMonth);
        startOfLastMonth.setMonth(startOfLastMonth.getMonth() - 1);

        // End of last month = start of this month
        const endOfLastMonth = startOfThisMonth;

        // Total messages created last month
        const totalMessagesLastMonth = await prisma.message.count({
            where: {
                receivedAt: {
                    gte: startOfLastMonth,
                    lt: endOfLastMonth
                }
            }
        });

        // Calculate percentage change
        const change = totalMessagesLastMonth === 0
            ? 0
            : ((totalMessagesNow - totalMessagesLastMonth) / totalMessagesLastMonth) * 100;

        // Determine trend
        const trend = change > 0 ? 'up' : change < 0 ? 'down' : 'neutral';

        return {
            value: totalMessagesNow,
            change: parseFloat(change.toFixed(2)),
            trend
        };
    }


}

