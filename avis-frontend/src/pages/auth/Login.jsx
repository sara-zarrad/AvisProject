import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Zap, LogIn, Lock, Mail, Loader2 } from 'lucide-react';
import Toast from '../../components/common/Toast';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // URL de redirection après connexion
  const searchParams = new URLSearchParams(location.search);
  const redirectPath = searchParams.get('redirect') || location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    const cleanEmail = email.trim();

    if (!cleanEmail || !motDePasse) {
      setError('Veuillez renseigner votre adresse email et votre mot de passe.');
      return;
    }

    if (!cleanEmail.includes('@') || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setError("L'adresse email doit contenir un '@' et avoir un format valide (ex: nom@domaine.com).");
      return;
    }

    if (motDePasse.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères.');
      return;
    }

    if (!/[A-Z]/.test(motDePasse)) {
      setError('Le mot de passe doit contenir au moins 1 lettre majuscule (A-Z).');
      return;
    }

    if (!/[0-9]/.test(motDePasse)) {
      setError('Le mot de passe doit contenir au moins 1 chiffre (0-9).');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await login({ email: cleanEmail, motDePasse });
      navigate(redirectPath, { replace: true });
    } catch (err) {
      console.error('Erreur login:', err);
      setError(err.message || 'Identifiants invalides. Vérifiez votre email et mot de passe.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="container"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 'calc(100vh - 180px)',
        padding: '3rem 1.5rem',
      }}
    >
      <div
        className="card-glass animate-fade-in"
        style={{
          width: '100%',
          maxWidth: '480px',
          padding: '2.5rem 2rem',
          border: '1px solid rgba(0, 240, 255, 0.25)',
          background: 'rgba(12, 18, 32, 0.95)',
          boxShadow: '0 20px 45px -10px rgba(0, 0, 0, 0.6), 0 0 25px rgba(0, 240, 255, 0.1)',
        }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div
            style={{
              width: '50px',
              height: '50px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #00f0ff 0%, #3b82f6 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem',
              color: '#06090f',
              boxShadow: '0 0 20px rgba(0, 240, 255, 0.35)',
            }}
          >
            <Zap size={28} fill="#06090f" />
          </div>

          <h1 style={{ fontSize: '1.85rem', marginBottom: '0.4rem' }}>Connexion Membre</h1>
          <p style={{ fontSize: '0.9rem' }}>
            Accédez à vos avis et évaluez vos séances EMS en Tunisie
          </p>
        </div>

        {error && <Toast type="error" message={error} />}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="loginEmail">
              Adresse Email
            </label>
            <div style={{ position: 'relative' }}>
              <Mail
                size={18}
                color="var(--text-dim)"
                style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }}
              />
              <input
                id="loginEmail"
                type="email"
                className="form-input"
                style={{ paddingLeft: '2.75rem' }}
                placeholder="votre.email@exemple.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="loginPassword">
              Mot de passe
            </label>
            <div style={{ position: 'relative' }}>
              <Lock
                size={18}
                color="var(--text-dim)"
                style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }}
              />
              <input
                id="loginPassword"
                type="password"
                className="form-input"
                style={{ paddingLeft: '2.75rem' }}
                placeholder="••••••••"
                value={motDePasse}
                onChange={(e) => setMotDePasse(e.target.value)}
                autoComplete="current-password"
                disabled={loading}
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.85rem', marginTop: '1.25rem' }}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" /> Connexion en cours...
              </>
            ) : (
              <>
                <LogIn size={18} /> Se connecter
              </>
            )}
          </button>
        </form>



        {/* Register link */}
        <div style={{ textAlign: 'center', marginTop: '1.75rem', fontSize: '0.88rem' }}>
          Pas encore inscrit ?{' '}
          <Link to="/register" style={{ fontWeight: '600', color: 'var(--electric-cyan)' }}>
            Créer un compte membre
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
