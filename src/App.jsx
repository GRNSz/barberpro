import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';
import ProtectedRoute from './components/ProtectedRoute';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';

// Public pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';

// Client pages
import ClientDashboard from './pages/client/ClientDashboard';
import ExploreBarbershops from './pages/client/ExploreBarbershops';
import BarbershopDetail from './pages/client/BarbershopDetail';
import BookAppointment from './pages/client/BookAppointment';
import MyAppointments from './pages/client/MyAppointments';
import ClientChat from './pages/client/ClientChat';
import EditProfile from './pages/client/EditProfile';
import Blog from './pages/client/Blog';
import AdminDashboard from './pages/AdminDashboard';

// Barber pages
import BarberDashboard from './pages/barber/BarberDashboard';
import ManageSchedule from './pages/barber/ManageSchedule';
import ManageServices from './pages/barber/ManageServices';
import ClientDetails from './pages/barber/ClientDetails';
import BarberChat from './pages/barber/BarberChat';
import AIAssistant from './pages/barber/AIAssistant';

function AppLayout({ children, title }) {
  return (
    <div className="app-layout with-sidebar">
      <Sidebar />
      <div className="main-content">
        <Navbar title={title} />
        {children}
      </div>
    </div>
  );
}

function AuthenticatedRedirect() {
  const { isAuthenticated, userType } = useAuth();
  if (isAuthenticated) {
    if (userType === 'barber') return <Navigate to="/barbeiro" replace />;
    if (userType === 'admin') return <Navigate to="/admin" replace />;
    return <Navigate to="/cliente" replace />;
  }
  return <Landing />;
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <DataProvider>
          <BrowserRouter>
            <Routes>
              {/* Public */}
              <Route path="/" element={<AuthenticatedRedirect />} />
              <Route path="/login" element={<Login />} />
              <Route path="/registro" element={<Register />} />

              {/* Client Routes */}
              <Route
                path="/cliente"
                element={
                  <ProtectedRoute requiredType="client">
                    <AppLayout title="Início">
                      <ClientDashboard />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/cliente/explorar"
                element={
                  <ProtectedRoute requiredType="client">
                    <AppLayout title="Explorar Barbearias">
                      <ExploreBarbershops />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/cliente/barbearia/:id"
                element={
                  <ProtectedRoute requiredType="client">
                    <AppLayout title="Barbearia">
                      <BarbershopDetail />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/cliente/agendar"
                element={
                  <ProtectedRoute requiredType="client">
                    <AppLayout title="Agendar Corte">
                      <BookAppointment />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/cliente/agendamentos"
                element={
                  <ProtectedRoute requiredType="client">
                    <AppLayout title="Meus Agendamentos">
                      <MyAppointments />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/cliente/chat"
                element={
                  <ProtectedRoute requiredType="client">
                    <AppLayout title="Chat">
                      <ClientChat />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/cliente/perfil"
                element={
                  <ProtectedRoute requiredType="client">
                    <AppLayout title="Meu Perfil">
                      <EditProfile />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/cliente/blog"
                element={
                  <ProtectedRoute requiredType="client">
                    <AppLayout title="Blog de Cuidados">
                      <Blog />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />

              {/* Barber Routes */}
              <Route
                path="/barbeiro"
                element={
                  <ProtectedRoute requiredType="barber">
                    <AppLayout title="Dashboard">
                      <BarberDashboard />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/barbeiro/agenda"
                element={
                  <ProtectedRoute requiredType="barber">
                    <AppLayout title="Agenda">
                      <ManageSchedule />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/barbeiro/servicos"
                element={
                  <ProtectedRoute requiredType="barber">
                    <AppLayout title="Serviços">
                      <ManageServices />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/barbeiro/clientes"
                element={
                  <ProtectedRoute requiredType="barber">
                    <AppLayout title="Clientes">
                      <ClientDetails />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/barbeiro/chat"
                element={
                  <ProtectedRoute requiredType="barber">
                    <AppLayout title="Chat">
                      <BarberChat />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/barbeiro/assistente"
                element={
                  <ProtectedRoute requiredType="barber">
                    <AppLayout title="Assistente IA">
                      <AIAssistant />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/barbeiro/perfil"
                element={
                  <ProtectedRoute requiredType="barber">
                    <AppLayout title="Meu Perfil">
                      <EditProfile />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />

              {/* Admin Routes */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute requiredType="admin">
                    <AppLayout title="Painel Master">
                      <AdminDashboard />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </DataProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
