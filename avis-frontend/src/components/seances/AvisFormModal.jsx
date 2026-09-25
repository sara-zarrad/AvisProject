import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import RatingInput from '../common/RatingInput';
import Toast from '../common/Toast';
import avisApi from '../../api/avis';
import coachesApi from '../../api/coaches';
import { Zap, Send, Loader2, UserCheck, Dumbbell, Award, Check, Star, Sparkles } from 'lucide-react';

export const AvisFormModal = ({
  isOpen,
  onClose,
  seanceId,
  seanceNom = '',
  coaches: initialCoaches = [],
  initialData = null,
  onSuccess,
}) => {
  const [note, setNote] = useState(initialData?.note || 0);
  const [noteCoach, setNoteCoach] = useState(initialData?.noteCoach || 0);
  const [commentaire, setCommentaire] = useState(initialData?.commentaire || '');
  const [selectedCoachId, setSelectedCoachId] = useState(initialData?.coachId ? String(initialData.coachId) : '');
  const [availableCoaches, setAvailableCoaches] = useState(initialCoaches || []);
  const [loadingCoaches, setLoadingCoaches] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formErrors, setFormErrors] = useState({});

  const isEditing = !!initialData?.id;

  // Charger les coaches si non passés en props
  useEffect(() => {
    const fetchCoaches = async () => {
      if (initialCoaches && initialCoaches.length > 0) {
        setAvailableCoaches(initialCoaches);
        return;
      }
      if (seanceId && isOpen) {
        try {
          setLoadingCoaches(true);
          const coaches = await coachesApi.getCoachesBySeance(seanceId);
          if (coaches && coaches.length > 0) {
            setAvailableCoaches(coaches);
          } else {
            const allCoaches = await coachesApi.getCoaches();
            setAvailableCoaches(allCoaches);
          }
        } catch (err) {
          console.error('Erreur chargement coaches pour le formulaire:', err);
        } finally {
          setLoadingCoaches(false);
        }
      }
    };

    fetchCoaches();
  }, [seanceId, initialCoaches, isOpen]);

  useEffect(() => {
    if (initialData) {
      setNote(initialData.note || 0);
      setNoteCoach(initialData.noteCoach !== undefined ? initialData.noteCoach : (initialData.note || 0));
      setCommentaire(initialData.commentaire || '');
      setSelectedCoachId(initialData.coachId ? String(initialData.coachId) : '');
    } else {
      setNote(0);
      setNoteCoach(0);
      setCommentaire('');
      // Si un seul coach est assigné à la séance, le pré-sélectionner automatiquement
      if (availableCoaches && availableCoaches.length === 1) {
        setSelectedCoachId(String(availableCoaches[0].id));
      } else {
        setSelectedCoachId('');
      }
    }
    setError(null);
    setFormErrors({});
  }, [initialData, isOpen, availableCoaches]);

  const validate = () => {
    const errs = {};
    if (!note || note < 1 || note > 5) {
      errs.note = 'Veuillez attribuer une note entre 1 et 5 étoiles pour la séance.';
    }
    if (!selectedCoachId) {
      errs.coach = 'Veuillez sélectionner le coach qui vous a entraîné(e).';
    }
    if (!noteCoach || noteCoach < 1 || noteCoach > 5) {
      errs.noteCoach = 'Veuillez attribuer une note entre 1 et 5 étoiles pour le coach.';
    }
    if (!commentaire.trim()) {
      errs.commentaire = 'Veuillez rédiger un commentaire sur votre expérience.';
    } else if (commentaire.trim().length < 10) {
      errs.commentaire = 'Votre commentaire doit comporter au moins 10 caractères.';
    }
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setError(null);

    const chosenCoach = availableCoaches.find((c) => String(c.id) === String(selectedCoachId));
    const coachNom = chosenCoach ? `${chosenCoach.prenom} ${chosenCoach.nom}` : null;

    try {
      if (isEditing) {
        const updatedAvis = await avisApi.updateAvis(initialData.id, {
          note: Number(note),
          noteCoach: Number(noteCoach),
          commentaire: commentaire.trim(),
          coachId: selectedCoachId ? Number(selectedCoachId) : null,
          coachNom,
        });
        if (onSuccess) onSuccess({ type: 'update', avis: updatedAvis });
      } else {
        const result = await avisApi.createAvis(seanceId, {
          note: Number(note),
          noteCoach: Number(noteCoach),
          commentaire: commentaire.trim(),
          coachId: selectedCoachId ? Number(selectedCoachId) : null,
          coachNom,
        });
        if (onSuccess) onSuccess({ type: 'create', ...result });
      }
      onClose();
    } catch (err) {
      console.error('Erreur soumission avis:', err);
      if (err.response?.status === 401) {
        setError('Votre session a expiré ou vous n\'êtes pas connecté. Redirection vers la page de connexion...');
      } else {
        setError(err.message || 'Une erreur est survenue lors de l\'enregistrement de votre avis.');
      }
    } finally {
      setLoading(false);
    }
  };

  const selectedCoachObj = availableCoaches.find((c) => String(c.id) === String(selectedCoachId));

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Modifier votre avis EMS & Coach' : `Évaluer la séance et votre coach`}
      maxWidth="680px"
    >
      {error && <Toast type="error" message={error} />}

      <form onSubmit={handleSubmit}>
        {/* Step 1: Séance Rating */}
        <div
          style={{
            padding: '1.25rem',
            borderRadius: '12px',
            background: 'rgba(0, 240, 255, 0.04)',
            border: '1px solid rgba(0, 240, 255, 0.18)',
            marginBottom: '1.5rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <Zap size={18} color="var(--electric-cyan)" />
            <strong style={{ fontSize: '1rem', color: 'var(--text-white)' }}>
              1. Évaluation de la Séance EMS : <span style={{ color: 'var(--electric-cyan)' }}>{seanceNom || 'Séance'}</span> <span style={{ color: '#f43f5e' }}>*</span>
            </strong>
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-dim)', marginBottom: '0.75rem' }}>
            Qualité du protocole, ressenti musculaire, sensations et intensité globale.
          </p>
          <RatingInput
            value={note}
            onChange={(val) => {
              setNote(val);
              if (formErrors.note) setFormErrors({ ...formErrors, note: null });
            }}
            error={formErrors.note}
          />
        </div>

        {/* Step 2: Coach Selector */}
        <div
          style={{
            padding: '1.25rem',
            borderRadius: '12px',
            background: 'rgba(168, 85, 247, 0.04)',
            border: '1px solid rgba(168, 85, 247, 0.18)',
            marginBottom: '1.5rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <UserCheck size={18} color="#c084fc" />
              <strong style={{ fontSize: '1rem', color: 'var(--text-white)' }}>
                2. Coach qui vous a encadré(e) <span style={{ color: '#f43f5e' }}>*</span>
              </strong>
            </div>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>
              Sélectionnez l'instructeur i-motion
            </span>
          </div>

          {loadingCoaches ? (
            <div style={{ padding: '0.75rem', color: 'var(--text-dim)', fontSize: '0.85rem' }}>
              <Loader2 size={16} className="animate-spin" style={{ display: 'inline', marginRight: '0.5rem' }} />
              Chargement des instructeurs...
            </div>
          ) : availableCoaches.length > 0 ? (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
                gap: '0.75rem',
                marginTop: '0.75rem',
              }}
            >
              {availableCoaches.map((c) => {
                const isSelected = String(selectedCoachId) === String(c.id);
                return (
                  <div
                    key={c.id}
                    onClick={() => {
                      setSelectedCoachId(String(c.id));
                      if (formErrors.coach) setFormErrors({ ...formErrors, coach: null });
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      padding: '0.75rem 1rem',
                      borderRadius: '10px',
                      background: isSelected ? 'rgba(168, 85, 247, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                      border: isSelected ? '1.5px solid #a855f7' : '1px solid var(--border-subtle)',
                      boxShadow: isSelected ? '0 0 15px rgba(168, 85, 247, 0.3)' : 'none',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <div
                      style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '50%',
                        background: isSelected
                          ? 'linear-gradient(135deg, #a855f7 0%, #3b82f6 100%)'
                          : 'rgba(255, 255, 255, 0.1)',
                        color: 'var(--text-white)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: '800',
                        fontSize: '0.85rem',
                        flexShrink: 0,
                      }}
                    >
                      {c.avatar || `${c.prenom[0]}${c.nom[0]}`}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.25rem' }}>
                        <strong
                          style={{
                            fontSize: '0.92rem',
                            color: isSelected ? 'var(--text-white)' : 'var(--text-main)',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {c.prenom} {c.nom}
                        </strong>
                        {isSelected && <Check size={16} color="#c084fc" strokeWidth={2.5} />}
                      </div>
                      <div
                        style={{
                          fontSize: '0.74rem',
                          color: isSelected ? '#c084fc' : 'var(--text-dim)',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {c.specialite}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <select
              className="form-select"
              value={selectedCoachId}
              onChange={(e) => {
                setSelectedCoachId(e.target.value);
                if (formErrors.coach) setFormErrors({ ...formErrors, coach: null });
              }}
            >
              <option value="">Sélectionnez un coach...</option>
              {availableCoaches.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.prenom} {c.nom} - {c.specialite}
                </option>
              ))}
            </select>
          )}

          {formErrors.coach && (
            <div className="form-error" style={{ marginTop: '0.5rem' }}>
              {formErrors.coach}
            </div>
          )}

          {/* Step 3: Coach Rating Input (appears below coach selection) */}
          <div
            style={{
              marginTop: '1.25rem',
              paddingTop: '1rem',
              borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem' }}>
              <Star size={16} color="#fbbf24" fill="#fbbf24" />
              <strong style={{ fontSize: '0.95rem', color: 'var(--text-white)' }}>
                3. Note du Coach {selectedCoachObj ? `(${selectedCoachObj.prenom} ${selectedCoachObj.nom})` : ''} <span style={{ color: '#f43f5e' }}>*</span>
              </strong>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: '0.65rem' }}>
              Pédagogie, ajustement des impulsions i-motion, motivation et posture.
            </p>
            <RatingInput
              value={noteCoach}
              onChange={(val) => {
                setNoteCoach(val);
                if (formErrors.noteCoach) setFormErrors({ ...formErrors, noteCoach: null });
              }}
              error={formErrors.noteCoach}
            />
          </div>
        </div>

        {/* Step 4: Comment field */}
        <div className="form-group">
          <label className="form-label" htmlFor="avisCommentaire">
            <span>4. Votre retour d'expérience détaillé <span style={{ color: '#f43f5e' }}>*</span></span>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>
              {commentaire.length} car.
            </span>
          </label>
          <textarea
            id="avisCommentaire"
            className="form-textarea"
            placeholder="Partagez vos sensations pendant et après la séance, l'intensité des impulsions, la qualité des consignes et du réglage par votre coach..."
            value={commentaire}
            onChange={(e) => {
              setCommentaire(e.target.value);
              if (formErrors.commentaire) setFormErrors({ ...formErrors, commentaire: null });
            }}
            rows={3}
            disabled={loading}
          />
          {formErrors.commentaire && (
            <div className="form-error">{formErrors.commentaire}</div>
          )}
        </div>

        {/* Action buttons */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '0.75rem',
            marginTop: '1.75rem',
            borderTop: '1px solid var(--border-subtle)',
            paddingTop: '1.25rem',
          }}
        >
          <button
            type="button"
            onClick={onClose}
            className="btn btn-secondary"
            disabled={loading}
          >
            Annuler
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" /> Enregistrement...
              </>
            ) : (
              <>
                {isEditing ? <Send size={16} /> : <Zap size={16} />}
                {isEditing ? 'Mettre à jour mon avis' : 'Publier mes notes Séance & Coach'}
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AvisFormModal;
