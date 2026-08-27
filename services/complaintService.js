const mongoose = require('mongoose');
const Complaint = require('../models/Complaint');
const { complaints } = require('../data/demo');

function mongoReady() {
  return mongoose.connection.readyState === 1;
}

async function listComplaints() {
  if (mongoReady()) return Complaint.find().sort({ createdAt: -1 }).lean();
  return complaints;
}

async function findComplaint(id) {
  if (mongoReady()) return Complaint.findOne({ number: Number(id) }).lean();
  return complaints.find(c => Number(c.id) === Number(id));
}

async function createComplaint(payload) {
  if (mongoReady()) {
    const latest = await Complaint.findOne().sort({ number: -1 }).lean();
    const number = latest?.number ? latest.number + 1 : 100;
    return Complaint.create({ ...payload, number, history: [{ status: 'Nuevo', note: 'Reclamo recibido' }] });
  }
  const id = Math.max(...complaints.map(c => Number(c.id)), 100) + 1;
  const item = { id, ...payload, priority: payload.priority || 'medium', status: 'Nuevo', files: 0, technician: null, createdAt: new Date() };
  complaints.unshift(item);
  return item;
}

async function updateStatus(id, status) {
  if (mongoReady()) {
    return Complaint.findOneAndUpdate(
      { number: Number(id) },
      { $set: { status }, $push: { history: { status, note: `Estado actualizado a ${status}` } } },
      { new: true }
    ).lean();
  }
  const item = complaints.find(c => Number(c.id) === Number(id));
  if (item) item.status = status;
  return item;
}

module.exports = { listComplaints, findComplaint, createComplaint, updateStatus };
