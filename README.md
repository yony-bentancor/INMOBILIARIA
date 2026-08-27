# QCASA

Base completa de un MVP de gestión de reparaciones por QR para propiedades.

## Incluye

- Index inspirado en la imagen de referencia suministrada.
- Flujo de inquilino sin login: `QR -> reclamo -> confirmación -> estado`.
- Panel de propietario.
- Panel administrador con bandeja tipo Trello/Kanban.
- Panel de técnico con acciones rápidas.
- Login demo por rol.
- QR por propiedad.
- MongoDB Atlas opcional.
- Configuración lista para GitHub y Heroku.
- `.env`, `.env.example`, `.gitignore`, `Procfile` y `app.json`.

## 1. Ejecutar localmente

```bash
npm install
npm run dev
```

Abrí: `http://localhost:3000`

### QR de prueba

`http://localhost:3000/r/AB123X`

## 2. Usuarios demo

- Admin: `admin@qcasa.uy` / `admin123`
- Propietario: `propietario@qcasa.uy` / `prop123`
- Técnico: `tecnico@qcasa.uy` / `tec123`

> Son credenciales de demostración. Antes de producción hay que reemplazarlas por usuarios almacenados en MongoDB, contraseñas con hash y recuperación segura.

## 3. MongoDB Atlas (opcional)

Por defecto el sistema funciona SIN Mongo:

```env
USE_MONGO=false
```

Cuando tengas Atlas listo:

1. Creá un cluster en MongoDB Atlas.
2. Creá un usuario de base de datos.
3. En `Network Access`, habilitá tu IP para desarrollo y configurá correctamente el acceso para Heroku.
4. Copiá la connection string.
5. En `.env`:

```env
USE_MONGO=true
MONGO_URI=mongodb+srv://usuario:clave@cluster.mongodb.net/qcasa?retryWrites=true&w=majority
```

Si Mongo falla, esta base continúa con datos demo para que la web no caiga durante el desarrollo.

## 4. GitHub

```bash
git init
git add .
git commit -m "Primer commit QCASA"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/qcasa.git
git push -u origin main
```

**Importante:** `.env` está dentro de `.gitignore`; no debe subirse a GitHub.

## 5. Heroku

Con Heroku CLI:

```bash
heroku login
heroku create qcasa-app
heroku config:set SESSION_SECRET="una-clave-larga"
heroku config:set USE_MONGO="false"
heroku config:set APP_URL="https://qcasa-app.herokuapp.com"
git push heroku main
```

Para activar Mongo luego:

```bash
heroku config:set USE_MONGO="true"
heroku config:set MONGO_URI="mongodb+srv://..."
```

Ver logs:

```bash
heroku logs --tail
```

## 6. Estructura

```text
qcasa/
├── app.js
├── package.json
├── Procfile
├── app.json
├── .env
├── .env.example
├── .gitignore
├── config/
├── controllers/
├── data/
├── middleware/
├── models/
├── routes/
├── services/
├── views/
└── public/
    ├── css/
    ├── js/
    └── img/
```

## 7. Próximos pasos recomendados

- Subida real de imágenes/video a S3 o Cloudinary.
- Usuarios reales en MongoDB y bcrypt.
- Notificaciones por WhatsApp/email.
- Asignación de técnicos y permisos más granulares.
- Historial de eventos por reclamo.
- WebSockets para estado en tiempo real.
- PWA para técnicos.
- Presupuestos y pagos, recién en una segunda etapa.
