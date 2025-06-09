import { PrismaClient } from '@prisma/client';

// Create Prisma client instance
const prisma = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
    errorFormat: 'pretty',
});

// Database connection function
export const connectDatabase = async () => {
    try {
        await prisma.$connect();
        console.log('✅ Database connected successfully');

    } catch (error) {
        console.error('❌ Database connection failed:', error);
        throw error;
    }
};

// Database health check function
export const checkDatabaseHealth = async () => {
    try {
        await prisma.$queryRaw`SELECT 1`;
        return true;
    } catch (error) {
        console.error('Database health check failed:', error);
        return false;
    }
};

// Graceful disconnect function
export const disconnectDatabase = async () => {
    try {
        await prisma.$disconnect();
        console.log('✅ Database disconnected successfully');
    } catch (error) {
        console.error('❌ Database disconnect failed:', error);
    }
};

// Export the Prisma client for use in other files
export default prisma;