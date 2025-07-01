import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/style-guide.css'; // Make sure style-guide is also applied globally or imported here

const Home = () => {
  return (
    <div className="main-container">
      <div className="widget-wrapper"> 
        <div className="logo-container">
          <img src="/other-logo.png" alt="Dental Kiosk Logo" className="logo" />
        </div>
        <div className="central-widget">
          <h1 className="widget-title">Welcome to the Dental Kiosk</h1>
          <p className="widget-content">
            Please click below to view and check in for today's appointments.
          </p>
          <h1 className="widget-content">
            <Link to="/appointments" className="button large">
              Today's Appointments
            </Link>
          </h1>
        </div>
      </div>
    </div>
  );
};

export default Home;
