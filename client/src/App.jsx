import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Landing from './pages/Landing.jsx';
import Auth from './pages/Auth.jsx';
import Sill from './pages/Sill.jsx';
import AddPlant from './pages/AddPlant.jsx';
import PlantDetail from './pages/PlantDetail.jsx';

function App() {
  return (
    <div className="container">
      <Navbar />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Auth mode="login" />} />
        <Route path="/signup" element={<Auth mode="signup" />} />
        <Route path="/sill" element={<ProtectedRoute><Sill /></ProtectedRoute>} />
        <Route path="/add" element={<ProtectedRoute><AddPlant /></ProtectedRoute>} />
        <Route path="/plant/:id" element={<ProtectedRoute><PlantDetail /></ProtectedRoute>} />
        <Route path="*" element={<p>Page not found</p>} />
      </Routes>
    </div>
  );
}

export default App;
