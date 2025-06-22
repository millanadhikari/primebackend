

import { ClientService } from '../services/clientService.js';


export class ClientController {
    /**
     * Register a new client
     * POST /api/client/signup
     */
    static async signup(req, res, next) {
        try {
            const clientData = req.body;


            const result = await ClientService.register(clientData);

            console.log('Client registration result:', result);
            res.status(201).json({
                status: 'success',
                message: 'client registered successfully',
                data: {
                    client: result,

                },
            });
        } catch (error) {
            next(error);
        }
    }

    // get all clients 
    static async getAllClients(req, res, next) {
        try {
            const {
                page = 1,
                limit = 10,
                search = '',
                ageGroup = 'All', // All | Adults | Children
                status = 'all',   // all | active | inactive
            } = req.query;

            const result = await ClientService.getAll({
                page,
                limit,
                search,
                ageGroup,
                status,
            });

            res.status(200).json({
                status: 'success',
                message: 'Clients fetched successfully',
                data: result,
            });
        } catch (error) {
            next(error);
        }
    }

    // Update client profile

    static async updateProfile(req, res, next) {
        // console.error('Update profile called', req.params.id);
        try {
            const clientId = req.params.id;
            const updateData = req.body;
            console.log('Update datadfdfdfd:', updateData);
            

            const updatedClient = await ClientService.updateClient(clientId, updateData);

            res.status(200).json({
                status: 'success',
                message: 'Client updated successfully',
                data: { client: updatedClient },
            });
        } catch (error) {
            next(error);
        }
    }

    // ✅ New method to get a client by ID
    static async getClientById(req, res, next) {
        try {
            const { id } = req.params;
            const client = await ClientService.getById(id);

            if (!client) {
                return res.status(404).json({
                    status: 'fail',
                    message: 'Client not found',
                });
            }

            res.status(200).json({
                status: 'success',
                message: 'Client fetched successfully',
                data: { client },
            });
        } catch (error) {
            next(error);
        }
    }

    // Delete client profile
    static async deleteClientById(req, res, next) {
        try {
            const { id } = req.params;

            const deletedClient = await ClientService.deleteById(id);

            if (!deletedClient) {
                return res.status(404).json({
                    status: 'fail',
                    message: 'Client not found',
                });
            }

            res.status(200).json({
                status: 'success',
                message: 'Client deleted successfully',
                data: {
                    id: deletedClient.id,
                },
            });
        } catch (error) {
            next(error);
        }
    }
    /**
     * Health check
     * GET /api/auth/health
     */
    static async healthCheck(req, res, next) {
        try {
            res.status(200).json({
                status: 'success',
                message: 'Auth service is healthy',
                timestamp: new Date().toISOString(),
                service: 'authentication-api',
            });
        } catch (error) {
            next(error);
        }
    }
}
