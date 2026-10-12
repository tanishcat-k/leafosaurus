import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api.js';
import Diary from '../components/Diary.jsx';
import CheckInForm from '../components/CheckInForm.jsx';
import { daysUntilWater, errorText } from '../utils/helpers.js';

function PlantDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [plant, setPlant] = useState(null);
  const [logs, setLogs] = useState([]);
  const [checkins, setCheckins] = useState([]);
  const [error, setError] = useState('');
  const [note, setNote] = useState('');

  // rename
  const [editing, setEditing] = useState(false);
  const [newName, setNewName] = useState('');

  const loadPlant = () => {
    api
      .get(`/plants/${id}`)
      .then((res) => {
        setPlant(res.data.plant);
        setLogs(res.data.logs);
        setCheckins(res.data.checkins);
      })
      .catch((err) => setError(errorText(err)));
  };

  useEffect(loadPlant, [id]);

  const startEditing = () => {
    setNewName(plant.nickname);   // start with the current name
    setError('');
    setEditing(true);
  };

  const handleRename = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;

    try {
      await api.patch(`/plants/${id}`, { nickname: newName });
      setEditing(false);
      loadPlant();
    } catch (err) {
      setError(errorText(err));
    }
  };

  const handleWater = async () => {
    await api.post(`/plants/${id}/water`);
    loadPlant();
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!note.trim()) return;
    await api.post(`/plants/${id}/logs`, { note });
    setNote('');
    loadPlant();
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this plant and its diary?')) return;
    await api.delete(`/plants/${id}`);
    navigate('/sill');
  };

  if (error && !plant) return <p className="error">{error}</p>;
  if (!plant) return <p>Loading...</p>;

  const days = daysUntilWater(plant.nextWatering);
  const species = plant.species;

  return (
    <div>
      <div className="detail-top">
        {plant.photo ? (
          <img className="big-photo" src={plant.photo} alt={plant.nickname} />
        ) : (
          <div className="big-photo emoji">{species?.emoji || '🪴'}</div>
        )}
        <div>
          {editing ? (
            <form className="row" onSubmit={handleRename}>
              <input value={newName} onChange={(e) => setNewName(e.target.value)} autoFocus />
              <button className="btn small-btn">Save</button>
              <button type="button" className="link-btn" onClick={() => setEditing(false)}>Cancel</button>
            </form>
          ) : (
            <>
              <h1 className="small-h1">{plant.nickname}</h1>
              <button className="link-btn" onClick={startEditing}>Rename</button>
            </>
          )}
          {error && <p className="error">{error}</p>}

          <p>{species ? `${species.commonName} (${species.scientificName})` : 'Unknown species'}</p>
          <p className={days <= 0 ? 'thirsty' : 'ok'}>
            {days <= 0 ? 'Thirsty! Needs water' : `Water in ${days} day${days === 1 ? '' : 's'}`}
          </p>
          <button className="btn small-btn" onClick={handleWater}>Water now</button>
        </div>
      </div>

      {species && (
        <div className="info">
          <div className="card"><b>Water</b><span>Every {plant.wateringDays} days</span></div>
          <div className="card"><b>Light</b><span>{species.light}</span></div>
          <div className="card"><b>Tip</b><span>{species.tips}</span></div>
        </div>
      )}

      <h2>Health check-in</h2>
      <CheckInForm plantId={id} onSaved={loadPlant} />

      <h2>The sill diary</h2>
      <form className="row" onSubmit={handleAddNote}>
        <input placeholder="Write a note (new leaf, repotted...)" value={note} onChange={(e) => setNote(e.target.value)} />
        <button className="btn small-btn">Add</button>
      </form>

      <Diary logs={logs} checkins={checkins} />

      <button className="link-btn danger" onClick={handleDelete}>Delete this plant</button>
    </div>
  );
}

export default PlantDetail;