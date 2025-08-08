import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import '../styles/style-guide.css';
import API_BASE_URL from '../config/api';

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [dob, setDob] = useState('');
  const [email, setEmail] = useState('');
  const [mfaCode, setMfaCode] = useState('');
  const [step, setStep] = useState('list');
  const [paid, setPaid] = useState(false);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Extract "step" and "paid" from URL parameters (if returning from payment, for instance)
    const queryParams = new URLSearchParams(location.search);
    const urlStep = queryParams.get('step');
    const paymentStatus = queryParams.get('paid') === 'true';

    if (urlStep) {
      setStep(urlStep);
      setPaid(paymentStatus);
    }
  }, [location.search]);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/appointments/today`);
        // Only show those that have not been checked in (checkedIn === 0)
        setAppointments(response.data.filter((appt) => appt.checkedIn === 0));
      } catch (error) {
        console.error('Error fetching appointments:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAppointments();
  }, []);

  const getInitials = (firstName, lastName) => {
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  };

  const handleRowClick = (appointment) => {
    setSelectedAppointment(appointment);
    setStep('dob');
  };

  const handleVerifyDob = () => {
    if (dob === selectedAppointment.dateOfBirth) {
      setStep('email');
    } else {
      alert('Incorrect Date of Birth. Please try again.');
    }
  };

  const handleRequestMfa = async () => {
    if (!email || !email.includes('@')) {
      alert('Please enter a valid email address.');
      return;
    }

    try {
      await axios.post(`${API_BASE_URL}/api/appointments/mfa/request`, { email });
      alert('MFA code sent to your email!');
      setStep('mfa');
    } catch (error) {
      console.error('Error requesting MFA code:', error);
      alert('Error sending MFA code. Please try again.');
    }
  };

  const handleCheckIn = async () => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/appointments/mfa/verify`, {
        email,
        code: mfaCode,
      });
      if (response.data.success) {
        // Mark the appointment as checked in
        const balance = parseFloat(selectedAppointment?.patientBalance || '0');
        const updatedAppointment = {
          ...selectedAppointment,
          checkedIn: 1,
          patientBalance: balance > 0 ? balance.toFixed(2) : '0.00',
        };

        // Update the database
        await axios.patch(`${API_BASE_URL}/api/appointments/${selectedAppointment._id}`, updatedAppointment);

        // Go to "menu" step, regardless of balance
        setStep('menu');

        // Remove this appointment from the list so it doesn't show again
        setAppointments((prevAppointments) =>
          prevAppointments.filter((appt) => appt._id !== selectedAppointment._id)
        );
      } else {
        alert('Invalid MFA code. Please try again.');
      }
    } catch (error) {
      console.error('Error verifying MFA code:', error);
      alert('Error during MFA verification. Please try again.');
    }
  };

  const handlePayNow = async () => {
    try {
      // Save selectedAppointment to localStorage in case user refreshes or returns from payment
      localStorage.setItem('selectedAppointment', JSON.stringify(selectedAppointment));

      // Call backend to create a payment session (Stripe, Square, etc.)
      const response = await axios.post(`${API_BASE_URL}/api/checkout/create-checkout-session`, {
        appointmentId: selectedAppointment._id,
      });
      // Redirect user to the payment page
      window.location.href = response.data.url;
    } catch (error) {
      console.error('Error creating checkout session:', error);
      alert('Error redirecting to Stripe Checkout.');
    }
  };


  useEffect(() => {
    const savedAppointment = localStorage.getItem('selectedAppointment');
    if (savedAppointment) {
      setSelectedAppointment(JSON.parse(savedAppointment));
    }
  }, []);

  useEffect(() => {
    if (paid && selectedAppointment) {

      axios
        .get(`${API_BASE_URL}/api/appointments/${selectedAppointment._id}`)
        .then((res) => {
          setSelectedAppointment(res.data); // updated appointment
        })
        .catch((err) => console.error('Error fetching updated appointment:', err));
    }
  }, [paid, selectedAppointment]);


  return (
    <div className="main-container">
      <div className="widget-wrapper">
        {/* Logo */}
        <div className="logo-container">
          <div className="logo">
            <span style={{fontSize: '2em', fontWeight: 'bold', color: 'var(--secondary-color)'}}>
              Dental Kiosk
            </span>
          </div>
        </div>

        {/* Central Widget */}
        <div className="central-widget">
          {/* STEP: list */}
          {step === 'list' && (
            <>
              <h1 className="widget-title">Today's Appointments</h1>
              <p className="widget-content">
                To check in, find your appointment using your initials, doctor, and time, then click on your row.
              </p>
              {loading ? (
                <p>Loading...</p>
              ) : (
                <table className="appointment-table">
                  <thead>
                    <tr>
                      <th>Appointment Time</th>
                      <th>Initials</th>
                      <th>Doctor</th>
                    </tr>
                  </thead>
                  <tbody>
                    {appointments.map((appointment) => (
                      <tr
                        key={appointment._id}
                        className="appointment-row"
                        onClick={() => handleRowClick(appointment)}
                      >
                        <td>
                          {new Date(`${appointment.date} ${appointment.time}`).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </td>
                        <td>{getInitials(appointment.patientFirstName, appointment.patientLastName)}</td>
                        <td>
                          {appointment.doctorName.startsWith('Dr.')
                            ? appointment.doctorName
                            : `Dr. ${appointment.doctorName}`}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </>
          )}

          {/* STEP: dob */}
          {step === 'dob' && (
            <>
              <h1 className="widget-title">Please, confirm your Date of Birth</h1>
              <p className="widget-content" style={{fontSize: '0.9rem', color: 'var(--neutral-text)', fontStyle: 'italic'}}>
                For demo purposes, all patients DOB is set to 01/01/1990
              </p>
              <div className="input-container">
                <input
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="input-box"
                />
              </div>
              <button className="button large" onClick={handleVerifyDob}>
                Confirm DOB
              </button>
            </>
          )}

          {/* STEP: email */}
          {step === 'email' && (
            <>
              <h1 className="widget-title">Enter Your Email for Verification</h1>
              <div className="input-container">
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-box"
                />
              </div>
              <button className="button large" onClick={handleRequestMfa}>
                Submit Email
              </button>
            </>
          )}

          {/* STEP: mfa */}
          {step === 'mfa' && (
            <>
              <h1 className="widget-title">Enter the Code Sent to Your Email</h1>
              <div className="input-container">
                <input
                  type="text"
                  placeholder="Enter MFA code"
                  value={mfaCode}
                  onChange={(e) => setMfaCode(e.target.value)}
                  className="input-box"
                />
              </div>
              <button className="button large" onClick={handleCheckIn}>
                Check In
              </button>
            </>
          )}

          {/* STEP: menu  */}
          {step === 'menu' && selectedAppointment && (
            <>
              {/* Check if there's a balance */}
              {parseFloat(selectedAppointment.patientBalance) === 0 ? (
                <p className="widget-content">
                  You have successfully checked in for your appointment with Dr.{' '}
                  {selectedAppointment.doctorName} at{' '}
                  {new Date(`${selectedAppointment.date} ${selectedAppointment.time}`).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                  .
                </p>
              ) : (
                <p className="widget-content">
                  You have a balance of <strong>${selectedAppointment.patientBalance}</strong>.
                </p>
              )}

              {/* If balance > 0, show Pay Now button */}
              {parseFloat(selectedAppointment.patientBalance) > 0 && (
                <button className="button large" onClick={handlePayNow}>
                  Pay Now
                </button>
              )}

              {/* Always show "Coming Soon" options */}
              <div className="button-group">
                <button className="button large coming-soon" disabled>
                  Join a Membership plan <em>(*Coming Soon)</em>
                </button>
                <button className="button large coming-soon" disabled>
                  Request My Xray Records <em>(*Coming Soon)</em>
                </button>
                <button className="button large coming-soon" disabled>
                  View My Treatment Plan <em>(*Coming Soon)</em>
                </button>
              </div>
            </>
          )}
        </div>

        {/* Return to Home Button */}
        <div className="home-button-container">
          <button className="button" onClick={() => navigate('/')}>
            Return Home
          </button>
        </div>
      </div>
    </div>
  );
}
export default Appointments;