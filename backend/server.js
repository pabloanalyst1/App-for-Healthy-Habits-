require('dotenv').config();
const express = require('express');
const cors = require('cors');
const sequelize = require('./config/database');
const authRoutes = require('./routes/auth');
const metricsRoutes = require('./routes/metrics');

// Import models to ensure associations are set up
require('./models');

const app = express();

// Middleware
const corsOptions = {
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
app.use(cors(corsOptions));
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});
app.use(express.json());

// Conectar a PostgreSQL
sequelize.authenticate()
  .then(() => console.log('Conectado a PostgreSQL'))
  .catch(err => console.error('Error conectando a PostgreSQL:', err));

// Sincronizar modelos
sequelize.sync()
  .then(() => console.log('Modelos sincronizados'))
  .catch(err => console.error('Error sincronizando modelos:', err));

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/metrics', metricsRoutes);

// Puerto
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
})