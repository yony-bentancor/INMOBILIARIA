# ETAPA 4 — Front, móvil y rendimiento

Aplicar sobre Etapas 0A + 1 + 2 + 3.

## Cambios
- QCASA: las 9 hojas CSS globales se consolidan en `qcasa-bundle.css`, preservando exactamente el orden de cascada. Los `<link>` pasan al `<head>` mediante un bloque `styles`.
- Admin QPropiedades: menú móvil colapsable (hamburguesa) por debajo de 1000 px; evita apilar todos los enlaces antes del contenido.
- Rendimiento: `compression` para respuestas HTTP; caché/ETag de CSS, JS e imágenes en producción.
- Búsqueda QCASA: paginación de 12 propiedades por página. Las búsquedas de “solo nuevas” (`qcNewSince`) conservan su comportamiento y no se paginan para que el filtro cliente siga siendo correcto.
- No se borran todavía las hojas CSS antiguas: quedan como respaldo, pero QCASA ya no las solicita individualmente.

## Importante al instalar
Ejecutar `npm install` porque se agrega la dependencia `compression`.

## Pruebas recomendadas
1. Abrir QCASA inicio, comprar, alquilar, mapa, detalle, Mi QCASA y publicar; comprobar que visualmente siguen iguales.
2. Reducir navegador a ancho móvil: menú QCASA debe seguir funcionando.
3. Entrar a `/admin`, reducir a móvil y probar ☰ / ×; verificar todos los enlaces.
4. Probar `/qcasa/buscar` con filtros y cambiar de página si hay más de 12 resultados.
5. Probar una búsqueda guardada con “ver nuevas” y comprobar que el contador/filtro de nuevas funciona.
6. En Heroku, confirmar que el deploy ejecuta `npm install` automáticamente a partir de package.json.

## Archivos
- app.js
- package.json
- controllers/qcasaController.js
- views/layouts/base.njk
- views/layouts/admin.njk
- views/qcasa/layout.njk
- views/qcasa/search.njk
- public/css/qcasa-bundle.css (nuevo)
- public/css/admin-mobile.css (nuevo)
- public/js/admin-mobile.js (nuevo)
