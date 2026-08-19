# BASE NODE + EXPRESS + MONGODB ATLAS

Plantilla inicial reutilizable para proyectos con:

- Node.js
- Express
- Nunjucks
- MongoDB Atlas + Mongoose
- Registro de usuarios
- Login / logout
- Contraseñas con bcrypt
- Roles `user` y `admin`
- Sesiones
- Panel de usuario
- Panel administrador
- CRUD genérico adaptable a producto / persona / usuario / casa / servicio
- CSS responsive
- Imágenes SVG de ejemplo
- Variables de entorno
- `.gitignore`
- Preparada para GitHub
- Preparada para Heroku
- Manejo de 404 y errores
- Helmet, compression y logs HTTP

---

## 1. Crear un proyecto nuevo

Copiá esta carpeta y cambiale el nombre.

Ejemplo:

```powershell
Copy-Item "BASE-NODE-EXPRESS-ATLAS" "mi-nuevo-proyecto" -Recurse
cd "mi-nuevo-proyecto"
```

No copies una carpeta `.git` de otro proyecto.

---

## 2. Instalar dependencias

```powershell
npm install
```

Esto también generará `package-lock.json`.

Para desarrollo:

```powershell
npm run dev
```

Para producción:

```powershell
npm start
```

---

## 3. Configurar variables de entorno

Copiá:

```powershell
Copy-Item .env.example .env
```

Editá `.env`.

Ejemplo:

```env
PORT=3000
NODE_ENV=development

MONGO_URI=mongodb+srv://USUARIO:CONTRASENA@cluster0.xxxxx.mongodb.net/mi_base?retryWrites=true&w=majority

SESSION_SECRET=un-secreto-muy-largo-y-dificil

ADMIN_NAME=Administrador
ADMIN_EMAIL=admin@ejemplo.com
ADMIN_PASSWORD=Cambiar123!
```

IMPORTANTE: `.env` está en `.gitignore` y NO debe subirse a GitHub.

---

## 4. MongoDB Atlas

1. Crear proyecto y cluster en MongoDB Atlas.
2. Crear un usuario de base de datos.
3. Autorizar tu IP o la red necesaria.
4. Copiar el connection string.
5. Pegar el string en `MONGO_URI`.
6. Elegir el nombre de la base en la URL.

Ejemplo:

```text
mongodb+srv://usuario:password@cluster0.xxxxx.mongodb.net/mercadocasas
```

Si la contraseña tiene caracteres especiales, deben estar correctamente codificados en la URL.

---

## 5. Crear administrador

Con MongoDB configurado:

```powershell
npm run seed:admin
```

Usa:

- `ADMIN_NAME`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`

del `.env`.

Podés ejecutar nuevamente el comando para actualizar ese administrador.

---

## 6. Rutas incluidas

### Público

- `/`
- `/items`
- `/auth/login`
- `/auth/register`

### Usuario autenticado

- `/dashboard`
- `/items/new`
- edición y eliminación de sus elementos

### Administrador

- `/admin`
- `/admin/users`

El administrador puede:

- ver cantidad de usuarios
- ver cantidad de administradores
- ver cantidad de elementos
- listar usuarios
- activar/desactivar usuarios
- convertir usuario en admin
- convertir admin en usuario

---

## 7. Modelo genérico Item

`models/Item.js` es intencionalmente genérico.

Tipos incluidos:

- producto
- persona
- usuario
- casa
- servicio
- otro

Cuando empieces un proyecto real, podés:

1. mantener `Item`, o
2. reemplazarlo por modelos específicos.

Ejemplos:

```text
models/
  Property.js
  Client.js
  Product.js
  Order.js
  User.js
```

---

## 8. Git y GitHub

Dentro del nuevo proyecto:

```powershell
git init
git add .
git commit -m "Proyecto inicial"
git branch -M main
```

Después creás un repositorio vacío en GitHub y conectás:

```powershell
git remote add origin URL-DE-TU-REPOSITORIO
git push -u origin main
```

Verificar:

```powershell
git status
git remote -v
```

---

## 9. Heroku

La plantilla incluye `Procfile`:

```text
web: npm start
```

En Heroku configurá las variables:

```powershell
heroku config:set MONGO_URI="TU_URL" --app TU-APP
heroku config:set SESSION_SECRET="TU_SECRETO" --app TU-APP
heroku config:set NODE_ENV="production" --app TU-APP
```

No es necesario configurar `PORT`; Heroku lo proporciona automáticamente.

Logs:

```powershell
heroku logs --tail --app TU-APP
```

---

## 10. Estructura

```text
BASE-NODE-EXPRESS-ATLAS/
│
├── config/
│   └── db.js
│
├── middlewares/
│   ├── appLocals.js
│   ├── auth.js
│   └── errorHandler.js
│
├── models/
│   ├── Item.js
│   └── User.js
│
├── public/
│   ├── css/
│   │   └── style.css
│   ├── img/
│   │   ├── logo.svg
│   │   └── placeholder.svg
│   └── js/
│       └── main.js
│
├── routes/
│   ├── admin.js
│   ├── auth.js
│   ├── index.js
│   └── items.js
│
├── scripts/
│   └── seedAdmin.js
│
├── views/
│   ├── admin/
│   ├── auth/
│   ├── items/
│   ├── layouts/
│   ├── partials/
│   ├── 404.njk
│   ├── dashboard.njk
│   ├── error.njk
│   └── index.njk
│
├── .env.example
├── .gitignore
├── app.js
├── package.json
├── Procfile
└── README.md
```

---

## 11. Qué conviene modificar en cada proyecto

Normalmente cambiarías:

1. Nombre en `package.json`.
2. Logo e imágenes de `/public/img`.
3. Colores en `/public/css/style.css`.
4. Textos y navegación.
5. Modelos.
6. Rutas.
7. Formularios.
8. Panel administrador.
9. Variables de entorno.
10. Nombre de la base MongoDB.

Los colores actuales de ejemplo son:

```css
--sky: #5AB0DC;
--sand: #E8CE96;
--sand-dark: #B4976B;
```

---

## 12. Seguridad mínima incluida

- Contraseñas nunca se guardan en texto plano.
- Bcrypt con 12 rondas.
- Cookies `httpOnly`.
- Cookies `secure` en producción.
- `sameSite=lax`.
- Helmet.
- `.env` ignorado por Git.
- Permisos de administrador separados.
- Usuario puede editar/eliminar solamente elementos propios, salvo administrador.

Para un proyecto más grande se recomienda agregar:

- CSRF
- rate limiting
- validación robusta de formularios
- recuperación de contraseña por email
- verificación de email
- auditoría de acciones del admin
- permisos más específicos
- almacenamiento de imágenes en Cloudinary/S3
- backups de MongoDB
- tests automáticos

---

## 13. Primera prueba

Sin MongoDB configurado, la página inicial levanta igual:

```powershell
npm install
npm run dev
```

Con MongoDB configurado:

```powershell
npm run seed:admin
npm run dev
```

Abrí:

```text
http://localhost:3000
```

Administrador:

```text
http://localhost:3000/admin
```
