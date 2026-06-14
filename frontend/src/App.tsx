import { createBrowserRouter, RouterProvider } from "react-router-dom"
import RootLayout from "./layouts/RootLayout/RootLayout"
import AuthLayout from "./layouts/AuthLayout"
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import LoginPage from "./pages/Auth/LoginPage/LoginPage";
import HomePage from "./pages/Common/HomePage/HomePage";
import RegisterPage from "./pages/Auth/RegisterPage/RegisterPage";
import ProfilePage from "./pages/Common/ProfilePage/ProfilePage";
import TrainingPlansPage from "./pages/Client/TrainingPlansPage/TrainingPlansPage";
import ManageUsersPage from "./pages/Admin/ManageUsersPage";
import ExerciseDatabasePage from "./pages/Common/ExerciseDatabasePage/ExerciseDatabasePage";
import TrainersPage from "./pages/Client/TrainersPage/TrainersPage";
import TrainerProfilePage from "./pages/Client/TrainerProfilePage/TrainerProfilePage";
import TrainerDashboardPage from "./pages/Trainer/TrainerDashboardPage/TrainerDashboardPage";
import CalendarPage from "./pages/Common/CalendarPage/CalendarPage";
import MembershipsPage from "./pages/Receptionist/MembershipsPage/MembershipsPage";
import ClientProfilePage from "./pages/Trainer/ClientProfilePage/ClientProfilePage";
import TrainingPlanDetailsPage from "./pages/Client/TrainingPlanDetailsPage/TrainingPlanDetailsPage";
import CheckInPage from "./pages/Receptionist/CheckInPage/CheckInPage";

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
        path: "training-plans/:id", element: (
          <ProtectedRoute allowedRoles={['CLIENT']}>
            <TrainingPlanDetailsPage />
          </ProtectedRoute>
        )
      },
      {
        path: "trainers", element: (
          <ProtectedRoute allowedRoles={['CLIENT']}>
            <TrainersPage />
          </ProtectedRoute>
        )
      },
      {
        path: "trainer/:id", element: (
          <ProtectedRoute allowedRoles={['CLIENT']}>
            <TrainerProfilePage />
          </ProtectedRoute>
        )
      },
      {
        path: "client/:id", element: (
          <ProtectedRoute allowedRoles={['TRAINER']}>
            <ClientProfilePage />
          </ProtectedRoute>
        )
      },
      {
        path: "calendar", element: (
          <ProtectedRoute allowedRoles={['TRAINER', 'CLIENT']}>
            <CalendarPage />
          </ProtectedRoute>
        )
      },
      {
        path: "check-in", element: (
          <ProtectedRoute allowedRoles={['RECEPTIONIST']}>
            <CheckInPage />
          </ProtectedRoute>
        )
      },
      {
        path: "memberships", element: (
          <ProtectedRoute allowedRoles={['RECEPTIONIST']}>
            <MembershipsPage />
          </ProtectedRoute>
        )
      },
      {
        path: "trainer-dashboard", element: (
          <ProtectedRoute allowedRoles={['TRAINER']}>
            <TrainerDashboardPage />
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
