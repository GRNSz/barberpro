import express from 'express';
import pool from '../db.js';
import jwt from 'jsonwebtoken';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'barberpro_jwt_secret_key_999';

// Helper to get user from cookie
const getUser = (req) => {
  try {
    const token = req.cookies.token;
    if (!token) return null;
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
};

// GET /api/barbershops — list all barbershops
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        b.*,
        u.email,
        u.phone,
        u.whatsapp,
        u.avatar,
        COALESCE(json_agg(
          json_build_object(
            'id', s.id,
            'name', s.name,
            'price', s.price,
            'duration', s.duration,
            'description', s.description,
            'icon', s.icon,
            'active', s.active
          ) ORDER BY s.name
        ) FILTER (WHERE s.id IS NOT NULL AND s.active = true), '[]') AS services
      FROM barbearias b
      LEFT JOIN usuarios u ON u.uid = b.owner_uid
      LEFT JOIN servicos s ON s.barbershop_id = b.id
      GROUP BY b.id, u.email, u.phone, u.whatsapp, u.avatar
      ORDER BY b.rating DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching barbershops:', err.message);
    res.status(500).json({ error: 'Erro ao buscar barbearias' });
  }
});

// GET /api/barbershops/:id — get one barbershop
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(`
      SELECT 
        b.*,
        u.email,
        u.phone,
        u.whatsapp,
        u.avatar,
        COALESCE(json_agg(
          json_build_object(
            'id', s.id,
            'name', s.name,
            'price', s.price,
            'duration', s.duration,
            'description', s.description,
            'icon', s.icon,
            'active', s.active
          ) ORDER BY s.name
        ) FILTER (WHERE s.id IS NOT NULL AND s.active = true), '[]') AS services
      FROM barbearias b
      LEFT JOIN usuarios u ON u.uid = b.owner_uid
      LEFT JOIN servicos s ON s.barbershop_id = b.id
      WHERE b.id = $1
      GROUP BY b.id, u.email, u.phone, u.whatsapp, u.avatar
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Barbearia não encontrada' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching barbershop:', err.message);
    res.status(500).json({ error: 'Erro ao buscar barbearia' });
  }
});

// GET /api/barbershops/me — get current barber's own shop
router.get('/me/profile', async (req, res) => {
  const decoded = getUser(req);
  if (!decoded || decoded.role !== 'barber') {
    return res.status(401).json({ error: 'Não autorizado' });
  }
  try {
    const result = await pool.query(
      'SELECT * FROM barbearias WHERE owner_uid = $1',
      [decoded.uid]
    );
    if (result.rows.length === 0) {
      return res.json(null); // No shop yet
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching my barbershop:', err.message);
    res.status(500).json({ error: 'Erro ao buscar sua barbearia' });
  }
});

// POST /api/barbershops — barber creates or updates their shop
router.post('/', async (req, res) => {
  const decoded = getUser(req);
  if (!decoded || decoded.role !== 'barber') {
    return res.status(401).json({ error: 'Não autorizado' });
  }

  const { name, description, address, phone, whatsapp, lat, lng } = req.body;
  if (!name || !address) {
    return res.status(400).json({ error: 'Nome e endereço são obrigatórios' });
  }

  try {
    const existing = await pool.query(
      'SELECT id FROM barbearias WHERE owner_uid = $1',
      [decoded.uid]
    );

    let result;
    if (existing.rows.length > 0) {
      // Update existing
      result = await pool.query(
        `UPDATE barbearias SET name=$1, description=$2, address=$3, phone=$4, whatsapp=$5, lat=$6, lng=$7
         WHERE owner_uid=$8 RETURNING *`,
        [name, description, address, phone, whatsapp, lat || null, lng || null, decoded.uid]
      );
    } else {
      // Create new
      const newId = `shop-${decoded.uid}-${Date.now()}`;
      result = await pool.query(
        `INSERT INTO barbearias (id, owner_uid, name, description, address, phone, whatsapp, lat, lng, rating, total_reviews)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 5.0, 0) RETURNING *`,
        [newId, decoded.uid, name, description, address, phone, whatsapp, lat || null, lng || null]
      );
    }

    // Sync barber's profile name
    await pool.query(
      `UPDATE usuarios SET barbershop_name=$1, barbershop_description=$2 WHERE uid=$3`,
      [name, description, decoded.uid]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error saving barbershop:', err.message);
    res.status(500).json({ error: 'Erro ao salvar barbearia' });
  }
});

// GET /api/barbershops/me/services — list barber's services
router.get('/me/services', async (req, res) => {
  const decoded = getUser(req);
  if (!decoded || decoded.role !== 'barber') {
    return res.status(401).json({ error: 'Não autorizado' });
  }
  try {
    const shop = await pool.query(
      'SELECT id FROM barbearias WHERE owner_uid = $1',
      [decoded.uid]
    );
    if (shop.rows.length === 0) return res.json([]);

    const services = await pool.query(
      'SELECT * FROM servicos WHERE barbershop_id = $1 ORDER BY name',
      [shop.rows[0].id]
    );
    res.json(services.rows);
  } catch (err) {
    console.error('Error fetching services:', err.message);
    res.status(500).json({ error: 'Erro ao buscar serviços' });
  }
});

// POST /api/barbershops/me/services — add/update service
router.post('/me/services', async (req, res) => {
  const decoded = getUser(req);
  if (!decoded || decoded.role !== 'barber') {
    return res.status(401).json({ error: 'Não autorizado' });
  }

  const { id, name, price, duration, description, icon, active } = req.body;

  try {
    const shop = await pool.query(
      'SELECT id FROM barbearias WHERE owner_uid = $1',
      [decoded.uid]
    );
    if (shop.rows.length === 0) {
      return res.status(400).json({ error: 'Crie sua barbearia primeiro' });
    }
    const shopId = shop.rows[0].id;

    let result;
    if (id) {
      // Update existing service
      result = await pool.query(
        `UPDATE servicos SET name=$1, price=$2, duration=$3, description=$4, icon=$5, active=$6
         WHERE id=$7 AND barbershop_id=$8 RETURNING *`,
        [name, price, duration, description, icon || '✂️', active ?? true, id, shopId]
      );
    } else {
      // Create new service
      const newId = `svc-${Date.now()}`;
      result = await pool.query(
        `INSERT INTO servicos (id, barbershop_id, name, price, duration, description, icon, active)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
        [newId, shopId, name, price, duration, description, icon || '✂️', active ?? true]
      );
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error saving service:', err.message);
    res.status(500).json({ error: 'Erro ao salvar serviço' });
  }
});

