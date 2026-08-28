const path=require('path');const multer=require('multer');
const storage=multer.diskStorage({destination:(req,file,cb)=>cb(null,path.join(__dirname,'..','uploads')),filename:(req,file,cb)=>{const safe=String(file.originalname||'archivo').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-zA-Z0-9._-]/g,'-');cb(null,`${Date.now()}-${safe}`)}});
module.exports=multer({storage,limits:{fileSize:25*1024*1024,files:6},fileFilter:(req,file,cb)=>{const ok=/^(image|video)\//.test(file.mimetype);cb(ok?null:new Error('Solo imágenes o videos.'),ok)}});
