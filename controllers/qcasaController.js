const store=require('../data/qcasaMarketplaceStore');

const money=p=>`${p.currency} ${Number(p.price||0).toLocaleString('es-UY')}`;
const publicProperties=()=>store.properties.filter(p=>p.status==='Publicada');

exports.home=(req,res)=>{
  const featured=publicProperties().filter(p=>p.featured).slice(0,4);
  const latest=publicProperties().slice(0,6);
  res.render('qcasa/home.njk',{title:'QCASA | Encontrá tu próximo lugar',featured,latest,categories:store.categories,money});
};

exports.search=(req,res)=>{
  const q=String(req.query.q||'').trim().toLowerCase();
  const category=String(req.query.category||'');
  const operation=String(req.query.operation||'');
  const department=String(req.query.department||'');
  const maxPrice=Number(req.query.maxPrice||0);
  let results=publicProperties().filter(p=>{
    const hay=[p.title,p.summary,p.city,p.department,p.category].join(' ').toLowerCase();
    return (!q||hay.includes(q)) &&
      (!category||p.category===category) &&
      (!operation||p.operation===operation) &&
      (!department||p.department===department) &&
      (!maxPrice||Number(p.price)<=maxPrice);
  });
  const departments=[...new Set(publicProperties().map(p=>p.department))].sort();
  res.render('qcasa/search.njk',{title:'Buscar | QCASA',results,categories:store.categories,departments,filters:req.query,money});
};

exports.detail=(req,res)=>{
  const property=store.findBySlug(req.params.slug);
  if(!property||property.status!=='Publicada')return res.status(404).send('Propiedad no encontrada.');
  res.render('qcasa/detail.njk',{title:`${property.title} | QCASA`,property,money,consulted:req.query.consulta==='1'});
};

exports.inquiry=(req,res)=>{
  const property=store.findBySlug(req.params.slug);
  if(!property||property.status!=='Publicada')return res.status(404).send('Propiedad no encontrada.');
  store.inquiries.unshift({
    id:`CON-${Date.now()}`,
    propertyId:property.id,
    propertyTitle:property.title,
    name:String(req.body.name||'').trim(),
    phone:String(req.body.phone||'').trim(),
    email:String(req.body.email||'').trim(),
    message:String(req.body.message||'').trim(),
    createdAt:new Date().toISOString()
  });
  res.redirect(`/qcasa/propiedad/${property.slug}?consulta=1`);
};

exports.loginForm=(req,res)=>res.render('qcasa/login.njk',{title:'Ingresar | QCASA',error:null});
exports.login=(req,res)=>{
  const email=String(req.body.email||'').trim().toLowerCase();
  const password=String(req.body.password||'');
  if(email!==store.admin.email.toLowerCase()||password!==store.admin.password){
    return res.status(401).render('qcasa/login.njk',{title:'Ingresar | QCASA',error:'Usuario o contraseña incorrectos.'});
  }
  req.session.qcasaAdmin={email:store.admin.email,name:store.admin.name};
  req.session.save(()=>res.redirect('/qcasa/admin'));
};
exports.logout=(req,res)=>{
  delete req.session.qcasaAdmin;
  req.session.save(()=>res.redirect('/qcasa'));
};
exports.requireAdmin=(req,res,next)=>req.session?.qcasaAdmin?next():res.redirect('/qcasa/ingresar');

exports.adminDashboard=(req,res)=>{
  const sale=store.properties.filter(p=>p.operation==='Venta').length;
  const rent=store.properties.filter(p=>p.operation==='Alquiler').length;
  const published=store.properties.filter(p=>p.status==='Publicada').length;
  res.render('qcasa/admin/dashboard.njk',{
    title:'Administración | QCASA',
    properties:store.properties,
    inquiries:store.inquiries,
    stats:{total:store.properties.length,sale,rent,published,inquiries:store.inquiries.length},
    money,
    admin:req.session.qcasaAdmin
  });
};

const formPayload=req=>({
  title:String(req.body.title||'').trim(),
  category:String(req.body.category||'Casa'),
  operation:String(req.body.operation||'Venta'),
  department:String(req.body.department||'Montevideo').trim(),
  city:String(req.body.city||'').trim(),
  currency:String(req.body.currency||'USD'),
  price:Number(req.body.price||0),
  bedrooms:Number(req.body.bedrooms||0),
  bathrooms:Number(req.body.bathrooms||0),
  area:Number(req.body.area||0),
  summary:String(req.body.summary||'').trim(),
  contact:String(req.body.contact||'').trim(),
  featured:req.body.featured==='on',
  tone:String(req.body.category||'propiedad').toLowerCase()
});

exports.adminNewForm=(req,res)=>res.render('qcasa/admin/form.njk',{title:'Nueva propiedad | QCASA',property:null,categories:store.categories});
exports.adminCreate=(req,res)=>{
  const data=formPayload(req);
  const id=store.nextId();
  const slug=`${store.slugify(data.title)}-${id.toLowerCase()}`;
  store.properties.unshift({id,slug,status:'Publicada',...data});
  res.redirect('/qcasa/admin');
};
exports.adminEditForm=(req,res)=>{
  const property=store.findById(req.params.id);
  if(!property)return res.status(404).send('Propiedad no encontrada.');
  res.render('qcasa/admin/form.njk',{title:'Editar propiedad | QCASA',property,categories:store.categories});
};
exports.adminUpdate=(req,res)=>{
  const property=store.findById(req.params.id);
  if(!property)return res.status(404).send('Propiedad no encontrada.');
  Object.assign(property,formPayload(req));
  res.redirect('/qcasa/admin');
};
exports.adminTogglePublish=(req,res)=>{
  const property=store.findById(req.params.id);
  if(property)property.status=property.status==='Publicada'?'Borrador':'Publicada';
  res.redirect('/qcasa/admin');
};
exports.adminDelete=(req,res)=>{
  const index=store.properties.findIndex(p=>p.id===req.params.id);
  if(index>=0)store.properties.splice(index,1);
  res.redirect('/qcasa/admin');
};
