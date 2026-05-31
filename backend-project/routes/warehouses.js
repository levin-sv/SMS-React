const express = require('express');
const pool = require('../config/db');
const auth = require('../middleware/auth');

const router = express.Router();
router.use(auth);

// Insert only
router.post('/', async (req, res) => {
  const { warehouseCode, warehouseName, warehouseLocation } = req.body;
  if (!warehouseCode || !warehouseName || !warehouseLocation) {
    return res.status(400).json({ message: 'All warehouse fields are required' });
  }
  try {
    await pool.query(
      'INSERT INTO Warehouse (warehouseCode, warehouseName, warehouseLocation) VALUES (?, ?, ?)',
      [warehouseCode, warehouseName, warehouseLocation]
    );
    res.status(201).json({ message: 'Warehouse registered successfully' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'Warehouse code already exists' });
    }
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM Warehouse ORDER BY warehouseName');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
