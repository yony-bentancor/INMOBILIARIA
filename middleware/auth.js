function exposeSession(req,res,next){res.locals.sessionUser=req.session.user||null;next()}
function requireRole(...roles){return(req,res,next)=>{if(!req.session.user)return res.redirect('/ingresar');if(!roles.includes(req.session.user.role))return res.status(403).render('auth/forbidden.njk',{title:'Sin permisos | QCASA'});next()}}
module.exports={exposeSession,requireRole};
