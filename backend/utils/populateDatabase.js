const mongoose = require('mongoose');
const Appointment = require('../models/Appointment');
require('dotenv').config();

const { createSampleAppointments } = require('../scripts/seed');

const populateDatabase = async () => {
  try {
    console.log('Initializing demo appointments...');
    
    // Clear ALL appointments first to avoid duplicates
    await Appointment.deleteMany({});
    console.log('Cleared all existing appointments');
    
    // Add fresh demo appointments
    const sampleAppointments = createSampleAppointments();
    await Appointment.insertMany(sampleAppointments);
    console.log(`Inserted ${sampleAppointments.length} demo appointments`);
    
    // Log the appointments for debugging
    const allAppointments = await Appointment.find({ checkedIn: 0 });
    console.log(`Total unchecked appointments: ${allAppointments.length}`);
    
  } catch (error) {
    console.error('Error populating database:', error);
  }
};

// Reset function to manually clear duplicates
const resetDatabase = async () => {
  try {
    console.log('Resetting database...');
    await Appointment.deleteMany({});
    console.log('All appointments cleared');
    await populateDatabase();
  } catch (error) {
    console.error('Error resetting database:', error);
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
      await resetDatabase();
      mongoose.connection.close();
    })
    .catch((error) => {
      console.error('Error connecting to MongoDB:', error);
    });
}

module.exports = populateDatabase;