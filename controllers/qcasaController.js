const store=require('../data/qcasaMarketplaceStore');

const money=p=>`${p.currency} ${Number(p.price||0).toLocaleString('es-UY')}`;
const publicProperties=()=>store.properties.filter(p=>p.status==='Publicada');

const demoPhotoByCategory={
  Casa:'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1400&q=78',
  Local:'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1400&q=78',
  Apartamento:'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1400&q=78',
  Chacra:'https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?auto=format&fit=crop&w=1400&q=78',
  Campo:'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1400&q=78',
  Industrial:'https://images.unsplash.com/photo-1511818966892-d7d671e672a2?auto=format&fit=crop&w=1400&q=78'
};

const sessionUser=req=>req.session?.qcasaUser||null;
const isAdmin=req=>Boolean(req.session?.qcasaAdmin);
const cleanEmail=v=>String(v||'').trim().toLowerCase();
const clean=v=>String(v||'').trim();

function uploadedPhotos(req){
  return (req.files||[]).map(file=>`/uploads/qcasa/${file.filename}`);
}

function userFormPayload(req){
  return{
    title:clean(req.body.title),
    category:clean(req.body.category)||'Casa',
    operation:clean(req.body.operation)||'Venta',
    department:clean(req.body.department)||'Colonia',
    city:clean(req.body.city),
    currency:clean(req.body.currency)||'USD',
    price:Number(req.body.price||0),
    bedrooms:Number(req.body.bedrooms||0),
    bathrooms:Number(req.body.bathrooms||0),
    area:Number(req.body.area||0),
    summary:clean(req.body.summary),
    contact:clean(req.body.contact),
    featured:false,
    tone:(clean(req.body.category)||'propiedad').toLowerCase()
  };
}

function adminFormPayload(req){
  return{
    ...userFormPayload(req),
    featured:req.body.featured==='on'
  };
}

function withPhotos(req,data,property=null){
  const newPhotos=uploadedPhotos(req);
  const existing=property?.images||[];
  const photos=newPhotos.length?[...existing,...newPhotos]:existing;

  if(!photos.length){
    const fallback=demoPhotoByCategory[data.category]||demoPhotoByCategory.Casa;
    return {image:fallback,images:[fallback]};
  }

  return {image:photos[0],images:photos};
}

/* Público */
exports.home=(req,res)=>{
  const featured=publicProperties().filter(p=>p.featured).slice(0,4);
  const latest=publicProperties().slice(0,6);

  res.render('qcasa/home.njk',{
    title:'QCASA | Encontrá tu próximo lugar',
    featured,
    latest,
    categories:store.categories,
    money,
    qcasaUser:sessionUser(req)
  });
};

exports.search=(req,res)=>{
  const q=clean(req.query.q).toLowerCase();
  const category=clean(req.query.category);
  const operation=clean(req.query.operation);
  const department=clean(req.query.department);
  const maxPrice=Number(req.query.maxPrice||0);

  const results=publicProperties().filter(p=>{
    const hay=[p.title,p.summary,p.city,p.department,p.category].join(' ').toLowerCase();
    return (!q||hay.includes(q)) &&
      (!category||p.category===category) &&
      (!operation||p.operation===operation) &&
      (!department||p.department===department) &&
      (!maxPrice||Number(p.price)<=maxPrice);
  });

  const departments=[...new Set(publicProperties().map(p=>p.department))].sort();

  res.render('qcasa/search.njk',{
    title:'Buscar | QCASA',
    results,
    categories:store.categories,
    departments,
    filters:req.query,
    money,
    qcasaUser:sessionUser(req)
  });
};

exports.detail=(req,res)=>{
  const property=store.findBySlug(req.params.slug);

  if(!property||property.status!=='Publicada'){
    return res.status(404).send('Propiedad no encontrada.');
  }

  res.render('qcasa/detail.njk',{
    title:`${property.title} | QCASA`,
    property,
    money,
    consulted:req.query.consulta==='1',
    qcasaUser:sessionUser(req)
  });
};

