# Dental Kiosk (MVP)
Welcome to the **Dental Kiosk (MVP)**, application designed to enhance price transparency and streamline patient check-in processes at dental practices. Built with React, Node.js, MongoDB, Docker, and Stripe it provides a scalable foundation for dental offices aiming to improve operational efficiency and patient experience.

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

## Getting Started

## Prerequisites
- [Docker](https://www.docker.com/get-started) and [Docker Compose](https://docs.docker.com/compose/install/)
- [Node.js](https://nodejs.org/) (for local development, optional)
- [Git](https://git-scm.com/) to clone the repository

### 1. Clone the Repository
```bash
git clone https://github.com/Adam-Behun/DentalKiosk.git
cd DentalKiosk
```

### 2. Set Up Environment Variables
Copy the example environment file below and configure it with your own credentials:

Edit `backend/.env` with your values:
- **MongoDB URI**: Use the default `mongodb://root:rootpassword@mongo:27017/dental?authSource=admin` for Docker.
- **Email Settings**: Provide your SMTP host, port, user, and app-specific password (Gmail app password).
- **Stripe Keys**: Obtain your `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` from the [Stripe Dashboard](https://dashboard.stripe.com/test/apikeys).

Example `backend/.env`:
```bash
PORT=4000
MONGO_URI=mongodb://root:rootpassword@mongo:27017/dental?authSource=admin
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_app_password
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
```

### 3. Build and Run with Docker
Start the application using Docker Compose:
```bash
docker-compose up --build -d
```
- **Frontend**: Access at [http://localhost:3000](http://localhost:3000)
- **Backend**: Access at [http://localhost:4000](http://localhost:4000)

### 4. Populate the Database
Run the database population script:
```bash
docker exec -it dental_backend node utils/populateDatabase.js
```

### 5. Log In to MongoDB
Access the MongoDB instance:
```bash
docker exec -it dental_mongo mongosh
```
Inside the Mongo shell:
```javascript
use admin
db.auth('root', 'rootpassword')
use dental
db.appointments.find()
show collections
exit
```

## Testing with Sample Patient
Use the following patient details for testing:
- **Name**: Alice Johnson (AJ)
- **Date of Birth**: 09-10-1978

### Test Payment with Stripe
Use the following test card for Stripe payments:
- **Card Number**: 4242 4242 4242 4242
- **Expiration**: 12/34
- **CVC**: 123

### Stop the Application
Shut down the containers:
```bash
docker-compose down
```
