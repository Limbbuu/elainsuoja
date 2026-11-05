const express = require('express');
const { Pool } = require('pg');

const app = express();
app.use(express.json());

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const PORT = process.env.PORT || 3002;

app.get('/health', (req, res) => res.json({ status: 'ok', service: 'server-b' }));

// B2–B5 endpointit tähän

app.listen(PORT, () => console.log(`Server B kuuntelee porttia ${PORT}`));