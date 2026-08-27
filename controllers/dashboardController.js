const { properties } = require('../data/demo');
const complaintService = require('../services/complaintService');
const { qrDataUrl } = require('../services/qrService');

const PENDING_STATUSES = ['Nuevo', 'Revisando'];
const IN_PROGRESS_STATUSES = [
  'Técnico asignado',
  'Aceptado',
  'En camino',
  'En reparación',
  'Necesita presupuesto',
  'Necesita repuesto'
];

exports.owner = async (req, res) => {
  const complaints = await complaintService.listComplaints();
  res.render('owner/dashboard.njk', {
    properties,
    complaints: complaints.slice(0, 5)
  });
};

exports.admin = async (req, res) => {
  const complaints = await complaintService.listComplaints();
  const filter = String(req.query.estado || 'todos').toLowerCase();

  const stats = {
    urgent: complaints.filter(c =>
      ['urgent', 'urgente', 'high', 'alta'].includes(String(c.priority || '').toLowerCase()) &&
      c.status !== 'Resuelto' &&
      c.status !== 'Cancelado'
    ).length,

    pending: complaints.filter(c =>
      PENDING_STATUSES.includes(c.status)
    ).length,

    inProgress: complaints.filter(c =>
      IN_PROGRESS_STATUSES.includes(c.status)
    ).length,

    resolved: complaints.filter(c =>
      c.status === 'Resuelto'
    ).length
  };

  let filteredComplaints = complaints;

  if (filter === 'pendientes') {
    filteredComplaints = complaints.filter(c =>
      PENDING_STATUSES.includes(c.status)
    );
  }

  if (filter === 'encurso') {
    filteredComplaints = complaints.filter(c =>
      IN_PROGRESS_STATUSES.includes(c.status)
    );
  }

  if (filter === 'resueltos') {
    filteredComplaints = complaints.filter(c =>
      c.status === 'Resuelto'
    );
  }

  if (filter === 'urgentes') {
    filteredComplaints = complaints.filter(c =>
      ['urgent', 'urgente', 'high', 'alta'].includes(String(c.priority || '').toLowerCase()) &&
      c.status !== 'Resuelto' &&
      c.status !== 'Cancelado'
    );
  }

  const columns = [
    'Nuevo',
    'Revisando',
    'Técnico asignado',
    'En reparación',
    'Resuelto'
  ];

  res.render('admin/dashboard.njk', {
    properties,
    complaints: filteredComplaints,
    columns,
    stats,
    activeFilter: filter
  });
};

exports.technician = async (req, res) => {
  const complaints = await complaintService.listComplaints();

  res.render('technician/dashboard.njk', {
    complaints: complaints.filter(c =>
      c.technician ||
      c.technicianName ||
      c.status === 'Técnico asignado'
    )
  });
};

exports.propertyQr = async (req, res) => {
  const property = properties.find(p => p.code === req.params.code);

  if (!property) {
    return res.status(404).send('Propiedad no encontrada');
  }

  const qr = await qrDataUrl(property.code);

  res.render('admin/qr.njk', {
    property,
    qr
  });
};
