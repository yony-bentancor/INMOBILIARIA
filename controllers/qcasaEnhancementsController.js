const store=require('../data/qcasaMarketplaceStore');
const base=require('./qcasaController');
const clean=v=>String(v||'').trim();
function normalizeVideoUrl(raw){
  const value=clean(raw); if(!value)return '';
  const yt=value.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([A-Za-z0-9_-]{6,})/i);
  return yt?`https://www.youtube.com/embed/${yt[1]}`:value;
}
function applyVideoAfter(handler,mode){
  return (req,res,next)=>{
    const propertyBefore=req.params?.id?store.findById(req.params.id):null;
    const wasPublished=propertyBefore?.status==='Publicada';
    const beforeIds=new Set(store.properties.map(p=>p.id));
    handler(req,res,next);
    const videoUrl=normalizeVideoUrl(req.body?.videoUrl);
    let property=propertyBefore;
    if(mode==='create')property=store.properties.find(p=>!beforeIds.has(p.id));
    if(!property)return;
    if((mode==='user-update'||mode==='user-published')&&wasPublished&&property.pendingChanges) property.pendingChanges.videoUrl=videoUrl;
    else property.videoUrl=videoUrl;
  };
}
exports.userCreate=applyVideoAfter(base.userCreateProperty,'create');
exports.userUpdate=applyVideoAfter(base.userUpdateProperty,'user-update');
exports.userPublishedChanges=applyVideoAfter(base.userSubmitPublishedChanges,'user-published');
exports.adminCreate=applyVideoAfter(base.adminCreate,'create');
exports.adminUpdate=applyVideoAfter(base.adminUpdate,'admin-update');
exports.adminDashboard=(req,res,next)=>{
  const render=res.render.bind(res);
  res.render=(view,locals={},cb)=>{
    if(view==='qcasa/admin/dashboard.njk'){
      locals.stats=locals.stats||{};
      locals.stats.total=store.properties.length;
      locals.stats.rejected=store.properties.filter(p=>p.status==='Rechazada').length;
      locals.stats.drafts=store.properties.filter(p=>p.status==='Borrador').length;
    }
    return render(view,locals,cb);
  };
  return base.adminDashboard(req,res,next);
};
exports.adminProperties=(req,res)=>{
  const selected=clean(req.query.status)||'Todos';
  const all=store.properties.slice().sort((a,b)=>new Date(b.updatedAt||b.createdAt||0)-new Date(a.updatedAt||a.createdAt||0));
  const counts={Todos:all.length,Publicada:all.filter(p=>p.status==='Publicada').length,Pendiente:all.filter(p=>p.status==='Pendiente').length,Rechazada:all.filter(p=>p.status==='Rechazada').length,Borrador:all.filter(p=>p.status==='Borrador').length,Cambios:all.filter(p=>p.changeStatus==='Pendiente'&&p.pendingChanges).length};
  let properties=all;
  if(selected==='Cambios')properties=all.filter(p=>p.changeStatus==='Pendiente'&&p.pendingChanges);
  else if(selected!=='Todos')properties=all.filter(p=>p.status===selected);
  res.render('qcasa/admin/properties.njk',{title:'Propiedades | Administración QCASA',properties,selected,counts});
};
/* Video público CC0 de demostración: prueba el reproductor de punta a punta. */
const demo=store.findById('QC-1001');
if(demo&&!demo.videoUrl){demo.videoUrl='https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4';demo.videoLabel='Video demo';}
