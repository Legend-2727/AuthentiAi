import { useEffect, useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { supabase } from './lib/supabase';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { initRevenueCat, getStarBalance, setStarBalance } from './lib/revenuecat';
import VeridicalBadge from './components/VeridicalBadge';
import MouseWaveEffect from './components/MouseWaveEffect';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';
import LoadingScreen from './components/LoadingScreen';
import ResetPassword from './pages/ResetPassword';

function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already authenticated and initialize RevenueCat
    const checkAuth = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        
        // Initialize RevenueCat with user ID if authenticated
        const userId = data.session?.user?.id || null;
        await initRevenueCat(userId);
        
        // Give new users some initial stars for testing (only if they have 0)
        if (userId && getStarBalance() === 0) {
          setStarBalance(50); // Give 50 stars to start with
          console.log('Welcome bonus: 50 stars added to your wallet!');
        }
        
      } catch (error) {
        console.error('Error checking auth session:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <ThemeProvider>
      <AuthProvider>
        <VeridicalBadge />
        <MouseWaveEffect />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route
            path="/dashboard/*"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;