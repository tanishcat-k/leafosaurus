import { useState } from 'react';

// the window scene. items = [{ id, emoji, photo, label }]
function PlantWindow({ items }) {
  const [open, setOpen] = useState(items[0]?.id);

  return (
    <div className="win" aria-label="A window with plants on the sill">
      <div className="orb"></div>
      <div className="plants">
        {items.map((item) => (
          <button
            key={item.id}
            className="pl"
            aria-pressed={open === item.id}
            onClick={() => setOpen(open === item.id ? null : item.id)}
          >
            {open === item.id && <span className="st">{item.label}</span>}
            {item.photo ? <img src={item.photo} alt={item.label} /> : item.emoji}
          </button>
        ))}
      </div>
      <div className="sill"></div>
    </div>
  );
}

export default PlantWindow;
