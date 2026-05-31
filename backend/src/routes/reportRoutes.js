const express = require('express');
const r = express.Router();
const { getMonthlyReport, downloadMonthlyPDF, getYearlyReport } = require('../controllers/reportController');
const { protect, admin } = require('../middleware/auth');
r.use(protect, admin);
r.get('/monthly', getMonthlyReport);
r.get('/monthly/pdf', downloadMonthlyPDF);
r.get('/yearly', getYearlyReport);
module.exports = r;
