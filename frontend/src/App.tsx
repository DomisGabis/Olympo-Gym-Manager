import { createBrowserRouter, RouterProvider } from "react-router-dom"
import RootLayout from "./layouts/RootLayout/RootLayout"
import AuthLayout from "./layouts/AuthLayout"
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import LoginPage from "./pages/LoginPage/LoginPage";
import HomePage from "./pages/HomePage/HomePage";
import RegisterPage from "./pages/RegisterPage/RegisterPage";
import ProfilePage from "./pages/ProfilePage/ProfilePage";

const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      {
        path: "/", element: (
          <HomePage />
        )
      },
      {
        path: "admin", element: (
          <ProtectedRoute allowedRoles={['ADMIN']}>
            {/* <AdminDashboard /> */<h2>Admin Panel</h2>}
          </ProtectedRoute>
        )
      },
      {
        path: "profile", element: (
          <ProtectedRoute allowedRoles={['ADMIN', 'TRAINER', 'CLIENT', 'RECEPTIONIST']}>
            {<ProfilePage />}
          </ProtectedRoute>
        )
      },
    ],
  },
  {
    element: <AuthLayout />,
    children: [
      { path: "login", element: <LoginPage /> },
      { path: "register", element: <RegisterPage /> },
    ],
  },
])

function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}

export default App
