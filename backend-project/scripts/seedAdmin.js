require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const bcrypt = require('bcryptjs');
const pool = require('../config/db');

async function seed() {
  const username = process.argv[2] || 'admin';
  const password = process.argv[3] || 'admin123';
  const hash = await bcrypt.hash(password, 10);
  try {
    await pool.query(
      `INSERT INTO User (username, passwordHash) VALUES (?, ?)
       ON DUPLICATE KEY UPDATE passwordHash = VALUES(passwordHash)`,
      [username, hash]
    );
    console.log(`User "${username}" ready. Password: ${password}`);
  } catch (err) {
    console.error('Seed failed:', err.message);
    console.error('Ensure database SMS exists and schema.sql has been run.');
  }
  process.exit(0);
}

seed();
