import React, { useState, useEffect } from 'react';
import { Zap, MapPin, Phone, ShieldCheck, HeartPulse, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import centresApi from '../../api/centres';

export const Footer = () => {
  const [centres, setCentres] = useState([]);

  useEffect(() => {
    const loadCentres = async () => {
      try {
        const data = await centresApi.getCentres();
        if (Array.isArray(data) && data.length > 0) {
          setCentres(data);
        }
      } catch (err) {
        console.error('Erreur chargement centres footer:', err);
      }
    };
    loadCentres();
  }, []);

  return (
    <footer
      style={{
        marginTop: 'auto',
        borderTop: '1px solid var(--border-subtle)',
        background: 'rgba(5, 8, 14, 0.95)',
        padding: '3.5rem 0 1.5rem',
      }}
    >
      <div className="container">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '2.5rem',
            marginBottom: '3rem',
            textAlign: 'left',
          }}
        >
          {/* Brand Col */}
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.65rem',
                marginBottom: '1rem',
              }}
            >
              <div
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, #00f0ff 0%, #3b82f6 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#06090f',
                }}
              >
                <Zap size={18} fill="#06090f" />
              </div>
              <span
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: '1.2rem',
                  fontWeight: '800',
                  color: 'var(--text-white)',
                }}
              >
                i-motion <span style={{ color: 'var(--electric-cyan)' }}>club Tunisie</span>
              </span>
            </div>
            <p style={{ fontSize: '0.88rem', lineHeight: '1.6', marginBottom: '1.25rem', color: 'var(--text-main)' }}>
              Réseau leader en Tunisie d'électrostimulation musculaire globale sans fil.
              20 minutes de technologie EMS pour sculpter, raffermir et préserver votre santé.
            </p>
            <div style={{ display: 'flex', gap: '0.5rem', color: 'var(--electric-lime)', fontSize: '0.8rem', alignItems: 'center' }}>
              <ShieldCheck size={16} /> Électrostimulation Certifiée Médicale & Sport
            </div>
          </div>

          {/* Centres en Tunisie importés de la base de données (ville et adresse) */}
          <div>
            <h4 style={{ fontSize: '0.95rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-white)', marginBottom: '1.2rem' }}>
              Nos Centres EMS
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: 0, margin: 0 }}>
              {centres.length > 0 ? (
                centres.map((c) => (
                  <li key={c.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.85rem' }}>
                    <MapPin size={15} color="var(--electric-cyan)" style={{ flexShrink: 0, marginTop: '3px' }} />
                    <Link
                      to={`/centres/${c.id}`}
                      style={{ color: 'var(--text-main)', textDecoration: 'none', transition: 'color 0.15s ease' }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--electric-cyan)')}
                      onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-main)')}
                    >
                      <strong style={{ color: 'var(--text-white)' }}>{c.ville || 'Tunisie'} :</strong> {c.adresse || c.nom}
                    </Link>
                  </li>
                ))
              ) : (
                <li style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>
                  Chargement des centres...
                </li>
              )}
            </ul>
          </div>

          {/* Avantages EMS */}
          <div>
            <h4 style={{ fontSize: '0.95rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-white)', marginBottom: '1.2rem' }}>
              La Puissance EMS
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-main)' }}>
                <Clock size={16} color="var(--electric-yellow)" />
                <span>20 minutes = 4h de sport classique</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-main)' }}>
                <HeartPulse size={16} color="var(--electric-rose)" />
                <span>Zéro contrainte sur les articulations</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-main)' }}>
                <Zap size={16} color="var(--electric-cyan)" />
                <span>Technologie espagnole sans fil i-motion v2</span>
              </div>
            </div>
          </div>

          {/* Navigation Rapide */}
          <div>
            <h4 style={{ fontSize: '0.95rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-white)', marginBottom: '1.2rem' }}>
              Plateforme d'Avis
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.85rem' }}>
              <Link to="/centres" style={{ color: 'var(--text-main)', textDecoration: 'none' }}>Explorer les centres</Link>
              <Link to="/login" style={{ color: 'var(--text-main)', textDecoration: 'none' }}>Espace Membre</Link>
              <Link to="/register" style={{ color: 'var(--text-main)', textDecoration: 'none' }}>Créer un compte</Link>
              <a href="tel:+21671860120" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-dim)', textDecoration: 'none' }}>
                <Phone size={14} /> +216 71 860 120 (Support)
              </a>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div
          style={{
            borderTop: '1px solid var(--border-subtle)',
            paddingTop: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
            fontSize: '0.8rem',
            color: 'var(--text-dim)',
          }}
        >
          <div>
            © {new Date().getFullYear()} i-motion Club Tunisie. Système d'évaluation des services EMS.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
