import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { FilterProvider } from './context/FilterContext';
import LoginPage from './pages/LoginPage';
import MyNewsPage from './pages/MyNewsPage';
import AllNewsPage from './pages/AllNewsPage';
import ProfilePage from './pages/ProfilePage';
import Layout from './components/Layout';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-[#f2f2f2] font-sans text-ncsu-gray">Loading...</div>;
  }
  return user ? children : <Navigate to="/login" />;
}

function LayoutWrapper({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const onNavigate = (view) => {
    if (view === 'feed') navigate('/dashboard/all-news');
    if (view === 'post') navigate('/dashboard/my-news');
    if (view === 'profile') navigate('/dashboard/profile');
    }

 const getActiveView = () => {
  if (location.pathname === '/dashboard/all-news') return 'feed';
  if (location.pathname === '/dashboard/my-news') return 'post';
  if (location.pathname === '/dashboard/profile') return 'profile';
 } 
  return (
    <Layout user={user} onLogout={logout} onNavigate={onNavigate} activeView={getActiveView()}>
      {children}
    </Layout>
  )

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
                <LayoutWrapper>
                  <MyNewsPage />
                </LayoutWrapper>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/all-news"
            element={
              <ProtectedRoute>
                <FilterProvider>
                  <LayoutWrapper>
                    <AllNewsPage />
                  </LayoutWrapper>
                </FilterProvider>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/profile"
            element={
              <ProtectedRoute>
                <LayoutWrapper>
                  <ProfilePage />
                </LayoutWrapper>
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