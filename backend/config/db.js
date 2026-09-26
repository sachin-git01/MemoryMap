import dns from 'dns';
import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    // Resolve MongoDB SRV records via public DNS if local ISP DNS fails
    try {
      dns.setServers(['8.8.8.8', '1.1.1.1']);
    } catch {}

    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/photoflow', {
      tlsAllowInvalidCertificates: true,
      serverSelectionTimeoutMS: 10000,
    });
    console.log(`[MongoDB] Connected successfully to host: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[MongoDB] Connection error: ${error.message}`);
    if (error.message.includes('IP that isn\'t whitelisted') || error.message.includes('Could not connect to any servers')) {
      console.warn('[MongoDB Hint] Please whitelist your IP address (or allow 0.0.0.0/0) in MongoDB Atlas Network Access.');
    }
  }
};
