// how many days until the plant needs water (negative = overdue)
export const daysUntilWater = (nextWatering) => {
  const diff = new Date(nextWatering) - new Date();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

export const formatDate = (date) =>
  new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });

export const errorText = (err) =>
  err.response?.data?.message || 'Something went wrong, please try again';

// symptoms for the check-in form (same names as in server/seed.js)
export const SYMPTOMS = ['Yellow leaves', 'Brown tips', 'Drooping', 'Spots on leaves', 'Leggy growth', 'Pests'];
