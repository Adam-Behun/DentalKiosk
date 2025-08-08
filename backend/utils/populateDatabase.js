// utils/populateDatabase.js

const mongoose = require('mongoose');
const Appointment = require('../models/Appointment');
require('dotenv').config();

// Get today's date in a more reliable way
const getTodayDate = () => {
  // Use Railway's timezone (usually UTC) and ensure consistency
  const today = new Date();
  return today.toISOString().split('T')[0]; // YYYY-MM-DD format
};

// Create appointments for multiple days to ensure reliability
const createSampleAppointments = () => {
  const today = getTodayDate();
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  return [
    // Today's appointments - ALL with DOB 1990-01-01 for demo consistency
    {
      patientFirstName: 'John',
      patientLastName: 'Doe',
      doctorName: 'Smith',
      date: today,
      time: '09:00 AM',
      dateOfBirth: '1990-01-01',
      patientBalance: '50.00',
      checkedIn: 0,
    },
    {
      patientFirstName: 'Jane',
      patientLastName: 'Doe',
      doctorName: 'Smith',
      date: today,
      time: '10:00 AM',
      dateOfBirth: '1990-01-01',
      patientBalance: '0.00',
      checkedIn: 0,
    },
    {
      patientFirstName: 'Alice',
      patientLastName: 'Johnson',
      doctorName: 'Brown',
      date: today,
      time: '11:00 AM',
      dateOfBirth: '1990-01-01',
      patientBalance: '150.00',
      checkedIn: 0,
    },
    {
      patientFirstName: 'Bob',
      patientLastName: 'Williams',
      doctorName: 'Brown',
      date: today,
      time: '01:00 PM',
      dateOfBirth: '1990-01-01',
      patientBalance: '25.50',
      checkedIn: 0,
    },
    // Tomorrow's appointments (backup) - also with consistent DOB
    {
      patientFirstName: 'Sarah',
      patientLastName: 'Miller',
      doctorName: 'Johnson',
      date: tomorrowStr,
      time: '09:30 AM',
      dateOfBirth: '1990-01-01',
      patientBalance: '75.00',
      checkedIn: 0,
    },
    {
      patientFirstName: 'Mike',
      patientLastName: 'Davis',
      doctorName: 'Johnson',
      date: tomorrowStr,
      time: '02:00 PM',
      dateOfBirth: '1990-01-01',
      patientBalance: '120.00',
      checkedIn: 0,
    }
  ];
};

const populateDatabase = async () => {
  try {
    console.log('Populating the database...');
    
    // Don't clear all appointments - just ensure we have today's appointments
    const today = getTodayDate();
    await Appointment.deleteMany({ date: today });
    console.log(`Cleared appointments for ${today}`);
    
    const sampleAppointments = createSampleAppointments();
    await Appointment.insertMany(sampleAppointments);
    console.log('Inserted sample appointments:', sampleAppointments);
    
    // Log the current count for debugging
    const todayCount = await Appointment.countDocuments({ date: today, checkedIn: 0 });
    console.log(`Total unchecked appointments for today (${today}): ${todayCount}`);
    
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