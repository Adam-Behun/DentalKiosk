Patient self-check-in kiosk for dental offices: identity check with email MFA, cost estimate before treatment, and co-pay collection with Stripe.

This is a portfolio project that runs locally. All data in the repo is fictional.

## How it works

1. **Appointment list.** The kiosk home page links to the appointment list. The backend returns every appointment with `checkedIn: 0` (the date is deliberately ignored for demo purposes). The table shows time, patient initials, and doctor, not full names.
2. **Pick your row and confirm date of birth.** The patient taps their row and enters a date of birth. The browser compares it to the date of birth stored on that appointment.
3. **Email MFA.** The patient enters an email address. The backend generates a 6-digit code with `crypto.randomInt`, keeps it in server memory keyed by that email, and sends it through Nodemailer over SMTP. The patient types the code in; a correct code is accepted once and then deleted. The email is not matched against the patient record.
4. **Check-in.** After the code verifies, the frontend marks the appointment `checkedIn: 1` (PATCH `/api/appointments/:id`). It disappears from the kiosk list.
5. **Cost estimate.** The next screen shows the patient's balance for the visit, read from the `patientBalance` field on the appointment. In this project that is a stored number; no insurance calculation happens. If the balance is zero, the patient just sees a check-in confirmation.
6. **Stripe payment.** If the balance is above zero, "Pay Now" calls `POST /api/checkout/create-checkout-session`. The backend looks up the balance itself (the amount is never taken from the browser), creates a Stripe Checkout session in USD, and the patient is redirected to Stripe's hosted page.
7. **Payment confirmation.** Stripe redirects back to `/appointments?step=success&paid=true`. A webhook endpoint (`POST /webhook`) verifies Stripe's signature and logs `checkout.session.completed`.

### Not implemented yet

- Staff notification and admission. Check-in only sets the `checkedIn` flag; there is no staff screen, alert, or "admitted" state.
- The webhook only logs the event. It does not mark the balance as paid.
- The success page has no dedicated screen, and the frontend's follow-up `GET /api/appointments/:id` has no matching backend route.
- Date of birth is checked in the browser, and the MFA code store is in memory, so a backend restart invalidates pending codes.
- The backend re-seeds the appointments collection every time it starts (`utils/populateDatabase.js`), which deletes existing appointments.

## Architecture

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Frontend** | React, CSS, Axios | User interface and API communication |
| **Backend** | Node.js, Express | RESTful API and business logic |
| **Database** | MongoDB | Patient and appointment data storage |
| **Payments** | Stripe Checkout | Hosted card payment, signed webhook |
| **Email** | Nodemailer, SMTP | MFA code delivery |
| **Local environment** | Docker Compose | MongoDB container |
| **Version Control** | Git, GitHub | Source code management |

## Run it locally

Prerequisites: Node.js (tested with 22), Docker with Compose, a Stripe account in test mode, and an SMTP account that can send mail.

`docker-compose.yml` defines backend and frontend services, but the Dockerfiles they point to are not in the repo, so only the `mongo` service works. Run MongoDB in Docker and the backend and frontend directly with npm.

1. **Start MongoDB.**

   ```bash
   docker compose up -d mongo
   ```

2. **Configure the backend.**

   ```bash
   cd backend
   cp .env.example .env
   ```

   Edit `.env`: the default `MONGO_URI` already matches the compose service. Fill in:
   - `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, `EMAIL_PASS`: any SMTP account (for Gmail, an app password). Without working SMTP the MFA code cannot be delivered.
   - `STRIPE_SECRET_KEY`: a test-mode key (`sk_test_...`) from the Stripe dashboard.
   - `STRIPE_WEBHOOK_SECRET`: from step 5 (can stay a placeholder until then).

3. **Install and seed.**

   ```bash
   npm install
   npm run seed
   ```

   This replaces all appointments with five fake ones: patients `Test Alpha` through `Test Echo`, all with date of birth 1990-01-01, balances of $50.00, $200.00, $150.00, $25.50 and $0.00, dated today. Phone numbers (555-01xx) and `example.com` emails for them are listed in comments in `scripts/seed.js`.

4. **Start the backend.** The backend reads Stripe's key when its modules load, before `dotenv` runs, so export the `.env` values into your shell first:

   ```bash
   set -a; . ./.env; set +a
   npm start
   ```

   It listens on http://localhost:4000.

5. **Optional: Stripe webhook.** In another terminal, with the [Stripe CLI](https://stripe.com/docs/stripe-cli) installed and logged in:

   ```bash
   stripe listen --forward-to localhost:4000/webhook
   ```

   Put the `whsec_...` secret it prints in `STRIPE_WEBHOOK_SECRET` and restart the backend. Payments work without this step; the webhook only logs the event.

6. **Start the frontend.** In another terminal:

   ```bash
   cd frontend
   cp .env.example .env.local
   npm install
   npm start
   ```

   Open http://localhost:3000. `.env.local` points the app at `http://localhost:4000`; without it the app falls back to a hard-coded hosted URL.

7. **Try the flow.** Click "Today's Appointments", choose the row with initials `TA` (Dr. Smith, 09:00 AM), enter date of birth `01/01/1990`, enter any email you can read, type the 6-digit code from that email, and click "Pay Now". On Stripe's page use the test card:

   - Card number: `4242 4242 4242 4242`
   - Expiry: any future date, CVC: any 3 digits, ZIP: any

   Re-run `npm run seed` in `backend/` to bring checked-in appointments back.

## Configuration

Every environment variable the code reads is listed, with a comment, in [`backend/.env.example`](backend/.env.example) and [`frontend/.env.example`](frontend/.env.example). The real `.env` files are gitignored.

## Ideas I'd build next

- **EDI 270/271 eligibility check.** Send a 270 eligibility inquiry through a clearinghouse at check-in and parse the 271 response, so the kiosk shows real-time coverage and remaining deductible instead of a stored balance.
- **Wait-time analytics.** Record a timestamp at check-in and another when staff admit the patient, then report wait time (admission minus check-in) by doctor and hour of day.