exports.inquiry=(req,res)=>{
  const property=store.findBySlug(req.params.slug);

  if(!property||property.status!=='Publicada'){
    return res.status(404).send('Propiedad no encontrada.');
  }

  store.inquiries.unshift({
    id:`CON-${Date.now()}`,
    propertyId:property.id,
    propertyTitle:property.title,
    name:clean(req.body.name),
    phone:clean(req.body.phone),
    email:clean(req.body.email),
    message:clean(req.body.message),
    createdAt:new Date().toISOString()
  });

  res.redirect(`/qcasa/propiedad/${property.slug}?consulta=1`);
};

/* Login / registro */
exports.loginForm=(req,res)=>res.render('qcasa/login.njk',{
  title:'Ingresar | QCASA',
  error:null,
  demoAdmin:store.admin,
  demoUser:store.users[0]
});

exports.login=(req,res)=>{
  const email=cleanEmail(req.body.email);
  const password=String(req.body.password||'');

  if(email===store.admin.email.toLowerCase()&&password===store.admin.password){
    req.session.qcasaAdmin={id:store.admin.id,email:store.admin.email,name:store.admin.name};
    delete req.session.qcasaUser;
    return req.session.save(()=>res.redirect('/qcasa/admin'));
  }

  const user=store.findUserByEmail(email);

  if(user&&user.active!==false&&user.password===password){
    req.session.qcasaUser={id:user.id,email:user.email,name:user.name,phone:user.phone};
    delete req.session.qcasaAdmin;
    return req.session.save(()=>res.redirect('/qcasa/mi-qcasa'));
  }

  return res.status(401).render('qcasa/login.njk',{
    title:'Ingresar | QCASA',
    error:'Usuario o contraseña incorrectos.',
    demoAdmin:store.admin,
    demoUser:store.users[0]
  });
};

exports.registerForm=(req,res)=>res.render('qcasa/register.njk',{title:'Crear cuenta | QCASA',error:null});

exports.register=(req,res)=>{
  const name=clean(req.body.name);
  const email=cleanEmail(req.body.email);
  const phone=clean(req.body.phone);
  const password=String(req.body.password||'');
  const password2=String(req.body.password2||'');

  if(!name||!email||!phone||password.length<4){
    return res.status(400).render('qcasa/register.njk',{
      title:'Crear cuenta | QCASA',
      error:'Completá nombre, email, teléfono y una contraseña de al menos 4 caracteres.'
    });
  }

  if(password!==password2){
    return res.status(400).render('qcasa/register.njk',{
      title:'Crear cuenta | QCASA',
      error:'Las contraseñas no coinciden.'
    });
  }

  if(email===store.admin.email.toLowerCase()||store.findUserByEmail(email)){
    return res.status(409).render('qcasa/register.njk',{
      title:'Crear cuenta | QCASA',
      error:'Ya existe una cuenta con ese email.'
    });
  }

  const user={
    id:store.nextUserId(),
    name,email,phone,password,
    createdAt:new Date().toISOString(),
    active:true
  };

  store.users.push(user);

  req.session.qcasaUser={id:user.id,email:user.email,name:user.name,phone:user.phone};
  req.session.save(()=>res.redirect('/qcasa/mi-qcasa'));
};

exports.logout=(req,res)=>{
  delete req.session.qcasaAdmin;
  delete req.session.qcasaUser;
  req.session.save(()=>res.redirect('/qcasa'));
};

exports.requireAdmin=(req,res,next)=>isAdmin(req)?next():res.redirect('/qcasa/ingresar');
exports.requireUser=(req,res,next)=>sessionUser(req)?next():res.redirect('/qcasa/ingresar');

/* Usuario */
exports.userDashboard=(req,res)=>{
  const user=store.findUserById(req.session.qcasaUser.id);

  if(!user||user.active===false){
    delete req.session.qcasaUser;
    return res.redirect('/qcasa/ingresar');
  }

  const properties=store.userProperties(user.id)
    .slice()
    .sort((a,b)=>new Date(b.createdAt||0)-new Date(a.createdAt||0));

  const notifications=store.userNotifications(user.id);
  const unread=notifications.filter(n=>!n.read).length;

  res.render('qcasa/user/dashboard.njk',{
    title:'Mi QCASA',
    user,
    properties,
    notifications:notifications.slice(0,12),
    unread,
    money
  });
};

