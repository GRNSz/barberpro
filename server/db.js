import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { Pool } = pg;

// PostgreSQL Connection Pool Setup
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@db:5432/barberpro',
  max: 10, // Limit connections for GCP economy
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Verify connection and automatically initialize schema
const initDB = async () => {
  let client;
  try {
    client = await pool.connect();
    console.log('✅ Connected to PostgreSQL database.');
    
    // Read and run schema.sql to guarantee tables/views exist
    const schemaPath = path.join(__dirname, 'schema.sql');
    if (fs.existsSync(schemaPath)) {
      const schemaSql = fs.readFileSync(schemaPath, 'utf8');
      await client.query(schemaSql);
      console.log('✅ Database schema initialized/verified successfully.');
    } else {
      console.warn('⚠️ schema.sql not found. Database structure must be checked manually.');
    }
  } catch (err) {
    console.error('❌ Database initialization error:', err.message);
  } finally {
    if (client) client.release();
  }
};

// Initialize schema in background
initDB();

export default pool;
