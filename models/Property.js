const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
  code: { type: String, unique: true, required: true, index: true },
  address: { type: String, required: true },
  unit: { type: String, default: '' },
  ownerName: String,
  tenant: {
    name: String,
    phone: String,
    email: String
  },
  active: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Property', propertySchema);
