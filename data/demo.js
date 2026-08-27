const properties = [
  {
    id: 'p1',
    code: 'AB123X',
    address: 'Av. Brasil 1234',
    unit: '302',
    city: 'Montevideo',
    department: 'Montevideo',
    type: 'Apartamento',
    bedrooms: 2,
    owner: 'Carlos',
    ownerName: 'Carlos',
    tenant: { name: 'Martín', phone: '099 111 222', email: 'martin@email.com' },
    notes: 'Apartamento de 2 dormitorios.',
    status: 'urgent',
    active: true
  },
  {
    id: 'p2',
    code: 'POC220',
    address: 'Rivera 1540',
    unit: '202',
    city: 'Montevideo',
    department: 'Montevideo',
    type: 'Apartamento',
    bedrooms: 1,
    owner: 'Carlos',
    ownerName: 'Carlos',
    tenant: { name: 'Lucía', phone: '099 333 444', email: 'lucia@email.com' },
    notes: '',
    status: 'ok',
    active: true
  },
  {
    id: 'p3',
    code: 'MVD401',
    address: 'Bv. España 2210',
    unit: 'Casa',
    city: 'Montevideo',
    department: 'Montevideo',
    type: 'Casa',
    bedrooms: 3,
    owner: 'Carlos',
    ownerName: 'Carlos',
    tenant: { name: 'Sofía', phone: '098 555 666', email: 'sofia@email.com' },
    notes: '',
    status: 'in_progress',
    active: true
  }
];

const complaints = [
  {
    id: 124,
    propertyCode: 'AB123X',
    category: 'Agua',
    title: 'Pérdida de agua',
    description: 'Pierde agua debajo de la pileta de la cocina.',
    phone: '099 111 222',
    priority: 'urgent',
    status: 'Nuevo',
    files: 3,
    technician: null,
    createdAt: new Date(),
    invoices: []
  },
  {
    id: 123,
    propertyCode: 'POC220',
    category: 'Electricidad',
    title: 'Problema eléctrico',
    description: 'Salta la llave cuando se enciende el horno.',
    phone: '099 333 444',
    priority: 'medium',
    status: 'Técnico asignado',
    files: 1,
    technician: 'Juan Rodríguez',
    createdAt: new Date(Date.now() - 86400000),
    invoices: [
      {
        id: 'fac-123-1',
        number: 'FAC-000123',
        concept: 'Diagnóstico eléctrico',
        amount: 1850,
        currency: 'UYU',
        date: '2026-08-26',
        url: '#'
      }
    ]
  },
  {
    id: 122,
    propertyCode: 'MVD401',
    category: 'Cerradura',
    title: 'Cerradura trabada',
    description: 'La llave gira con dificultad.',
    phone: '098 555 666',
    priority: 'low',
    status: 'Resuelto',
    files: 0,
    technician: 'Juan Rodríguez',
    createdAt: new Date(Date.now() - 172800000),
    invoices: [
      {
        id: 'fac-122-1',
        number: 'FAC-000122',
        concept: 'Reparación de cerradura',
        amount: 2400,
        currency: 'UYU',
        date: '2026-08-25',
        url: '#'
      }
    ]
  }
];

module.exports = { properties, complaints };
