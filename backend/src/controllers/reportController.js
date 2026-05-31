const asyncHandler = require('express-async-handler');
const Order = require('../models/Order');
const PDFDocument = require('pdfkit');

// GET /api/reports/monthly?year=2024&month=1
exports.getMonthlyReport = asyncHandler(async (req, res) => {
  const { year = new Date().getFullYear(), month = new Date().getMonth() + 1 } = req.query;
  const from = new Date(year, month - 1, 1);
  const to = new Date(year, month, 0, 23, 59, 59);

  const [orders, summary] = await Promise.all([
    Order.find({ createdAt: { $gte: from, $lte: to } }).populate('user', 'name email').sort('createdAt'),
    Order.aggregate([
      { $match: { createdAt: { $gte: from, $lte: to } } },
      { $group: {
        _id: null,
        totalOrders: { $sum: 1 },
        totalRevenue: { $sum: { $cond: [{ $eq: ['$payment.status', 'paid'] }, '$pricing.total', 0] } },
        paidOrders: { $sum: { $cond: [{ $eq: ['$payment.status', 'paid'] }, 1, 0] } },
        refundedAmount: { $sum: { $ifNull: ['$payment.refundAmount', 0] } },
        totalShipping: { $sum: '$pricing.shipping' },
      }},
    ]),
  ]);

  res.json({ orders, summary: summary[0] || {}, period: { year: Number(year), month: Number(month), from, to } });
});

// GET /api/reports/monthly/pdf?year=2024&month=1
exports.downloadMonthlyPDF = asyncHandler(async (req, res) => {
  const { year = new Date().getFullYear(), month = new Date().getMonth() + 1 } = req.query;
  const from = new Date(year, month - 1, 1);
  const to = new Date(year, month, 0, 23, 59, 59);
  const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  const orders = await Order.find({ createdAt: { $gte: from, $lte: to } }).populate('user', 'name email').sort('createdAt');
  const paidOrders = orders.filter(o => o.payment.status === 'paid');
  const totalRevenue = paidOrders.reduce((s, o) => s + o.pricing.total, 0);
  const totalRefunds = orders.reduce((s, o) => s + (o.payment.refundAmount || 0), 0);

  const doc = new PDFDocument({ margin: 50, size: 'A4' });
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=kesara-batik-statement-${year}-${month}.pdf`);
  doc.pipe(res);

  // Header
  doc.fontSize(22).fillColor('#C8923A').text('KESARA BATIK', 50, 50);
  doc.fontSize(10).fillColor('#666').text('Monthly Financial Statement', 50, 80);
  doc.fontSize(14).fillColor('#000').text(`${monthNames[month-1]} ${year}`, 50, 100);
  doc.moveTo(50, 120).lineTo(545, 120).strokeColor('#C8923A').stroke();

  // Summary Box
  doc.fontSize(12).fillColor('#000').text('Summary', 50, 140);
  const summaryData = [
    ['Total Orders', orders.length],
    ['Paid Orders', paidOrders.length],
    ['Total Revenue (CAD)', `$${totalRevenue.toFixed(2)}`],
    ['Total Refunds', `$${totalRefunds.toFixed(2)}`],
    ['Net Revenue', `$${(totalRevenue - totalRefunds).toFixed(2)}`],
  ];
  let y = 160;
  summaryData.forEach(([k, v]) => {
    doc.fontSize(10).fillColor('#333').text(k + ':', 60, y).text(String(v), 300, y);
    y += 20;
  });

  doc.moveTo(50, y + 10).lineTo(545, y + 10).strokeColor('#ddd').stroke();
  y += 30;

  // Orders Table
  doc.fontSize(12).fillColor('#000').text('Order Details', 50, y); y += 20;
  const headers = ['Order #', 'Date', 'Customer', 'Amount', 'Status', 'Payment'];
  const colWidths = [70, 70, 130, 70, 70, 70];
  let x = 50;
  headers.forEach((h, i) => { doc.fontSize(9).fillColor('#fff').rect(x, y, colWidths[i], 18).fill('#C8923A').fillColor('#fff').text(h, x+3, y+4, { width: colWidths[i]-6 }); x += colWidths[i]; });
  y += 18;

  orders.forEach((order, idx) => {
    if (y > 720) { doc.addPage(); y = 50; }
    x = 50;
    const rowColor = idx % 2 === 0 ? '#f9f9f9' : '#ffffff';
    const cells = [
      order.orderNumber,
      new Date(order.createdAt).toLocaleDateString(),
      order.user?.name || order.guestEmail || 'Guest',
      `$${order.pricing.total.toFixed(2)}`,
      order.status,
      order.payment.status,
    ];
    cells.forEach((cell, i) => {
      doc.fontSize(8).rect(x, y, colWidths[i], 16).fill(rowColor).fillColor('#333').text(String(cell).slice(0,20), x+3, y+3, { width: colWidths[i]-6 });
      x += colWidths[i];
    });
    y += 16;
  });

  doc.fontSize(8).fillColor('#999').text(`Generated on ${new Date().toLocaleString()} | Kesara Batik`, 50, 800, { align: 'center' });
  doc.end();
});

// GET /api/reports/yearly
exports.getYearlyReport = asyncHandler(async (req, res) => {
  const { year = new Date().getFullYear() } = req.query;
  const data = await Order.aggregate([
    { $match: { createdAt: { $gte: new Date(year, 0, 1), $lte: new Date(year, 11, 31) }, 'payment.status': 'paid' } },
    { $group: { _id: { $month: '$createdAt' }, revenue: { $sum: '$pricing.total' }, orders: { $sum: 1 } } },
    { $sort: { _id: 1 } },
  ]);
  res.json(data);
});
