const users=require('../config/demoUsers');
exports.loginForm=(req,res)=>res.render('auth/login.njk',{title:'Ingresar | QCASA',error:null});
exports.login=(req,res)=>{const email=String(req.body.email||'').trim().toLowerCase();const password=String(req.body.password||'');const u=users.find(x=>x.email.toLowerCase()===email&&x.password===password);if(!u)return res.status(401).render('auth/login.njk',{title:'Ingresar | QCASA',error:'Usuario o contraseña incorrectos.'});req.session.user={id:u.id,email:u.email,role:u.role,name:u.name,phone:u.phone};req.session.save(()=>res.redirect(u.role==='admin'?'/admin':'/propietario'))};
exports.logout=(req,res)=>req.session.destroy(()=>res.redirect('/'));
