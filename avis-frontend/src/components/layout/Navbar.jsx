import React, { useState } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Zap,
  Building2,
  Dumbbell,
  MessageSquare,
  LayoutDashboard,
  Shield,
  User,
  UserCheck,
  LogOut,
  LogIn,
  UserPlus,
  Menu,
  X
} from 'lucide-react';
import Badge from '../common/Badge';

export const Navbar = () => {
  const { user, isAuthenticated, isAdmin, isMembre, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setMobileMenuOpen(false);
  };

  const closeMobile = () => setMobileMenuOpen(false);

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: 'rgba(6, 9, 15, 0.85)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--border-subtle)',
      }}
    >
      <div
        className="container"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '74px',
        }}
      >
        {/* Brand Logo */}
        <Link
          to={isAdmin ? "/admin/dashboard" : "/"}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            textDecoration: 'none',
          }}
          onClick={closeMobile}
        >
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #00f0ff 0%, #3b82f6 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 15px rgba(0, 240, 255, 0.4)',
              color: '#06090f',
            }}
          >
            <Zap size={22} fill="#06090f" />
          </div>
          <div>
            <div
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '1.25rem',
                fontWeight: '800',
                letterSpacing: '-0.02em',
                color: 'var(--text-white)',
                lineHeight: 1.1,
              }}
            >
              i-motion <span style={{ color: 'var(--electric-cyan)' }}>club</span>
            </div>
            <div
              style={{
                fontSize: '0.68rem',
                fontWeight: '600',
                color: 'var(--text-dim)',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
              }}
            >
              EMS Tunisie • Notation
            </div>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav
          style={{
            display: 'none',
            alignItems: 'center',
            gap: '0.45rem',
          }}
          className="desktop-nav"
        >
          {/* Navigation pour Visiteur et Membre */}
          {!isAdmin && (
            <>
              <NavLink
                to="/"
                end
                className={({ isActive }) =>
                  `nav-link ${isActive ? 'active-nav' : ''}`
                }
              >
                <Zap size={16} /> Accueil
              </NavLink>

              <NavLink
                to="/centres"
                className={({ isActive }) =>
                  `nav-link ${isActive ? 'active-nav' : ''}`
                }
              >
                <Building2 size={16} /> Centres
              </NavLink>

              {isAuthenticated && (
                <NavLink
                  to="/mes-avis"
                  className={({ isActive }) =>
                    `nav-link ${isActive ? 'active-nav' : ''}`
                  }
                >
                  <MessageSquare size={16} /> Mes Avis
                </NavLink>
              )}
            </>
          )}

          {/* Navigation exclusive pour Administrateur */}
          {isAdmin && (
            <>
              <NavLink
                to="/admin/dashboard"
                className={({ isActive }) =>
                  `nav-link nav-link-admin ${isActive ? 'active-nav-admin' : ''}`
                }
              >
                <LayoutDashboard size={16} /> Dashboard
              </NavLink>
              <NavLink
                to="/admin/centres"
                className={({ isActive }) =>
                  `nav-link nav-link-admin ${isActive ? 'active-nav-admin' : ''}`
                }
              >
                <Building2 size={16} /> Gestion Centres
              </NavLink>
              <NavLink
                to="/admin/seances"
                className={({ isActive }) =>
                  `nav-link nav-link-admin ${isActive ? 'active-nav-admin' : ''}`
                }
              >
                <Dumbbell size={16} /> Gestion Séances
              </NavLink>
              <NavLink
                to="/admin/coaches"
                className={({ isActive }) =>
                  `nav-link nav-link-admin ${isActive ? 'active-nav-admin' : ''}`
                }
              >
                <UserCheck size={16} /> Gestion Coaches
              </NavLink>
            </>
          )}
        </nav>

        {/* Desktop Auth Section */}
        <div
          style={{
            display: 'none',
            alignItems: 'center',
            gap: '0.75rem',
          }}
          className="desktop-auth"
        >
          {isAuthenticated ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.65rem',
                  padding: '0.35rem 0.75rem',
                  borderRadius: '10px',
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    background: isAdmin ? 'var(--electric-rose-dim)' : 'var(--electric-cyan-dim)',
                    color: isAdmin ? '#f43f5e' : 'var(--electric-cyan)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {isAdmin ? <Shield size={16} /> : <User size={16} />}
                </div>
                <div style={{ textAlign: 'left', lineHeight: 1.2 }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-white)' }}>
                    {user?.prenom ? `${user.prenom} ${user?.nom?.[0] || ''}.` : (isAdmin ? 'Admin' : 'Membre')}
                  </div>
                  <Badge variant={isAdmin ? 'admin' : 'member'}>
                    {isAdmin ? 'Administrateur' : 'Membre EMS'}
                  </Badge>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="btn btn-secondary btn-icon"
                title="Se déconnecter"
                aria-label="Déconnexion"
              >
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <Link to="/login" className="btn btn-secondary btn-sm">
                <LogIn size={16} /> Connexion
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                <UserPlus size={16} /> Inscription
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu trigger */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="btn btn-secondary btn-icon mobile-toggle"
          aria-label="Menu"
        >
          {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile dropdown menu */}
      {mobileMenuOpen && (
        <div
          className="animate-fade-in"
          style={{
            background: 'var(--bg-surface-elevated)',
            borderBottom: '1px solid var(--border-medium)',
            padding: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
          }}
        >
          {!isAdmin && (
            <>
              <NavLink
                to="/"
                end
                onClick={closeMobile}
                className={({ isActive }) => `nav-link-mobile ${isActive ? 'active' : ''}`}
              >
                <Zap size={18} /> Accueil
              </NavLink>

              <NavLink
                to="/centres"
                onClick={closeMobile}
                className={({ isActive }) => `nav-link-mobile ${isActive ? 'active' : ''}`}
              >
                <Building2 size={18} /> Centres
              </NavLink>

              {isAuthenticated && (
                <NavLink
                  to="/mes-avis"
                  onClick={closeMobile}
                  className={({ isActive }) => `nav-link-mobile ${isActive ? 'active' : ''}`}
                >
                  <MessageSquare size={18} /> Mes Avis Rédigés
                </NavLink>
              )}
            </>
          )}

          {isAdmin && (
            <>
              <div style={{ margin: '0.25rem 0', borderTop: '1px solid var(--border-subtle)' }} />
              <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-dim)', fontWeight: '700', paddingLeft: '0.5rem' }}>
                Administration
              </div>
              <NavLink
                to="/admin/dashboard"
                onClick={closeMobile}
                className={({ isActive }) => `nav-link-mobile admin ${isActive ? 'active' : ''}`}
              >
                <LayoutDashboard size={18} /> Tableau de Bord
              </NavLink>
              <NavLink
                to="/admin/centres"
                onClick={closeMobile}
                className={({ isActive }) => `nav-link-mobile admin ${isActive ? 'active' : ''}`}
              >
                <Building2 size={18} /> Gestion des Centres
              </NavLink>
              <NavLink
                to="/admin/seances"
                onClick={closeMobile}
                className={({ isActive }) => `nav-link-mobile admin ${isActive ? 'active' : ''}`}
              >
                <Dumbbell size={18} /> Gestion des Séances
              </NavLink>
              <NavLink
                to="/admin/coaches"
                onClick={closeMobile}
                className={({ isActive }) => `nav-link-mobile admin ${isActive ? 'active' : ''}`}
              >
                <UserCheck size={18} /> Gestion des Coaches
              </NavLink>
            </>
          )}

          <div style={{ margin: '0.5rem 0', borderTop: '1px solid var(--border-subtle)' }} />

          {isAuthenticated ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', padding: '0.5rem' }}>
                {isAdmin ? <Shield size={18} color="#f43f5e" /> : <User size={18} color="var(--electric-cyan)" />}
                <span style={{ fontSize: '0.9rem', color: 'var(--text-white)', fontWeight: '600' }}>
                  {isAdmin ? 'Compte Administrateur' : 'Compte Membre EMS'}
                </span>
              </div>
              <button onClick={handleLogout} className="btn btn-danger btn-sm" style={{ width: '100%' }}>
                <LogOut size={16} /> Déconnexion
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <Link to="/login" onClick={closeMobile} className="btn btn-secondary" style={{ flex: 1 }}>
                Connexion
              </Link>
              <Link to="/register" onClick={closeMobile} className="btn btn-primary" style={{ flex: 1 }}>
                Inscription
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
