import { ActivitiesModel } from "../models/activitiesModel.js";

export class ActivitiesService {

    static async createActivity(activityData) {
        try {
            // Assuming ActivitiesModel is defined similarly to MessageModel
            const newActivity = await ActivitiesModel.createActivity(activityData);
            return newActivity;
        } catch (error) {
            console.error('Error creating activity:', error);
            throw error;
        }
    }

    static async getAllActivities(currentUser, res, req, next) {
        console.log('Fetching all activities for user:', currentUser);
        try {
            // Fetch all activities from the model
            return await ActivitiesModel.getActivities(currentUser, res, req, next);
            // return activities;
        } catch (error) {
            console.error('Error fetching activities:', error);
            throw error;
        }
    }

    // Additional methods for fetching, updating, etc. can be added here
}