import express from 'express';
import jwt from 'jsonwebtoken';
import pool from '../db.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'barberpro_jwt_secret_key_999';

// Helper to map snake_case postgres columns to camelCase expected by the React frontend
const mapUserToCamelCase = (dbUser) => {
  if (!dbUser) return null;
  const mapped = { ...dbUser };
  if (dbUser.barbershop_name !== undefined) {
    mapped.barbershopName = dbUser.barbershop_name;
    delete mapped.barbershop_name;
  }
  if (dbUser.barbershop_description !== undefined) {
    mapped.barbershopDescription = dbUser.barbershop_description;
    delete mapped.barbershop_description;
  }
  return mapped;
};

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

    // Set cookie — use sameSite none + secure for cross-origin HTTPS (GCP VM)
    const isProduction = process.env.NODE_ENV === 'production';
    res.cookie('token', token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      maxAge: 24 * 60 * 60 * 1000 // 1 day
    });

    return res.json({ user: mapUserToCamelCase(userObj), userType: userObj.role });
  } catch (err) {
    console.error('Login route error:', err.message);
    return res.status(500).json({ error: 'Erro interno do servidor ao autenticar' });
  }
});

// Endpoint to validate and fetch current session
router.get('/session', async (req, res) => {
  const token = req.cookies.token;
  
  if (!token) {
    return res.status(401).json({ error: 'Nenhuma sessão activa encontrada' });
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
    return res.json({ user: mapUserToCamelCase(userObj), userType: userObj.role });
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

    // Set cookie — use sameSite none + secure for cross-origin HTTPS (GCP VM)
    const isProd = process.env.NODE_ENV === 'production';
    res.cookie('token', token, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'none' : 'lax',
      maxAge: 24 * 60 * 60 * 1000
    });

    return res.json({ user: mapUserToCamelCase(userObj), userType: userObj.role });
  } catch (err) {
    console.error('Register route error:', err.message);
    return res.status(500).json({ error: 'Erro ao registrar usuário' });
  }
});

// Endpoint to update user profile details in database
router.put('/profile', async (req, res) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ error: 'Não autorizado' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const { name, email, whatsapp, phone, address, avatar, barbershopName, barbershopDescription } = req.body;

    const query = `
      UPDATE usuarios 
      SET name = $1, email = $2, whatsapp = $3, phone = $4, address = $5, avatar = $6,
          barbershop_name = $7, barbershop_description = $8
      WHERE uid = $9
      RETURNING *
    `;
    const values = [
      name,
      email,
      whatsapp,
      phone,
      address,
      avatar,
      barbershopName || null,
      barbershopDescription || null,
      decoded.uid
    ];

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    return res.json({ user: mapUserToCamelCase(result.rows[0]) });
  } catch (err) {
    console.error('Update profile route error:', err.message);
    return res.status(500).json({ error: 'Erro ao atualizar dados do perfil' });
  }
});

// Endpoint to logout
router.post('/logout', (req, res) => {
  res.clearCookie('token');
  return res.json({ success: true });
});

export default router;
