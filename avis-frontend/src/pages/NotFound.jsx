import React from 'react';
import { Link } from 'react-router-dom';
import { Zap, ArrowLeft, Building2 } from 'lucide-react';

export const NotFound = () => {
  return (
    <div
      className="container"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 'calc(100vh - 200px)',
        padding: '3rem 1.5rem',
        textAlign: 'center',
      }}
    >
      <div
        className="card-glass animate-fade-in"
        style={{
          maxWidth: '520px',
          padding: '3.5rem 2rem',
          border: '1px solid rgba(0, 240, 255, 0.25)',
        }}
      >
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '16px',
            background: 'var(--electric-cyan-dim)',
            color: 'var(--electric-cyan)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem',
            boxShadow: '0 0 25px rgba(0, 240, 255, 0.25)',
          }}
        >
          <Zap size={32} />
        </div>

        <h1 style={{ fontSize: '3.5rem', fontWeight: '900', color: 'var(--electric-cyan)', lineHeight: 1, marginBottom: '0.75rem' }}>
          404
        </h1>

        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Page introuvable</h2>

        <p style={{ marginBottom: '2rem', lineHeight: '1.6' }}>
          La page que vous recherchez semble introuvable ou a été déplacée.
        </p>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/" className="btn btn-primary">
            <Building2 size={16} /> Explorer les centres EMS
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
