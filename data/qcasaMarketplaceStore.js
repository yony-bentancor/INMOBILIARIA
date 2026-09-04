const categories=['Casa','Local','Apartamento','Chacra','Campo','Industrial'];

const properties=[
  {id:'QC-1001',slug:'casa-pocitos-venta',title:'Casa luminosa en Pocitos',category:'Casa',operation:'Venta',department:'Montevideo',city:'Pocitos',price:315000,currency:'USD',bedrooms:3,bathrooms:2,area:180,featured:true,status:'Publicada',summary:'Casa de 3 dormitorios con patio, escritorio y garage.',tone:'casa',contact:'099 700 101'},
  {id:'QC-1002',slug:'casa-carrasco-alquiler',title:'Casa con jardín en Carrasco',category:'Casa',operation:'Alquiler',department:'Montevideo',city:'Carrasco',price:2450,currency:'USD',bedrooms:4,bathrooms:3,area:260,featured:false,status:'Publicada',summary:'Casa amplia, jardín arbolado y excelente entorno residencial.',tone:'casa',contact:'099 700 102'},
  {id:'QC-2001',slug:'local-centro-venta',title:'Local comercial sobre avenida',category:'Local',operation:'Venta',department:'Montevideo',city:'Centro',price:168000,currency:'USD',bedrooms:0,bathrooms:1,area:92,featured:false,status:'Publicada',summary:'Local al frente con gran visibilidad y depósito.',tone:'local',contact:'099 700 201'},
  {id:'QC-2002',slug:'local-cordon-alquiler',title:'Local en Cordón',category:'Local',operation:'Alquiler',department:'Montevideo',city:'Cordón',price:59000,currency:'UYU',bedrooms:0,bathrooms:1,area:78,featured:false,status:'Publicada',summary:'Local renovado, ideal servicios, oficina o comercio.',tone:'local',contact:'099 700 202'},
  {id:'QC-3001',slug:'apartamento-punta-carretas-venta',title:'Apartamento con terraza',category:'Apartamento',operation:'Venta',department:'Montevideo',city:'Punta Carretas',price:228000,currency:'USD',bedrooms:2,bathrooms:2,area:88,featured:true,status:'Publicada',summary:'Dos dormitorios, terraza al frente, garage y portería.',tone:'apartamento',contact:'099 700 301'},
  {id:'QC-3002',slug:'apartamento-malvin-alquiler',title:'Apartamento frente al mar',category:'Apartamento',operation:'Alquiler',department:'Montevideo',city:'Malvín',price:48500,currency:'UYU',bedrooms:2,bathrooms:1,area:72,featured:false,status:'Publicada',summary:'Vista despejada, living luminoso y cocina definida.',tone:'apartamento',contact:'099 700 302'},
  {id:'QC-4001',slug:'chacra-canelones-venta',title:'Chacra productiva con casa',category:'Chacra',operation:'Venta',department:'Canelones',city:'Progreso',price:285000,currency:'USD',bedrooms:3,bathrooms:2,area:65000,featured:false,status:'Publicada',summary:'6,5 hectáreas, casa principal, tajamar y galpón.',tone:'chacra',contact:'099 700 401'},
  {id:'QC-4002',slug:'chacra-colonia-alquiler',title:'Chacra para temporada larga',category:'Chacra',operation:'Alquiler',department:'Colonia',city:'Colonia del Sacramento',price:1650,currency:'USD',bedrooms:3,bathrooms:2,area:42000,featured:false,status:'Publicada',summary:'Entorno tranquilo, piscina y acceso rápido a la ciudad.',tone:'chacra',contact:'099 700 402'},
  {id:'QC-5001',slug:'campo-durazno-venta',title:'Campo ganadero',category:'Campo',operation:'Venta',department:'Durazno',city:'Carlos Reyles',price:690000,currency:'USD',bedrooms:0,bathrooms:0,area:2400000,featured:true,status:'Publicada',summary:'240 hectáreas, aguadas permanentes y buenos accesos.',tone:'campo',contact:'099 700 501'},
  {id:'QC-5002',slug:'campo-san-jose-alquiler',title:'Campo para explotación mixta',category:'Campo',operation:'Alquiler',department:'San José',city:'Ecilda Paullier',price:4200,currency:'USD',bedrooms:0,bathrooms:0,area:1800000,featured:false,status:'Publicada',summary:'180 hectáreas con divisiones, sombra y agua.',tone:'campo',contact:'099 700 502'},
  {id:'QC-6001',slug:'industrial-ruta-101-venta',title:'Planta industrial Ruta 101',category:'Industrial',operation:'Venta',department:'Canelones',city:'Colonia Nicolich',price:1250000,currency:'USD',bedrooms:0,bathrooms:4,area:2400,featured:true,status:'Publicada',summary:'Planta logística con oficinas, playa de maniobras y depósitos.',tone:'industrial',contact:'099 700 601'},
  {id:'QC-6002',slug:'industrial-ruta-5-alquiler',title:'Depósito logístico Ruta 5',category:'Industrial',operation:'Alquiler',department:'Montevideo',city:'La Tablada',price:7800,currency:'USD',bedrooms:0,bathrooms:3,area:1750,featured:false,status:'Publicada',summary:'Depósito con gran altura, docks y acceso para camiones.',tone:'industrial',contact:'099 700 602'}
];

const PHOTO_URLS=[
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1400&q=78',
  'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1400&q=78',
  'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1400&q=78',
  'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1400&q=78',
  'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1400&q=78',
  'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1400&q=78',
  'https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?auto=format&fit=crop&w=1400&q=78',
  'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1400&q=78',
  'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1400&q=78',
  'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1400&q=78',
  'https://images.unsplash.com/photo-1511818966892-d7d671e672a2?auto=format&fit=crop&w=1400&q=78',
  'https://images.unsplash.com/photo-1565793298595-6a879b1d9492?auto=format&fit=crop&w=1400&q=78'
];

properties.forEach((property,index)=>{
  property.image=PHOTO_URLS[index%PHOTO_URLS.length];
  property.images=[property.image];
});

const inquiries=[];
const admin={email:'admin@qcasa.uy',password:'qcasa123',name:'Administrador QCASA'};

const nextId=()=>{
  const nums=properties.map(p=>Number(String(p.id).replace(/\D/g,''))).filter(Boolean);
  return `QC-${String(Math.max(6002,...nums)+1).padStart(4,'0')}`;
};
const slugify=v=>String(v||'propiedad').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'');
const findBySlug=slug=>properties.find(p=>p.slug===slug);
const findById=id=>properties.find(p=>p.id===id);

module.exports={categories,properties,inquiries,admin,nextId,slugify,findBySlug,findById};
