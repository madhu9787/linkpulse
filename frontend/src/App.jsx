import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Analytics from './pages/Analytics';
import PublicStats from './pages/PublicStats';
import Chatbot from './components/Chatbot';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="spinner spinner-md" />
      </div>
    );
  }
  return user ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="relative z-[1]">
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/stats/:shortCode" element={<PublicStats />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/analytics/:id"
              element={
                <ProtectedRoute>
                  <Analytics />
                </ProtectedRoute>
              }
            />
          </Routes>
          <Chatbot />
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: '#111420',
                color: '#e2e8f0',
                border: '1px solid rgba(255,255,255,0.10)',
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: '0.875rem',
                borderRadius: '12px',
                boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
              },
              success: { iconTheme: { primary: '#10b981', secondary: '#111420' } },
              error:   { iconTheme: { primary: '#ef4444', secondary: '#111420' } },
            }}
          />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
