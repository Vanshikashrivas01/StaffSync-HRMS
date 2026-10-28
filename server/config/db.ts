import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoServer: MongoMemoryServer | null = null;

/**
 * Boots an in-memory MongoDB instance using mongodb-memory-server
 * and connects Mongoose to it without needing any external MongoDB installation or URI.
 */
export const connectDB = async (): Promise<string> => {
  try {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();

    await mongoose.connect(mongoUri, {
      dbName: 'staffsync_db',
    });

    console.log(`✅ MongoDB In-Memory Server started successfully.`);
    console.log(`🔗 Mongoose connected to: ${mongoUri}`);
    return mongoUri;
  } catch (error) {
    console.error('❌ Failed to start and connect to mongodb-memory-server:', error);
    throw error;
  }
};

/**
 * Graceful cleanup of Mongoose and in-memory MongoDB on shutdown
 */
export const disconnectDB = async (): Promise<void> => {
  try {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    if (mongoServer) {
      await mongoServer.stop();
      mongoServer = null;
    }
    console.log('🛑 In-memory MongoDB stopped and disconnected.');
  } catch (error) {
    console.error('Error stopping in-memory database:', error);
  }
};
