const propertyService = require('../services/propertyService');
const complaintService = require('../services/complaintService');

const PENDING = ['Nuevo', 'Revisando'];
const IN_PROGRESS = [
  'Técnico asignado',
  'Aceptado',
  'En camino',
  'En reparación',
  'Necesita presupuesto',
  'Necesita repuesto'
];

function isUrgent(c) {
  return ['urgent', 'urgente', 'high', 'alta'].includes(
    String(c.priority || '').toLowerCase()
  ) && !['Resuelto', 'Cancelado'].includes(c.status);
}

async function ownerData(req) {
  const owner = req.session.user;
  const properties = await propertyService.listOwnerProperties(owner.name, owner.email);
  const codes = new Set(properties.map(p => p.code));
  const allComplaints = await complaintService.listComplaints();
  const complaints = allComplaints.filter(c => codes.has(c.propertyCode));

  return { owner, properties, complaints };
}

exports.dashboard = async (req, res) => {
  const { properties, complaints } = await ownerData(req);
  const filter = String(req.query.estado || 'todos').toLowerCase();

  const stats = {
    properties: properties.length,
    pending: complaints.filter(c => PENDING.includes(c.status)).length,
    inProgress: complaints.filter(c => IN_PROGRESS.includes(c.status)).length,
    urgent: complaints.filter(isUrgent).length,
    resolved: complaints.filter(c => c.status === 'Resuelto').length
  };

  let filtered = complaints;

  if (filter === 'pendientes') {
    filtered = complaints.filter(c => PENDING.includes(c.status));
  } else if (filter === 'encurso') {
    filtered = complaints.filter(c => IN_PROGRESS.includes(c.status));
  } else if (filter === 'urgentes') {
    filtered = complaints.filter(isUrgent);
  } else if (filter === 'resueltos') {
    filtered = complaints.filter(c => c.status === 'Resuelto');
  }

  res.render('owner/dashboard.njk', {
    properties,
    complaints: filtered,
    stats,
    activeFilter: filter
  });
};

exports.newPropertyForm = (req, res) => {
  res.render('owner/property-form.njk', {
    title: 'Nueva propiedad | QCASA',
    mode: 'create',
    property: {}
  });
};

exports.createProperty = async (req, res) => {
  if (!req.body.address) {
    return res.status(400).render('owner/property-form.njk', {
      title: 'Nueva propiedad | QCASA',
      mode: 'create',
      property: req.body,
      error: 'La dirección es obligatoria.'
    });
  }

  const property = await propertyService.createOwnerProperty(
    req.body,
    req.session.user
  );

  res.redirect(`/propietario/propiedades/${property.code}/editar?creada=1`);
};

exports.editPropertyForm = async (req, res) => {
  const property = await propertyService.findOwnerProperty(
    req.params.code,
    req.session.user.name,
    req.session.user.email
  );

  if (!property) return res.status(404).send('Propiedad no encontrada.');

  res.render('owner/property-form.njk', {
    title: 'Editar propiedad | QCASA',
    mode: 'edit',
    property,
    success: req.query.creada ? 'Propiedad creada correctamente. Ya tiene su código QR.' : null
  });
};

exports.updateProperty = async (req, res) => {
  const property = await propertyService.updateOwnerProperty(
    req.params.code,
    req.body,
    req.session.user
  );

  if (!property) return res.status(404).send('Propiedad no encontrada.');

  res.render('owner/property-form.njk', {
    title: 'Editar propiedad | QCASA',
    mode: 'edit',
    property,
    success: 'Los datos de la propiedad fueron actualizados.'
  });
};

exports.deleteProperty = async (req, res) => {
  await propertyService.deleteOwnerProperty(
    req.params.code,
    req.session.user
  );

  res.redirect('/propietario#propiedades');
};

exports.complaintDetail = async (req, res) => {
  const { properties } = await ownerData(req);
  const codes = new Set(properties.map(p => p.code));
  const complaint = await complaintService.findComplaint(req.params.id);

  if (!complaint || !codes.has(complaint.propertyCode)) {
    return res.status(404).send('Reclamo no encontrado.');
  }

  const property = properties.find(p => p.code === complaint.propertyCode);

  res.render('owner/complaint-detail.njk', {
    title: `Reclamo #${complaint.number || complaint.id} | QCASA`,
    complaint,
    property
  });
};

exports.profileForm = (req, res) => {
  res.render('owner/profile.njk', {
    title: 'Mi cuenta | QCASA',
    owner: req.session.user
  });
};

exports.updateProfile = (req, res) => {
  const name = String(req.body.name || '').trim();
  const email = String(req.body.email || '').trim().toLowerCase();
  const phone = String(req.body.phone || '').trim();

  if (!name || !email) {
    return res.status(400).render('owner/profile.njk', {
      title: 'Mi cuenta | QCASA',
      owner: { name, email, phone },
      error: 'Nombre y email son obligatorios.'
    });
  }

  req.session.user.name = name;
  req.session.user.email = email;
  req.session.user.phone = phone;

  req.session.save(() => {
    res.render('owner/profile.njk', {
      title: 'Mi cuenta | QCASA',
      owner: req.session.user,
      success: 'Tus datos fueron actualizados para esta sesión demo.'
    });
  });
};
