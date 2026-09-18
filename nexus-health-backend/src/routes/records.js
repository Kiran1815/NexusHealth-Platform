const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { db, uuidv4 } = require('../config/database');

// Get all patient records
router.get('/', authenticate, (req, res) => {
  const records = db.medicalRecords.filter(r => r.patientId === req.user.id || !r.patientId || r.patientId === 'patient-001');
  res.json({ success: true, data: records });
});

// Get timeline view
router.get('/timeline', authenticate, (req, res) => {
  const records = db.medicalRecords.filter(r => r.patientId === req.user.id || !r.patientId || r.patientId === 'patient-001');
  res.json({ success: true, data: records });
});

// Add record
router.post('/', authenticate, (req, res) => {
  const newRecord = {
    id: `rec-${Date.now()}`,
    patientId: req.user.id,
    ...req.body,
    uploadedAt: new Date(),
    verified: true,
  };
  db.medicalRecords.unshift(newRecord);
  res.status(201).json({ success: true, data: newRecord });
});

// Share
router.get('/share/:id', authenticate, (req, res) => {
  const record = db.medicalRecords.find(r => r.id === req.params.id);
  if (!record) return res.status(404).json({ error: 'Record not found' });
  const shareToken = uuidv4().substring(0, 8);
  res.json({
    success: true,
    data: {
      shareToken,
      record,
      shareUrl: `http://localhost:5173/records/shared/${shareToken}`,
      expiresIn: '24 hours',
    },
  });
});

module.exports = router;
