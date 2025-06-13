const Appointment = require('../models/Appointment');
const { getTodayDate } = require('../utils/dateUtils');

const getTodaysAppointments = async (req, res) => {
  try {
    const today = getTodayDate();
    console.log('Computed today:', today); // Add this log
    const appointments = await Appointment.find({ date: today });
    console.log('Fetched appointments:', appointments); // Add this log
    res.status(200).json(appointments);
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getTodaysAppointments };
