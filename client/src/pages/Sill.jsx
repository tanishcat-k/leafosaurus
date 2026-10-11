import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api.js';
import PlantWindow from '../components/PlantWindow.jsx';
import { daysUntilWater } from '../utils/helpers.js';

function Sill() {
  const [plants, setPlants] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadPlants = () => {
    api
      .get('/plants')
      .then((res) => setPlants(res.data))
      .catch((err) => console.log(err))
      .finally(() => setLoading(false));
  };

  useEffect(loadPlants, []);

  const handleWater = async (plant) => {
    if (daysUntilWater(plant.nextWatering) > 0) {
      if (!window.confirm(`${plant.nickname} isn't due for water yet. Water it anyway?`)) return;
    }
    try {
      await api.post(`/plants/${plant._id}/water`);
      loadPlants();
    } catch (err) {
      console.log(err.response?.data?.message);   // e.g. already watered a moment ago
    }
  };

  if (loading) return <p>Loading your sill...</p>;

  if (plants.length === 0) {
    return (
      <div className="card empty">
        <h2>Your sill is empty</h2>
        <p>Put your first plant here.</p>
        <Link to="/add" className="btn">Add a plant</Link>
      </div>
    );
  }

  // the window only has space for 3 plants
  const windowItems = plants.slice(0, 3).map((p) => ({
    id: p._id,
    emoji: p.species?.emoji || '🪴',
    photo: p.photo,
    label: p.nickname,
  }));

  return (
    <div>
      <div className="sill-top">
        <PlantWindow items={windowItems} />
      </div>

      <h2>My plants</h2>
      <div className="grid">
        {plants.map((p) => {
          const days = daysUntilWater(p.nextWatering);
          return (
            <div className="card" key={p._id}>
              <h3>{p.nickname}</h3>
              <p className="small">{p.species ? p.species.commonName : 'Unknown species'}</p>

              <p className={days <= 0 ? 'thirsty' : 'ok'}>
                {days <= 0 ? 'Thirsty! Needs water' : `Water in ${days} day${days === 1 ? '' : 's'}`}
              </p>

              <div className="row">
              <button className="btn small-btn" onClick={() => handleWater(p)}>Water</button>
                <Link to={`/plant/${p._id}`} className="link-btn">Open</Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Sill;
