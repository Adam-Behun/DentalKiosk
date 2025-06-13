// appointments.js
const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');
const { sendMfaCode } = require('../utils/mfa');
const crypto = require('crypto');

const activeMfaCodes = {}; // Temporary in-memory storage

router.patch('/:id', async (req, res) => {
  const { id } = req.params;
  const { checkedIn, patientBalance } = req.body;

  try {
    const updatedAppointment = await Appointment.findByIdAndUpdate(
      id,
      { checkedIn, patientBalance },
      { new: true }
    );

    if (!updatedAppointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    res.status(200).json(updatedAppointment);
  } catch (error) {
    console.error('Error updating appointment:', error);
    res.status(500).json({ message: 'Error updating appointment' });
  }
});

// Fetch today's appointments
router.get('/today', async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const appointments = await Appointment.find({ date: today, checkedIn: 0 }); // Only fetch unchecked-in appointments
    res.status(200).json(appointments);
  } catch (error) {
    console.error("Error fetching today's appointments:", error);
    res.status(500).json({ message: "Error fetching today's appointments" });
  }
});

router.post('/checkin', async (req, res) => {
  try {
    const { appointmentId } = req.body;
    const appointment = await Appointment.findByIdAndUpdate(appointmentId, { checkedIn: 1 }, { new: true });
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    res.status(200).json({ message: 'Appointment checked in successfully', appointment });
  } catch (error) {
    console.error('Error updating appointment status:', error);
    res.status(500).json({ message: 'Error updating appointment status' });
  }
});

// Request MFA Code
router.post('/mfa/request', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ success: false, message: 'Email is required.' });
  }

  const code = crypto.randomInt(100000, 999999).toString(); // Generate a 6-digit code
  activeMfaCodes[email] = code; // Store the code temporarily using email as the key

  try {
    await sendMfaCode(email, code); // Use nodemailer to send the code
    res.status(200).json({ success: true, message: 'MFA code sent successfully!' });
  } catch (error) {
    console.error('Error sending MFA code:', error);
    res.status(500).json({ success: false, message: 'Error sending MFA code.' });
  }
});

// Verify MFA Code
router.post('/mfa/verify', (req, res) => {
  const { email, code } = req.body;

  if (!email || !code) {
    return res.status(400).json({ success: false, message: 'Email and code are required.' });
  }

  if (activeMfaCodes[email] === code) {
    delete activeMfaCodes[email]; // Remove the code after successful verification
    return res.status(200).json({ success: true, message: 'MFA code verified!' });
  }

  res.status(400).json({ success: false, message: 'Invalid MFA code.' });
});

module.exports = router;
