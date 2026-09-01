const store = require('../data/demoStore');
const alertService = require('../services/alertService');
const whatsapp = require('../services/whatsappService');
const { safeNumber, daysUntil } = require('../utils/helpers');

const CLOSED_CLAIM_STATUSES = new Set(['Resuelto', 'Cancelado']);

function ownerLabel(property) {
  return String(property?.owner?.name || property?.owner?.email || 'Sin propietario').trim();
}

function deadlineCategory(alert) {
  const text = `${alert?.type || ''} ${alert?.title || ''} ${alert?.category || ''}`
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  if (text.includes('contribucion')) return 'contribucion';
  if (text.includes('primaria')) return 'primaria';
  if (text.includes('contrato') || text.includes('arrendamiento')) return 'contratos';
  if (text.includes('seguro')) return 'seguros';
  if (text.includes('alquiler') || text.includes('renta')) return 'alquileres';
  if (text.includes('impuesto') || text.includes('tributo') || text.includes('tax')) return 'impuestos';
  return 'otros';
}

function dateSort(a, b) {
  return String(a?.dueDate || '2999-12-31').localeCompare(String(b?.dueDate || '2999-12-31'));
}

function formatDateShort(value) {
  if (!value) return 'Sin fecha';
  const date = new Date(`${String(value).slice(0, 10)}T12:00:00Z`);
  if (Number.isNaN(date.getTime())) return String(value);
  return new Intl.DateTimeFormat('es-UY', {
    timeZone: 'America/Montevideo',
    day: '2-digit',
    month: 'short'
  }).format(date).replace('.', '');
}

function enrichDashboardAlert(alert, propertyMap) {
  const property = propertyMap.get(alert.propertyCode);
  return {
    ...alert,
    property,
    ownerName: ownerLabel(property),
    dateShort: formatDateShort(alert.dueDate)
  };
}

function paymentIsOverdue(payment) {
  if (String(payment?.status || '').toLowerCase() === 'pagado') return false;
  const days = daysUntil(payment?.dueDate);
  return days !== null && days < 0;
}

exports.dashboard = (req, res) => {
  const activeProperties = req.adminOwnerContext.properties.filter(property => property.active !== false);
  const selectedOwner = req.adminOwnerContext.selectedOwner;
  const codes = new Set(activeProperties.map(property => property.code));
  const propertyMap = new Map(activeProperties.map(property => [property.code, property]));

  const alerts = alertService.enrichedAlerts()
    .filter(alert => codes.has(alert.propertyCode))
    .map(alert => enrichDashboardAlert(alert, propertyMap));

  const pendingAlertsAll = alerts
    .filter(alert => !alert.paid && alert.dueDate)
    .sort(dateSort);

  const pendingAlerts = pendingAlertsAll.filter(alert => {
    const days = daysUntil(alert.dueDate);
    return days !== null && days >= 0 && days <= 30;
  });

  const openClaims = store.complaints
    .filter(claim => codes.has(claim.propertyCode) && !CLOSED_CLAIM_STATUSES.has(claim.status))
    .map(claim => ({
      ...claim,
      property: propertyMap.get(claim.propertyCode),
      ownerName: ownerLabel(propertyMap.get(claim.propertyCode))
    }))
    .sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt));

  const pendingPayments = store.payments
    .filter(payment => codes.has(payment.propertyCode) && payment.status !== 'Pagado')
    .map(payment => ({
      ...payment,
      property: propertyMap.get(payment.propertyCode),
      ownerName: ownerLabel(propertyMap.get(payment.propertyCode)),
      dateShort: formatDateShort(payment.dueDate),
      overdue: paymentIsOverdue(payment)
    }))
    .sort((a, b) => {
      if (a.overdue !== b.overdue) return a.overdue ? -1 : 1;
      return dateSort(a, b);
    });

  const nextSevenDays = pendingAlerts.filter(alert => {
    const days = daysUntil(alert.dueDate);
    return days !== null && days >= 0 && days <= 7;
  });

  const categoryConfig = [
    ['contribucion', 'Contribución'],
    ['primaria', 'Primaria'],
    ['contratos', 'Contratos'],
    ['seguros', 'Seguros'],
    ['alquileres', 'Alquileres'],
    ['impuestos', 'Impuestos'],
    ['otros', 'Otros']
  ];

  const deadlineGroups = categoryConfig
    .map(([key, label]) => {
      const allItems = pendingAlerts.filter(alert => deadlineCategory(alert) === key);
      return { key, label, count: allItems.length, items: allItems.slice(0, 5) };
    })
    .filter(group => group.count > 0);

  const attention = openClaims.slice(0, 6).map(claim => ({
    kind: 'Reclamo',
    level: String(claim.priority || '').toLowerCase() === 'urgent' ? 'danger' : 'warning',
    title: `#${claim.number} · ${claim.title}`,
    detail: claim.status,
    propertyCode: claim.propertyCode,
    property: claim.property,
    ownerName: claim.ownerName
  }));

  const totalMonthlyRent = activeProperties
    .filter(property => property.status === 'Alquilada')
    .reduce((sum, property) => sum + safeNumber(property.lease?.amount), 0);

  const ownerWhatsappUrl = selectedOwner
    ? whatsapp.buildWhatsappUrl(
        selectedOwner.phone,
        whatsapp.buildOwnerSummaryMessage({
          owner: selectedOwner,
          properties: activeProperties,
          openClaims,
          alerts: pendingAlerts,
          payments: pendingPayments
        })
      )
    : null;

  res.render('admin/dashboard.njk', {
    title: 'Dashboard | QCASA',
    owners: res.locals.adminOwners.map(o => ({...o, key:o.id, properties:store.ownerProperties(o.id).length})),
    selectedOwner: selectedOwner ? {...selectedOwner, key:selectedOwner.id} : null,
    properties: activeProperties,
    deadlineGroups,
    attention,
    latestClaims: openClaims.slice(0, 6),
    pendingPayments: pendingPayments.slice(0, 6),
    ownerWhatsappUrl,
    stats: {
      properties: activeProperties.length,
      owners: selectedOwner ? 1 : res.locals.adminOwners.length,
      openClaims: openClaims.length,
      pendingPayments: pendingPayments.length,
      overdueAlerts: 0,
      nextSevenDays: nextSevenDays.length,
      pendingDeadlines: pendingAlerts.length,
      totalMonthlyRent
    }
  });
};
