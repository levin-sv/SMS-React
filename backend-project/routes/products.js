const express = require('express');
const pool = require('../config/db');
const auth = require('../middleware/auth');

const router = express.Router();
router.use(auth);

// Insert only
router.post('/', async (req, res) => {
  const {
    productCode,
    productName,
    category,
    quantityInStock,
    unitPrice,
    supplierName,
    dateReceived,
    warehouseCode,
  } = req.body;

  if (!productCode || !productName || !category || !supplierName || !warehouseCode) {
    return res.status(400).json({ message: 'Required fields missing' });
  }

  try {
    await pool.query(
      `INSERT INTO Product 
       (productCode, productName, category, quantityInStock, unitPrice, supplierName, dateReceived, warehouseCode)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        productCode,
        productName,
        category,
        quantityInStock ?? 0,
        unitPrice,
        supplierName,
        dateReceived,
        warehouseCode,
      ]
    );
    res.status(201).json({ message: 'Product registered successfully' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'Product code already exists' });
    }
    if (err.code === 'ER_NO_REFERENCED_ROW_2') {
      return res.status(400).json({ message: 'Invalid warehouse code' });
    }
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT p.*, w.warehouseName 
       FROM Product p 
       JOIN Warehouse w ON p.warehouseCode = w.warehouseCode 
       ORDER BY p.productName`
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