// DELETE /api/barbershops/me/services/:id
router.delete('/me/services/:id', async (req, res) => {
  const decoded = getUser(req);
  if (!decoded || decoded.role !== 'barber') {
    return res.status(401).json({ error: 'Não autorizado' });
  }

  try {
    await pool.query('DELETE FROM servicos WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao deletar serviço' });
  }
});

// GET /api/barbershops/me/clients — list all clients of current barber
router.get('/me/clients', async (req, res) => {
  const decoded = getUser(req);
  if (!decoded || decoded.role !== 'barber') {
    return res.status(401).json({ error: 'Não autorizado' });
  }

  try {
    const checkShop = await pool.query('SELECT id FROM barbearias WHERE owner_uid = $1', [decoded.uid]);
    if (checkShop.rows.length === 0) return res.json([]);
    const shopId = checkShop.rows[0].id;

    const result = await pool.query(`
      SELECT DISTINCT 
        u.uid AS id,
        u.name,
        u.email,
        u.phone,
        u.whatsapp,
        u.avatar,
        COUNT(a.id)::int AS "totalVisits",
        MAX(a.date) AS "lastVisit",
        (
          SELECT service 
          FROM agendamentos 
          WHERE client_id = u.uid AND barbershop_id = $2
          GROUP BY service 
          ORDER BY COUNT(*) DESC 
          LIMIT 1
        ) AS "favoriteService"
      FROM usuarios u
      JOIN agendamentos a ON a.client_id = u.uid
      WHERE a.barbershop_id = $2
      GROUP BY u.uid;
    `, [decoded.uid, shopId]);

    // Format lastVisit as YYYY-MM-DD
    const formatted = result.rows.map(row => ({
      ...row,
      lastVisit: row.lastVisit ? row.lastVisit.toISOString().split('T')[0] : null
    }));

    res.json(formatted);
  } catch (err) {
    console.error('Error fetching clients for barber:', err.message);
    res.status(500).json({ error: 'Erro ao buscar clientes' });
  }
});

