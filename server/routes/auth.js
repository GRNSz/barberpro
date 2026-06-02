import express from 'express';
import jwt from 'jsonwebtoken';
import pool from '../db.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'barberpro_jwt_secret_key_999';

// Endpoint to login
router.post('/login', async (req, res) => {
  const { email, password, role } = req.body;
  
  if (!email || !role) {
    return res.status(400).json({ error: 'Email e função são necessários' });
  }

  try {
    // Look up user in PostgreSQL database
    const userRes = await pool.query(
      'SELECT * FROM usuarios WHERE email = $1 AND role = $2',
      [email, role]
    );

    let userObj;

    if (userRes.rows.length === 0) {
      // If user doesn't exist yet, we register them on the fly for ease of test/mock
      // (This guarantees the frontend has no blockers while using real DB)
      const mockName = email.split('@')[0].replace('.', ' ');
      const formattedName = mockName.charAt(0).toUpperCase() + mockName.slice(1);
      const newUid = `${role}-${Date.now()}`;
      
      const insertRes = await pool.query(
        'INSERT INTO usuarios (uid, name, email, role, phone, whatsapp, address) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
        [newUid, formattedName, email, role, '(11) 98888-7777', '5511988887777', 'Rua Cadastrada, 100']
      );
      
      userObj = insertRes.rows[0];

      // Initialize loyalty card history for client
      if (role === 'client') {
        await pool.query(
          'INSERT INTO historico_fidelidade (client_id, cuts_count) VALUES ($1, 0) ON CONFLICT DO NOTHING',
          [newUid]
        );
      }
    } else {
      userObj = userRes.rows[0];
    }

    // Generate JWT token
    const token = jwt.sign(
      { uid: userObj.uid, email: userObj.email, role: userObj.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Set cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000 // 1 day
    });

    return res.json({ user: userObj, userType: userObj.role });
  } catch (err) {
    console.error('Login route error:', err.message);
    return res.status(500).json({ error: 'Erro interno do servidor ao autenticar' });
  }
});

// Endpoint to validate and fetch current session
router.get('/session', async (req, res) => {
  const token = req.cookies.token;
  
  if (!token) {
    return res.status(401).json({ error: 'Nenhuma sessão ativa encontrada' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Fetch profile details from database
    const userRes = await pool.query(
      'SELECT * FROM usuarios WHERE uid = $1',
      [decoded.uid]
    );

    if (userRes.rows.length === 0) {
      return res.status(401).json({ error: 'Usuário não encontrado' });
    }

    const userObj = userRes.rows[0];
    return res.json({ user: userObj, userType: userObj.role });
  } catch (err) {
    res.clearCookie('token');
    return res.status(401).json({ error: 'Sessão expirada ou inválida' });
  }
});

// Endpoint to register a new user
router.post('/register', async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !role) {
    return res.status(400).json({ error: 'Nome, email e função são obrigatórios' });
  }

  try {
    const checkUser = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);
    if (checkUser.rows.length > 0) {
      return res.status(400).json({ error: 'Este e-mail já está em uso' });
    }

    const newUid = `${role}-${Date.now()}`;
    const insertRes = await pool.query(
      'INSERT INTO usuarios (uid, name, email, role, phone, whatsapp, address) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [newUid, name, email, role, '(11) 98888-7777', '5511988887777', 'Endereço Completo, 123']
    );

    const userObj = insertRes.rows[0];

    // Initialize loyalty card history for client
    if (role === 'client') {
      await pool.query(
        'INSERT INTO historico_fidelidade (client_id, cuts_count) VALUES ($1, 0)',
        [newUid]
      );
    }

    // Generate JWT token
    const token = jwt.sign(
      { uid: userObj.uid, email: userObj.email, role: userObj.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Set cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000
    });

    return res.json({ user: userObj, userType: userObj.role });
  } catch (err) {
    console.error('Register route error:', err.message);
    return res.status(500).json({ error: 'Erro ao registrar usuário' });
  }
});

// Endpoint to logout
router.post('/logout', (req, res) => {
  res.clearCookie('token');
  return res.json({ success: true });
});

export default router;
