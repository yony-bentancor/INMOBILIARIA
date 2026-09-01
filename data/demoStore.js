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

function text(value) {
  return String(value || '').trim();
}

function normalized(value) {
  return text(value).toLowerCase();
}

function ownerIdentity(owner = {}) {
  return normalized(owner.document) || normalized(owner.email) || normalized(owner.name);
}

// Por ahora los propietarios se construyen desde los datos ya existentes en cada propiedad.
// De esta forma la actualización funciona con el JSON demo actual sin exigir migración.
const owners = [];
const ownerByIdentity = new Map();

properties.forEach(property => {
  const snapshot = property.owner || {};
  const identity = ownerIdentity(snapshot);
  if (!identity) return;

  let owner = ownerByIdentity.get(identity);
  if (!owner) {
    owner = {
      id: uid('own'),
      name: text(snapshot.name),
      document: text(snapshot.document),
      phone: text(snapshot.phone),
      email: text(snapshot.email),
      address: text(snapshot.address),
      notes: '',
      active: true,
      createdAt: property.createdAt || nowISO(),
      updatedAt: property.updatedAt || nowISO()
    };
    owners.push(owner);
    ownerByIdentity.set(identity, owner);
  }

  property.ownerId = owner.id;
  property.owner = {
    name: owner.name,
    document: owner.document,
    phone: owner.phone,
    email: owner.email,
    address: owner.address
  };
});

function findProperty(code) {
  return properties.find(p => p.code === code);
}

function findOwner(id) {
  return owners.find(o => o.id === id);
}

function ownerProperties(ownerId) {
  return properties.filter(p => p.ownerId === ownerId);
}

function ownerSnapshot(owner) {
  if (!owner) return { name: '', document: '', phone: '', email: '', address: '' };
  return {
    name: owner.name || '',
    document: owner.document || '',
    phone: owner.phone || '',
    email: owner.email || '',
    address: owner.address || ''
  };
}

function syncOwnerToProperties(owner) {
  if (!owner) return;
  properties
    .filter(p => p.ownerId === owner.id)
    .forEach(p => {
      p.owner = ownerSnapshot(owner);
      p.updatedAt = nowISO();
    });
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
  owners,
  technicians,
  complaints,
  alerts,
  payments,
  documents,
  audit,
  findProperty,
  findOwner,
  ownerProperties,
  ownerSnapshot,
  syncOwnerToProperties,
  nextPropertyCode,
  nextComplaintNumber,
  addAudit
};
