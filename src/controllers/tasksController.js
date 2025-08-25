import prisma from "../config/database.js";

export class TasksController {

    static async createTask(req, res) {
        try {
            const {
                title,
                description,
                clientName,
                assignedUserId,
                projectId,
                status,     // e.g., "TODO"
                priority,   // e.g., "MEDIUM"
                dueDate,
            } = req.body;

            if (!title || !clientName || !assignedUserId || !projectId) {
                return res.status(400).json({ error: "Required fields missing" });
            }

            const task = await prisma.task.create({
                data: {
                    title,
                    description,
                    clientName,
                    assignedUserId,
                    projectId,
                    status,
                    priority,
                    dueDate: dueDate ? new Date(dueDate) : null,
                },
            });

            res.status(201).json(task);
        } catch (error) {
            console.error("Create task error:", error);
            res.status(500).json({ error: "Failed to create task" });
        }
    }

    static async getAllTasks(req, res) {
        try {
            const { projectId, assignedUserId, status } = req.query;

            const where = {};
            if (projectId) where.projectId = projectId;
            if (assignedUserId) where.assignedUserId = assignedUserId;
            if (status) where.status = status;

            const tasks = await prisma.task.findMany({ where });
            res.json(tasks);
        } catch (error) {
            console.error("Fetch tasks error:", error);
            res.status(500).json({ error: "Failed to fetch tasks" });
        }
    }

    static async getTaskById(req, res) {
        try {
            const { id } = req.params;

            const task = await prisma.task.findUnique({
                where: { id },
                include: {
                    assignedUser: true,
                    project: true,
                    comments: {
                        include: {
                            user: true, // include user details of comment authors
                        },
                        orderBy: {
                            createdAt: "asc",
                        },
                    },
                },
            });

            if (!task) {
                return res.status(404).json({ error: "Task not found" });
            }

            res.json(task);
        } catch (error) {
            console.error("Get task by ID error:", error);
            res.status(500).json({ error: "Failed to fetch task" });
        }
    }

    static async updateTask(req, res) {
        try {
            const taskId = req.params.id;
            const updateData = { ...req.body };

            if (updateData.dueDate) {
                updateData.dueDate = new Date(updateData.dueDate);
            }

            const updatedTask = await prisma.task.update({
                where: { id: taskId },
                data: updateData,
            });

            res.json(updatedTask);
        } catch (error) {
            console.error("Update task error:", error);
            res.status(500).json({ error: "Failed to update task" });
        }
    }

    static async deleteTask(req, res) {
        try {
            const { id } = req.params;
            await prisma.task.delete({ where: { id } });
            res.status(200).json({
                status: 'success',
                message: 'Task succesfully deleted'
                
            });
        } catch (error) {
            console.error("Delete task error:", error);
            res.status(500).json({ error: "Failed to delete task" });
        }
    }
}