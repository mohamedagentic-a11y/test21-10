import express from 'express';
import { register, login } from './controllers/authController';
import { getBooking, rebookFlight } from './controllers/bookingController';
import { submitClaim, getClaimStatus } from './controllers/claimController';

const app = express();

app.use(express.json());

// Auth Routes
app.post('/api/auth/register', register);
app.post('/api/auth/login', login);

// Booking Routes
app.get('/api/bookings/:pnr', getBooking);
app.put('/api/bookings/:pnr/rebook', rebookFlight);

// Baggage Claim Routes
app.post('/api/claims', submitClaim);
app.get('/api/claims/:claimId', getClaimStatus);

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});