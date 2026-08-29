const store=require('../data/demoStore');
const{safeNumber}=require('../utils/helpers');

const CLOSED_PAYMENT_STATUS='Pagado';

function currentPeriod(){
  const now=new Date();
  const parts=new Intl.DateTimeFormat('en-CA',{
    timeZone:'America/Montevideo',
    year:'numeric',
    month:'2-digit'
  }).formatToParts(now);

  const year=parts.find(x=>x.type==='year')?.value||String(now.getUTCFullYear());
  const month=parts.find(x=>x.type==='month')?.value||String(now.getUTCMonth()+1).padStart(2,'0');
  return `${year}-${month}`;
}

function periodLabel(period){
  const [year,month]=String(period||'').split('-').map(Number);
  if(!year||!month)return period||'';
  const d=new Date(Date.UTC(year,month-1,1,12,0,0));
  return new Intl.DateTimeFormat('es-UY',{
    timeZone:'America/Montevideo',
    month:'long',
    year:'numeric'
  }).format(d);
}

function formatDate(value){
  if(!value)return '—';
  const d=new Date(`${String(value).slice(0,10)}T12:00:00`);
  if(Number.isNaN(d.getTime()))return String(value);
  return new Intl.DateTimeFormat('es-UY',{
    timeZone:'America/Montevideo',
    day:'2-digit',
    month:'2-digit',
    year:'numeric'
  }).format(d);
}

function ownerKey(property){
  const email=String(property?.owner?.email||'').trim().toLowerCase();
  if(email)return `email:${email}`;
  return `name:${String(property?.owner?.name||'Sin propietario').trim().toLowerCase()}`;
}

function buildOwners(properties){
  const map=new Map();
  properties.forEach(property=>{
    const key=ownerKey(property);
    if(!map.has(key)){
      map.set(key,{
        key,
        name:property?.owner?.name||'Sin propietario',
        email:property?.owner?.email||''
      });
    }
  });
  return [...map.values()].sort((a,b)=>a.name.localeCompare(b.name,'es'));
}

function paymentStatus(payment,today){
  if(payment.status===CLOSED_PAYMENT_STATUS)return 'Pagado';
  if(!payment.dueDate)return 'Pendiente';
  return payment.dueDate<today?'Vencido':'Pendiente';
}

function paymentSort(a,b){
  const order={Vencido:0,Pendiente:1,Pagado:2};
  if(order[a.displayStatus]!==order[b.displayStatus]){
    return order[a.displayStatus]-order[b.displayStatus];
  }
  return String(a.dueDate||'2999-12-31').localeCompare(String(b.dueDate||'2999-12-31'));
}

function monthPeriodOptions(payments){
  const set=new Set(payments.map(p=>p.period).filter(Boolean));
  set.add(currentPeriod());
  return [...set]
    .sort((a,b)=>String(b).localeCompare(String(a)))
    .map(value=>({value,label:periodLabel(value)}));
}

exports.payments=(req,res)=>{
  const today=new Intl.DateTimeFormat('en-CA',{
    timeZone:'America/Montevideo',
    year:'numeric',
    month:'2-digit',
    day:'2-digit'
  }).format(new Date());

  const period=String(req.query.period||currentPeriod());
  const owner=String(req.query.owner||'all');

  const activeProperties=store.properties.filter(p=>p.active!==false);
  const propertyMap=new Map(activeProperties.map(p=>[p.code,p]));
  const owners=buildOwners(activeProperties);

  let payments=store.payments
    .filter(p=>p.period===period)
    .map(payment=>{
      const property=propertyMap.get(payment.propertyCode)||store.findProperty(payment.propertyCode)||null;
      const displayStatus=paymentStatus(payment,today);
      return{
        ...payment,
        property,
        ownerKey:ownerKey(property),
        displayStatus,
        dueDateLabel:formatDate(payment.dueDate),
        paidAtLabel:formatDate(payment.paidAt)
      };
    });

  if(owner!=='all'){
    payments=payments.filter(p=>p.ownerKey===owner);
  }

  payments.sort(paymentSort);

  const visibleProperties=owner==='all'
    ? activeProperties
    : activeProperties.filter(p=>ownerKey(p)===owner);

  const rentedProperties=visibleProperties.filter(p=>p.status==='Alquilada');

  const expected=rentedProperties.reduce((sum,p)=>sum+safeNumber(p.lease?.amount),0);
  const collected=payments
    .filter(p=>p.displayStatus==='Pagado')
    .reduce((sum,p)=>sum+safeNumber(p.amount),0);
  const pending=payments
    .filter(p=>p.displayStatus==='Pendiente')
    .reduce((sum,p)=>sum+safeNumber(p.amount),0);
  const overdue=payments
    .filter(p=>p.displayStatus==='Vencido')
    .reduce((sum,p)=>sum+safeNumber(p.amount),0);

  const stats={
    expected,
    collected,
    pending,
    overdue,
    expectedCount:rentedProperties.length,
    paidCount:payments.filter(p=>p.displayStatus==='Pagado').length,
    pendingCount:payments.filter(p=>p.displayStatus==='Pendiente').length,
    overdueCount:payments.filter(p=>p.displayStatus==='Vencido').length
  };

  const registerProperties=rentedProperties.map(p=>({
    code:p.code,
    address:p.address,
    unit:p.unit,
    amount:safeNumber(p.lease?.amount),
    currency:p.lease?.currency||'UYU',
    paymentDay:safeNumber(p.lease?.paymentDay,5),
    tenantName:p.tenant?.name||'',
    ownerName:p.owner?.name||''
  }));

  res.render('admin/payments.njk',{
    title:'Cobros | QCASA',
    payments,
    properties:registerProperties,
    owners,
    selectedOwner:owner,
    period,
    periodLabel:periodLabel(period),
    periodOptions:monthPeriodOptions(store.payments),
    stats,
    today
  });
};
