const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { db } = require('../config/database');

// Nearby pharmacies
router.get('/nearby', (req, res) => {
  res.json({ success: true, data: db.pharmacies });
});

// Check medicine availability
router.post('/check-availability', (req, res) => {
  const { medicines = [] } = req.body;
  const results = db.pharmacies.map(p => {
    const stocked = medicines.filter(m => p.medicines.some(med => med.toLowerCase().includes(m.toLowerCase())));
    return {
      pharmacyId: p.id,
      pharmacyName: p.name,
      address: p.address,
      phone: p.phone,
      open: p.open,
      stockedMedicines: stocked,
      inStock: stocked.length > 0,
      matchPercentage: medicines.length > 0 ? Math.round((stocked.length / medicines.length) * 100) : 100,
    };
  });
  res.json({ success: true, data: results });
});

// Drug interactions check
router.post('/drug-interactions', (req, res) => {
  const { drugs = [] } = req.body;
  const drugString = drugs.map(d => d.toLowerCase()).join(' ');

  const interactions = [];
  if (drugString.includes('aspirin') && drugString.includes('warfarin')) {
    interactions.push({
      severity: 'high',
      effect: 'Increased risk of gastrointestinal and systemic bleeding',
      recommendation: 'Do not combine without direct hematologist supervision.',
    });
  }
  if (drugString.includes('metformin') && drugString.includes('alcohol')) {
    interactions.push({
      severity: 'moderate',
      effect: 'Increased risk of lactic acidosis',
      recommendation: 'Avoid high alcohol intake while taking Metformin.',
    });
  }

  res.json({
    success: true,
    data: {
      safe: interactions.length === 0,
      interactions,
      totalChecked: drugs.length,
    },
  });
});

module.exports = router;
