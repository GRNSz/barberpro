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

// Helper to push to Google Calendar API from Backend using REST
const addEventToGoogleCalendar = async (appointment, token) => {
  if (!token) return false;

  const startDateTime = new Date(`${appointment.date}T${appointment.time}`);
  if (isNaN(startDateTime.getTime())) return false;

  const endDateTime = new Date(startDateTime.getTime() + 45 * 60 * 1000); // 45 min duration

  try {
    const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        summary: `💈 BarberPro — ${appointment.service}`,
        description: `Agendamento de ${appointment.service} na barbearia ${appointment.barbershop_name}.\nStatus: ${appointment.status}\nNotas do Cliente: ${appointment.client_notes || ''}\nNotas do Barbeiro: ${appointment.barber_notes || ''}`,
        start: {
          dateTime: startDateTime.toISOString(),
          timeZone: 'America/Sao_Paulo'
        },
        end: {
          dateTime: endDateTime.toISOString(),
          timeZone: 'America/Sao_Paulo'
        }
      })
    });
    return response.ok;
  } catch (error) {
    console.error('Error creating Google Calendar event on server:', error);
    return false;
  }
};

// Get all appointments
router.get('/', async (req, res) => {
  const decoded = getUser(req);
  if (!decoded) {
    return res.status(401).json({ error: 'Não autorizado' });
  }

  try {
    let result;
    if (decoded.role === 'admin') {
      result = await pool.query('SELECT * FROM agendamentos ORDER BY date DESC, time DESC');
    } else if (decoded.role === 'barber') {
      // Find barbershop owned by this barber
      const shopRes = await pool.query('SELECT id FROM barbearias WHERE owner_uid = $1', [decoded.uid]);
      if (shopRes.rows.length === 0) {
        return res.json([]);
      }
      const shopId = shopRes.rows[0].id;
      result = await pool.query(
        'SELECT * FROM agendamentos WHERE barbershop_id = $1 ORDER BY date DESC, time DESC',
        [shopId]
      );
    } else {
      // Client role
      result = await pool.query(
        'SELECT * FROM agendamentos WHERE client_id = $1 ORDER BY date DESC, time DESC',
        [decoded.uid]
      );
    }

    // Map database fields to frontend fields for backwards-compatibility
    const mapped = result.rows.map((row) => ({
      id: row.id,
      clientId: row.client_id,
      clientName: row.client_name,
      clientAvatar: row.client_avatar,
      service: row.service,
      serviceId: row.service_id,
      barbershopId: row.barbershop_id,
      barbershopName: row.barbershop_name,
      date: row.date.toISOString().split('T')[0], // format as YYYY-MM-DD
      time: row.time.slice(0, 5), // format as HH:MM
      status: row.status,
      price: parseFloat(row.price),
      clientNotes: row.client_notes,
      barberNotes: row.barber_notes,
      googleSynced: row.google_synced,
      paymentReceived: row.payment_received
    }));
    return res.json(mapped);
  } catch (err) {
    console.error('Error fetching appointments:', err.message);
    return res.status(500).json({ error: 'Erro ao buscar agendamentos' });
  }
});

// Create new appointment
router.post('/new', async (req, res) => {
  const { barbershopId, barbershopName, service, serviceId, date, time, price, notes, clientId, clientName } = req.body;
  const googleToken = req.headers['google-access-token'];

  if (!clientId || !barbershopId || !date || !time) {
    return res.status(400).json({ error: 'Campos obrigatórios ausentes' });
  }

  const id = `apt-${Date.now()}`;

  try {
    // Collision check: check for any active (not cancelled) appointment for the same shop, date, and time
    const collisionCheck = await pool.query(
      "SELECT id FROM agendamentos WHERE barbershop_id = $1 AND date = $2 AND time = $3 AND status != 'cancelado'",
      [barbershopId, date, time]
    );

    if (collisionCheck.rows.length > 0) {
      return res.status(409).json({ error: 'Este horário já foi reservado por outro cliente.' });
    }

    // Insert into PostgreSQL
    const result = await pool.query(
      `INSERT INTO agendamentos 
       (id, client_id, client_name, client_avatar, service, service_id, barbershop_id, barbershop_name, date, time, status, price, client_notes, google_synced)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
       RETURNING *`,
      [
        id,
        clientId,
        clientName || 'Cliente',
        null,
        service || 'Corte Masculino',
        serviceId || 'svc-001',
        barbershopId,
        barbershopName,
        date,
        time,
        'pendente',
        price || 50.00,
        notes || null,
        false
      ]
    );

    const createdApt = result.rows[0];

    // If Google token is passed, trigger Calendar API automatically
    if (googleToken) {
      const success = await addEventToGoogleCalendar(createdApt, googleToken);
      if (success) {
        await pool.query('UPDATE agendamentos SET google_synced = TRUE WHERE id = $1', [id]);
        createdApt.google_synced = true;
      }
    }

    return res.json(createdApt);
  } catch (err) {
    console.error('Error creating appointment:', err.message);
    return res.status(500).json({ error: 'Erro ao criar agendamento' });
  }
});

