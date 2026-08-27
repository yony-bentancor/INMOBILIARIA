const { properties } = require('../data/demo');
const complaintService = require('../services/complaintService');

exports.showQrForm = (req, res) => {
  const property = properties.find(p => p.code === req.params.code);
  if (!property) return res.status(404).render('tenant/not-found.njk');
  res.render('tenant/report.njk', { property, minimal: true });
};

exports.createFromQr = async (req, res) => {
  const property = properties.find(p => p.code === req.params.code);
  if (!property) return res.status(404).render('tenant/not-found.njk');

  const payload = {
    propertyCode: property.code,
    category: req.body.category || 'Otro',
    title: req.body.quickIssue || req.body.category || 'Reclamo',
    description: req.body.description || '',
    phone: req.body.phone || '',
    priority: req.body.priority || 'medium'
  };
  const created = await complaintService.createComplaint(payload);
  const number = created.number || created.id;
  res.redirect(`/reclamos/${number}/recibido`);
};

exports.received = async (req, res) => {
  const complaint = await complaintService.findComplaint(req.params.id);
  if (!complaint) return res.status(404).render('tenant/not-found.njk');
  res.render('tenant/success.njk', { complaint, minimal: true });
};

exports.status = async (req, res) => {
  const complaint = await complaintService.findComplaint(req.params.id);
  if (!complaint) return res.status(404).render('tenant/not-found.njk');
  res.render('tenant/status.njk', { complaint, minimal: true });
};
