import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Navbar from './components/layout/Navbar';
import Preloader from './components/layout/Preloader';
import MobileNav from './components/layout/MobileNav';
import ErrorBoundary from './components/layout/ErrorBoundary';
import DynamicIsland from './components/motion/DynamicIsland';
import MoodEngine from './components/ai/MoodEngine';
import './index.css';

// Lazy pages
const Landing     = lazy(() => import('./pages/Landing'));
const Login       = lazy(() => import('./pages/Login'));
const Register    = lazy(() => import('./pages/Register'));
const Explore     = lazy(() => import('./pages/Explore'));
const MovieDetail = lazy(() => import('./pages/MovieDetail'));
const Schedule    = lazy(() => import('./pages/Schedule'));
const Spaces      = lazy(() => import('./pages/Spaces'));
const Collections = lazy(() => import('./pages/Collections'));
const Profile     = lazy(() => import('./pages/Profile'));
const PersonDetail = lazy(() => import('./pages/PersonDetail'));
const AdminDash   = lazy(() => import('./pages/admin/Dashboard'));
const NotFound    = lazy(() => import('./pages/NotFound'));
const AITools     = lazy(() => import('./pages/AITools'));
const SeasonDetail = lazy(() => import('./pages/SeasonDetail'));

const Fallback = () => (
  <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
    <div style={{ textAlign: 'center' }}>
      <div className="skel" style={{ width: 60, height: 60, borderRadius: '50%', margin: '0 auto 1rem' }} />
      <p className="t-mono">Loading...</p>
    </div>
  </div>
);

const Protected = ({ children }) => {
  const { isAuth, loading } = useAuth();
  if (loading) return <Fallback />;
  return isAuth ? children : <Navigate to="/login" replace />;
};

const AdminOnly = ({ children }) => {
  const { user, isAuth, loading } = useAuth();
  if (loading) return <Fallback />;
  if (!isAuth) return <Navigate to="/login" replace />;
  if (user?.role !== 'admin') return <Navigate to="/explore" replace />;
  return children;
};

function AppRoutes() {
  const { isAuth, loading } = useAuth();
  if (loading) return <Preloader />;

  return (
    <>
      <DynamicIsland />
      <Navbar />
      <MobileNav />
      {isAuth && <MoodEngine />}

      <Suspense fallback={<Fallback />}>
        <Routes>
          <Route path="/"              element={isAuth ? <Navigate to="/explore" replace /> : <Landing />} />
          <Route path="/login"         element={isAuth ? <Navigate to="/explore" replace /> : <Login />} />
          <Route path="/register"      element={isAuth ? <Navigate to="/explore" replace /> : <Register />} />
          <Route path="/explore"       element={<Protected><Explore /></Protected>} />
          <Route path="/movie/:id"     element={<MovieDetail />} />
          <Route path="/tv/:id/season/:seasonNumber" element={<SeasonDetail />} />
          <Route path="/person/:id"    element={<PersonDetail />} />
          <Route path="/schedule"      element={<Protected><Schedule /></Protected>} />
          <Route path="/spaces"        element={<Protected><Spaces /></Protected>} />
          <Route path="/collections"   element={<Protected><Collections /></Protected>} />
          <Route path="/profile/:id"   element={<Protected><Profile /></Protected>} />
          <Route path="/ai"             element={<Protected><AITools /></Protected>} />
          <Route path="/admin"         element={<AdminOnly><AdminDash /></AdminOnly>} />
          <Route path="*"              element={<NotFound />} />
        </Routes>
      </Suspense>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ErrorBoundary>
          <AppRoutes />
        </ErrorBoundary>
      </AuthProvider>
    </BrowserRouter>
  );
}
