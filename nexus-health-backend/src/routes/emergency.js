const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { db } = require('../config/database');

// Active emergency
router.get('/active', authenticate, (req, res) => {
  const active = db.emergencyAlerts.find(e => (e.userId === req.user.id || !e.userId) && e.status === 'active');
  res.json({ success: true, data: active || null });
});

// Activate SOS
router.post('/sos', authenticate, (req, res) => {
  const { location } = req.body;
  const newEmergency = {
    id: `EMG-${Date.now().toString().slice(-6)}`,
    userId: req.user.id,
    userName: req.user.name || 'Arjun Sharma',
    location: location || { lat: 17.385, lng: 78.4867 },
    status: 'active',
    ambulanceETA: '4 mins',
    assignedAmbulance: 'AP-09-AMB-4091',
    nearestER: 'NEXUS Medical Center, Hitech City',
    erContact: '+91-40-12345678',
    activatedAt: new Date(),
  };

  db.emergencyAlerts.unshift(newEmergency);

  const io = req.app.get('io');
  if (io) {
    io.emit('emergency-alert', newEmergency);
  }

  res.status(201).json({
    success: true,
    message: 'Emergency services dispatched',
    data: newEmergency,
  });
});

// Cancel SOS
router.patch('/:id/cancel', authenticate, (req, res) => {
  const emg = db.emergencyAlerts.find(e => e.id === req.params.id);
  if (emg) emg.status = 'cancelled';
  res.json({ success: true, message: 'Emergency cancelled', data: emg });
});

// Nearby hospitals
router.get('/hospitals', (req, res) => {
  res.json({ success: true, data: db.hospitals });
});

module.exports = router;
