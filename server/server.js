import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import plantRoutes from './routes/plantRoutes.js';
import speciesRoutes from './routes/speciesRoutes.js';
import identifyRoutes from './routes/identifyRoutes.js';
import { startReminderJob } from './jobs/reminders.js';

const app = express();

// render (and most hosts) put a proxy in front of our server,
// this makes the rate limiter see the real user IP
app.set('trust proxy', 1);

// only our own frontend is allowed to call this api
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));
app.use(express.json());

// limit login attempts (stops password guessing)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many attempts, please try again in a few minutes' },
});

// limit the routes that use up our api quotas (plantnet, perenual)
const quotaLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'You have used too many identifications this hour, please try later' },
});

app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/plants', plantRoutes);
app.use('/api/species/lookup', quotaLimiter);   // runs first for this path, then the species router
app.use('/api/species', speciesRoutes);
app.use('/api/identify', quotaLimiter, identifyRoutes);

app.get('/', (req, res) => res.send('Leafosaurus API is running'));

// error handler (keep this last)
app.use((err, req, res, next) => {
  console.log(err.message);
  res.status(err.status || 500).json({ message: err.message || 'Something went wrong' });
});

const PORT = process.env.PORT || 5001;

connectDB().then(() => {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  startReminderJob();
});