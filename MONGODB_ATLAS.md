# Configuración MongoDB Atlas para QCASA

QCASA está preparado para funcionar con o sin MongoDB.

## Desarrollo sin Mongo

`.env`:

```env
USE_MONGO=false
```

## Activar MongoDB Atlas

```env
USE_MONGO=true
MONGO_URI=mongodb+srv://USUARIO:CLAVE@cluster.mongodb.net/qcasa?retryWrites=true&w=majority
```

### Colecciones previstas

- `properties`
- `complaints`
- `users`

Los modelos se encuentran en `/models`.
