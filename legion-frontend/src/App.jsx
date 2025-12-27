import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import AcceptInvite from './pages/AcceptInvite';
import WorkspaceSelect from './pages/WorkspaceSelect';
import CreateWorkspace from './pages/CreateWorkspace';
import MainLayout from './components/layout/MainLayout';
import Dashboard from './pages/Dashboard';
import Board from './pages/Board';
import Tasks from './pages/Tasks';
import Team from './pages/Team';
import useAuthStore from './store/authStore';
import Settings from './pages/Settings';
import Reports from './pages/Reports';
import Profile from './pages/Profile';
import Bleach from './pages/Bleach';




// Protected Route wrapper
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return isAuthenticated ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Invitation Routes */}
        <Route path="/invite/accept/:token?" element={<AcceptInvite />} />

        {/* Workspace Selection */}
        <Route
          path="/workspaces"
          element={
            <ProtectedRoute>
              <WorkspaceSelect />
            </ProtectedRoute>
          }
        />
        <Route
          path="/workspace/create"
          element={
            <ProtectedRoute>
              <CreateWorkspace />
            </ProtectedRoute>
          }
        />

        {/* Main App */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="board" element={<Board />} />
          <Route path="tasks" element={<Tasks />} />
          <Route path="team" element={<Team />} />
          <Route path="settings" element={<Settings />} />
          <Route path="reports" element={<Reports />} />
          <Route path="profile" element={<Profile />} />
          <Route path="bleach" element={<Bleach />} />

        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;