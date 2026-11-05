const express = require('express');
const { Pool } = require('pg');

const app = express();
app.use(express.json());

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const PORT = process.env.PORT || 3002;

app.get('/health', (req, res) => res.json({ status: 'ok', service: 'server-b' }));

app.post('/adoptions', async (req, res) => {
  const { animal_id, applicant_name, email, phone, message } = req.body;
  if (!Number.isInteger(animal_id) || !applicant_name || !email) {
    return res.status(400).json({ error: 'animal_id, nimi ja sähköposti ovat pakollisia' });
  }
  // B3: tallennus tähän
});

app.listen(PORT, () => console.log(`Server B kuuntelee porttia ${PORT}`));