import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

// first visit: night after 7pm, day otherwise
const getStartMode = () => {
  const saved = localStorage.getItem('mode');
  if (saved) return saved;
  const hour = new Date().getHours();
  return hour >= 19 || hour < 6 ? 'night' : 'day';
};

export function ThemeProvider({ children }) {
  const [mode, setMode] = useState(getStartMode);

  useEffect(() => {
    document.documentElement.dataset.mode = mode;
    localStorage.setItem('mode', mode);
  }, [mode]);

  const toggleMode = () => setMode(mode === 'day' ? 'night' : 'day');

  return <ThemeContext.Provider value={{ mode, toggleMode }}>{children}</ThemeContext.Provider>;
}
