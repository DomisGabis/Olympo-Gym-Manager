import { createBrowserRouter, RouterProvider } from "react-router-dom"
import RootLayout from "./layouts/RootLayout/RootLayout"
import AuthLayout from "./layouts/AuthLayout"
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";

const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      { path: "/", element: <h2>Home</h2> },
      { path: "admin", element: (
    <ProtectedRoute allowedRoles={['ADMIN']}>
      {/* <AdminDashboard /> */<h2>Admin Panel</h2>}
    </ProtectedRoute>
  ) },
    ],
  },
  {
    element: <AuthLayout />,
    children: [
      { path: "login", element: <Login /> },
      { path: "register", element: <h2>Register</h2> },
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
