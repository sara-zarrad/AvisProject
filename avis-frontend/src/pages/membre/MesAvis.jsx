import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import avisApi from '../../api/avis';
import { useAuth } from '../../context/AuthContext';
import {
  MessageSquare,
  Star,
  Edit3,
  Trash2,
  Calendar,
  Building2,
  Dumbbell,
  ArrowRight,
  Loader2,
  AlertCircle,
  PlusCircle,
  UserCheck
} from 'lucide-react';
import RatingDisplay from '../../components/common/RatingDisplay';
import AvisFormModal from '../../components/seances/AvisFormModal';
import Modal from '../../components/common/Modal';
import Toast from '../../components/common/Toast';

export const MesAvis = () => {
  const { user } = useAuth();
  const [mesAvis, setMesAvis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  // Edit / Delete states
  const [editingAvis, setEditingAvis] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [avisToDelete, setAvisToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const loadMesAvis = async () => {
    try {
      setLoading(true);
      const data = await avisApi.getMyAvis();
      setMesAvis(data);
    } catch (err) {
      console.error('Erreur chargement mes avis:', err);
      setToast({ type: 'error', message: 'Impossible de charger vos avis.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMesAvis();
  }, []);

  const handleEditSuccess = ({ avis }) => {
    setMesAvis((prev) =>
      prev.map((item) => (String(item.id) === String(avis.id) ? { ...item, ...avis } : item))
    );
    setToast({ type: 'success', message: 'Votre avis et coach ont été modifiés avec succès.' });
  };

  const confirmDeleteAvis = async () => {
    if (!avisToDelete) return;
    setDeleting(true);
    try {
      await avisApi.deleteAvis(avisToDelete.id);
      setMesAvis((prev) => prev.filter((a) => String(a.id) !== String(avisToDelete.id)));
      setToast({ type: 'info', message: 'Votre avis a été supprimé.' });
      setAvisToDelete(null);
    } catch (err) {
      console.error('Erreur suppression:', err);
      setToast({ type: 'error', message: 'Erreur lors de la suppression.' });
    } finally {
      setDeleting(false);
    }
  };

  const formatDate = (dateStr) => {
    try {
      return new Intl.DateTimeFormat('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }).format(new Date(dateStr));
    } catch {
      return dateStr;
    }
  };

  // Statistiques membre
  const totalNotesSeance = mesAvis.reduce((acc, a) => acc + Number(a.note), 0);
  const moyenneDonneeSeance = mesAvis.length > 0 ? (totalNotesSeance / mesAvis.length).toFixed(1) : '0.0';

  const totalNotesCoach = mesAvis.reduce(
    (acc, a) => acc + (a.noteCoach !== undefined ? Number(a.noteCoach) : Number(a.note)),
    0
  );
  const moyenneDonneeCoach = mesAvis.length > 0 ? (totalNotesCoach / mesAvis.length).toFixed(1) : '0.0';

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem 5rem' }}>
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}

      {/* Page Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1.5rem',
          marginBottom: '2.5rem',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
            <MessageSquare size={20} color="var(--electric-cyan)" />
            <span style={{ fontSize: '0.85rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: '700' }}>
              Espace Membre EMS
            </span>
          </div>
          <h1 style={{ fontSize: '2.2rem' }}>Mes Avis & Retours d'Expérience</h1>
          <p style={{ fontSize: '0.95rem' }}>
            Consultez, modifiez ou supprimez vos évaluations de séances et de coachs certifiés i-motion.
          </p>
        </div>

        <Link to="/" className="btn btn-primary">
          <PlusCircle size={16} /> Évaluer une autre séance
        </Link>
      </div>

      {/* Member summary cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1.25rem',
          marginBottom: '2.5rem',
        }}
      >
        <div className="card-glass" style={{ padding: '1.5rem' }}>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
            Total des avis rédigés
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: '800', color: 'var(--electric-cyan)' }}>
            {mesAvis.length}
          </div>
        </div>

        <div className="card-glass" style={{ padding: '1.5rem' }}>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
            Moyenne Séances
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '2.2rem', fontWeight: '800', color: '#fbbf24' }}>
              {moyenneDonneeSeance}
            </span>
            <Star size={24} fill="#fbbf24" color="#fbbf24" />
          </div>
        </div>

        <div className="card-glass" style={{ padding: '1.5rem' }}>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
            Moyenne Coachs
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '2.2rem', fontWeight: '800', color: '#c084fc' }}>
              {moyenneDonneeCoach}
            </span>
            <Star size={24} fill="#c084fc" color="#c084fc" />
          </div>
        </div>

        <div className="card-glass" style={{ padding: '1.5rem' }}>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
            Statut du compte
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--electric-lime)' }}>
            Membre Certifié
          </div>
        </div>
      </div>

      {/* Reviews List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--electric-cyan)' }}>
          <Loader2 size={36} className="animate-spin" style={{ margin: '0 auto 1rem' }} />
          <p>Chargement de vos avis...</p>
        </div>
      ) : mesAvis.length === 0 ? (
        <div className="card-glass" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <MessageSquare size={48} color="var(--text-dim)" style={{ margin: '0 auto 1rem' }} />
          <h3 style={{ fontSize: '1.35rem', marginBottom: '0.5rem' }}>Vous n'avez pas encore déposé d'avis</h3>
          <p style={{ maxWidth: '500px', margin: '0 auto 1.75rem' }}>
            Partagez votre retour et évaluez votre coach après avoir testé une séance d'électrostimulation dans l'un de nos clubs.
          </p>
          <Link to="/" className="btn btn-primary">
            Parcourir les séances EMS
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {mesAvis.map((avis) => {
            const noteCoachVal = avis.noteCoach !== undefined ? Number(avis.noteCoach) : Number(avis.note);

            return (
              <div
                key={avis.id}
                className="card-glass"
                style={{
                  padding: '1.75rem',
                  border: '1px solid rgba(0, 240, 255, 0.2)',
                  background: 'rgba(12, 18, 32, 0.85)',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    gap: '1rem',
                    marginBottom: '1rem',
                    flexWrap: 'wrap',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                      <Dumbbell size={16} color="var(--electric-cyan)" />
                      <Link
                        to={`/seances/${avis.seanceId}`}
                        style={{ fontSize: '1.15rem', fontWeight: '700', color: 'var(--text-white)' }}
                      >
                        {avis.seanceNom || `Séance #${avis.seanceId}`}
                      </Link>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.82rem', color: 'var(--text-dim)', flexWrap: 'wrap' }}>
                      {avis.centreNom && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          <Building2 size={13} /> {avis.centreNom}
                        </span>
                      )}
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <Calendar size={13} /> {formatDate(avis.dateCreation)}
                      </span>
                    </div>
                  </div>

                  {/* Dual Ratings and Action Buttons */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                    {/* Séance rating */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        padding: '0.25rem 0.55rem',
                        borderRadius: '8px',
                        background: 'rgba(0, 240, 255, 0.08)',
                        border: '1px solid rgba(0, 240, 255, 0.25)',
                      }}
                    >
                      <span style={{ fontSize: '0.75rem', color: 'var(--electric-cyan)', fontWeight: '700' }}>
                        Séance :
                      </span>
                      <RatingDisplay score={avis.note} showText={false} size="sm" />
                    </div>

                    {/* Coach rating */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        padding: '0.25rem 0.55rem',
                        borderRadius: '8px',
                        background: 'rgba(168, 85, 247, 0.08)',
                        border: '1px solid rgba(168, 85, 247, 0.25)',
                      }}
                    >
                      <span style={{ fontSize: '0.75rem', color: '#c084fc', fontWeight: '700' }}>
                        Coach :
                      </span>
                      <RatingDisplay score={noteCoachVal} showText={false} size="sm" />
                    </div>

                    <div style={{ display: 'flex', gap: '0.35rem', marginLeft: '0.25rem' }}>
                      <button
                        onClick={() => {
                          setEditingAvis(avis);
                          setIsEditModalOpen(true);
                        }}
                        className="btn btn-secondary btn-icon"
                        title="Modifier cet avis et vos notes"
                      >
                        <Edit3 size={16} color="var(--electric-cyan)" />
                      </button>
                      <button
                        onClick={() => setAvisToDelete(avis)}
                        className="btn btn-danger btn-icon"
                        title="Supprimer cet avis"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Coach Badge if evaluated */}
                {avis.coachNom && (
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.45rem',
                      padding: '0.3rem 0.8rem',
                      borderRadius: '999px',
                      background: 'rgba(168, 85, 247, 0.08)',
                      border: '1px solid rgba(168, 85, 247, 0.25)',
                      marginBottom: '0.75rem',
                      fontSize: '0.82rem',
                      flexWrap: 'wrap',
                    }}
                  >
                    <UserCheck size={14} color="#c084fc" />
                    <span style={{ color: 'var(--text-dim)' }}>Coach ayant dispensé la séance :</span>
                    <strong style={{ color: 'var(--text-white)' }}>{avis.coachNom}</strong>
                    {avis.coachSpecialite && (
                      <span style={{ color: 'var(--text-dim)', fontSize: '0.78rem' }}>({avis.coachSpecialite})</span>
                    )}
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: '#fbbf24', marginLeft: '0.35rem', fontSize: '0.8rem', fontWeight: '700' }}>
                      <Star size={12} fill="#fbbf24" /> {noteCoachVal.toFixed(1)}/5
                    </span>
                  </div>
                )}

                {/* Review Text */}
                <p style={{ fontSize: '0.95rem', lineHeight: '1.65', color: 'var(--text-main)', margin: '0.5rem 0 1.25rem' }}>
                  {avis.commentaire}
                </p>

                <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '0.75rem', textAlign: 'right' }}>
                  <Link
                    to={`/seances/${avis.seanceId}`}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.85rem' }}
                  >
                    Voir la fiche séance complète <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Review Modal */}
      {editingAvis && (
        <AvisFormModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingAvis(null);
          }}
          seanceId={editingAvis.seanceId}
          seanceNom={editingAvis.seanceNom || 'Séance EMS'}
          initialData={editingAvis}
          onSuccess={handleEditSuccess}
        />
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!avisToDelete}
        onClose={() => setAvisToDelete(null)}
        title="Supprimer votre avis"
        maxWidth="450px"
      >
        <div style={{ textAlign: 'center', padding: '1rem 0' }}>
          <div
            style={{
              width: '50px',
              height: '50px',
              borderRadius: '50%',
              background: 'var(--electric-rose-dim)',
              color: '#f43f5e',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.25rem',
            }}
          >
            <AlertCircle size={28} />
          </div>
          <h4 style={{ marginBottom: '0.75rem', color: 'var(--text-white)' }}>
            Confirmez-vous la suppression de cet avis ?
          </h4>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1.75rem' }}>
            Cette action supprimera définitivement votre commentaire et votre note.
          </p>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
            <button
              onClick={() => setAvisToDelete(null)}
              className="btn btn-secondary"
              disabled={deleting}
            >
              Annuler
            </button>
            <button
              onClick={confirmDeleteAvis}
              className="btn btn-danger"
              disabled={deleting}
            >
              {deleting ? 'Suppression...' : 'Supprimer mon avis'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default MesAvis;
