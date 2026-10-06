// Seeds the database with clearly fake patients and appointments.
// Usage (from backend/): npm run seed
// WARNING: deletes every document in the appointments collection first.
const mongoose = require('mongoose');
const Appointment = require('../models/Appointment');
require('dotenv').config();

// All data below is fictional (unique last names keep the kiosk's initials column distinguishable). Phones use the reserved 555-01xx range and
// emails use example.com. The Appointment schema has no phone/email fields,
// so they are kept as comments to document the fake contact details.
const fakePatients = [
  { first: 'Test', last: 'Alpha',   dob: '1990-01-01', doctor: 'Smith', time: '09:00 AM', balance: '50.00'  }, // 555-0101, test.alpha@example.com
  { first: 'Test', last: 'Bravo',   dob: '1990-01-01', doctor: 'Smith', time: '10:00 AM', balance: '200.00' }, // 555-0102, test.bravo@example.com
  { first: 'Test', last: 'Charlie', dob: '1990-01-01', doctor: 'Brown', time: '11:00 AM', balance: '150.00' }, // 555-0103, test.charlie@example.com
  { first: 'Test', last: 'Delta',  dob: '1990-01-01', doctor: 'Brown', time: '02:00 PM', balance: '25.50'  }, // 555-0104, test.delta@example.com
  { first: 'Test', last: 'Echo',  dob: '1990-01-01', doctor: 'Jones', time: '03:00 PM', balance: '0.00'   }, // 555-0105, test.echo@example.com (no balance: skips payment)
];

const createSampleAppointments = () => {
  const today = new Date().toISOString().split('T')[0];
  return fakePatients.map((p) => ({
    patientFirstName: p.first,
    patientLastName: p.last,
    doctorName: p.doctor,
    date: today,
    time: p.time,
    dateOfBirth: p.dob,
    patientBalance: p.balance,
    checkedIn: 0,
  }));
};

const seed = async () => {
  await Appointment.deleteMany({});
  const docs = await Appointment.insertMany(createSampleAppointments());
  console.log(`Seeded ${docs.length} fake appointments`);
};

if (require.main === module) {
  mongoose
    .connect(process.env.MONGO_URI)
    .then(seed)
    .then(() => mongoose.connection.close())
    .catch((err) => {
      console.error('Seed failed:', err.message);
      process.exit(1);
    });
}

module.exports = { createSampleAppointments, seed };
