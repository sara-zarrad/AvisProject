import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

// Layout
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import ProtectedRoute from './components/common/ProtectedRoute';

// Public Pages
import Accueil from './pages/public/Accueil';
import Centres from './pages/public/Centres';
import CentreDetail from './pages/public/CentreDetail';
import SeanceDetail from './pages/public/SeanceDetail';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Membre Pages
import MesAvis from './pages/membre/MesAvis';

// Admin Pages
import Dashboard from './pages/admin/Dashboard';
import GestionCentres from './pages/admin/GestionCentres';
import GestionSeances from './pages/admin/GestionSeances';
import GestionCoaches from './pages/admin/GestionCoaches';

// 404
import NotFound from './pages/NotFound';

import './App.css';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <Navbar />
          
          <main style={{ flex: '1 0 auto' }}>
            <Routes>
              {/* Routes Publiques */}
              <Route path="/" element={<Accueil />} />
              <Route path="/centres" element={<Centres />} />
              <Route path="/centres/:id" element={<CentreDetail />} />
              <Route path="/seances/:id" element={<SeanceDetail />} />

              {/* Routes Authentification */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Routes Membre (Connecté) */}
              <Route
                path="/mes-avis"
                element={
                  <ProtectedRoute>
                    <MesAvis />
                  </ProtectedRoute>
                }
              />

              {/* Routes Administrateur */}
              <Route
                path="/admin"
                element={<Navigate to="/admin/dashboard" replace />}
              />
              <Route
                path="/admin/dashboard"
                element={
                  <ProtectedRoute requiredRole="ADMINISTRATEUR">
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/centres"
                element={
                  <ProtectedRoute requiredRole="ADMINISTRATEUR">
                    <GestionCentres />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/seances"
                element={
                  <ProtectedRoute requiredRole="ADMINISTRATEUR">
                    <GestionSeances />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/coaches"
                element={
                  <ProtectedRoute requiredRole="ADMINISTRATEUR">
                    <GestionCoaches />
                  </ProtectedRoute>
                }
              />

              {/* 404 Route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>

          <Footer />
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
