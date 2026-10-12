import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import plantRoutes from './routes/plantRoutes.js';
import speciesRoutes from './routes/speciesRoutes.js';
import identifyRoutes from './routes/identifyRoutes.js';
import { startReminderJob } from './jobs/reminders.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

// make sure uploads folder exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(uploadDir));

app.use('/api/auth', authRoutes);
app.use('/api/plants', plantRoutes);
app.use('/api/species', speciesRoutes);
app.use('/api/identify', identifyRoutes);

app.get('/', (req, res) => res.send('Leafosaurus API is running'));

// error handler (keep this last)
app.use((err, req, res, next) => {
  console.log(err.message);
  res.status(err.status || 500).json({ message: err.message || 'Something went wrong' });
});

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  startReminderJob();
});
