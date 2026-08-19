require("dotenv").config();

const mongoose = require("mongoose");
const connectDB = require("../config/db");
const User = require("../models/User");

async function seedAdmin() {
  if (!process.env.MONGO_URI) {
    throw new Error("Falta MONGO_URI en el archivo .env");
  }

  const connected = await connectDB();

  if (!connected) {
    throw new Error("No fue posible conectar con MongoDB.");
  }

  const name = process.env.ADMIN_NAME || "Administrador";
  const email = String(process.env.ADMIN_EMAIL || "")
    .trim()
    .toLowerCase();
  const password = process.env.ADMIN_PASSWORD || "";

  if (!email || !password) {
    throw new Error("Faltan ADMIN_EMAIL o ADMIN_PASSWORD en .env");
  }

  if (password.length < 8) {
    throw new Error("ADMIN_PASSWORD debe tener al menos 8 caracteres.");
  }

  const passwordHash = await User.hashPassword(password);

  const admin = await User.findOneAndUpdate(
    { email },
    {
      name,
      email,
      passwordHash,
      role: "admin",
      active: true
    },
    {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true
    }
  );

  console.log(`✅ Administrador listo: ${admin.email}`);
}

seedAdmin()
  .catch((error) => {
    console.error("❌", error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
