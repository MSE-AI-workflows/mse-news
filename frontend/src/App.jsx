import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import MyNewsPage from './pages/MyNewsPage';
import AllNewsPage from './pages/AllNewsPage';
import Navbar from './components/Navbar';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) {
    return <div className='min-h-screen flex items-center justify-center'>Loading...</div>;
  }
  return user ? children : <Navigate to="/login" />;
}

function AppContent() {
  const { user } = useAuth();
  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <Routes>
          <Route path="/login" element={!user ? <LoginPage /> : <Navigate to="/dashboard/my-news" />} />
          <Route
            path="/dashboard/my-news"
            element={
              <ProtectedRoute>
                <Navbar />
                <MyNewsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/all-news"
            element={
              <ProtectedRoute>
                <Navbar />
                <AllNewsPage />
              </ProtectedRoute>
            }
          />
          <Route path="/auth/callback" element={<Navigate to="/dashboard/my-news" />} />
          <Route path="/" element={<Navigate to="/dashboard/my-news" />} />
        </Routes>
      </div>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;