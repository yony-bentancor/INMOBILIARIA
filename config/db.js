const mongoose = require("mongoose");

async function connectDB() {
  if (!process.env.MONGO_URI) {
    console.warn("⚠️ MongoDB desactivado: MONGO_URI no está configurado.");
    return false;
  }

  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log(`✅ MongoDB conectado: ${mongoose.connection.name}`);
    return true;
  } catch (error) {
    console.error("❌ Error conectando MongoDB:", error.message);

    // En producción conviene fallar rápido si la app necesita DB.
    // Para esta plantilla la dejamos levantar igualmente.
    return false;
  }
}

module.exports = connectDB;
