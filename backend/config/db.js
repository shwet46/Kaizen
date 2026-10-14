const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
require('dotenv').config();
const mongoose = require('mongoose');

const dbConnect = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      console.warn('⚠️ MONGODB_URI not provided. Running without MongoDB.');
      return;
    }
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
    });
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('⚠️ MongoDB connection warning:', error.message);
    console.error('If deploying on Render, ensure MongoDB Atlas Network Access whitelist includes 0.0.0.0/0');
  }
};

mongoose.connection.on('error', (err) => {
  console.warn('⚠️ MongoDB connection error:', err.message);
});

mongoose.connection.on('disconnected', () => {
  console.warn('MongoDB connection lost. Reconnection will be attempted.');
});

mongoose.connection.on('reconnected', () => {
  console.log('MongoDB reconnected successfully.');
});

// Avoid indefinite query buffering if Mongo is offline
mongoose.set('bufferTimeoutMS', 3000);

dbConnect();

module.exports = mongoose;
