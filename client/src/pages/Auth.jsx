import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { errorText } from '../utils/helpers.js';

// one page used for both login and signup
function Auth({ mode }) {
  const isSignup = mode === 'signup';
  const { login, signup } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      if (isSignup) await signup(form.name, form.email, form.password);
      else await login(form.email, form.password);
      navigate('/sill');
    } catch (err) {
      setError(errorText(err));
    }
    setBusy(false);
  };

  return (
    <form className="card form" onSubmit={handleSubmit}>
      <h2>{isSignup ? 'Join the jungle' : 'Welcome back'}</h2>

      {isSignup && (
        <input name="name" placeholder="Your name" value={form.name} onChange={handleChange} required />
      )}
      <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} required />
      <input name="password" type="password" placeholder="Password (min 6 characters)" value={form.password} onChange={handleChange} required />

      {error && <p className="error">{error}</p>}

      <button className="btn" disabled={busy}>{busy ? 'Please wait...' : isSignup ? 'Sign up' : 'Log in'}</button>

      <p>
        {isSignup ? 'Already have an account? ' : 'New here? '}
        <Link to={isSignup ? '/login' : '/signup'}>{isSignup ? 'Log in' : 'Sign up'}</Link>
      </p>
    </form>
  );
}

export default Auth;
