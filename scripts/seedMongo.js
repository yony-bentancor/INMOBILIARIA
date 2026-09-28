require('dotenv').config();
const mongoose=require('mongoose');
const {connectDatabase,disconnectDatabase}=require('../config/database');
const qp=require('../data/demoStore');
const qc=require('../data/qcasaMarketplaceStore');
const Property=require('../models/Property'); const Owner=require('../models/Owner'); const Technician=require('../models/Technician');
const Complaint=require('../models/Complaint'); const Alert=require('../models/Alert'); const Payment=require('../models/Payment'); const Document=require('../models/Document'); const Audit=require('../models/Audit');
const User=require('../models/User'); const Listing=require('../models/Listing'); const Inquiry=require('../models/Inquiry'); const Notification=require('../models/Notification'); const Setting=require('../models/Setting'); const Lead=require('../models/Lead'); const Counter=require('../models/Counter');
const asDate=v=>v?new Date(v):undefined;
const clean=o=>JSON.parse(JSON.stringify(o));
async function replace(Model,docs){ if(!docs.length)return; await Model.insertMany(docs,{ordered:false}); }
async function run(){
  if(String(process.env.ALLOW_MONGO_SEED||'').toLowerCase()!=='true') throw new Error('Semilla bloqueada. Usá ALLOW_MONGO_SEED=true únicamente contra una base de pruebas vacía.');
  if(String(process.env.USE_MONGO||'').toLowerCase()!=='true') throw new Error('La semilla requiere USE_MONGO=true.');
  await connectDatabase();
  const dbName=mongoose.connection.name;
  if(!/demo|test|dev/i.test(dbName) && String(process.env.ALLOW_NONTEST_SEED||'').toLowerCase()!=='true') throw new Error(`Base "${dbName}" no parece de pruebas. Semilla cancelada.`);
  const collections=[Property,Owner,Technician,Complaint,Alert,Payment,Document,Audit,User,Listing,Inquiry,Notification,Setting,Lead,Counter];
  for(const M of collections) await M.deleteMany({});
  await replace(Owner,qp.owners.map(o=>({...clean(o),legacyId:o.id,_id:undefined})));
  await replace(Property,qp.properties.map(p=>({...clean(p),lease:p.lease?{...p.lease,startDate:asDate(p.lease.startDate),endDate:asDate(p.lease.endDate)}:p.lease})));
  await replace(Technician,qp.technicians.map(clean));
  await replace(Complaint,qp.complaints.map(c=>({...clean(c),history:(c.history||[]).map(h=>({...h,at:asDate(h.at)}))})));
  await replace(Alert,qp.alerts.map(a=>({...clean(a),dueDate:asDate(a.dueDate)})));
  await replace(Payment,qp.payments.map(x=>({...clean(x),dueDate:asDate(x.dueDate),paidAt:asDate(x.paidAt)})));
  await replace(Document,qp.documents.map(x=>({...clean(x),issueDate:asDate(x.issueDate),dueDate:asDate(x.dueDate)})));
  await replace(Audit,qp.audit.map(x=>({...clean(x),legacyId:x.id,at:asDate(x.at),_id:undefined})));
  await replace(Lead,(qp.leads||[]).map(x=>({legacyId:x.id,source:'alta',name:x.name,email:x.email,phone:x.phone,message:x.message,status:x.status||'Nuevo',payload:clean(x)})));
  await replace(User,qc.users.map(u=>({legacyId:u.id,scope:'qcasa',role:'user',name:u.name,email:u.email,phone:u.phone,password:u.password,active:u.active!==false})));
  await User.create({legacyId:qc.admin.id,scope:'qcasa',role:'admin',name:qc.admin.name,email:qc.admin.email,password:qc.admin.password,active:true});
  await replace(Listing,qc.properties.map(p=>({...clean(p),listingId:p.id,_id:undefined,submittedAt:asDate(p.submittedAt),reviewedAt:asDate(p.reviewedAt),createdAt:asDate(p.createdAt)})));
  await replace(Inquiry,(qc.inquiries||[]).map(i=>({...clean(i),legacyId:i.id,_id:undefined,createdAt:asDate(i.createdAt)})));
  const notes=[...(qc.notifications||[]).map(n=>({...n,audience:'user'})),...(qc.adminNotifications||[]).map(n=>({...n,audience:'admin'}))];
  await replace(Notification,notes.map(n=>({...clean(n),legacyId:n.id,_id:undefined,createdAt:asDate(n.createdAt)})));
  await Setting.create({scope:'qcasa',values:clean(qc.settings)});
  console.log(`Semilla completada en ${dbName}: ${qp.properties.length} propiedades QPropiedades y ${qc.properties.length} publicaciones QCASA.`);
  await disconnectDatabase();
}
run().catch(async err=>{console.error(err.message);try{await disconnectDatabase();}catch{}process.exitCode=1;});
