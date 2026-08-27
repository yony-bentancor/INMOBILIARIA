const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
  code: { type: String, unique: true, required: true, index: true },
  address: { type: String, required: true },
  unit: { type: String, default: '' },
  city: { type: String, default: '' },
  department: { type: String, default: '' },
  type: { type: String, default: 'Apartamento' },
  bedrooms: { type: Number, default: 0 },
  ownerName: String,
  ownerEmail: String,
  tenant: {
    name: String,
    phone: String,
    email: String
  },
  notes: { type: String, default: '' },
  status: { type: String, default: 'ok' },
  active: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Property', propertySchema);
