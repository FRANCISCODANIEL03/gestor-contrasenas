const mongoose = require('mongoose');
const os = require('os');

const connectDB = async () => {
  const MONGO_URI = process.env.MONGO_URI;
  try {
    await mongoose.connect(MONGO_URI);
    console.log(`[Auth] Conectado al Replica Set rs_users desde ${os.hostname()}`);
  } catch (err) {
    console.error('[Auth] Error conectando a MongoDB:', err);
    process.exit(1); // Detiene el microservicio si no hay base de datos
  }
};

module.exports = connectDB;