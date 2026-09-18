const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { db, uuidv4 } = require('../config/database');

// Get all appointments
router.get('/', authenticate, (req, res) => {
  const list = db.appointments.filter(a => a.patientId === req.user.id || a.patientId === 'patient-001' || !a.patientId);
  res.json({ success: true, data: list, appointments: list });
});

// Book appointment
router.post('/', authenticate, (req, res) => {
  const { doctorId, doctorName, specialization, date, time, symptoms, reason, type = 'in-person' } = req.body;

  const doc = db.doctors.find(d => d.id === doctorId);
  const newAppointment = {
    id: `apt-${Date.now()}`,
    patientId: req.user.id,
    doctorId: doctorId || 'doctor-001',
    doctorName: doctorName || (doc ? doc.name : 'Dr. Kavya Reddy'),
    specialization: specialization || (doc ? doc.specialization : 'Cardiology'),
    date: date || new Date().toISOString().split('T')[0],
    time: time || '10:00 AM',
    status: 'confirmed',
    type,
    symptoms: symptoms || reason || 'General Consultation',
    fee: doc?.consultationFee || 500,
    createdAt: new Date(),
  };

  db.appointments.unshift(newAppointment);

  const io = req.app.get('io');
  if (io) {
    io.emit('appointment-booked', newAppointment);
  }

  res.status(201).json({
    success: true,
    message: 'Appointment booked successfully',
    data: newAppointment,
    appointment: newAppointment,
  });
});

// Update appointment status (e.g. cancelled)
router.patch('/:id/status', authenticate, (req, res) => {
  const { status } = req.body;
  const apt = db.appointments.find(a => a.id === req.params.id);
  if (!apt) return res.status(404).json({ error: 'Appointment not found' });
  apt.status = status || apt.status;
  res.json({ success: true, message: 'Status updated', data: apt, appointment: apt });
});

// Reschedule
router.patch('/:id/reschedule', authenticate, (req, res) => {
  const { date, time } = req.body;
  const apt = db.appointments.find(a => a.id === req.params.id);
  if (!apt) return res.status(404).json({ error: 'Appointment not found' });
  if (date) apt.date = date;
  if (time) apt.time = time;
  res.json({ success: true, message: 'Appointment rescheduled', data: apt, appointment: apt });
});

// Queue
router.get('/queue/:doctorId', authenticate, (req, res) => {
  res.json({
    success: true,
    data: {
      currentPatientNumber: 4,
      yourNumber: 7,
      estimatedWaitTime: '25 mins',
      queueLength: 6,
    },
  });
});

module.exports = router;
