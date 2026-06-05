import { createBrowserRouter, RouterProvider } from "react-router-dom"
import RootLayout from "./layouts/RootLayout/RootLayout"
import AuthLayout from "./layouts/AuthLayout"
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import LoginPage from "./pages/LoginPage/LoginPage";
import HomePage from "./pages/HomePage/HomePage";
import RegisterPage from "./pages/RegisterPage/RegisterPage";
import ProfilePage from "./pages/ProfilePage/ProfilePage";
import TrainingPlansPage from "./pages/TrainingPlansPage/TrainingPlansPage";
import ManageUsersPage from "./pages/Admin/ManageUsersPage";
import ExerciseDatabasePage from "./pages/ExerciseDatabasePage/ExerciseDatabasePage";

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
        path: "manage-users", element: (
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <ManageUsersPage />
          </ProtectedRoute>
        )
      },
      {
        path: "manage-offer", element: (
          <ProtectedRoute allowedRoles={['ADMIN']}>
            {/* <ManageOfferPage /> */ <h1>Panel zarządzania ofertą</h1>}
          </ProtectedRoute>
        )
      },
      {
        path: "exercises", element: (
          <ProtectedRoute allowedRoles={['ADMIN', 'TRAINER']}>
            <ExerciseDatabasePage />
          </ProtectedRoute>
        )
      },
      {
        path: "training-plans", element: (
          <ProtectedRoute allowedRoles={['CLIENT']}>
            <TrainingPlansPage />
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
