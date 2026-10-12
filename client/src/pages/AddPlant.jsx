import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api.js';
import { errorText } from '../utils/helpers.js';

function AddPlant() {
  const navigate = useNavigate();

  const [tab, setTab] = useState('know');       // 'know' or 'unsure'
  const [search, setSearch] = useState('');
  const [results, setResults] = useState([]);   // species list from search
  const [matches, setMatches] = useState([]);   // results from photo identify
  const [identifying, setIdentifying] = useState(false);
  const [demoNote, setDemoNote] = useState(false);
  const [photo, setPhoto] = useState(null);
  const [species, setSpecies] = useState(null); // the chosen species
  const [nickname, setNickname] = useState('');
  const [error, setError] = useState('');

  // search the species list when the user types
  useEffect(() => {
    if (tab !== 'know') return;
    api.get('/species', { params: { q: search } }).then((res) => setResults(res.data));
  }, [search, tab]);

  const handleIdentify = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setPhoto(file);
    setMatches([]);
    setError('');
    setIdentifying(true);

    const data = new FormData();
    data.append('image', file);

    try {
      const res = await api.post('/identify', data);
      setMatches(res.data.matches);
      setDemoNote(!!res.data.demo);
      if (res.data.matches.length === 0) setError("Couldn't recognise this one. Try a clearer photo of a leaf or flower.");
    } catch (err) {
      setError(errorText(err));
    }
    setIdentifying(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');

    const data = new FormData();
    data.append('nickname', nickname);
    if (species) data.append('speciesId', species._id);
    if (photo) data.append('photo', photo);

    try {
      const res = await api.post('/plants', data);
      navigate(`/plant/${res.data._id}`);
    } catch (err) {
      setError(errorText(err));
    }
  };

  // step 2: name your plant
  if (species) {
    return (
      <form className="card form" onSubmit={handleSave}>
        <h2>Name your {species.commonName}</h2>
        <p className="small">Water every {species.wateringDays} days · {species.light}</p>

        <input placeholder="Nickname (e.g. Gerald)" value={nickname} onChange={(e) => setNickname(e.target.value)} required />

        <label className="upload">
          {photo ? `Photo: ${photo.name}` : 'Add a photo (optional)'}
          <input type="file" accept="image/*" onChange={(e) => setPhoto(e.target.files[0])} hidden />
        </label>

        {error && <p className="error">{error}</p>}

        <button className="btn">Put it on my sill</button>
        <button type="button" className="link-btn" onClick={() => setSpecies(null)}>Pick a different plant</button>
      </form>
    );
  }

  return (
    <div>
      <h2>Add a plant</h2>

      <div className="tabs">
        <button className={tab === 'know' ? 'tab on' : 'tab'} onClick={() => setTab('know')}>I know what it is</button>
        <button className={tab === 'unsure' ? 'tab on' : 'tab'} onClick={() => setTab('unsure')}>Not sure</button>
      </div>

      {tab === 'know' && (
        <div className="card">
          <input placeholder="Search e.g. money plant, tulsi..." value={search} onChange={(e) => setSearch(e.target.value)} />
          <div className="list">
            {results.map((s) => (
              <button key={s._id} className="list-item" onClick={() => setSpecies(s)}>
                <span>{s.emoji}</span> {s.commonName} <small>{s.scientificName}</small>
              </button>
            ))}
            {results.length === 0 && <p className="small">No match. Try the "Not sure" tab.</p>}
          </div>
        </div>
      )}

      {tab === 'unsure' && (
        <div className="card">
          <label className="upload">
            Take or choose a photo
            <input type="file" accept="image/*" capture="environment" onChange={handleIdentify} hidden />
          </label>

          {identifying && <p>Sniffing the leaves...</p>}
          {demoNote && <p className="small">Demo result (no Pl@ntNet API key set on the server)</p>}

          <div className="list">
            {matches.map((m, i) => (
              <button
                key={i}
                className="list-item"
                disabled={!m.species}
                onClick={() => setSpecies(m.species)}
              >
                <span className="sticker">{Math.round(m.score * 100)}% sure</span>
                {m.commonName} <small>{m.scientificName}</small>
                {!m.species && <small> (no care info yet)</small>}
              </button>
            ))}
          </div>
        </div>
      )}

      {error && <p className="error">{error}</p>}
    </div>
  );
}

export default AddPlant;
