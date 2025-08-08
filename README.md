# Dental Kiosk (MVP)
Welcome to the **Dental Kiosk**, application designed to enhance price transparency and streamline patient check-in processes at dental practices. Built with React, Node.js, MongoDB, Docker, and Stripe it provides a scalable foundation for dental offices aiming to improve operational efficiency and patient experience.

## Features
- **Price Transparency**: Displays estimated visit costs based on appointments (CPT + Fee Schedule).
- **Multi-Factor Authentication**: Ensures secure patient access.
- **Stripe Integration**: Facilitates secure co-payment collection.
- **MongoDB Backend**: Stores appointment and patient data, with sample records like patient Alice Johnson (DOB: 09-10-1978, balance: $150.00).
- **Future Roadmap**: Plans for EDI Clearinghouse integration to enable real-time deductible insights, software-controlled co-pay collection, and office wait-time analytics.

## Architecture
- **Frontend**: React application served via Nginx, running on port 3000.
- **Backend**: Node.js API connected to MongoDB, running on port 4000.
- **Database**: MongoDB 6.0, running on port 27017.
- **Payment**: Stripe CLI for testing payment workflows.
- **Containerization**: Docker with multi-stage builds. 

- **Example appointment record**:
```json
{
  _id: ObjectId('678bdf6eba69b819f1e8a36c'),
  patientFirstName: 'Alice',
  patientLastName: 'Johnson',
  doctorName: 'Brown',
  date: '2025-01-18',
  time: '11:00 AM',
  dateOfBirth: '1978-09-10',
  patientBalance: '150.00',
  __v: 0
}
```

## Future Enhancements
- **EDI Clearinghouse Integration**: Real-time deductible insights for enhanced price transparency.
- **Wait-Time Analytics**: Analyze and optimize office wait times (Wait-time = Check-in - Admission by Staff).