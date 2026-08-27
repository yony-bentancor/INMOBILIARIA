const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
  number: { type: Number, unique: true, index: true },
  propertyCode: { type: String, required: true, index: true },
  category: { type: String, required: true },
  title: String,
  description: String,
  phone: String,
  priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },
  status: {
    type: String,
    enum: ['Nuevo', 'Revisando', 'Técnico asignado', 'Aceptado', 'En camino', 'En reparación', 'Resuelto', 'Cancelado', 'Necesita presupuesto', 'Necesita repuesto'],
    default: 'Nuevo'
  },
  technicianName: String,
  attachments: [String],
  history: [{ status: String, note: String, at: { type: Date, default: Date.now } }]
}, { timestamps: true });

module.exports = mongoose.model('Complaint', complaintSchema);
