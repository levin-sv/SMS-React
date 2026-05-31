const express = require('express');
const pool = require('../config/db');
const auth = require('../middleware/auth');

const router = express.Router();
router.use(auth);

async function adjustStock(connection, productCode, type, quantity) {
  const delta = type === 'IN' ? quantity : -quantity;
  const [result] = await connection.query(
    'UPDATE Product SET quantityInStock = quantityInStock + ? WHERE productCode = ? AND quantityInStock + ? >= 0',
    [delta, productCode, delta]
  );
  if (result.affectedRows === 0) {
    throw new Error('INSUFFICIENT_STOCK');
  }
}

router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT t.*, p.productName, w.warehouseName
       FROM StockTransaction t
       JOIN Product p ON t.productCode = p.productCode
       JOIN Warehouse w ON t.warehouseCode = w.warehouseCode
       ORDER BY t.transactionDate DESC`
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT t.*, p.productName, w.warehouseName
       FROM StockTransaction t
       JOIN Product p ON t.productCode = p.productCode
       JOIN Warehouse w ON t.warehouseCode = w.warehouseCode
       WHERE t.transactionId = ?`,
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ message: 'Transaction not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/', async (req, res) => {
  const { transactionDate, quantityMoved, transactionType, productCode, warehouseCode } = req.body;
  if (!transactionDate || !quantityMoved || !transactionType || !productCode || !warehouseCode) {
    return res.status(400).json({ message: 'All transaction fields are required' });
  }
  if (!['IN', 'OUT'].includes(transactionType)) {
    return res.status(400).json({ message: 'transactionType must be IN or OUT' });
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    await connection.query(
      `INSERT INTO StockTransaction (transactionDate, quantityMoved, transactionType, productCode, warehouseCode)
       VALUES (?, ?, ?, ?, ?)`,
      [transactionDate, quantityMoved, transactionType, productCode, warehouseCode]
    );
    await adjustStock(connection, productCode, transactionType, quantityMoved);
    await connection.commit();
    res.status(201).json({ message: 'Transaction recorded successfully' });
  } catch (err) {
    await connection.rollback();
    if (err.message === 'INSUFFICIENT_STOCK') {
      return res.status(400).json({ message: 'Insufficient stock for this outbound transaction' });
    }
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  } finally {
    connection.release();
  }
});

router.put('/:id', async (req, res) => {
  const { transactionDate, quantityMoved, transactionType, productCode, warehouseCode } = req.body;
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [existing] = await connection.query(
      'SELECT * FROM StockTransaction WHERE transactionId = ?',
      [req.params.id]
    );
    if (!existing.length) {
      await connection.rollback();
      return res.status(404).json({ message: 'Transaction not found' });
    }
    const old = existing[0];

    const reverseType = old.transactionType === 'IN' ? 'OUT' : 'IN';
    await adjustStock(connection, old.productCode, reverseType, old.quantityMoved);

    await connection.query(
      `UPDATE StockTransaction SET transactionDate=?, quantityMoved=?, transactionType=?, productCode=?, warehouseCode=?
       WHERE transactionId=?`,
      [transactionDate, quantityMoved, transactionType, productCode, warehouseCode, req.params.id]
    );

    await adjustStock(connection, productCode, transactionType, quantityMoved);
    await connection.commit();
    res.json({ message: 'Transaction updated successfully' });
  } catch (err) {
    await connection.rollback();
    if (err.message === 'INSUFFICIENT_STOCK') {
      return res.status(400).json({ message: 'Insufficient stock for updated transaction' });
    }
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  } finally {
    connection.release();
  }
});

router.delete('/:id', async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [existing] = await connection.query(
      'SELECT * FROM StockTransaction WHERE transactionId = ?',
      [req.params.id]
    );
    if (!existing.length) {
      await connection.rollback();
      return res.status(404).json({ message: 'Transaction not found' });
    }
    const old = existing[0];
    const reverseType = old.transactionType === 'IN' ? 'OUT' : 'IN';
    await adjustStock(connection, old.productCode, reverseType, old.quantityMoved);
    await connection.query('DELETE FROM StockTransaction WHERE transactionId = ?', [req.params.id]);
    await connection.commit();
    res.json({ message: 'Transaction deleted successfully' });
  } catch (err) {
    await connection.rollback();
    if (err.message === 'INSUFFICIENT_STOCK') {
      return res.status(400).json({ message: 'Cannot delete: would result in negative stock' });
    }
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  } finally {
    connection.release();
  }
});

module.exports = router;
