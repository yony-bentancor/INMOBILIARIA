# Deploy de QCASA en Heroku

```bash
heroku login
heroku create NOMBRE-DE-TU-APP
heroku config:set NODE_ENV=production
heroku config:set SESSION_SECRET="CAMBIAR-POR-UNA-CLAVE-SEGURA"
heroku config:set USE_MONGO=false
heroku config:set APP_URL="https://NOMBRE-DE-TU-APP.herokuapp.com"
git push heroku main
heroku open
```

Si activás Atlas:

```bash
heroku config:set USE_MONGO=true
heroku config:set MONGO_URI="TU_CONNECTION_STRING"
```

Diagnóstico:

```bash
heroku logs --tail
```
