import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Auth from './components/Auth';
import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard';
import Trainers from './components/Trainers';
import PlanGenerator from './components/PlanGenerator';
import Tracker from './components/Tracker';
import Discover from './components/Discover';
import Community from './components/Community';
import { LogOut, Activity } from 'lucide-react';
import { Toaster } from 'react-hot-toast';
import { AnimatePresence, motion } from 'framer-motion';

const PageWrapper = ({ children }) => (
  <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.35 }}>
    {children}
  </motion.div>
);

const AnimatedRoutes = () => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<HomeRoute />} />
        <Route path="/auth" element={<PageWrapper><Auth /></PageWrapper>} />
        <Route path="/trainers" element={<ProtectedRoute><PageWrapper><Trainers /></PageWrapper></ProtectedRoute>} />
        <Route path="/plans" element={<ProtectedRoute><PageWrapper><PlanGenerator /></PageWrapper></ProtectedRoute>} />
        <Route path="/tracker" element={<ProtectedRoute><PageWrapper><Tracker /></PageWrapper></ProtectedRoute>} />
        <Route path="/discover" element={<ProtectedRoute><PageWrapper><Discover /></PageWrapper></ProtectedRoute>} />
        <Route path="/community" element={<ProtectedRoute><PageWrapper><Community /></PageWrapper></ProtectedRoute>} />
      </Routes>
    </AnimatePresence>
  );
};

const HomeRoute = () => {
  const { user } = useAuth();
  return user ? (
    <ProtectedRoute>
      <PageWrapper>
        <Dashboard />
      </PageWrapper>
    </ProtectedRoute>
  ) : (
    <PageWrapper>
      <LandingPage />
    </PageWrapper>
  );
};

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/auth" />;
  return (
    <>
      <nav className="nav-bar">
        <div className="brand" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Activity size={24} color="#38bdf8" />
          FitLife
        </div>
        <div className="nav-links">
          <Link to="/" className="nav-link">Dashboard</Link>
          <Link to="/discover" className="nav-link">Discover</Link>
          <Link to="/community" className="nav-link">Community</Link>
          <Link to="/trainers" className="nav-link">Trainers</Link>
          <Link to="/plans" className="nav-link">Plans</Link>
          <Link to="/tracker" className="nav-link">Tracker</Link>
          <LogoutButton />
        </div>
      </nav>
      <main className="main-layout">
        {children}
      </main>
    </>
  );
};

const LogoutButton = () => {
  const { logout } = useAuth();
  return (
    <button 
      onClick={logout} 
      className="nav-link" 
      style={{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}
    >
      <LogOut size={18} /> Logout
    </button>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster position="top-right" toastOptions={{ style: { background: '#1e293b', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' } }} />
        <AnimatedRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
