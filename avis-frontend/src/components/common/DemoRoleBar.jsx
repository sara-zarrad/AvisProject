import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Eye,
  User,
  Shield,
  Layers,
  ChevronDown,
  ChevronUp,
  ExternalLink
} from 'lucide-react';

export const DemoRoleBar = () => {
  const { user, isAuthenticated, isAdmin, isMembre, setDemoRole } = useAuth();
  const location = useLocation();
  const [expanded, setExpanded] = useState(true);

  const currentMode = !isAuthenticated
    ? 'VISITEUR'
    : isAdmin
    ? 'ADMINISTRATEUR'
    : 'MEMBRE';

  const quickPages = [
    { label: 'Centres (Accueil)', path: '/' },
    { label: 'Détail Centre (Lac 2)', path: '/centres/1' },
    { label: 'Fiche Séance EMS (Avis)', path: '/seances/1' },
    { label: 'Mes Avis (Membre)', path: '/mes-avis', role: 'MEMBRE' },
    { label: 'Dashboard Admin', path: '/admin/dashboard', role: 'ADMIN' },
    { label: 'Gestion Centres', path: '/admin/centres', role: 'ADMIN' },
    { label: 'Gestion Séances', path: '/admin/seances', role: 'ADMIN' },
    { label: 'Gestion Coaches', path: '/admin/coaches', role: 'ADMIN' },
    { label: 'Connexion', path: '/login' },
    { label: 'Inscription', path: '/register' },
  ];

  return (
    <div
      style={{
        background: 'linear-gradient(90deg, #090e1a 0%, #0d1527 50%, #090e1a 100%)',
        borderBottom: '1px solid rgba(0, 240, 255, 0.3)',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
        fontSize: '0.82rem',
        zIndex: 100,
        position: 'relative',
      }}
    >
      <div
        className="container"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.5rem 1.5rem',
          flexWrap: 'wrap',
          gap: '0.6rem',
        }}
      >
        {/* Switcher Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'inline-flex', background: 'rgba(0, 0, 0, 0.4)', borderRadius: '8px', padding: '2px', border: '1px solid var(--border-subtle)' }}>
            <button
              type="button"
              onClick={() => setDemoRole('VISITEUR')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.3rem 0.65rem',
                borderRadius: '6px',
                border: 'none',
                background: currentMode === 'VISITEUR' ? 'var(--electric-cyan-dim)' : 'transparent',
                color: currentMode === 'VISITEUR' ? 'var(--electric-cyan)' : 'var(--text-dim)',
                fontWeight: currentMode === 'VISITEUR' ? '700' : '500',
                cursor: 'pointer',
                fontSize: '0.8rem',
                transition: 'all 0.15s ease',
              }}
            >
              <Eye size={13} /> Visiteur Public
            </button>

            <button
              type="button"
              onClick={() => setDemoRole('MEMBRE')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.3rem 0.65rem',
                borderRadius: '6px',
                border: 'none',
                background: currentMode === 'MEMBRE' ? 'var(--electric-cyan)' : 'transparent',
                color: currentMode === 'MEMBRE' ? '#06090f' : 'var(--text-dim)',
                fontWeight: currentMode === 'MEMBRE' ? '700' : '500',
                cursor: 'pointer',
                fontSize: '0.8rem',
                transition: 'all 0.15s ease',
              }}
            >
              <User size={13} /> Membre
            </button>

            <button
              type="button"
              onClick={() => setDemoRole('ADMINISTRATEUR')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.3rem 0.65rem',
                borderRadius: '6px',
                border: 'none',
                background: currentMode === 'ADMINISTRATEUR' ? '#f43f5e' : 'transparent',
                color: currentMode === 'ADMINISTRATEUR' ? '#ffffff' : 'var(--text-dim)',
                fontWeight: currentMode === 'ADMINISTRATEUR' ? '700' : '500',
                cursor: 'pointer',
                fontSize: '0.8rem',
                transition: 'all 0.15s ease',
              }}
            >
              <Shield size={13} /> Administrateur
            </button>
          </div>
        </div>

        {/* Toggle shortcuts button */}
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            background: 'transparent',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            fontSize: '0.78rem',
          }}
        >
          <Layers size={13} /> Raccourcis Pages {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
        </button>
      </div>

      {/* Expanded Quick Navigation Bar */}
      {expanded && (
        <div
          style={{
            borderTop: '1px solid rgba(255, 255, 255, 0.05)',
            background: 'rgba(6, 9, 15, 0.95)',
            padding: '0.45rem 1.5rem',
          }}
        >
          <div
            className="container"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              overflowX: 'auto',
              whiteSpace: 'nowrap',
              padding: '0.2rem 0',
            }}
          >
            <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-dim)', fontWeight: '700', marginRight: '0.3rem' }}>
              Accès Direct :
            </span>

            {quickPages.map((page) => {
              const isActive = location.pathname === page.path;
              return (
                <Link
                  key={page.path}
                  to={page.path}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                    padding: '0.25rem 0.6rem',
                    borderRadius: '6px',
                    fontSize: '0.78rem',
                    textDecoration: 'none',
                    background: isActive ? 'rgba(0, 240, 255, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                    color: isActive ? 'var(--electric-cyan)' : 'var(--text-muted)',
                    border: isActive ? '1px solid rgba(0, 240, 255, 0.3)' : '1px solid transparent',
                    fontWeight: isActive ? '700' : '500',
                  }}
                >
                  {page.label}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default DemoRoleBar;
