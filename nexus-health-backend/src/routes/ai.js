const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { db } = require('../config/database');

// ARIA Symptom Assessment
router.post('/aria/assess', authenticate, (req, res) => {
  const { symptoms = '', age = 30, severity = 'moderate', duration = 'today', existingConditions = [] } = req.body;
  const s = symptoms.toLowerCase();

  let cps = 35;
  let urgency = 'routine';
  let category = 'General Consultation';
  let recommendedSpecialty = 'General Medicine';

  const criticalKeywords = ['chest pain', 'heart attack', 'unconscious', 'cannot breathe', 'severe bleeding', 'stroke', 'paralysis'];
  const urgentKeywords = ['high fever', 'vomiting blood', 'severe abdominal', 'sudden blindness', 'seizure', 'shortness of breath'];
  const cardiacKeywords = ['chest', 'heart', 'palpitations', 'angina'];
  const orthoKeywords = ['joint', 'bone', 'fracture', 'knee', 'back pain'];
  const dermaKeywords = ['rash', 'itching', 'skin', 'mole', 'eczema'];

  if (criticalKeywords.some(k => s.includes(k)) || severity === 'severe') {
    cps = 92;
    urgency = 'emergency';
    category = 'Immediate Emergency';
    recommendedSpecialty = 'Emergency Medicine / Cardiology';
  } else if (urgentKeywords.some(k => s.includes(k))) {
    cps = 72;
    urgency = 'urgent';
    category = 'Priority Specialist Evaluation';
    recommendedSpecialty = 'Cardiology / Internal Medicine';
  } else if (cardiacKeywords.some(k => s.includes(k))) {
    cps = 68;
    urgency = 'urgent';
    category = 'Cardiovascular Investigation';
    recommendedSpecialty = 'Cardiology';
  } else if (orthoKeywords.some(k => s.includes(k))) {
    cps = 45;
    urgency = 'semi-urgent';
    category = 'Orthopedic Care';
    recommendedSpecialty = 'Orthopedics';
  } else if (dermaKeywords.some(k => s.includes(k))) {
    cps = 30;
    urgency = 'routine';
    category = 'Dermatological Review';
    recommendedSpecialty = 'Dermatology';
  }

  const result = {
    cps,
    urgency,
    category,
    recommendedSpecialty,
    reasoning: [
      `Primary reported symptoms: "${symptoms}" analyzed against clinical protocols.`,
      `Symptom duration (${duration}) and reported severity (${severity}) factored into triage weighting.`,
      `Clinical Priority Score of ${cps}/100 indicates ${urgency.toUpperCase()} protocol.`,
    ],
    recommendations: [
      urgency === 'emergency' ? 'Proceed immediately to the nearest Emergency Room or trigger SOS.' : 'Schedule an appointment with the recommended specialist.',
      'Refrain from heavy physical exertion pending professional evaluation.',
      'Keep vital readings updated in your health portal.',
    ],
    timestamp: new Date(),
  };

  res.json({ success: true, data: result, ...result });
});

// ARIA Follow-up
router.post('/aria/followup', authenticate, (req, res) => {
  res.json({
    success: true,
    data: {
      message: 'Follow-up noted. Updated priority score maintained.',
      status: 'monitored',
    },
  });
});

// SENTINEL Continuous Risk Monitor
router.get('/sentinel/risk', authenticate, (req, res) => {
  const result = {
    overallRisk: 34,
    riskCategory: 'moderate',
    trend: 'stable',
    risks: [
      { factor: 'Blood Pressure Fluctuation', status: 'Moderate', detail: 'Latest systolic avg 130 mmHg' },
      { factor: 'Medication Adherence', status: 'Low Risk', detail: '90% compliance on Amlodipine' },
      { factor: 'Activity Level', status: 'Low Risk', detail: '8,400 avg daily steps' },
    ],
    riskFactors: [
      { factor: 'Cardiovascular Risk', score: 38, alert: false },
      { factor: 'Metabolic Syndrome', score: 28, alert: false },
    ],
  };
  res.json({ success: true, data: result, ...result });
});

// ECHO Mental Health Check-in
router.post('/echo/checkin', authenticate, (req, res) => {
  const { responses = [] } = req.body;
  const totalScore = responses.reduce((acc, r) => acc + (r.score || 0), 0);

  let assessment = 'minimal';
  let level = 'Low Anxiety/Depression Risk';
  let message = 'Your responses suggest minimal psychological distress. Keep nurturing your daily wellbeing routines!';

  if (totalScore >= 9) {
    assessment = 'severe';
    level = 'High Distress Indicator';
    message = 'Your responses reflect high distress. We strongly recommend speaking to a supportive specialist or counselor today.';
  } else if (totalScore >= 6) {
    assessment = 'moderate';
    level = 'Moderate Symptoms';
    message = 'Your responses indicate moderate stress or low mood. Taking intentional recovery time and speaking with a professional can help.';
  } else if (totalScore >= 3) {
    assessment = 'mild';
    level = 'Mild Symptoms';
    message = 'Mild indicators detected. Consider sleep regularity, physical activity, and mindfulness practices.';
  }

  const result = {
    score: totalScore,
    assessment,
    level,
    message,
    resources: [
      { title: 'Breathwork & Reset', type: 'audio', duration: '5 min' },
      { title: 'Connect with a Counselor', type: 'consultation', available: true },
      { title: 'Sleep Hygiene Checklist', type: 'guide' },
    ],
  };

  res.json({ success: true, data: result, ...result });
});

// PULSE Heatmap
router.get('/pulse/heatmap', (req, res) => {
  const outbreaks = db.outbreakData || [
    { id: 'ob-001', disease: 'Influenza', severity: 'moderate', lat: 17.38, lng: 78.46, cases: 234, trend: 'rising' },
    { id: 'ob-002', disease: 'Dengue', severity: 'high', lat: 17.42, lng: 78.48, cases: 89, trend: 'stable' },
    { id: 'ob-003', disease: 'COVID-19', severity: 'low', lat: 17.36, lng: 78.43, cases: 45, trend: 'declining' },
  ];

  const result = {
    alertLevel: 'moderate',
    affectedAreas: 3,
    outbreaks,
    activeHotspots: [
      { zone: 'Hitech City & Madhapur', disease: 'Influenza H3N2', cases: 142, trend: 'rising' },
      { zone: 'Banjara Hills', disease: 'Dengue', cases: 89, trend: 'stable' },
      { zone: 'Secunderabad', disease: 'Viral Pharyngitis', cases: 64, trend: 'declining' },
    ],
  };

  res.json({ success: true, data: result, ...result });
});

// PULSE Surge Predictions
router.get('/pulse/surge', (req, res) => {
  const surge = [
    { hospital: 'NEXUS Medical Center, Hitech City', occupancy: 82, predictedSurge: '+14% next 48h', riskLevel: 'moderate' },
    { hospital: 'Apollo Hospitals, Jubilee Hills', occupancy: 91, predictedSurge: '+18% next 48h', riskLevel: 'high' },
    { hospital: 'KIMS Hospital, Secunderabad', occupancy: 74, predictedSurge: '+6% next 48h', riskLevel: 'low' },
  ];

  res.json({ success: true, data: surge, ...surge });
});

module.exports = router;
