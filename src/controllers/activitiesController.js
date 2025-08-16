import prisma from '../config/database.js';

import { ActivitiesService } from "../services/activitiesService.js";
export class ActivitiesController {


    static async createActivity(req, res, next) {
        try {
            const activityData = req.body;

            // Validate required fields
            if (!activityData.type || !activityData.description) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Activity type and description are required',
                });
            }

            const newActivity = await ActivitiesService.createActivity(activityData);

            res.status(201).json({
                status: 'success',
                message: 'Activity created successfully',
                data: {
                    activity: newActivity,
                },
            });
        } catch (error) {
            next(error);
        }
    }

    static async getAllActivities(req, res, next) {
        const userId = req.user?.userId; // Assuming authenticateToken middleware sets req.user
        console.log('Fetching all activities for user:', userId);
        const currentUser = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                role: true,
                firstName: true,
                lastName: true,
                // add more fields if needed for your use case
            },
        });


        try {
             await ActivitiesService.getAllActivities(currentUser, req, res, next);
            // res.status(200).json({
            //     status: 'success',
            //     data: {
            //         activities,
            //     },
            // });
        } catch (error) {
            next(error);
        }
    }
}