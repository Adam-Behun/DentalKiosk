const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  patientFirstName: { type: String, required: true },
  patientLastName: { type: String, required: true },
  doctorName: { type: String, required: true },
  date: { type: String, required: true }, // Use String for ISO date format
  time: { type: String, required: true },
  dateOfBirth: { type: String, required: true }, // New field
  patientBalance: { type: String, required: true },
  checkedIn: { type: Number, default: 0 }, 
});

const Appointment = mongoose.model('Appointment', appointmentSchema);

module.exports = Appointment;
