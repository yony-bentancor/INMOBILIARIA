const r=require('express').Router();
const c=require('../controllers/qcasaController');

r.get('/',c.home);
r.get('/buscar',c.search);
r.get('/propiedad/:slug',c.detail);
r.post('/propiedad/:slug/consulta',c.inquiry);

r.get('/ingresar',c.loginForm);
r.post('/ingresar',c.login);
r.post('/salir',c.logout);

r.get('/admin',c.requireAdmin,c.adminDashboard);
r.get('/admin/propiedades/nueva',c.requireAdmin,c.adminNewForm);
r.post('/admin/propiedades',c.requireAdmin,c.adminCreate);
r.get('/admin/propiedades/:id/editar',c.requireAdmin,c.adminEditForm);
r.post('/admin/propiedades/:id',c.requireAdmin,c.adminUpdate);
r.post('/admin/propiedades/:id/publicar',c.requireAdmin,c.adminTogglePublish);
r.post('/admin/propiedades/:id/eliminar',c.requireAdmin,c.adminDelete);

module.exports=r;
