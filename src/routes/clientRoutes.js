import express from 'express'
import { ClientController } from '../controllers/clientController.js';
import { authenticateToken, requireAdmin, requireCoordinatorOrAdmin } from '../middleware/auth.js';

const router = express.Router()


// AUTH ROUTES
//Create a new client (authentication required)
router.post('/signup', authenticateToken, requireCoordinatorOrAdmin, ClientController.signup);

// CLIENT ROUTES
// Get all clients (authentication required)')
router.get('/', authenticateToken, requireCoordinatorOrAdmin, ClientController.getAllClients);
//Get client by ID (authenticaFion required)
router.get('/:id', authenticateToken, requireCoordinatorOrAdmin, ClientController.getClientById);
// Update client profile (authentication required)
router.put('/:id', authenticateToken, requireCoordinatorOrAdmin, ClientController.updateProfile);
// Delete client profile (authentication required)
router.delete('/:id', authenticateToken, requireCoordinatorOrAdmin, ClientController.deleteClientById);

//STAFF ROUTES


export default router;