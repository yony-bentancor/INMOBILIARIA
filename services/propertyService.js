const mongoose = require('mongoose');
const Property = require('../models/Property');
const { properties } = require('../data/demo');

function mongoReady() {
  return mongoose.connection.readyState === 1;
}

function normalizeProperty(payload = {}) {
  return {
    address: String(payload.address || '').trim(),
    unit: String(payload.unit || '').trim(),
    city: String(payload.city || '').trim(),
    department: String(payload.department || '').trim(),
    type: String(payload.type || 'Apartamento').trim(),
    bedrooms: Number(payload.bedrooms || 0),
    tenant: {
      name: String(payload.tenantName || '').trim(),
      phone: String(payload.tenantPhone || '').trim(),
      email: String(payload.tenantEmail || '').trim()
    },
    notes: String(payload.notes || '').trim()
  };
}

function makeCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

async function listOwnerProperties(ownerName, ownerEmail) {
  if (mongoReady()) {
    return Property.find({
      active: true,
      $or: [
        { ownerEmail },
        { ownerName }
      ]
    }).sort({ createdAt: -1 }).lean();
  }

  return properties.filter(p =>
    p.active !== false &&
    (
      p.ownerName === ownerName ||
      p.owner === ownerName ||
      (ownerEmail && p.ownerEmail === ownerEmail)
    )
  );
}

async function findOwnerProperty(code, ownerName, ownerEmail) {
  if (mongoReady()) {
    return Property.findOne({
      code,
      active: true,
      $or: [{ ownerEmail }, { ownerName }]
    }).lean();
  }

  return properties.find(p =>
    p.code === code &&
    p.active !== false &&
    (
      p.ownerName === ownerName ||
      p.owner === ownerName ||
      (ownerEmail && p.ownerEmail === ownerEmail)
    )
  );
}

async function createOwnerProperty(payload, owner) {
  const data = normalizeProperty(payload);
  let code = makeCode();

  if (mongoReady()) {
    while (await Property.exists({ code })) code = makeCode();

    return Property.create({
      ...data,
      code,
      ownerName: owner.name,
      ownerEmail: owner.email,
      status: 'ok',
      active: true
    });
  }

  while (properties.some(p => p.code === code)) code = makeCode();

  const item = {
    id: `p${Date.now()}`,
    code,
    ...data,
    owner: owner.name,
    ownerName: owner.name,
    ownerEmail: owner.email,
    status: 'ok',
    active: true
  };

  properties.unshift(item);
  return item;
}

async function updateOwnerProperty(code, payload, owner) {
  const data = normalizeProperty(payload);

  if (mongoReady()) {
    return Property.findOneAndUpdate(
      {
        code,
        active: true,
        $or: [{ ownerEmail: owner.email }, { ownerName: owner.name }]
      },
      { $set: data },
      { new: true }
    ).lean();
  }

  const item = properties.find(p =>
    p.code === code &&
    p.active !== false &&
    (
      p.ownerName === owner.name ||
      p.owner === owner.name ||
      p.ownerEmail === owner.email
    )
  );

  if (!item) return null;

  Object.assign(item, data);
  return item;
}

async function deleteOwnerProperty(code, owner) {
  if (mongoReady()) {
    return Property.findOneAndUpdate(
      {
        code,
        active: true,
        $or: [{ ownerEmail: owner.email }, { ownerName: owner.name }]
      },
      { $set: { active: false } },
      { new: true }
    ).lean();
  }

  const index = properties.findIndex(p =>
    p.code === code &&
    p.active !== false &&
    (
      p.ownerName === owner.name ||
      p.owner === owner.name ||
      p.ownerEmail === owner.email
    )
  );

  if (index === -1) return false;
  properties.splice(index, 1);
  return true;
}

module.exports = {
  listOwnerProperties,
  findOwnerProperty,
  createOwnerProperty,
  updateOwnerProperty,
  deleteOwnerProperty
};
