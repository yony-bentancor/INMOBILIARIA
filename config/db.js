const mongoose = require('mongoose');

async function connectDB() {
  const useMongo = String(process.env.USE_MONGO).toLowerCase() === 'true';
  if (!useMongo) {
    console.log('🟡 MongoDB desactivado (USE_MONGO=false). QCASA usa datos demo en memoria.');
    return false;
  }

  if (!process.env.MONGO_URI) {
    console.warn('⚠️ USE_MONGO=true pero MONGO_URI no está definido. Se continúa sin MongoDB.');
    return false;
  }

  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('🟢 MongoDB Atlas conectado');
    return true;
  } catch (error) {
    console.error('🔴 Error conectando a MongoDB:', error.message);
    console.warn('La aplicación seguirá funcionando con datos demo en memoria.');
    return false;
  }
}

module.exports = connectDB;
