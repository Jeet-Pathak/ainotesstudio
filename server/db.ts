import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ai_notes_studio';

// Setup connection listeners
mongoose.connection.on('connected', () => {
  console.log(`✅ [MongoDB] Connected successfully to database: ${mongoose.connection.name}`);
});

mongoose.connection.on('error', (err) => {
  console.error(`❌ [MongoDB] Connection error:`, err.message);
});

mongoose.connection.on('disconnected', () => {
  console.warn(`⚠️ [MongoDB] Disconnected from database`);
});

let isConnecting = false;

export async function connectToDatabase(): Promise<boolean> {
  if (mongoose.connection.readyState === 1) {
    return true;
  }

  if (isConnecting) {
    return false;
  }

  isConnecting = true;
  try {
    const maskedUri = MONGODB_URI.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@');
    console.log(`🔌 [MongoDB] Connecting to: ${maskedUri}`);

    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 6000,
    });

    console.log(`✅ [MongoDB] Ready and active on DB: ${mongoose.connection.name}`);
    isConnecting = false;
    return true;
  } catch (error: any) {
    isConnecting = false;
    console.warn(`⚠️ [MongoDB] Connection failed: ${error.message}`);
    console.log('💡 [MongoDB] Server will retry connecting periodically in the background.');
    
    // Auto-retry in 10 seconds if disconnected
    setTimeout(() => {
      if (mongoose.connection.readyState !== 1) {
        connectToDatabase();
      }
    }, 10000);

    return false;
  }
}

export function isDbConnected(): boolean {
  return mongoose.connection.readyState === 1;
}

