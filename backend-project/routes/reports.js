const express = require('express');
const pool = require('../config/db');
const auth = require('../middleware/auth');

const router = express.Router();
router.use(auth);

function getDateRange(period) {
  const now = new Date();
  const end = new Date(now);
  end.setHours(23, 59, 59, 999);
  let start = new Date(now);
  start.setHours(0, 0, 0, 0);

  if (period === 'weekly') {
    start.setDate(start.getDate() - 6);
  } else if (period === 'monthly') {
    start = new Date(now.getFullYear(), now.getMonth(), 1);
  }
  return { start, end };
}

function parseRange(from, to) {
  const start = new Date(from);
  const end = new Date(to);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return { error: 'Invalid from or to timestamp' };
  }
  if (start > end) {
    return { error: 'From timestamp must be before to timestamp' };
  }
  return { start, end };
}

async function buildReport(reportType, start, end, periodLabel) {
  if (reportType === 'available') {
    const [rows] = await pool.query(
      `SELECT p.productCode, p.productName, p.category, p.quantityInStock, p.unitPrice,
              p.supplierName, p.dateReceived, w.warehouseName, w.warehouseLocation
       FROM Product p
       JOIN Warehouse w ON p.warehouseCode = w.warehouseCode
       WHERE p.dateReceived >= DATE(?) AND p.dateReceived <= DATE(?)
       ORDER BY p.quantityInStock DESC`,
      [start, end]
    );
    return {
      period: periodLabel,
      reportType: 'Available Stock',
      dateFrom: start.toISOString(),
      dateTo: end.toISOString(),
      generatedAt: new Date().toISOString(),
      data: rows,
      summary: {
        totalProducts: rows.length,
        totalUnits: rows.reduce((s, r) => s + r.quantityInStock, 0),
        totalValue: rows.reduce((s, r) => s + r.quantityInStock * parseFloat(r.unitPrice), 0),
      },
    };
  }

  const type = reportType === 'stock-in' ? 'IN' : 'OUT';
  const [rows] = await pool.query(
    `SELECT t.transactionId, t.transactionDate, t.quantityMoved, t.transactionType,
            p.productCode, p.productName, w.warehouseName
     FROM StockTransaction t
     JOIN Product p ON t.productCode = p.productCode
     JOIN Warehouse w ON t.warehouseCode = w.warehouseCode
     WHERE t.transactionType = ? AND t.transactionDate BETWEEN ? AND ?
     ORDER BY t.transactionDate DESC`,
    [type, start, end]
  );

  const totalQty = rows.reduce((s, r) => s + r.quantityMoved, 0);

  return {
    period: periodLabel,
    reportType: reportType === 'stock-in' ? 'Stock In' : 'Stock Out',
    dateFrom: start.toISOString(),
    dateTo: end.toISOString(),
    generatedAt: new Date().toISOString(),
    data: rows,
    summary: { transactionCount: rows.length, totalQuantityMoved: totalQty },
  };
}

/** Custom range: ?reportType=available&from=ISO&to=ISO */
router.get('/generate', async (req, res) => {
  const { reportType, from, to } = req.query;
  if (!['available', 'stock-in', 'stock-out'].includes(reportType)) {
    return res.status(400).json({ message: 'Invalid report type' });
  }
  if (!from || !to) {
    return res.status(400).json({ message: 'from and to timestamps are required' });
  }

  const parsed = parseRange(from, to);
  if (parsed.error) {
    return res.status(400).json({ message: parsed.error });
  }

  try {
    const report = await buildReport(reportType, parsed.start, parsed.end, 'custom');
    res.json(report);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

/** Preset period (legacy / quick filters) */
router.get('/:period/:reportType', async (req, res) => {
  const { period, reportType } = req.params;
  if (!['daily', 'weekly', 'monthly'].includes(period)) {
    return res.status(400).json({ message: 'Period must be daily, weekly, or monthly' });
  }
  if (!['available', 'stock-in', 'stock-out'].includes(reportType)) {
    return res.status(400).json({ message: 'Invalid report type' });
  }

  const { start, end } = getDateRange(period);

  try {
    const report = await buildReport(reportType, start, end, period);
    res.json(report);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