// GET /api/barbershops/me/costs — list costs
router.get('/me/costs', async (req, res) => {
  const decoded = getUser(req);
  if (!decoded || decoded.role !== 'barber') {
    return res.status(401).json({ error: 'Não autorizado' });
  }

  try {
    const shop = await pool.query(
      'SELECT id FROM barbearias WHERE owner_uid = $1',
      [decoded.uid]
    );
    if (shop.rows.length === 0) return res.json([]);

    const costs = await pool.query(
      'SELECT * FROM custos WHERE barbershop_id = $1 ORDER BY date DESC, id DESC',
      [shop.rows[0].id]
    );
    // Format date as YYYY-MM-DD
    const formatted = costs.rows.map(row => ({
      ...row,
      date: row.date.toISOString().split('T')[0],
      value: parseFloat(row.value)
    }));
    res.json(formatted);
  } catch (err) {
    console.error('Error fetching costs:', err.message);
    res.status(500).json({ error: 'Erro ao buscar custos' });
  }
});

// POST /api/barbershops/me/costs — add/update cost
router.post('/me/costs', async (req, res) => {
  const decoded = getUser(req);
  if (!decoded || decoded.role !== 'barber') {
    return res.status(401).json({ error: 'Não autorizado' });
  }

  const { id, description, value, date, category } = req.body;
  if (!description || !value || !date || !category) {
    return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
  }

  try {
    const shop = await pool.query(
      'SELECT id FROM barbearias WHERE owner_uid = $1',
      [decoded.uid]
    );
    if (shop.rows.length === 0) {
      return res.status(400).json({ error: 'Crie sua barbearia primeiro acessando o perfil' });
    }
    const shopId = shop.rows[0].id;

    let result;
    if (id) {
      // Update existing
      result = await pool.query(
        `UPDATE custos SET description=$1, value=$2, date=$3, category=$4
         WHERE id=$5 AND barbershop_id=$6 RETURNING *`,
        [description, value, date, category, id, shopId]
      );
    } else {
      // Create new
      const newId = `cost-${Date.now()}`;
      result = await pool.query(
        `INSERT INTO custos (id, barbershop_id, description, value, date, category)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
        [newId, shopId, description, value, date, category]
      );
    }

    const row = result.rows[0];
    res.json({
      ...row,
      date: row.date.toISOString().split('T')[0],
      value: parseFloat(row.value)
    });
  } catch (err) {
    console.error('Error saving cost:', err.message);
    res.status(500).json({ error: 'Erro ao salvar custo' });
  }
});

// DELETE /api/barbershops/me/costs/:id
router.delete('/me/costs/:id', async (req, res) => {
  const decoded = getUser(req);
  if (!decoded || decoded.role !== 'barber') {
    return res.status(401).json({ error: 'Não autorizado' });
  }

  try {
    const shop = await pool.query(
      'SELECT id FROM barbearias WHERE owner_uid = $1',
      [decoded.uid]
    );
    if (shop.rows.length === 0) {
      return res.status(400).json({ error: 'Barbearia não encontrada' });
    }

    await pool.query('DELETE FROM custos WHERE id = $1 AND barbershop_id = $2', [req.params.id, shop.rows[0].id]);
    res.json({ success: true });
  } catch (err) {
    console.error('Error deleting cost:', err.message);
    res.status(500).json({ error: 'Erro ao deletar custo' });
  }
});

export default router;
