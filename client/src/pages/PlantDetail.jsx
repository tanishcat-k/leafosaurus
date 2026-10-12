import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api.js';
import { daysUntilWater, formatDate, errorText, SYMPTOMS } from '../utils/helpers.js';

function PlantDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [plant, setPlant] = useState(null);
  const [logs, setLogs] = useState([]);
  const [checkins, setCheckins] = useState([]);
  const [error, setError] = useState('');

  // note form
  const [note, setNote] = useState('');

  // check-in form
  const [symptoms, setSymptoms] = useState([]);
  const [checkPhoto, setCheckPhoto] = useState(null);
  const [advice, setAdvice] = useState(null);

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

  const toggleSymptom = (s) => {
    if (symptoms.includes(s)) setSymptoms(symptoms.filter((x) => x !== s));
    else setSymptoms([...symptoms, s]);
  };

  const handleCheckIn = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append('symptoms', symptoms.join(','));
    if (checkPhoto) data.append('photo', checkPhoto);

    try {
      const res = await api.post(`/plants/${id}/checkins`, data);
      setAdvice(res.data);
      setSymptoms([]);
      setCheckPhoto(null);
      loadPlant();
    } catch (err) {
      setError(errorText(err));
    }
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

  // join logs and check-ins into one diary list, newest first
  const diary = [
    ...logs.map((l) => ({ ...l, kind: 'log' })),
    ...checkins.map((c) => ({ ...c, kind: 'checkin' })),
  ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return (
    <div>
      <div className="detail-top">
        {plant.photo ? <img className="big-photo" src={plant.photo} alt={plant.nickname} /> : <div className="big-photo emoji">{species?.emoji || '🪴'}</div>}
        <div>
          <h1 className="small-h1">{plant.nickname}</h1>
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
      <form className="card form" onSubmit={handleCheckIn}>
        <p className="small">Tick anything you notice (or none if it looks happy).</p>
        <div className="chips">
          {SYMPTOMS.map((s) => (
            <label key={s} className={symptoms.includes(s) ? 'chip on' : 'chip'}>
              <input type="checkbox" checked={symptoms.includes(s)} onChange={() => toggleSymptom(s)} hidden />
              {s}
            </label>
          ))}
        </div>
        <label className="upload">
          {checkPhoto ? checkPhoto.name : 'Add a photo'}
          <input type="file" accept="image/*" onChange={(e) => setCheckPhoto(e.target.files[0])} hidden />
        </label>
        <button className="btn small-btn">Save check-in</button>
      </form>

      {advice && (
        <div className="card">
          {advice.advice.length === 0 ? (
            <p>{advice.checkin.status === 'healthy' ? 'Looking healthy! Nice work.' : 'No known causes for these symptoms yet. Keep an eye on it.'}</p>
          ) : (
            advice.advice.map((a, i) => (
              <p key={i}><b>{a.symptom}:</b> {a.cause}. {a.fix}</p>
            ))
          )}
        </div>
      )}

      <h2>The sill diary</h2>
      <form className="row" onSubmit={handleAddNote}>
        <input placeholder="Write a note (new leaf, repotted...)" value={note} onChange={(e) => setNote(e.target.value)} />
        <button className="btn small-btn">Add</button>
      </form>

      <div className="diary">
        {diary.length === 0 && <p className="small">Nothing here yet.</p>}
        {diary.map((d) => (
          <div className="pola" key={d._id}>
            <div className="pic">
              {d.photo ? <img src={d.photo} alt="" /> : <span>{d.kind === 'checkin' ? '🩺' : d.type === 'water' ? '💧' : '📝'}</span>}
            </div>
            <p>
              {d.kind === 'checkin'
                ? d.symptoms.length > 0 ? d.symptoms.join(', ') : 'Looking healthy'
                : d.note || 'Photo'}
            </p>
            <em>{formatDate(d.createdAt)}</em>
          </div>
        ))}
      </div>

      <button className="link-btn danger" onClick={handleDelete}>Delete this plant</button>
    </div>
  );
}

export default PlantDetail;
