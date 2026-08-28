const path = require('path');
const fs = require('fs');
const { uid, nowISO } = require('../utils/helpers');

const jsonPath = path.join(__dirname, 'qcasa-demo.json');
const raw = fs.readFileSync(jsonPath, 'utf8');
const data = JSON.parse(raw);

// Se exportan referencias mutables para que el CRUD demo siga funcionando en memoria.
// Los cambios NO se escriben automáticamente al JSON: al reiniciar Node vuelve el dataset original.
const properties = data.properties || [];
const technicians = data.technicians || [];
const complaints = data.complaints || [];
const alerts = data.alerts || [];
const payments = data.payments || [];
const documents = data.documents || [];
const audit = data.audit || [];

function findProperty(code) {
  return properties.find(p => p.code === code);
}

function nextPropertyCode() {
  const max = properties.reduce((acc, p) => {
    const n = Number(String(p.code || '').replace(/\D/g, '')) || 0;
    return Math.max(acc, n);
  }, 0);
  return `QC-${String(max + 1).padStart(4, '0')}`;
}

function nextComplaintNumber() {
  return complaints.reduce((acc, c) => Math.max(acc, Number(c.number) || 0), 100) + 1;
}

function addAudit(propertyCode, actor, action, detail) {
  audit.unshift({
    id: uid('aud'),
    propertyCode,
    at: nowISO(),
    actor,
    action,
    detail
  });
}

module.exports = {
  properties,
  technicians,
  complaints,
  alerts,
  payments,
  documents,
  audit,
  findProperty,
  nextPropertyCode,
  nextComplaintNumber,
  addAudit
};
