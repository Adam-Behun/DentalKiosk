// utils/populateDatabase.js

const mongoose = require('mongoose');
const Appointment = require('../models/Appointment');
require('dotenv').config();

// Get today's date in Railway's timezone (UTC)
const getTodayDate = () => {
  return new Date().toISOString().split('T')[0];
};

const sampleAppointments = [
  {
    patientFirstName: 'John',
    patientLastName: 'Doe',
    doctorName: 'Smith',
    date: getTodayDate(),
    time: '09:00 AM',
    dateOfBirth: '1990-01-01',
    patientBalance: '50.00',
    checkedIn: 0,
  },
  {
    patientFirstName: 'Jane',
    patientLastName: 'Doe',
    doctorName: 'Smith',
    date: getTodayDate(),
    time: '10:00 AM',
    dateOfBirth: '1985-05-15',
    patientBalance: '0.00',
    checkedIn: 0,
  },
  {
    patientFirstName: 'Alice',
    patientLastName: 'Johnson',
    doctorName: 'Brown',
    date: getTodayDate(),
    time: '11:00 AM',
    dateOfBirth: '1978-09-10',
    patientBalance: '150.00',
    checkedIn: 0,
  },
  {
    patientFirstName: 'Bob',
    patientLastName: 'Williams',
    doctorName: 'Brown',
    date: getTodayDate(),
    time: '01:00 PM',
    dateOfBirth: '1992-12-20',
    patientBalance: '25.50',
    checkedIn: 0,
  },
];

const populateDatabase = async () => {
  try {
    console.log('Populating the database...');
    await Appointment.deleteMany({});
    console.log('Cleared existing appointments');
    await Appointment.insertMany(sampleAppointments);
    console.log('Inserted sample appointments:', sampleAppointments);
  } catch (error) {
    console.error('Error populating database:', error);
  }
};

// Run the script only if this file is executed directly
if (require.main === module) {
  mongoose
    .connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(async () => {
      console.log('Connected to MongoDB');
      await populateDatabase();
      mongoose.connection.close(); // Only close if script is run independently
    })
    .catch((error) => {
      console.error('Error connecting to MongoDB:', error);
    });
}

module.exports = populateDatabase;