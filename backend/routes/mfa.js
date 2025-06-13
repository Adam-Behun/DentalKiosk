const express = require('express');
const { sendMfaCode, verifyMfaCode } = require('../controllers/mfaController');
const router = express.Router();

router.post('/request', sendMfaCode); // New route for requesting the MFA code
router.post('/verify', verifyMfaCode);

module.exports = router;
