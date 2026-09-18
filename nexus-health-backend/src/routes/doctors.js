const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { db } = require('../config/database');

const defaultSlotTimes = [
  '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM',
  '11:00 AM', '11:30 AM', '02:00 PM', '02:30 PM',
  '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM',
];

// Get all doctors with filters
router.get('/', (req, res) => {
  const { specialization, search } = req.query;
  let list = db.doctors.map(d => {
    const userDoc = db.users.find(u => u.id === d.userId || u.id === d.id);
    return {
      id: d.id,
      name: userDoc ? userDoc.name : d.name,
      specialization: d.specialization || (userDoc ? userDoc.specialization : 'General Medicine'),
      hospital: d.hospital || (userDoc ? userDoc.hospital : 'NEXUS Medical Center'),
      rating: d.rating || 4.8,
      experience: d.experience || (userDoc ? userDoc.experience : 10),
      consultationFee: d.consultationFee || 500,
      available: d.available !== undefined ? d.available : true,
      languages: userDoc?.languages || ['English', 'Hindi'],
      location: d.location || { city: 'Hyderabad', lat: 17.385, lng: 78.4867 },
    };
  });

  if (specialization && specialization !== 'All') {
    list = list.filter(d => d.specialization.toLowerCase().includes(specialization.toLowerCase()));
  }
  if (search) {
    const s = search.toLowerCase();
    list = list.filter(d => d.name.toLowerCase().includes(s) || d.specialization.toLowerCase().includes(s));
  }

  res.json({ success: true, data: list, doctors: list });
});

// Get single doctor
router.get('/:id', (req, res) => {
  const d = db.doctors.find(doc => doc.id === req.params.id);
  if (!d) return res.status(404).json({ error: 'Doctor not found' });
  const userDoc = db.users.find(u => u.id === d.userId || u.id === d.id);
  const doc = {
    id: d.id,
    name: userDoc ? userDoc.name : d.name,
    specialization: d.specialization,
    hospital: d.hospital || userDoc?.hospital,
    rating: d.rating || 4.8,
    experience: d.experience || userDoc?.experience,
    consultationFee: d.consultationFee || 500,
    available: d.available,
    location: d.location,
  };
  res.json({ success: true, data: doc });
});

// Get doctor availability slots
router.get('/:id/slots', (req, res) => {
  const date = req.query.date || new Date().toISOString().split('T')[0];
  const slots = defaultSlotTimes.map((time, idx) => ({
    id: `slot-${idx}`,
    time,
    date,
    available: idx % 3 !== 0,
  }));
  res.json({ success: true, data: slots, slots });
});

// AI recommendation
router.post('/recommend', (req, res) => {
  const { symptoms = '' } = req.body;
  const s = symptoms.toLowerCase();
  let targetSpecialty = 'General Medicine';

  if (s.includes('heart') || s.includes('chest') || s.includes('palpitations')) {
    targetSpecialty = 'Cardiology';
  } else if (s.includes('skin') || s.includes('rash') || s.includes('itch')) {
    targetSpecialty = 'Dermatology';
  } else if (s.includes('bone') || s.includes('joint') || s.includes('knee') || s.includes('back')) {
    targetSpecialty = 'Orthopedics';
  } else if (s.includes('child') || s.includes('baby') || s.includes('infant')) {
    targetSpecialty = 'Pediatrics';
  }

  const recommended = db.doctors.filter(d => d.specialization === targetSpecialty || d.specialization === 'General Medicine');
  res.json({
    success: true,
    data: {
      targetSpecialty,
      recommended,
      reasoning: `Based on your reported symptoms, consultation with a ${targetSpecialty} specialist is recommended.`,
    },
  });
});

module.exports = router;
