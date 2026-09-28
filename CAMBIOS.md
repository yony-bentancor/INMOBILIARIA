# QCASA / QPROPIEDADES — Etapa 2: datos y repositorios

Esta etapa se instala DESPUÉS de Etapa 0A y Etapa 1. No conecta Mongo todavía y no cambia rutas, vistas ni diseño.

## Objetivo
Separar los controladores y servicios del almacenamiento concreto. La aplicación deja de importar `data/demoStore` y `data/qcasaMarketplaceStore` directamente desde la capa de aplicación.

Flujo actual:
`Controlador/Servicio -> Repository -> Adaptador DEMO -> JSON/memoria`

Flujo previsto en la próxima etapa:
`Controlador/Servicio -> Repository -> Adaptador DEMO o Mongo`

## Cambios
- Se agrega `repositories/qpropiedadesRepository.js` como punto único de acceso a datos de QPROPIEDADES.
- Se agrega `repositories/qcasaRepository.js` como punto único de acceso a datos de QCASA.
- Se agregan adaptadores demo que conservan exactamente los stores existentes.
- Controladores, `alertService` y `adminOwnerContext` pasan a depender de repositorios, no de archivos de datos.
- No se cambia el contenido del JSON ni se elimina el store demo: sigue siendo la fuente de datos actual.
- Los IDs estables de propietarios introducidos en Etapa 0A se conservan.
- `utils/helpers.js -> daysUntil()` ahora acepta `YYYY-MM-DD`, ISO completo y objetos `Date`, preparando los vencimientos para Mongo sin alterar la presentación actual.

## Decisiones deliberadas
- `USE_MONGO` todavía NO activa Mongo. Se implementará cuando modelos y relaciones estén alineados en Etapa 3.
- Los repositorios mantienen por ahora una API síncrona compatible con el código existente. La migración asíncrona se hará junto con el adaptador Mongo, evitando una reescritura prematura.
- No se unificaron las sesiones QCASA/QPROPIEDADES en esta etapa para no modificar permisos ni autenticación existente.
- No se modificó CSS, Nunjucks ni URLs.

## Archivos nuevos
- repositories/qpropiedadesRepository.js
- repositories/qcasaRepository.js
- repositories/adapters/qpropiedadesDemoRepository.js
- repositories/adapters/qcasaDemoRepository.js

## Archivos modificados
- controllers/adminDashboardController.js
- controllers/ownerController.js
- controllers/publicController.js
- controllers/adminComplaintsController.js
- controllers/adminController.js
- controllers/adminPaymentsController.js
- controllers/qcasaController.js
- controllers/qcasaEnhancementsController.js
- services/alertService.js
- middleware/adminOwnerContext.js
- utils/helpers.js

## Verificaciones realizadas
- Sintaxis `node --check` correcta en todos los `.js` del proyecto.
- No quedan imports directos de los stores en controllers/services/middleware/routes.
- QPROPIEDADES carga 42 propiedades demo y propietarios `own-001` a `own-005`.
- QCASA conserva sus propiedades y usuarios demo.
- `daysUntil()` devuelve el mismo resultado para una fecha `YYYY-MM-DD` y su equivalente como objeto `Date`.

## Pruebas recomendadas
1. Iniciar sesión en Admin y recorrer Dashboard, Propiedades, Propietarios, Reclamos y Cobros.
2. Entrar al portal de un propietario y comprobar que solo ve sus propiedades.
3. Abrir QCASA, buscar propiedades, entrar a fichas y usar favoritos/búsquedas guardadas.
4. Probar publicación/edición/moderación de una propiedad QCASA.
5. Crear un reclamo por QR y comprobar que aparece en administración.
6. Revisar alertas/vencimientos y confirmar que las fechas se muestran como antes.
