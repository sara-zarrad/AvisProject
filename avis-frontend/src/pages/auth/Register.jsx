import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Zap, UserPlus, Lock, Mail, User, Loader2, Check, X } from 'lucide-react';
import Toast from '../../components/common/Toast';

export const Register = () => {
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    motDePasse: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState(null);
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const validate = () => {
    const errs = {};
    if (!formData.nom.trim()) errs.nom = 'Le nom est obligatoire.';
    if (!formData.prenom.trim()) errs.prenom = 'Le prénom est obligatoire.';
    
    const cleanEmail = formData.email.trim();
    if (!cleanEmail) {
      errs.email = "L'adresse email est obligatoire.";
    } else if (!cleanEmail.includes('@') || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      errs.email = "L'adresse email doit contenir un '@' et un format valide (ex: utilisateur@domaine.com).";
    }

    const pwd = formData.motDePasse;
    if (!pwd) {
      errs.motDePasse = 'Le mot de passe est obligatoire.';
    } else if (pwd.length < 6) {
      errs.motDePasse = 'Le mot de passe doit comporter au moins 6 caractères.';
    } else if (!/[A-Z]/.test(pwd)) {
      errs.motDePasse = 'Le mot de passe doit contenir au moins 1 lettre majuscule (A-Z).';
    } else if (!/[0-9]/.test(pwd)) {
      errs.motDePasse = 'Le mot de passe doit contenir au moins 1 chiffre (0-9).';
    }

    if (formData.motDePasse !== formData.confirmPassword) {
      errs.confirmPassword = 'Les mots de passe ne correspondent pas.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setGeneralError(null);

    try {
      await register({
        nom: formData.nom.trim(),
        prenom: formData.prenom.trim(),
        email: formData.email.trim(),
        motDePasse: formData.motDePasse,
      });
      navigate('/', { replace: true });
    } catch (err) {
      console.error('Erreur inscription:', err);
      setGeneralError(err.message || 'Une erreur est survenue lors de la création du compte.');
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
          maxWidth: '520px',
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
              background: 'linear-gradient(135deg, #10b981 0%, #00f0ff 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem',
              color: '#06090f',
              boxShadow: '0 0 20px rgba(16, 185, 129, 0.35)',
            }}
          >
            <Zap size={28} fill="#06090f" />
          </div>

          <h1 style={{ fontSize: '1.85rem', marginBottom: '0.4rem' }}>Rejoindre la Communauté EMS</h1>
          <p style={{ fontSize: '0.9rem' }}>
            Créez votre compte membre et notez vos séances i-motion en Tunisie
          </p>
        </div>

        {generalError && <Toast type="error" message={generalError} />}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="registerPrenom">
                Prénom <span style={{ color: '#f43f5e' }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <User
                  size={16}
                  color="var(--text-dim)"
                  style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)' }}
                />
                <input
                  id="registerPrenom"
                  name="prenom"
                  type="text"
                  className="form-input"
                  style={{ paddingLeft: '2.5rem' }}
                  placeholder="Votre prénom"
                  value={formData.prenom}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>
              {errors.prenom && <div className="form-error">{errors.prenom}</div>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="registerNom">
                Nom <span style={{ color: '#f43f5e' }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <User
                  size={16}
                  color="var(--text-dim)"
                  style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)' }}
                />
                <input
                  id="registerNom"
                  name="nom"
                  type="text"
                  className="form-input"
                  style={{ paddingLeft: '2.5rem' }}
                  placeholder="Votre nom"
                  value={formData.nom}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>
              {errors.nom && <div className="form-error">{errors.nom}</div>}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="registerEmail">
              Adresse Email <span style={{ color: '#f43f5e' }}>*</span>
            </label>
            <div style={{ position: 'relative' }}>
              <Mail
                size={18}
                color="var(--text-dim)"
                style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }}
              />
              <input
                id="registerEmail"
                name="email"
                type="email"
                className="form-input"
                style={{ paddingLeft: '2.75rem' }}
                placeholder="votre.email@exemple.tn"
                value={formData.email}
                onChange={handleChange}
                autoComplete="email"
                disabled={loading}
              />
            </div>
            {errors.email && <div className="form-error">{errors.email}</div>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="registerPassword">
              Mot de passe <span style={{ color: '#f43f5e' }}>*</span>
            </label>
            <div style={{ position: 'relative' }}>
              <Lock
                size={18}
                color="var(--text-dim)"
                style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }}
              />
              <input
                id="registerPassword"
                name="motDePasse"
                type="password"
                className="form-input"
                style={{ paddingLeft: '2.75rem' }}
                placeholder="6 caractères (1 majuscule, 1 chiffre)"
                value={formData.motDePasse}
                onChange={handleChange}
                autoComplete="new-password"
                disabled={loading}
              />
            </div>
            
            {/* Password requirements indicators */}
            <div style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.78rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: formData.motDePasse.length >= 6 ? '#10b981' : 'var(--text-dim)' }}>
                {formData.motDePasse.length >= 6 ? <Check size={13} color="#10b981" /> : <span style={{ width: 13, height: 13, display: 'inline-block', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.2)' }} />}
                <span>Au moins 6 caractères</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: /[A-Z]/.test(formData.motDePasse) ? '#10b981' : 'var(--text-dim)' }}>
                {/[A-Z]/.test(formData.motDePasse) ? <Check size={13} color="#10b981" /> : <span style={{ width: 13, height: 13, display: 'inline-block', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.2)' }} />}
                <span>Au moins 1 majuscule (A-Z)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: /[0-9]/.test(formData.motDePasse) ? '#10b981' : 'var(--text-dim)' }}>
                {/[0-9]/.test(formData.motDePasse) ? <Check size={13} color="#10b981" /> : <span style={{ width: 13, height: 13, display: 'inline-block', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.2)' }} />}
                <span>Au moins 1 chiffre (0-9)</span>
              </div>
            </div>

            {errors.motDePasse && <div className="form-error">{errors.motDePasse}</div>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="registerConfirm">
              Confirmer le mot de passe <span style={{ color: '#f43f5e' }}>*</span>
            </label>
            <div style={{ position: 'relative' }}>
              <Lock
                size={18}
                color="var(--text-dim)"
                style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }}
              />
              <input
                id="registerConfirm"
                name="confirmPassword"
                type="password"
                className="form-input"
                style={{ paddingLeft: '2.75rem' }}
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleChange}
                autoComplete="new-password"
                disabled={loading}
              />
            </div>
            {errors.confirmPassword && <div className="form-error">{errors.confirmPassword}</div>}
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.85rem', marginTop: '1rem' }}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" /> Inscription en cours...
              </>
            ) : (
              <>
                <UserPlus size={18} /> Créer mon compte MEMBRE
              </>
            )}
          </button>
        </form>

        {/* Login link */}
        <div style={{ textAlign: 'center', marginTop: '1.75rem', fontSize: '0.88rem' }}>
          Vous avez déjà un compte ?{' '}
          <Link to="/login" style={{ fontWeight: '600', color: 'var(--electric-cyan)' }}>
            Se connecter
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