exports.userNewPropertyForm=(req,res)=>{
  const user=store.findUserById(req.session.qcasaUser.id);

  res.render('qcasa/user/property-form.njk',{
    title:'Publicar mi propiedad | QCASA',
    user,
    property:null,
    mode:'create',
    categories:store.categories,
    departments:store.activeDepartments,
    error:null
  });
};

exports.userCreateProperty=(req,res)=>{
  const user=store.findUserById(req.session.qcasaUser.id);
  if(!user)return res.redirect('/qcasa/ingresar');

  const data=userFormPayload(req);

  if(!data.title||!data.city||!data.price||!data.area||!data.summary){
    return res.status(400).render('qcasa/user/property-form.njk',{
      title:'Publicar mi propiedad | QCASA',
      user,property:null,mode:'create',
      categories:store.categories,departments:store.activeDepartments,
      error:'Completá todos los datos obligatorios.'
    });
  }

  if(!store.activeDepartments.includes(data.department)){
    return res.status(400).render('qcasa/user/property-form.njk',{
      title:'Publicar mi propiedad | QCASA',
      user,property:null,mode:'create',
      categories:store.categories,departments:store.activeDepartments,
      error:'Por el momento QCASA acepta publicaciones únicamente en Colonia.'
    });
  }

  const id=store.nextId();
  const slug=`${store.slugify(data.title)}-${id.toLowerCase()}`;
  const photoData=withPhotos(req,data);

  store.properties.unshift({
    id,slug,status:'Pendiente',
    ownerUserId:user.id,
    ownerName:user.name,
    ownerEmail:user.email,
    ownerPhone:user.phone,
    submittedAt:new Date().toISOString(),
    createdAt:new Date().toISOString(),
    reviewedAt:null,
    reviewNote:'',
    ...photoData,
    ...data
  });

  store.addNotification(user.id,{
    type:'info',
    title:'Propiedad enviada',
    message:`Recibimos "${data.title}". El equipo de QCASA la revisará antes de publicarla.`,
    propertyId:id
  });

  res.redirect('/qcasa/mi-qcasa?enviada=1');
};

exports.userEditPropertyForm=(req,res)=>{
  const user=store.findUserById(req.session.qcasaUser.id);
  const property=store.findById(req.params.id);

  if(!property||property.ownerUserId!==user?.id)return res.status(404).send('Propiedad no encontrada.');

  if(!['Rechazada','Pendiente','Borrador'].includes(property.status)){
    return res.status(409).send('Esta publicación no se puede editar en su estado actual.');
  }

  res.render('qcasa/user/property-form.njk',{
    title:'Editar publicación | QCASA',
    user,
    property,
    mode:'edit',
    categories:store.categories,
    departments:store.activeDepartments,
    error:null
  });
};

exports.userUpdateProperty=(req,res)=>{
  const user=store.findUserById(req.session.qcasaUser.id);
  const property=store.findById(req.params.id);

  if(!property||property.ownerUserId!==user?.id)return res.status(404).send('Propiedad no encontrada.');

  if(!['Rechazada','Pendiente','Borrador'].includes(property.status)){
    return res.status(409).send('Esta publicación no se puede editar en su estado actual.');
  }

  const data=userFormPayload(req);
  const photoData=withPhotos(req,data,property);

  Object.assign(property,data,photoData,{
    updatedAt:new Date().toISOString()
  });

  if(property.status==='Rechazada'){
    property.status='Borrador';
  }

  res.redirect('/qcasa/mi-qcasa');
};

