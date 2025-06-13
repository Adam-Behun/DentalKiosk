const crypto = require('crypto');
const nodemailer = require('nodemailer');

let activeMfaCodes = {}; // In-memory store for MFA codes

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Send MFA Code
const sendMfaCode = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).send({ success: false, message: 'Email address is required.' });
  }

  const code = crypto.randomInt(100000, 999999).toString(); // Generate a 6-digit code
  activeMfaCodes[email] = code; // Store the code temporarily using the email as the key

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Your MFA Code',
      text: `Your MFA code is: ${code}`,
    });

    res.status(200).send({ success: true, message: 'MFA code sent successfully!' });
  } catch (error) {
    console.error('Error sending MFA code:', error);
    res.status(500).send({ success: false, message: 'Error sending MFA code.' });
  }
};

// Verify MFA Code
const verifyMfaCode = (req, res) => {
  const { email, code } = req.body;

  if (activeMfaCodes[email] === code) {
    delete activeMfaCodes[email]; // Remove the code after successful verification
    return res.status(200).send({ success: true, message: 'MFA code verified!' });
  }

  res.status(400).send({ success: false, message: 'Invalid MFA code.' });
};

module.exports = { sendMfaCode, verifyMfaCode };
