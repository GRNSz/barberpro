import express from 'express';
import pool from '../db.js';

const router = express.Router();
const BI_TOKEN = process.env.BI_TOKEN || 'barberpro_default_bi_secret_token_123';

// Auth middleware to validate BI token
const requireBIToken = (req, res, next) => {
  const token = req.headers['x-bi-token'] || req.query.token;
  if (!token || token !== BI_TOKEN) {
    return res.status(403).json({ error: 'Acesso proibido: Token BI inválido ou ausente' });
  }
  next();
};

// Root export: returns all views in a single JSON
router.get('/export', requireBIToken, async (req, res) => {
  try {
    const revenueRes = await pool.query('SELECT * FROM vw_faturamento_mensal');
    const servicesRes = await pool.query('SELECT * FROM vw_popularidade_servicos');
    const loyaltyRes = await pool.query('SELECT * FROM vw_conversao_fidelidade');

    return res.json({
      timestamp: new Date().toISOString(),
      revenue: revenueRes.rows,
      services: servicesRes.rows,
      loyalty: loyaltyRes.rows
    });
  } catch (err) {
    console.error('Error fetching BI metrics:', err.message);
    return res.status(500).json({ error: 'Erro interno ao exportar métricas de BI' });
  }
});

// Endpoint for monthly revenue view specifically
router.get('/revenue', requireBIToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM vw_faturamento_mensal');
    return res.json(result.rows);
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao obter faturamento' });
  }
});

// Endpoint for service popularity view specifically
router.get('/services', requireBIToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM vw_popularidade_servicos');
    return res.json(result.rows);
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao obter popularidade dos serviços' });
  }
});

// Endpoint for loyalty conversion view specifically
router.get('/loyalty', requireBIToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM vw_conversao_fidelidade');
    return res.json(result.rows);
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao obter fidelidade dos clientes' });
  }
});

export default router;