exports.userResubmitProperty=(req,res)=>{
  const user=store.findUserById(req.session.qcasaUser.id);
  const property=store.findById(req.params.id);

  if(!property||property.ownerUserId!==user?.id)return res.status(404).send('Propiedad no encontrada.');
  if(!['Rechazada','Borrador'].includes(property.status))return res.status(409).send('No se puede reenviar esta propiedad.');

  property.status='Pendiente';
  property.submittedAt=new Date().toISOString();
  property.reviewedAt=null;
  property.reviewNote='';

  store.addNotification(user.id,{
    type:'info',
    title:'Propiedad reenviada',
    message:`"${property.title}" volvió a revisión.`,
    propertyId:property.id
  });

  res.redirect('/qcasa/mi-qcasa');
};

exports.userMarkNotificationsRead=(req,res)=>{
  const userId=req.session.qcasaUser.id;
  store.notifications.filter(n=>n.userId===userId).forEach(n=>{n.read=true;});
  res.redirect('/qcasa/mi-qcasa');
};

/* Admin usuarios */
exports.adminUsers=(req,res)=>{
  const users=store.users.map(u=>({
    ...u,
    propertyCount:store.userProperties(u.id).length,
    pendingCount:store.userProperties(u.id).filter(p=>p.status==='Pendiente').length
  }));

  res.render('qcasa/admin/users.njk',{
    title:'Usuarios | QCASA',
    users
  });
};

exports.adminUserNewForm=(req,res)=>res.render('qcasa/admin/user-form.njk',{
  title:'Nuevo usuario | QCASA',
  user:null,
  mode:'create'
});

exports.adminUserCreate=(req,res)=>{
  const email=cleanEmail(req.body.email);

  if(!clean(req.body.name)||!email||!clean(req.body.phone)||!req.body.password){
    return res.status(400).send('Faltan datos obligatorios.');
  }

  if(email===store.admin.email.toLowerCase()||store.findUserByEmail(email)){
    return res.status(409).send('Ya existe un usuario con ese email.');
  }

  store.users.push({
    id:store.nextUserId(),
    name:clean(req.body.name),
    email,
    phone:clean(req.body.phone),
    password:String(req.body.password),
    active:req.body.active!=='false',
    createdAt:new Date().toISOString()
  });

  res.redirect('/qcasa/admin/usuarios');
};

exports.adminUserEditForm=(req,res)=>{
  const user=store.findUserById(req.params.id);
  if(!user)return res.status(404).send('Usuario no encontrado.');

  res.render('qcasa/admin/user-form.njk',{
    title:`Editar ${user.name} | QCASA`,
    user,
    mode:'edit'
  });
};

exports.adminUserUpdate=(req,res)=>{
  const user=store.findUserById(req.params.id);
  if(!user)return res.status(404).send('Usuario no encontrado.');

  const email=cleanEmail(req.body.email);
  const duplicate=store.users.find(u=>u.id!==user.id&&u.email.toLowerCase()===email);
  if(duplicate||email===store.admin.email.toLowerCase())return res.status(409).send('Email ya utilizado.');

  user.name=clean(req.body.name);
  user.email=email;
  user.phone=clean(req.body.phone);
  if(req.body.password)user.password=String(req.body.password);
  user.updatedAt=new Date().toISOString();

  store.userProperties(user.id).forEach(p=>{
    p.ownerName=user.name;
    p.ownerEmail=user.email;
    p.ownerPhone=user.phone;
  });

  res.redirect('/qcasa/admin/usuarios');
};

exports.adminUserToggle=(req,res)=>{
  const user=store.findUserById(req.params.id);
  if(user)user.active=!user.active;
  res.redirect('/qcasa/admin/usuarios');
};

exports.adminUserDelete=(req,res)=>{
  const user=store.findUserById(req.params.id);
  if(!user)return res.status(404).send('Usuario no encontrado.');

  const count=store.userProperties(user.id).length;
  if(count)return res.status(409).send(`No se puede eliminar: el usuario tiene ${count} propiedad(es). Primero eliminá o reasigná esas publicaciones.`);

  const i=store.users.findIndex(u=>u.id===user.id);
  if(i>=0)store.users.splice(i,1);

  res.redirect('/qcasa/admin/usuarios');
};

