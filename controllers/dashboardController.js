const { properties } = require('../data/demo');
const complaintService = require('../services/complaintService');
const { qrDataUrl } = require('../services/qrService');

exports.owner = async (req, res) => {
  const complaints = await complaintService.listComplaints();
  res.render('owner/dashboard.njk', { properties, complaints: complaints.slice(0, 5) });
};

exports.admin = async (req, res) => {
  const complaints = await complaintService.listComplaints();
  const columns = ['Nuevo', 'Revisando', 'Técnico asignado', 'En reparación', 'Resuelto'];
  res.render('admin/dashboard.njk', { properties, complaints, columns });
};

exports.technician = async (req, res) => {
  const complaints = await complaintService.listComplaints();
  res.render('technician/dashboard.njk', { complaints: complaints.filter(c => c.technician || c.technicianName || c.status === 'Técnico asignado') });
};

exports.propertyQr = async (req, res) => {
  const property = properties.find(p => p.code === req.params.code);
  if (!property) return res.status(404).send('Propiedad no encontrada');
  const qr = await qrDataUrl(property.code);
  res.render('admin/qr.njk', { property, qr });
};
