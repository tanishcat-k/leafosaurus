import { Link, useNavigate } from 'react-router-dom';
import Logo from './Logo.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';

function Navbar() {
  const { user, logout } = useAuth();
  const { mode, toggleMode } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <Link to="/" className="logo">
        <Logo />
        Leafosaurus
      </Link>

      <div className="nav-right">
        {user ? (
          <>
            <Link to="/sill">My sill</Link>
            <Link to="/add">+ Add plant</Link>
            <button className="tog" onClick={handleLogout}>Log out</button>
          </>
        ) : (
          <>
            <Link to="/login">Log in</Link>
            <Link to="/signup">Sign up</Link>
          </>
        )}
        <button className="tog" onClick={toggleMode}>
          {mode === 'day' ? 'Night' : 'Day'}
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
