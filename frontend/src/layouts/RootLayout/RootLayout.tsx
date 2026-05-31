import { Outlet } from "react-router-dom"
import Navbar from "./Navbar"
import Footer from "./Footer"
import { useAuth } from '../../context/AuthContext';

function RootLayout() {
  const { user, isLoading } = useAuth();

  if (isLoading) return <div>Ładowanie aplikacji...</div>;

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