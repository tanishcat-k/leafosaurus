import cron from 'node-cron';
import Plant from '../models/Plant.js';

// runs every day at 8 AM and prints plants that are overdue for water
// TODO: send an email instead of just logging
export const startReminderJob = () => {
  cron.schedule('0 8 * * *', async () => {
    const plants = await Plant.find().populate('user', 'name email');
    const now = new Date();

    plants.forEach((p) => {
      if (p.nextWatering <= now && p.user) {
        console.log(`Reminder: ${p.user.name}'s plant "${p.nickname}" needs water`);
      }
    });
  });
  console.log('Reminder job scheduled');
};
