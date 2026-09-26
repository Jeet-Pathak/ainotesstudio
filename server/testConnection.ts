import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function run() {
  const uri = process.env.MONGODB_URI || '';
  console.log('Testing MongoDB URI:', uri.replace(/:([^@]+)@/, ':****@'));

  try {
    const conn = await mongoose.connect(uri, { serverSelectionTimeoutMS: 6000 });
    console.log('✅ CONNECTED TO MONGODB ATLAS SUCCESSFULLY!');
    console.log('Database Name:', conn.connection.name);
    console.log('Host:', conn.connection.host);
    await mongoose.disconnect();
    process.exit(0);
  } catch (err: any) {
    console.error('❌ Connection Failed:', err.message);
    process.exit(1);
  }
}

run();
