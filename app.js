const express = require('express');
const app = express();
const mysql = require('mysql2/promise');

// Database connection
const db = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'password',
  database: 'speaker_session_booking'
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Swagger documentation
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Routes
app.use('/api', require('./routes'));

app.listen(3000, () => {
  console.log('Server started on port 3000');
});