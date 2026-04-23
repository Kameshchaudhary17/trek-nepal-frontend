import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Pricing from './pages/Pricing';
import AdminDashboard from './pages/AdminDashboard';
import GuideListing from './pages/GuideListing';
import Dashboard from './pages/Dashboard';
import GuideDashboard from './pages/GuideDashboard';
import Conditions from './pages/Conditions';
import Treks from './pages/Treks';
import GuideProfile from './pages/GuideProfile';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/admin/pricing" element={<AdminDashboard />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/guides" element={<GuideListing />} />
        <Route path="/guides/:id" element={<GuideProfile />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/guide/dashboard" element={<GuideDashboard />} />
        <Route path="/conditions" element={<Conditions />} />
        <Route path="/treks" element={<Treks />} />
      </Routes>
    </Router>
  );
}

export default App;
