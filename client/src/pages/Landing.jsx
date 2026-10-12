import { Link } from 'react-router-dom';
import PlantWindow from '../components/PlantWindow.jsx';

// demo plants just for the landing page
const demo = [
  { id: 1, emoji: '🪴', label: 'Monstera · 94% sure!' },
  { id: 2, emoji: '🌵', label: 'Cactus · water monthly' },
  { id: 3, emoji: '🌱', label: 'Seedling · day 12' },
];

function Landing() {
  return (
    <div className="hero">
      <div>
        <h1>Who's that plant?</h1>
        <p className="lede">
          Snap a photo. We'll tell you its name, what it drinks, and when it's feeling off.
          Check in at sunrise or after dark.
        </p>
        <Link to="/add" className="btn">Snap a leaf</Link>
      </div>
      <PlantWindow items={demo} />
    </div>
  );
}

export default Landing;
