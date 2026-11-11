const express = require('express');
const { Pool } = require('pg');

const app = express();
app.use(express.json());

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const PORT = process.env.PORT || 3002;

app.get('/health', (req, res) => res.json({ status: 'ok', service: 'server-b' }));

// POST /adoptions: tallentaa hakemuksen ja merkitsee eläimen adoptoiduksi
app.post('/adoptions', async (req, res) => {
  const { animal_id, applicant_name, email, phone, message } = req.body;
  if (!Number.isInteger(animal_id) || !applicant_name || !email) {
    return res.status(400).json({ error: 'animal_id, nimi ja sähköposti ovat pakollisia' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

  
    const { rows } = await client.query(
      'SELECT status FROM animals WHERE id = $1 FOR UPDATE', [animal_id]
    );
    if (rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Eläintä ei löytynyt' });
    }
    if (rows[0].status === 'adopted') {
      await client.query('ROLLBACK');
      return res.status(409).json({ error: 'Eläin on jo adoptoitu' });
    }

    const result = await client.query(
      `INSERT INTO adoptions (animal_id, applicant_name, email, phone, message)
       VALUES ($1, $2, $3, $4, $5) RETURNING id, created_at`,
      [animal_id, applicant_name, email, phone || null, message || null]
    );
    await client.query("UPDATE animals SET status = 'adopted' WHERE id = $1", [animal_id]);
    await client.query('COMMIT');

    res.status(201).json({
      success: true,
      adoption_id: result.rows[0].id,
      animal_id,
      created_at: result.rows[0].created_at,
      message: 'Adoptiohakemus vastaanotettu'
    });
  } catch (err) {
    await client.query('ROLLBACK');
    if (err.code === '23505') {
     
      return res.status(409).json({ error: 'Eläin on jo adoptoitu' });
    }
    console.error(err);
    res.status(500).json({ error: 'Hakemuksen tallennus epäonnistui' });
  } finally {
    client.release();
  }
});

// GET /adoptions: kaikki hakemukset eläimen nimen kanssa
app.get('/adoptions', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT a.id, a.applicant_name, a.email, a.created_at, an.name AS animal_name
       FROM adoptions a JOIN animals an ON an.id = a.animal_id
       ORDER BY a.created_at DESC`
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Tietokantavirhe' });
  }
});

app.listen(PORT, () => console.log(`Server B kuuntelee porttia ${PORT}`));