const crypto = require('crypto');
function uid(prefix='id'){ return `${prefix}-${crypto.randomBytes(4).toString('hex')}`; }
function nowISO(){ return new Date().toISOString(); }
function safeNumber(v,fallback=0){ const n=Number(v); return Number.isFinite(n)?n:fallback; }
function money(v,c='UYU'){ return new Intl.NumberFormat('es-UY',{style:'currency',currency:c,maximumFractionDigits:0}).format(Number(v||0)); }
function daysUntil(d){ if(!d) return null; const t=new Date(`${d}T23:59:59`); if(Number.isNaN(t.getTime())) return null; return Math.ceil((t-Date.now())/86400000); }
function alertLevel(d,paid=false){ if(paid) return 'ok'; const x=daysUntil(d); if(x===null)return'neutral'; if(x<0||x<=7)return'danger'; if(x<=30)return'warning'; return'ok'; }
function alertText(d,paid=false){ if(paid)return'Cumplido'; const x=daysUntil(d); if(x===null)return'Sin fecha'; if(x<0)return`Vencido hace ${Math.abs(x)} día(s)`; if(x===0)return'Vence hoy'; return`Vence en ${x} día(s)`; }
function slugToken(){ return crypto.randomBytes(16).toString('hex'); }
module.exports={uid,nowISO,safeNumber,money,daysUntil,alertLevel,alertText,slugToken};
