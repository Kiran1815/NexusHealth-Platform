// In-memory data store (replace with MongoDB/PostgreSQL in production)
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');

const db = {
  users: [
    {
      id: 'patient-001',
      email: 'patient@nexushealth.com',
      password: bcrypt.hashSync('password123', 10),
      role: 'patient',
      name: 'Arjun Sharma',
      phone: '+91-9876543210',
      bloodType: 'O+',
      dateOfBirth: '1990-05-15',
      gender: 'male',
      avatar: null,
      createdAt: new Date('2024-01-01'),
      emergencyContact: { name: 'Priya Sharma', phone: '+91-9876543211', relation: 'spouse' },
      allergies: ['Penicillin', 'Aspirin'],
      chronicConditions: ['Hypertension'],
    },
    {
      id: 'doctor-001',
      email: 'doctor@nexushealth.com',
      password: bcrypt.hashSync('password123', 10),
      role: 'doctor',
      name: 'Dr. Kavya Reddy',
      phone: '+91-9876543220',
      specialization: 'Cardiology',
      qualifications: ['MBBS', 'MD', 'DM Cardiology'],
      experience: 12,
      rating: 4.9,
      totalReviews: 847,
      avatar: null,
      hospital: 'NEXUS Medical Center, Hyderabad',
      consultationFee: 800,
      languages: ['English', 'Telugu', 'Hindi'],
      available: true,
      createdAt: new Date('2024-01-01'),
    },
    {
      id: 'admin-001',
      email: 'admin@nexushealth.com',
      password: bcrypt.hashSync('password123', 10),
      role: 'admin',
      name: 'System Administrator',
      createdAt: new Date('2024-01-01'),
    }
  ],

  patients: [
    {
      id: 'patient-001',
      userId: 'patient-001',
      healthScore: 72,
      riskLevel: 'moderate',
      vitals: {
        bloodPressure: '130/85',
        heartRate: 78,
        temperature: 98.6,
        oxygenSaturation: 98,
        bloodGlucose: 105,
        bmi: 24.5,
        lastUpdated: new Date(),
      },
      medications: [
        { id: 'm1', name: 'Amlodipine', dose: '5mg', frequency: 'Once daily', startDate: '2024-01-15', adherenceScore: 85 },
        { id: 'm2', name: 'Metoprolol', dose: '25mg', frequency: 'Twice daily', startDate: '2024-02-01', adherenceScore: 90 },
      ],
      vaccinations: [
        { name: 'COVID-19', date: '2023-03-15', nextDue: null },
        { name: 'Flu Shot', date: '2023-10-01', nextDue: '2024-10-01' },
      ],
    }
  ],

  doctors: [
    { id: 'doctor-001', userId: 'doctor-001', specialization: 'Cardiology', rating: 4.9, available: true, consultationFee: 800, location: { lat: 17.385, lng: 78.4867, city: 'Hyderabad' } },
    { id: 'doctor-002', userId: null, name: 'Dr. Rohit Mehta', specialization: 'General Medicine', rating: 4.7, available: true, consultationFee: 400, experience: 8, hospital: 'Apollo Clinic', location: { lat: 17.44, lng: 78.50, city: 'Hyderabad' } },
    { id: 'doctor-003', userId: null, name: 'Dr. Sneha Patel', specialization: 'Dermatology', rating: 4.8, available: false, consultationFee: 600, experience: 6, hospital: 'Skin Care Center', location: { lat: 17.36, lng: 78.47, city: 'Hyderabad' } },
    { id: 'doctor-004', userId: null, name: 'Dr. Arun Kumar', specialization: 'Orthopedics', rating: 4.6, available: true, consultationFee: 700, experience: 15, hospital: 'Bone & Joint Clinic', location: { lat: 17.39, lng: 78.52, city: 'Hyderabad' } },
    { id: 'doctor-005', userId: null, name: 'Dr. Meena Iyer', specialization: 'Pediatrics', rating: 4.9, available: true, consultationFee: 500, experience: 10, hospital: 'Childcare Hospital', location: { lat: 17.41, lng: 78.46, city: 'Hyderabad' } },
  ],

  appointments: [
    { id: 'apt-001', patientId: 'patient-001', doctorId: 'doctor-001', doctorName: 'Dr. Kavya Reddy', specialization: 'Cardiology', date: '2025-03-10', time: '10:00 AM', status: 'confirmed', type: 'consultation', symptoms: 'Chest discomfort, mild breathlessness', priorityScore: 65, fee: 800, createdAt: new Date() },
    { id: 'apt-002', patientId: 'patient-001', doctorId: 'doctor-002', doctorName: 'Dr. Rohit Mehta', specialization: 'General Medicine', date: '2025-02-20', time: '02:30 PM', status: 'completed', type: 'follow-up', symptoms: 'Routine checkup', priorityScore: 30, fee: 400, createdAt: new Date() },
  ],

  medicalRecords: [
    { id: 'rec-001', patientId: 'patient-001', type: 'diagnosis', date: '2024-06-15', title: 'Hypertension Diagnosis', description: 'Stage 1 Hypertension diagnosed. BP consistently above 130/85.', doctor: 'Dr. Kavya Reddy', tags: ['hypertension', 'cardiovascular'] },
    { id: 'rec-002', patientId: 'patient-001', type: 'lab', date: '2024-08-20', title: 'Lipid Profile Report', description: 'Total Cholesterol: 210, HDL: 45, LDL: 140, Triglycerides: 170', doctor: 'Dr. Kavya Reddy', tags: ['lipid', 'cholesterol'] },
    { id: 'rec-003', patientId: 'patient-001', type: 'prescription', date: '2024-09-01', title: 'Antihypertensive Prescription', description: 'Amlodipine 5mg OD, Metoprolol 25mg BD for hypertension management.', doctor: 'Dr. Kavya Reddy', tags: ['prescription', 'hypertension'] },
  ],

  emergencyAlerts: [],

  analyticsData: {
    patientsHelped: 124847,
    waitTimeReduced: 68,
    livesSaved: 2341,
    ruralUsersReached: 47832,
    appointmentEfficiency: 89,
    outbreakAlerts: 12,
    mentalHealthCheckins: 38291,
    avgEmergencyResponseTime: 4.2,
  },

  pharmacies: [
    { id: 'ph-001', name: 'MedPlus Pharmacy', address: 'Banjara Hills, Hyderabad', lat: 17.41, lng: 78.44, open: true, phone: '+91-40-23456789', medicines: ['Amlodipine', 'Metoprolol', 'Paracetamol', 'Amoxicillin'] },
    { id: 'ph-002', name: 'Apollo Pharmacy', address: 'Jubilee Hills, Hyderabad', lat: 17.43, lng: 78.41, open: true, phone: '+91-40-23456790', medicines: ['Metoprolol', 'Atorvastatin', 'Paracetamol'] },
    { id: 'ph-003', name: '1mg Pharma Store', address: 'Madhapur, Hyderabad', lat: 17.45, lng: 78.39, open: false, phone: '+91-40-23456791', medicines: ['Amlodipine', 'Cetirizine', 'Omeprazole'] },
  ],

  hospitals: [
    { id: 'h-001', name: 'NEXUS Medical Center', type: 'Super Specialty', address: 'Hitech City, Hyderabad', lat: 17.445, lng: 78.377, phone: '+91-40-12345678', beds: { total: 500, available: 47 }, emergency: true, waitTime: 12 },
    { id: 'h-002', name: 'Apollo Hospitals', type: 'Multi Specialty', address: 'Jubilee Hills, Hyderabad', lat: 17.43, lng: 78.41, phone: '+91-40-23456780', beds: { total: 800, available: 120 }, emergency: true, waitTime: 25 },
    { id: 'h-003', name: 'KIMS Hospital', type: 'Multi Specialty', address: 'Secunderabad, Hyderabad', lat: 17.44, lng: 78.50, phone: '+91-40-44556677', beds: { total: 600, available: 89 }, emergency: true, waitTime: 18 },
  ],

  outbreakData: [
    { id: 'ob-001', disease: 'Influenza', severity: 'moderate', lat: 17.38, lng: 78.46, cases: 234, trend: 'rising', lastUpdated: new Date() },
    { id: 'ob-002', disease: 'Dengue', severity: 'high', lat: 17.42, lng: 78.48, cases: 89, trend: 'stable', lastUpdated: new Date() },
    { id: 'ob-003', disease: 'COVID-19', severity: 'low', lat: 17.36, lng: 78.43, cases: 45, trend: 'declining', lastUpdated: new Date() },
  ],
};

module.exports = { db, uuidv4 };
