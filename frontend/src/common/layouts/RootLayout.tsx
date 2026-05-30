import { Outlet, useNavigate } from "react-router-dom"
import Navbar from "../components/Navbar"
import Footer from "../components/Footer"
import { useAuth } from '../../context/AuthContext';

function RootLayout() {
  const { user, logout, isLoading } = useAuth();
  const navigate = useNavigate();

  if (isLoading) return <div>Ładowanie aplikacji...</div>;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="app-layout" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar role={user?.role || null} />
      <main>
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}

export default RootLayout