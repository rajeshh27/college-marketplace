const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    // In development, continue with in-memory mode
    if (process.env.NODE_ENV === 'development') {
      console.log('⚠️  Running in development mode without database');
      return;
    }
    process.exit(1);
  }
};

module.exports = connectDB;
