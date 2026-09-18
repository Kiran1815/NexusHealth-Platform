const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { db } = require('../config/database');

router.get('/impact', (req, res) => {
  const data = db.analyticsData || {
    patientsHelped: 124847,
    waitTimeReduced: 68,
    livesSaved: 2341,
    ruralUsersReached: 47832,
    appointmentEfficiency: 89,
    outbreakAlerts: 12,
    mentalHealthCheckins: 38291,
    avgEmergencyResponseTime: 4.2,
  };
  res.json({ success: true, data });
});

router.get('/dashboard', authenticate, (req, res) => {
  const patient = db.patients.find(p => p.userId === req.user.id || p.id === req.user.id) || db.patients[0];
  const data = {
    weeklyStats: {
      appointments: db.appointments.length,
      healthScore: patient?.healthScore || 75,
      medicationsAdherence: 90,
      stepsAverage: 8420,
    },
    monthlyTrend: [
      { month: 'Oct', score: 68 },
      { month: 'Nov', score: 71 },
      { month: 'Dec', score: 70 },
      { month: 'Jan', score: 73 },
      { month: 'Feb', score: 72 },
      { month: 'Mar', score: 75 },
    ],
    upcomingReminders: [
      { type: 'medication', name: 'Amlodipine 5mg', time: '08:00 AM', today: true },
      { type: 'appointment', name: 'Dr. Kavya Reddy', date: 'Tomorrow, 10:00 AM' },
      { type: 'vital', name: 'Log Blood Pressure', date: 'Due today' },
    ],
  };
  res.json({ success: true, data });
});

module.exports = router;