/* Admin propiedades */
exports.adminDashboard=(req,res)=>{
  const sale=store.properties.filter(p=>p.operation==='Venta').length;
  const rent=store.properties.filter(p=>p.operation==='Alquiler').length;
  const published=store.properties.filter(p=>p.status==='Publicada').length;
  const pending=store.properties.filter(p=>p.status==='Pendiente');
  const rejected=store.properties.filter(p=>p.status==='Rechazada').length;

  res.render('qcasa/admin/dashboard.njk',{
    title:'Administración | QCASA',
    properties:store.properties,
    pending,
    inquiries:store.inquiries,
    stats:{
      total:store.properties.length,
      sale,rent,published,
      pending:pending.length,
      rejected,
      users:store.users.length,
      inquiries:store.inquiries.length
    },
    money,
    admin:req.session.qcasaAdmin
  });
};

exports.adminNewForm=(req,res)=>res.render('qcasa/admin/form.njk',{
  title:'Nueva propiedad | QCASA',
  property:null,
  categories:store.categories,
  departments:store.allDepartments
});

exports.adminCreate=(req,res)=>{
  const data=adminFormPayload(req);
  const id=store.nextId();
  const slug=`${store.slugify(data.title)}-${id.toLowerCase()}`;
  const photoData=withPhotos(req,data);

  store.properties.unshift({
    id,slug,status:'Publicada',
    ownerUserId:null,
    createdAt:new Date().toISOString(),
    ...photoData,
    ...data
  });

  res.redirect('/qcasa/admin');
};

exports.adminEditForm=(req,res)=>{
  const property=store.findById(req.params.id);
  if(!property)return res.status(404).send('Propiedad no encontrada.');

  res.render('qcasa/admin/form.njk',{
    title:'Editar propiedad | QCASA',
    property,
    categories:store.categories,
    departments:store.allDepartments
  });
};

exports.adminUpdate=(req,res)=>{
  const property=store.findById(req.params.id);
  if(!property)return res.status(404).send('Propiedad no encontrada.');

  const data=adminFormPayload(req);
  const photoData=withPhotos(req,data,property);

  Object.assign(property,data,photoData,{updatedAt:new Date().toISOString()});
  res.redirect('/qcasa/admin');
};

exports.adminTogglePublish=(req,res)=>{
  const property=store.findById(req.params.id);
  if(property)property.status=property.status==='Publicada'?'Borrador':'Publicada';
  res.redirect('/qcasa/admin');
};

exports.adminApprove=(req,res)=>{
  const property=store.findById(req.params.id);
  if(!property)return res.status(404).send('Propiedad no encontrada.');

  property.status='Publicada';
  property.reviewedAt=new Date().toISOString();
  property.reviewNote='Aprobada por administración.';

  if(property.ownerUserId){
    store.addNotification(property.ownerUserId,{
      type:'success',
      title:'¡Tu propiedad fue aceptada!',
      message:`"${property.title}" fue aprobada por QCASA y ya está publicada.`,
      propertyId:property.id
    });
  }

  res.redirect('/qcasa/admin#pendientes');
};

exports.adminReject=(req,res)=>{
  const property=store.findById(req.params.id);
  if(!property)return res.status(404).send('Propiedad no encontrada.');

  const reason=clean(req.body.reason)||'La publicación necesita ajustes antes de poder aprobarse.';
  property.status='Rechazada';
  property.reviewedAt=new Date().toISOString();
  property.reviewNote=reason;

  if(property.ownerUserId){
    store.addNotification(property.ownerUserId,{
      type:'danger',
      title:'Tu publicación necesita cambios',
      message:`"${property.title}" no fue aprobada. Motivo: ${reason}`,
      propertyId:property.id
    });
  }

  res.redirect('/qcasa/admin#pendientes');
};

exports.adminDelete=(req,res)=>{
  const index=store.properties.findIndex(p=>p.id===req.params.id);
  if(index>=0)store.properties.splice(index,1);
  res.redirect('/qcasa/admin');
};
