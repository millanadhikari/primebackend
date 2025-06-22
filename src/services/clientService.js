import { UserModel } from '../models/userModel.js';
import { ClientModel } from '../models/clientModel.js';

import { comparePassword } from '../utils/password.js';
import { generateTokens, verifyRefreshToken, generateSecureToken } from '../utils/jwt.js';

export class ClientService {
  static async register(clientData) {
    try {
      const client = await ClientModel.createClient({
        clientData,
      });
      return client;
    } catch (error) {
      console.error('Error in createClient:', error);
      throw error;
    }
  }

  static async getAll(query) {
    try {
      const clients = await ClientModel.findAll(query);
      return clients;
    } catch (error) {
      console.error('Error fetching clients:', error);
      throw error;
    }
  }
  // ✅ New method for fetching by ID
  static async getById(id) {
    return await ClientModel.findById(id);
  }
  // You already have register here
  // static async register(data) { ... }


  static async getUserProfile(userId) {
    const user = await UserModel.findById(userId);
    if (!user) throw new Error('User not found');
    return user;
  }

  static async updateClient(clientId, updateData) {
    // const { password, role, adminLevel, permissions, ...safeUpdateData } = updateData;
    return await ClientModel.update(clientId, updateData);
  }

static async deleteById(id) {
    return await ClientModel.deleteById(id);
  }
}
