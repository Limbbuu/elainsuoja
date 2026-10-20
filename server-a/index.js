const express = require('express'); 
const { Pool } = require('pg'); 

const app = express(); 
app.use(express.json()); 

const pool = new Pool({ connectionString: process.env.DATABASE_URL }); 
const ADOPTION_URL = process.env.ADOPTION_SERVICE_URL || 'http://localhost:3002'; 
const PORT = process.env.PORT || 3001; 

// A1. Health check -endpoint
app.get('/health', (req, res) => res.json({ status: 'ok', service: 'server-a' })); 

// A2. GET /animals - Hae kaikki eläimet
app.get('/animals', async (req, res) => { 
  try { 
    const { rows } = await pool.query( 
      'SELECT id, name, type, age, image_url, status FROM animals ORDER BY id' 
    ); 
    res.json(rows); 
  } catch (err) { 
    console.error(err); 
    res.status(500).json({ error: 'Tietokantavirhe' }); 
  } 
}); 

// A3. GET /animals/:id - Hae yksittäinen eläin
app.get('/animals/:id', async (req, res) => { 
  const id = Number(req.params.id); 
  if (!Number.isInteger(id)) { 
    return res.status(400).json({ error: 'Virheellinen id' }); 
  } 
  try { 
    const { rows } = await pool.query('SELECT * FROM animals WHERE id = \$1', [id]); 
    if (rows.length === 0) { 
      return res.status(404).json({ error: 'Eläintä ei löytynyt' }); 
    } 
    res.json(rows[0]); 
  } catch (err) { 
    console.error(err); 
    res.status(500).json({ error: 'Tietokantavirhe' }); 
  } 
}); 

// A4. POST /animals/:id/adopt - Välittää hakemuksen Server B:lle
app.post('/animals/:id/adopt', async (req, res) => { 
  const id = Number(req.params.id); 
  const { applicant_name, email, phone, message } = req.body; 

  if (!Number.isInteger(id)) { 
    return res.status(400).json({ error: 'Virheellinen id' }); 
  } 
  if (!applicant_name || !email) { 
    return res.status(400).json({ error: 'Nimi ja sähköposti ovat pakollisia' }); 
  } 

  try { 
    const response = await fetch(`${ADOPTION_URL}/adoptions`, { 
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' }, 
      body: JSON.stringify({ animal_id: id, applicant_name, email, phone, message }) 
    }); 
    const data = await response.json(); 
    res.status(response.status).json(data); 
  } catch (err) { 
    console.error(err); 
    res.status(502).json({ error: 'Adoptiopalvelu ei vastaa' }); 
  } 
}); 

app.listen(PORT, () => console.log(`Server A kuuntelee porttia ${PORT}`)); 