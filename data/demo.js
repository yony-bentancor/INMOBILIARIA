const properties = [
  { id: 'p1', code: 'AB123X', address: 'Av. Brasil 1234', unit: '302', owner: 'Carlos', tenant: 'Martín', status: 'urgent' },
  { id: 'p2', code: 'POC220', address: 'Rivera 1540', unit: '202', owner: 'Carlos', tenant: 'Lucía', status: 'ok' },
  { id: 'p3', code: 'MVD401', address: 'Bv. España 2210', unit: 'Casa', owner: 'Carlos', tenant: 'Sofía', status: 'in_progress' }
];

const complaints = [
  { id: 124, propertyCode: 'AB123X', category: 'Agua', title: 'Pérdida de agua', description: 'Pierde agua debajo de la pileta de la cocina.', phone: '099 111 222', priority: 'urgent', status: 'Nuevo', files: 3, technician: null, createdAt: new Date() },
  { id: 123, propertyCode: 'POC220', category: 'Electricidad', title: 'Problema eléctrico', description: 'Salta la llave cuando se enciende el horno.', phone: '099 333 444', priority: 'medium', status: 'Técnico asignado', files: 1, technician: 'Juan Rodríguez', createdAt: new Date(Date.now() - 86400000) },
  { id: 122, propertyCode: 'MVD401', category: 'Cerradura', title: 'Cerradura trabada', description: 'La llave gira con dificultad.', phone: '098 555 666', priority: 'low', status: 'Resuelto', files: 0, technician: 'Juan Rodríguez', createdAt: new Date(Date.now() - 172800000) }
];

module.exports = { properties, complaints };
