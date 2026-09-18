const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { db, uuidv4 } = require('../config/database');

const getPatientData = (userId) => {
  let patient = db.patients.find(p => p.userId === userId || p.id === userId);
  if (!patient) {
    patient = {
      id: userId,
      userId: userId,
      healthScore: 75,
      riskLevel: 'moderate',
      vitals: {
        bloodPressure: '128/82',
        heartRate: 74,
        temperature: 98.6,
        oxygenSaturation: 99,
        bloodGlucose: 98,
        bmi: 23.8,
        lastUpdated: new Date(),
      },
      medications: [
        { id: 'm1', name: 'Amlodipine', dose: '5mg', frequency: 'Once daily', startDate: '2024-01-15', adherenceScore: 88 },
        { id: 'm2', name: 'Metoprolol', dose: '25mg', frequency: 'Twice daily', startDate: '2024-02-01', adherenceScore: 92 },
      ],
      vaccinations: [
        { name: 'COVID-19 Booster', date: '2023-03-15', nextDue: null },
        { name: 'Annual Flu Shot', date: '2023-10-01', nextDue: '2024-10-01' },
      ],
    };
    db.patients.push(patient);
  }
  return patient;
};

// Profile
router.get('/profile', authenticate, (req, res) => {
  const patient = getPatientData(req.user.id);
  const user = db.users.find(u => u.id === req.user.id) || req.user;
  res.json({
    success: true,
    data: {
      id: req.user.id,
      name: user.name || req.user.name,
      email: user.email || req.user.email,
      role: user.role || req.user.role,
      bloodType: user.bloodType || 'O+',
      allergies: user.allergies || ['Penicillin'],
      chronicConditions: user.chronicConditions || ['Hypertension'],
      emergencyContact: user.emergencyContact || { name: 'Priya Sharma', phone: '+91-9876543211', relation: 'spouse' },
      vitals: patient.vitals,
      healthScore: patient.healthScore,
    },
  });
});

router.put('/profile', authenticate, (req, res) => {
  res.json({ success: true, message: 'Profile updated successfully', data: req.body });
});

// Vitals
router.get('/vitals', authenticate, (req, res) => {
  const patient = getPatientData(req.user.id);
  res.json({ success: true, data: patient.vitals });
});

router.put('/vitals', authenticate, (req, res) => {
  const patient = getPatientData(req.user.id);
  patient.vitals = { ...patient.vitals, ...req.body, lastUpdated: new Date() };
  res.json({ success: true, message: 'Vitals updated', data: patient.vitals });
});

// Medications
router.get('/medications', authenticate, (req, res) => {
  const patient = getPatientData(req.user.id);
  res.json({ success: true, data: patient.medications });
});

router.post('/medications', authenticate, (req, res) => {
  const patient = getPatientData(req.user.id);
  const newMed = { id: uuidv4(), ...req.body, startDate: req.body.startDate || new Date().toISOString().split('T')[0], adherenceScore: 100 };
  patient.medications.push(newMed);
  res.status(201).json({ success: true, message: 'Medication added', data: newMed });
});

// Vaccinations
router.get('/vaccinations', authenticate, (req, res) => {
  const patient = getPatientData(req.user.id);
  res.json({ success: true, data: patient.vaccinations });
});

// Health Score
router.get('/health-score', authenticate, (req, res) => {
  const patient = getPatientData(req.user.id);
  res.json({
    success: true,
    data: {
      score: patient.healthScore || 75,
      grade: 'B+',
      trend: '+3 pts this month',
      factors: [
        { factor: 'Cardiovascular Health', score: 78, status: 'good' },
        { factor: 'Metabolic Balance', score: 82, status: 'good' },
        { factor: 'Medication Adherence', score: 90, status: 'excellent' },
        { factor: 'Physical Activity', score: 65, status: 'moderate' },
        { factor: 'Sleep & Recovery', score: 68, status: 'moderate' },
      ],
      recommendations: [
        'Increase daily brisk walking to 35 minutes',
        'Maintain blood pressure logging on weekends',
        'Continue regular Amlodipine regimen',
      ],
    },
  });
});

module.exports = router;
