import React from 'react';
import { Navigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname + location.search)}`} state={{ from: location }} replace />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    return (
      <div className="container" style={{ padding: '4rem 1.5rem', textAlign: 'center' }}>
        <div
          className="card-glass"
          style={{
            maxWidth: '550px',
            margin: '0 auto',
            padding: '3rem 2rem',
            borderColor: 'rgba(244, 63, 94, 0.4)',
          }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'var(--electric-rose-dim)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem',
              color: '#f43f5e',
            }}
          >
            <ShieldAlert size={32} />
          </div>

          <h2 style={{ fontSize: '1.75rem', marginBottom: '1rem', color: '#f87171' }}>
            Accès Non Autorisé
          </h2>

          <p style={{ marginBottom: '1.5rem', lineHeight: '1.6' }}>
            Cette section nécessite des privilèges <strong>{requiredRole}</strong>. 
            Votre compte actuel est connecté avec le rôle <strong>{user?.role || 'MEMBRE'}</strong>.
          </p>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/" className="btn btn-secondary">
              <ArrowLeft size={16} /> Retour à l'accueil
            </Link>
            <Link to="/login" className="btn btn-primary">
              Changer de compte
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
