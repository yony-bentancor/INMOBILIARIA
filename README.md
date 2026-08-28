# QCASA V1 — Proyecto completo demo

QCASA centraliza la gestión de propiedades, inquilinos, propietarios, alquileres, impuestos, documentos, vencimientos, reclamos y proveedores.

## Incluido

- Administrador con dashboard.
- CRUD de propiedades.
- Ficha detallada: información, ubicación, fotos, propietario, inquilino, alquiler, servicios, impuestos, documentos, reparaciones, alertas, historial y QR.
- CRUD de técnicos / empresas.
- Reclamos desde QR sin registro del inquilino.
- Carga de fotos y videos en reclamos.
- Asignación de proveedor.
- Botón de WhatsApp con mensaje completo.
- Ficha pública del trabajo mediante token aleatorio.
- Cobros.
- Vencimientos y alertas automáticas por fecha.
- Documentos.
- Vista de propietario.
- Modelos MongoDB preparados para la siguiente etapa.

## Usuarios demo

Administrador
- admin@qcasa.uy
- admin123

Propietario
- propietario@qcasa.uy
- prop123

QR demo
- http://localhost:3000/r/QC-0001

## Instalación Windows

```powershell
npm install
copy .env.example .env
npm run dev
```

Abrir http://localhost:3000

## Alertas funcionando

Cada vez que se abre Dashboard o Vencimientos se recalculan según la fecha actual:
- vencido: rojo;
- 7 días o menos: rojo;
- 30 días o menos: amarillo;
- más de 30 días: verde;
- cumplido: verde.

No necesita cron para mostrar las alertas. Más adelante se puede agregar un proceso programado para enviar email o WhatsApp.

## Datos demo

Están en `data/demoStore.js`. Se pueden crear, modificar y borrar desde la interfaz, pero al reiniciar Node se restaura el demo. Esto es intencional para la etapa inicial.

## Fotos / videos

Los archivos cargados desde QR van a `/uploads`. En Heroku el disco es efímero, por eso en producción conviene migrar a Cloudinary, S3 o equivalente.

## WhatsApp

Desde un reclamo se asigna una empresa y se genera un enlace `wa.me` con:
- trabajo y número;
- propiedad;
- Google Maps;
- inquilino y teléfono;
- categoría y prioridad;
- descripción;
- fotos/videos;
- ficha pública del trabajo.

El administrador hace clic y confirma el envío en WhatsApp.

## MongoDB futuro

Los modelos ya están en `/models`. La V1 usa memoria para poder probar sin base de datos. La siguiente etapa será implementar services/repositories que usen MongoDB cuando `USE_MONGO=true`.

## Seguridad futura

Antes de almacenar datos bancarios o financieros sensibles se recomienda implementar usuarios persistentes, bcrypt, roles estrictos, auditoría, cifrado, backups, almacenamiento cloud seguro, CSRF, rate limiting y tokens con expiración.

## Heroku

Variables sugeridas:

```text
SESSION_SECRET=<clave-larga>
BASE_URL=https://TU-APP.herokuapp.com
USE_MONGO=false
NODE_ENV=production
```

Luego:

```powershell
git add -A
git commit -m "QCASA V1 completa"
git push
```
