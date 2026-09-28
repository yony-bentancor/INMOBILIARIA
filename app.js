require('dotenv').config();
const path=require('path');
const express=require('express');
const compression=require('compression');
const session=require('express-session');
const nunjucks=require('nunjucks');
const{exposeSession}=require('./middleware/auth');
const{money,alertLevel,alertText}=require('./utils/helpers');
const{connectDatabase}=require('./config/database');

const app=express();
const PORT=process.env.PORT||3000;

app.set('trust proxy',1);

nunjucks.configure(path.join(__dirname,'views'),{
  autoescape:true,
  express:app,
  noCache:process.env.NODE_ENV!=='production'
});

app.set('view engine','njk');
app.use(express.urlencoded({extended:true}));
app.use(express.json());
app.use(compression());

app.use(session({
  secret:process.env.SESSION_SECRET||'qcasa-dev-secret',
  resave:false,
  saveUninitialized:false,
  cookie:{
    secure:process.env.NODE_ENV==='production',
    httpOnly:true,
    sameSite:'lax',
    maxAge:1000*60*60*8
  }
}));

app.use(exposeSession);

/*
  Contexto de marca:
  - QPROPIEDADES = gestión
  - QCASA = inmobiliaria
  - / = Estudio QR / gateway

  Se usa para corregir títulos históricos como "Propiedades | QCASA"
  sin tocar la lógica de cada controlador.
*/
app.use((req,res,next)=>{
  const pathname=req.path||'';
  res.locals.isQCasa=pathname==='/qcasa'||pathname.startsWith('/qcasa/');
  res.locals.isQPropiedades=
    pathname==='/qpropiedades'||
    pathname==='/ingresar'||
    pathname==='/alta'||
    pathname==='/seguimiento'||
    pathname.startsWith('/admin')||
    pathname.startsWith('/propietario')||
    pathname.startsWith('/r/')||
    pathname.startsWith('/reclamo-enviado/')||
    pathname.startsWith('/trabajo/');
  next();
});

const staticOptions={maxAge:process.env.NODE_ENV==='production'?'7d':0,etag:true};
app.use('/css',express.static(path.join(__dirname,'public/css'),staticOptions));
app.use('/js',express.static(path.join(__dirname,'public/js'),staticOptions));
app.use('/img',express.static(path.join(__dirname,'public/img'),staticOptions));
app.use('/uploads',(req,res,next)=>{res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Content-Disposition','inline');next();},express.static(path.join(__dirname,'uploads'),{fallthrough:true}));

app.locals.money=money;
app.locals.alertLevel=alertLevel;
app.locals.alertText=alertText;

app.use('/',require('./routes/public'));
app.use('/',require('./routes/auth'));
app.use('/admin',require('./routes/admin'));
app.use('/propietario',require('./routes/owner'));
app.use('/qcasa',require('./routes/qcasa'));

app.use((err,req,res,next)=>{
  console.error(err);
  res.status(500).render('errors/500.njk',{
    title:res.locals.isQCasa?'Error | QCASA':'Error | QPROPIEDADES',
    error:process.env.NODE_ENV==='development'?err.message:null
  });
});

app.use((req,res)=>res.status(404).render('errors/404.njk',{
  title:res.locals.isQCasa?'Página no encontrada | QCASA':'Página no encontrada | QPROPIEDADES'
}));

async function start(){
  try{
    const db=await connectDatabase();
    if(db.connected) console.log('MongoDB conectado (infraestructura preparada; repositorios operativos continúan en modo demo en esta etapa).');
    app.listen(PORT,()=>console.log(`QPROPIEDADES + QCASA V4 activo en http://localhost:${PORT}`));
  }catch(err){
    console.error('No se pudo iniciar QCASA/QPROPIEDADES:',err.message);
    process.exitCode=1;
  }
}
if(require.main===module) start();
module.exports={app,start};