// Confirm appointment (Barber)
router.post('/confirm/:id', async (req, res) => {
  const { id } = req.params;
  const googleToken = req.headers['google-access-token'];

  try {
    const result = await pool.query(
      "UPDATE agendamentos SET status = 'confirmado' WHERE id = $1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Agendamento não encontrado' });
    }

    const updated = result.rows[0];

    // If Google token is passed, push confirmed status to Google Calendar
    if (googleToken) {
      const success = await addEventToGoogleCalendar(updated, googleToken);
      if (success) {
        await pool.query('UPDATE agendamentos SET google_synced = TRUE WHERE id = $1', [id]);
      }
    }

    return res.json(updated);
  } catch (err) {
    console.error('Error confirming appointment:', err.message);
    return res.status(500).json({ error: 'Erro ao confirmar agendamento' });
  }
});

// Complete appointment (Triggers loyalty count increment automatically via database TRIGGER)
router.post('/complete/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      "UPDATE agendamentos SET status = 'concluído' WHERE id = $1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Agendamento não encontrado' });
    }

    return res.json(result.rows[0]);
  } catch (err) {
    console.error('Error completing appointment:', err.message);
    return res.status(500).json({ error: 'Erro ao concluir agendamento' });
  }
});

// Cancel appointment
router.post('/cancel/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      "UPDATE agendamentos SET status = 'cancelado' WHERE id = $1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Agendamento não encontrado' });
    }

    return res.json(result.rows[0]);
  } catch (err) {
    console.error('Error cancelling appointment:', err.message);
    return res.status(500).json({ error: 'Erro ao cancelar agendamento' });
  }
});

// Mark payment received
router.post('/payment/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      "UPDATE agendamentos SET payment_received = TRUE WHERE id = $1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Agendamento não encontrado' });
    }

    return res.json(result.rows[0]);
  } catch (err) {
    console.error('Error marking payment received:', err.message);
    return res.status(500).json({ error: 'Erro ao registrar pagamento' });
  }
});

// Update appointment notes (Barber or Client)
router.post('/notes/:id', async (req, res) => {
  const { id } = req.params;
  const { notes, role } = req.body; // role: barber, client

  if (!role) {
    return res.status(400).json({ error: 'Função do usuário é obrigatória' });
  }

  const column = role === 'barber' ? 'barber_notes' : 'client_notes';

  try {
    const result = await pool.query(
      `UPDATE agendamentos SET ${column} = $1 WHERE id = $2 RETURNING *`,
      [notes, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Agendamento não encontrado' });
    }

    return res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating notes:', err.message);
    return res.status(500).json({ error: 'Erro ao atualizar notas do agendamento' });
  }
});

// Get loyalty card state for client
router.get('/loyalty/:clientId', async (req, res) => {
  const { clientId } = req.params;

  try {
    const result = await pool.query(
      'SELECT cuts_count FROM historico_fidelidade WHERE client_id = $1',
      [clientId]
    );

    const count = result.rows.length > 0 ? result.rows[0].cuts_count : 0;
    return res.json({ cuts_count: count });
  } catch (err) {
    console.error('Error fetching loyalty card count:', err.message);
    return res.status(500).json({ error: 'Erro ao obter dados de fidelidade' });
  }
});

export default router;
