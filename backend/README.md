# Backend para Healthy Habits App

Este es el backend de la aplicación Healthy Habits, construido con Node.js, Express y PostgreSQL.

## Instalación

1. Asegúrate de tener Node.js y PostgreSQL instalados.
2. Instala las dependencias: `npm install`
3. Crea un archivo `.env` con las variables necesarias (ver `.env.example`).

## Variables de Entorno

Crea un archivo `.env` en la raíz del backend con:

```
DATABASE_URL=postgresql://tu_usuario:tu_password@tu_host:5432/tu_db
JWT_SECRET=tu_secreto_jwt_aqui
PORT=5000
```

## Ejecutar

1. Inicia PostgreSQL y crea la base de datos `healthy_habits`.
2. Ejecuta `npm start` para iniciar el servidor.

El servidor correrá en `http://localhost:5000`.

## Endpoints

### Autenticación

- `POST /api/auth/register` - Registrar un nuevo usuario (body: { email, password })
- `POST /api/auth/login` - Iniciar sesión (body: { email, password }) - Retorna un token JWT

Para rutas protegidas, incluye el token en el header: `Authorization: Bearer <token>`

## Notas

- Cambia `JWT_SECRET` por una clave segura en producción.
- Para producción, considera usar una base de datos en la nube como AWS RDS o Heroku Postgres.