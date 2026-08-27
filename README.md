# QCASA

MVP de gestión de reparaciones para propiedades con entrada principal por QR.

## Idea central

**QR → reclamo → administrador → técnico → reparación → propietario informado → reclamo cerrado**

La interfaz está separada por tipo de usuario para que cada persona vea únicamente lo necesario.

## Experiencias

### Web institucional
Ruta: `/`

Explica QCASA y muestra:
- Cómo funciona
- Propietarios
- Técnicos
- Contacto
- Ingresar
- **Escanear QR** como acción principal

### Inquilino
No necesita usuario ni contraseña.

Rutas principales:
- `/qr`
- `/r/:codigo`
- `/mis-reclamos`
- `/emergencia`

El QR identifica propiedad y unidad. El inquilino no tiene que escribir dirección, propietario ni datos que QCASA ya conoce.

### Propietario
Ruta: `/propietario`

Ve:
- Inicio
- Mis propiedades
- Reclamos
- Notificaciones
- Documentos

### Técnico
Ruta: `/tecnico`

Ve:
- Trabajos
- Agenda
- Historial
- Mi perfil

### Administrador
Ruta: `/admin`

Ve toda la operación:
- Reclamos
- Propiedades
- Propietarios
- Inquilinos
- Técnicos
- Agenda
- Notificaciones
- Archivos
- Configuración

## Ejecutar localmente

```bash
npm install
npm run dev
```

Abrir:

```text
http://localhost:3000
```

Lector QR:

```text
http://localhost:3000/qr
```

QR demo:

```text
http://localhost:3000/r/AB123X
```

## Usuarios demo

- Admin: `admin@qcasa.uy` / `admin123`
- Propietario: `propietario@qcasa.uy` / `prop123`
- Técnico: `tecnico@qcasa.uy` / `tec123`

## MongoDB

El proyecto funciona sin Mongo:

```env
USE_MONGO=false
```

Para activar Atlas:

```env
USE_MONGO=true
MONGO_URI=mongodb+srv://usuario:clave@cluster.mongodb.net/qcasa?retryWrites=true&w=majority
```

## GitHub

No subas `.env`.

```bash
git add -A
git commit -m "QCASA experiencias separadas por rol"
git push
```

## Heroku

El proyecto incluye `Procfile` y `app.json`.

Variables mínimas:

```bash
heroku config:set USE_MONGO=false
heroku config:set SESSION_SECRET="una-clave-larga"
```

La cámara del navegador necesita HTTPS en producción. Heroku entrega HTTPS.

## Importante

Este proyecto sigue siendo un MVP. Algunas secciones de propietario, técnico y administrador están preparadas visualmente pero todavía usan datos demo. La persistencia real, usuarios seguros, archivos, notificaciones y búsquedas reales deben conectarse a MongoDB y servicios externos en las próximas etapas.
