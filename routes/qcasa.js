const r=require('express').Router();
const c=require('../controllers/qcasaController');
const upload=require('../middleware/qcasaUpload');

r.get('/',c.home);
r.get('/buscar',c.search);
r.get('/propiedad/:slug',c.detail);
r.post('/propiedad/:slug/consulta',c.inquiry);

/* Acceso y registro */
r.get('/ingresar',c.loginForm);
r.post('/ingresar',c.login);
r.get('/registro',c.registerForm);
r.post('/registro',c.register);
r.post('/salir',c.logout);

/* Portal usuario */
r.get('/mi-qcasa',c.requireUser,c.userDashboard);
r.get('/mi-qcasa/publicar',c.requireUser,c.userNewPropertyForm);
r.post('/mi-qcasa/propiedades',c.requireUser,upload.array('photos',8),c.userCreateProperty);
r.get('/mi-qcasa/propiedades/:id/editar',c.requireUser,c.userEditPropertyForm);
r.post('/mi-qcasa/propiedades/:id',c.requireUser,upload.array('photos',8),c.userUpdateProperty);
r.post('/mi-qcasa/propiedades/:id/reenviar',c.requireUser,c.userResubmitProperty);
r.post('/mi-qcasa/notificaciones/leer',c.requireUser,c.userMarkNotificationsRead);

/* Admin */
r.get('/admin',c.requireAdmin,c.adminDashboard);

r.get('/admin/usuarios',c.requireAdmin,c.adminUsers);
r.get('/admin/usuarios/nuevo',c.requireAdmin,c.adminUserNewForm);
r.post('/admin/usuarios',c.requireAdmin,c.adminUserCreate);
r.get('/admin/usuarios/:id/editar',c.requireAdmin,c.adminUserEditForm);
r.post('/admin/usuarios/:id',c.requireAdmin,c.adminUserUpdate);
r.post('/admin/usuarios/:id/toggle',c.requireAdmin,c.adminUserToggle);
r.post('/admin/usuarios/:id/eliminar',c.requireAdmin,c.adminUserDelete);

r.get('/admin/propiedades/nueva',c.requireAdmin,c.adminNewForm);
r.post('/admin/propiedades',c.requireAdmin,upload.array('photos',8),c.adminCreate);
r.get('/admin/propiedades/:id/editar',c.requireAdmin,c.adminEditForm);
r.post('/admin/propiedades/:id',c.requireAdmin,upload.array('photos',8),c.adminUpdate);
r.post('/admin/propiedades/:id/publicar',c.requireAdmin,c.adminTogglePublish);
r.post('/admin/propiedades/:id/aprobar',c.requireAdmin,c.adminApprove);
r.post('/admin/propiedades/:id/rechazar',c.requireAdmin,c.adminReject);
r.post('/admin/propiedades/:id/eliminar',c.requireAdmin,c.adminDelete);

module.exports=r;
