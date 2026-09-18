const express = require('express');
const router = express.Router();

router.get('/facilities', (req, res) => {
  const facilities = [
    { id: 'f1', type: 'hospital', name: 'Kokilaben Hospital', distance: 1.2, lat: 19.1089, lng: 72.8370, rating: 4.8, open: true, waitTime: 15 },
    { id: 'f2', type: 'clinic', name: 'City Care Clinic', distance: 0.4, lat: 19.0760, lng: 72.8777, rating: 4.5, open: true, waitTime: 10 },
    { id: 'f3', type: 'lab', name: 'SRL Diagnostics', distance: 0.8, lat: 19.0700, lng: 72.8700, rating: 4.6, open: true, waitTime: 5 },
    { id: 'f4', type: 'pharmacy', name: 'Apollo Pharmacy', distance: 0.3, lat: 19.0780, lng: 72.8750, rating: 4.4, open: true, waitTime: 0 },
    { id: 'f5', type: 'blood-bank', name: 'Rotary Blood Bank', distance: 0.9, lat: 19.0650, lng: 72.8820, rating: 4.7, open: true, waitTime: 0 },
  ];

  res.json({ facilities });
});

module.exports = router;
