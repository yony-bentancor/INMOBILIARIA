# ETAPA 3 — Preparación MongoDB

Esta etapa se instala ENCIMA de Etapa 0A + Etapa 1 + Etapa 2.

## Objetivo
Dejar MongoDB estructuralmente preparado sin cambiar todavía el comportamiento operativo de la demo. La aplicación continúa usando los repositorios demo actuales. Esto es intencional: los controladores actuales son síncronos y Mongoose es asíncrono; activar Mongo como repositorio sin migrar esos contratos sería inseguro.

## Qué cambia
- `config/database.js`: conexión centralizada. Con `USE_MONGO=false` no intenta conectarse.
- `app.js`: arranque controlado; si se solicita Mongo y falta/falla la URI, la app no continúa silenciosamente.
- Modelos nuevos: Owner, User, Listing, Inquiry, Notification, Setting, Audit, Lead y Counter.
- `Property`: agrega `ownerId` estable y conserva snapshot de propietario; admite la forma de datos actual.
- `Complaint`: `technicianId` pasa a String para coincidir con IDs demo (`tec-...`).
- `Counter` + `counterService`: secuencias atómicas para sustituir `max+1` cuando Mongo sea el repositorio activo.
- `scripts/seedMongo.js`: semilla de prueba protegida para cargar el dataset demo en una base Mongo de desarrollo/demo/test.
- `.env.example`: documenta flags de Mongo y salvaguardas de semilla.
- `package.json`: agrega `npm run seed:mongo`.

## IMPORTANTE: qué NO cambia
- `USE_MONGO=false` debe seguir siendo el valor normal por ahora.
- QCASA y QPropiedades continúan leyendo/escribiendo los stores demo de la Etapa 2.
- No se modifican rutas, vistas, CSS ni UX.
- No se conecta una base real de producción todavía.
- Las contraseñas demo visibles se conservan por decisión del proyecto.

## Si solo querés continuar usando la demo
Reemplazá los archivos/carpetas de este ZIP y dejá:

    USE_MONGO=false

No necesitás configurar `MONGO_URI`.

## Prueba opcional de infraestructura Mongo (NO necesaria ahora)
Usar únicamente una base separada cuyo nombre contenga `demo`, `test` o `dev`.

    USE_MONGO=true
    MONGO_URI=mongodb+srv://.../qcasa_demo
    ALLOW_MONGO_SEED=true

Luego:

    npm run seed:mongo

La semilla BORRA las colecciones de esa base antes de cargarlas, por eso viene bloqueada por defecto. No usar contra una base con datos reales.

Después de probar, volver a:

    USE_MONGO=false
    ALLOW_MONGO_SEED=false

## Verificaciones realizadas
- Sintaxis (`node --check`) de app, conexión, modelos, contador y script de semilla.
- Se preserva el selector de repositorios demo creado en Etapa 2.
- No se pudo ejecutar una conexión real a Mongo desde el entorno de preparación porque no se proporcionó una URI/base de pruebas, y tampoco corresponde inventarla.

## Próximo paso
Etapa 4: archivos/front/rendimiento: almacenamiento de uploads abstraído, consolidación CSS progresiva, menú móvil admin, compresión/caché y paginación. La activación completa de Mongo debe hacerse después mediante repositorios asíncronos y pruebas, no con un simple cambio de flag.
