import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import seancesApi from '../../api/seances';
import centresApi from '../../api/centres';
import avisApi from '../../api/avis';
import { useAuth } from '../../context/AuthContext';
import {
  ArrowLeft,
  Star,
  MessageSquarePlus,
  Building2,
  Dumbbell,
  CheckCircle2,
  Filter,
  Zap,
  Loader2,
  Trash2,
  AlertCircle,
  UserCheck,
  Award,
  Sparkles
} from 'lucide-react';
import RatingDisplay from '../../components/common/RatingDisplay';
import AvisCard from '../../components/seances/AvisCard';
import AvisFormModal from '../../components/seances/AvisFormModal';
import Modal from '../../components/common/Modal';
import Toast from '../../components/common/Toast';
import Badge from '../../components/common/Badge';

export const SeanceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, isAdmin } = useAuth();

  const [seance, setSeance] = useState(null);
  const [centre, setCentre] = useState(null);
  const [avisList, setAvisList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);

  // Modal and filters state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingAvis, setEditingAvis] = useState(null);
  const [selectedStarFilter, setSelectedStarFilter] = useState('ALL');
  const [selectedCoachFilter, setSelectedCoachFilter] = useState('ALL');
  
  // Delete confirmation modal state
  const [avisToDelete, setAvisToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const loadSeanceData = async () => {
      try {
        setLoading(true);
        const seanceData = await seancesApi.getSeanceById(id);
        setSeance(seanceData);

        if (seanceData?.centre) {
          setCentre(seanceData.centre);
        } else if (seanceData?.centreId) {
          try {
            const centreData = await centresApi.getCentreById(seanceData.centreId);
            setCentre(centreData);
          } catch {
            // Optionnel
          }
        }

        if (seanceData?.avis && Array.isArray(seanceData.avis)) {
          const formattedAvis = seanceData.avis.map((a) => ({
            ...a,
            utilisateurNom: a.utilisateur ? `${a.utilisateur.prenom} ${a.utilisateur.nom}` : a.utilisateurNom || 'Membre',
            coachNom: a.coach ? `${a.coach.prenom} ${a.coach.nom}` : a.coachNom || null,
          }));
          setAvisList(formattedAvis);
        } else {
          try {
            const avisData = await avisApi.getAvisBySeance(id);
            setAvisList(Array.isArray(avisData) ? avisData : []);
          } catch {
            setAvisList([]);
          }
        }
      } catch (err) {
        console.error('Erreur chargement séance:', err);
        setError('Impossible de charger cette séance EMS.');
      } finally {
        setLoading(false);
      }
    };
    loadSeanceData();
  }, [id]);


  // Vérifier si l'utilisateur connecté a déjà rédigé un avis
  const myExistingAvis = user
    ? avisList.find((a) => String(a.utilisateurId) === String(user.id))
    : null;

  // Handler ouverture modal de dépôt d'avis
  const handleOpenReviewModal = (preselectedCoach = null) => {
    if (!isAuthenticated) {
      navigate(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
      return;
    }
    if (preselectedCoach && !myExistingAvis) {
      setEditingAvis({ coachId: preselectedCoach.id, coachNom: `${preselectedCoach.prenom} ${preselectedCoach.nom}` });
    } else {
      setEditingAvis(myExistingAvis || null);
    }
    setIsFormModalOpen(true);
  };

  // Handler après création ou mise à jour réussie d'un avis
  const handleAvisSuccess = ({ type, avis, nouvelleMoyenne }) => {
    if (type === 'create') {
      setAvisList((prev) => [avis, ...prev]);
      if (nouvelleMoyenne !== undefined) {
        setSeance((prev) => ({ ...prev, moyenneNote: nouvelleMoyenne }));
      }
      setToast({
        type: 'success',
        message: 'Votre avis et votre retour sur le coach ont été publiés avec succès !',
      });
    } else if (type === 'update') {
      setAvisList((prev) =>
        prev.map((item) => (String(item.id) === String(avis.id) ? { ...item, ...avis } : item))
      );
      // Recalculer la moyenne locale
      const updatedList = avisList.map((item) =>
        String(item.id) === String(avis.id) ? { ...item, ...avis } : item
      );
      const sum = updatedList.reduce((acc, a) => acc + a.note, 0);
      const newAvg = Number((sum / updatedList.length).toFixed(1));
      setSeance((prev) => ({ ...prev, moyenneNote: newAvg }));
      setToast({
        type: 'success',
        message: 'Votre avis a été mis à jour avec succès.',
      });
    }
  };

  // Suppression d'un avis
  const confirmDeleteAvis = async () => {
    if (!avisToDelete) return;
    setDeleting(true);
    try {
      await avisApi.deleteAvis(avisToDelete.id);
      const updatedList = avisList.filter((a) => String(a.id) !== String(avisToDelete.id));
      setAvisList(updatedList);

      const sum = updatedList.reduce((acc, a) => acc + a.note, 0);
      const newAvg = updatedList.length > 0 ? Number((sum / updatedList.length).toFixed(1)) : 0;
      setSeance((prev) => ({ ...prev, moyenneNote: newAvg }));

      setToast({
        type: 'info',
        message: 'L\'avis a été supprimé.',
      });
      setAvisToDelete(null);
    } catch (err) {
      console.error('Erreur suppression avis:', err);
      setToast({
        type: 'error',
        message: 'Erreur lors de la suppression de l\'avis.',
      });
    } finally {
      setDeleting(false);
    }
  };

  // Calcul répartition des étoiles (1 à 5)
  const starCounts = [5, 4, 3, 2, 1].map((star) => {
    const count = avisList.filter((a) => a.note === star).length;
    const percentage = avisList.length > 0 ? Math.round((count / avisList.length) * 100) : 0;
    return { star, count, percentage };
  });

  // Calcul moyenne coach pour cette séance
  const coachNotesSum = avisList.reduce(
    (acc, a) => acc + (a.noteCoach !== undefined ? Number(a.noteCoach) : Number(a.note)),
    0
  );
  const moyenneCoachSeance = avisList.length > 0 ? (coachNotesSum / avisList.length).toFixed(1) : '0.0';

  // Filtrage des avis affichés (étoiles + coach)
  const filteredAvis = avisList.filter((a) => {
    const matchesStar = selectedStarFilter === 'ALL' || a.note === Number(selectedStarFilter);
    const matchesCoach =
      selectedCoachFilter === 'ALL' || String(a.coachId) === String(selectedCoachFilter);
    return matchesStar && matchesCoach;
  });

  const coaches = seance?.coaches || [];

  if (loading) {
    return (
      <div className="container" style={{ padding: '5rem 0', textAlign: 'center', color: 'var(--electric-cyan)' }}>
        <Loader2 size={40} className="animate-spin" style={{ margin: '0 auto 1rem' }} />
        <p>Chargement des évaluations de la séance EMS...</p>
      </div>
    );
  }

  if (error || !seance) {
    return (
      <div className="container" style={{ padding: '4rem 1.5rem', textAlign: 'center' }}>
        <div className="card-glass" style={{ maxWidth: '550px', margin: '0 auto', padding: '3rem 2rem' }}>
          <h2 style={{ marginBottom: '1rem', color: '#f87171' }}>Séance introuvable</h2>
          <p style={{ marginBottom: '1.5rem' }}>{error || 'La séance demandée n\'existe pas.'}</p>
          <Link to="/" className="btn btn-primary">
            <ArrowLeft size={16} /> Retour aux centres
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem 5rem' }}>
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}

      {/* Navigation fil d'Ariane */}
      <div style={{ marginBottom: '1.75rem', display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
        <Link to="/" className="btn btn-secondary btn-sm">
          <ArrowLeft size={15} /> Centres
        </Link>
        {centre && (
          <Link to={`/centres/${centre.id}`} className="btn btn-secondary btn-sm">
            <Building2 size={15} /> {centre.nom}
          </Link>
        )}
      </div>

      {/* Session Hero / Header Card */}
      <div
        className="card-glass"
        style={{
          padding: '2.5rem',
          marginBottom: '2.5rem',
          border: '1px solid rgba(0, 240, 255, 0.25)',
          background: 'linear-gradient(135deg, rgba(14, 21, 37, 0.95) 0%, rgba(9, 15, 27, 0.9) 100%)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: '1.5rem',
            flexWrap: 'wrap',
            marginBottom: '1.5rem',
          }}
        >
          <div style={{ flex: '1 1 500px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
              <Badge variant="purple">{seance.type || 'Programme EMS'}</Badge>
              {centre && (
                <Link to={`/centres/${centre.id}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.85rem' }}>
                  <Building2 size={14} /> {centre.nom}
                </Link>
              )}
            </div>

            <h1 style={{ fontSize: '2.2rem', marginBottom: '0.75rem' }}>{seance.nom}</h1>

            <p style={{ fontSize: '1rem', lineHeight: '1.7', color: 'var(--text-muted)' }}>
              {seance.description}
            </p>
          </div>

          {/* Action to leave a review */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', minWidth: '220px' }}>
            <button
              onClick={() => handleOpenReviewModal()}
              className="btn btn-primary btn-lg"
              style={{ width: '100%', justifyContent: 'center' }}
            >
              <Zap size={18} />
              {myExistingAvis ? 'Modifier mon avis & notes' : 'Évaluer séance & coach'}
            </button>

            {!isAuthenticated && (
              <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)', textAlign: 'center' }}>
                Connexion membre requise pour déposer un avis
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Coaches Section (Coaches in charge of this Seance) */}
      <div style={{ marginBottom: '2.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <UserCheck size={22} color="var(--electric-cyan)" />
            <h2 style={{ fontSize: '1.45rem', color: 'var(--text-white)' }}>
              Coaches Certifiés pour cette Séance ({coaches.length})
            </h2>
          </div>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>
            Instructeurs i-motion Master Trainers avec évaluations adhérents
          </span>
        </div>

        {coaches.length === 0 ? (
          <div className="card-glass" style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            Aucun coach spécifique n'est rattaché pour l'instant. Les coachs du centre dispensent cette séance.
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '1.25rem',
            }}
          >
            {coaches.map((c) => {
              const coachAvis = avisList.filter((a) => String(a.coachId) === String(c.id));
              const coachRatingVal = coachAvis.length > 0
                ? Number((coachAvis.reduce((acc, a) => acc + (a.noteCoach !== undefined ? Number(a.noteCoach) : Number(a.note)), 0) / coachAvis.length).toFixed(1))
                : (c.moyenneNote || 0);

              return (
                <div
                  key={c.id}
                  className="card-glass"
                  style={{
                    padding: '1.5rem',
                    border: '1px solid rgba(0, 240, 255, 0.2)',
                    background: 'rgba(12, 18, 32, 0.85)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '1rem',
                    transition: 'transform 0.2s ease, border-color 0.2s ease',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '0.75rem' }}>
                      <div
                        style={{
                          width: '48px',
                          height: '48px',
                          borderRadius: '50%',
                          background: 'linear-gradient(135deg, #00f0ff 0%, #3b82f6 100%)',
                          color: '#06090f',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: '800',
                          fontSize: '1.1rem',
                          flexShrink: 0,
                          boxShadow: '0 0 15px rgba(0, 240, 255, 0.35)',
                        }}
                      >
                        {c.avatar || `${c.prenom[0]}${c.nom[0]}`}
                      </div>

                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.25rem' }}>
                          <h3 style={{ fontSize: '1.05rem', color: 'var(--text-white)', marginBottom: '0.1rem' }}>
                            {c.prenom} {c.nom}
                          </h3>
                        </div>
                        <span style={{ fontSize: '0.78rem', color: 'var(--electric-cyan)', fontWeight: '600' }}>
                          {c.specialite}
                        </span>
                      </div>
                    </div>

                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.5', marginBottom: '0.75rem' }}>
                      {c.bio}
                    </p>

                    {/* Coach rating display */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.5rem 0.75rem',
                        borderRadius: '8px',
                        background: 'rgba(168, 85, 247, 0.08)',
                        border: '1px solid rgba(168, 85, 247, 0.2)',
                        marginBottom: '0.75rem',
                      }}
                    >
                      <span style={{ fontSize: '0.78rem', color: '#c084fc', fontWeight: '700' }}>
                        Note Coach :
                      </span>
                      <RatingDisplay score={coachRatingVal} count={coachAvis.length || c.nombreAvis || null} size="sm" />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem', color: 'var(--electric-lime)' }}>
                      <Award size={14} />
                      <span>{c.experience || 'Certifié i-motion EMS'}</span>
                    </div>
                  </div>

                  <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '0.75rem', display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                      onClick={() => handleOpenReviewModal(c)}
                      className="btn btn-secondary btn-sm"
                      style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}
                    >
                      <Zap size={14} color="var(--electric-cyan)" /> Évaluer avec ce coach
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Ratings Breakdown and Statistics Section (Dual Scores: Séance + Coachs) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '2rem',
          marginBottom: '3rem',
        }}
      >
        {/* Overall Score Badge Card (Séance + Coach) */}
        <div
          className="card-glass"
          style={{
            padding: '2rem',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(12, 18, 32, 0.8)',
          }}
        >
          <div style={{ fontSize: '0.85rem', textTransform: 'uppercase', color: 'var(--text-dim)', fontWeight: '700', letterSpacing: '0.08em', marginBottom: '1rem' }}>
            Scores de Satisfaction
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', width: '100%', marginBottom: '1.25rem' }}>
            {/* Séance Score */}
            <div
              style={{
                padding: '1rem',
                borderRadius: '12px',
                background: 'rgba(0, 240, 255, 0.05)',
                border: '1px solid rgba(0, 240, 255, 0.2)',
              }}
            >
              <div style={{ fontSize: '0.75rem', color: 'var(--electric-cyan)', fontWeight: '700', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                ⚡ Séance
              </div>
              <div
                style={{
                  fontSize: '2.5rem',
                  fontWeight: '900',
                  fontFamily: 'var(--font-heading)',
                  color: '#fbbf24',
                  lineHeight: 1,
                  marginBottom: '0.35rem',
                }}
              >
                {seance.moyenneNote ? seance.moyenneNote.toFixed(1) : '0.0'}
              </div>
              <RatingDisplay score={seance.moyenneNote || 0} size="sm" showScore={false} showText={false} />
            </div>

            {/* Coach Score */}
            <div
              style={{
                padding: '1rem',
                borderRadius: '12px',
                background: 'rgba(168, 85, 247, 0.05)',
                border: '1px solid rgba(168, 85, 247, 0.2)',
              }}
            >
              <div style={{ fontSize: '0.75rem', color: '#c084fc', fontWeight: '700', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                🏆 Coachs
              </div>
              <div
                style={{
                  fontSize: '2.5rem',
                  fontWeight: '900',
                  fontFamily: 'var(--font-heading)',
                  color: '#fbbf24',
                  lineHeight: 1,
                  marginBottom: '0.35rem',
                }}
              >
                {moyenneCoachSeance}
              </div>
              <RatingDisplay score={Number(moyenneCoachSeance) || 0} size="sm" showScore={false} showText={false} />
            </div>
          </div>

          <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            Basé sur <strong>{avisList.length}</strong> avis de membres vérifiés
          </div>
        </div>

        {/* 1-5 Star Breakdown Progress Bars */}
        <div className="card-glass" style={{ padding: '2rem', background: 'rgba(12, 18, 32, 0.8)' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '1.25rem', color: 'var(--text-white)' }}>
            Répartition des notes de séance
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {starCounts.map(({ star, count, percentage }) => (
              <button
                key={star}
                type="button"
                onClick={() => setSelectedStarFilter(selectedStarFilter === String(star) ? 'ALL' : String(star))}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  background: selectedStarFilter === String(star) ? 'rgba(0, 240, 255, 0.1)' : 'transparent',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '0.25rem 0.5rem',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'background 0.2s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', width: '60px', color: '#fbbf24', fontSize: '0.85rem', fontWeight: '600' }}>
                  <span>{star}</span>
                  <Star size={14} fill="#fbbf24" color="#fbbf24" />
                </div>

                <div
                  style={{
                    flex: 1,
                    height: '10px',
                    borderRadius: '999px',
                    background: 'rgba(255, 255, 255, 0.08)',
                    overflow: 'hidden',
                    position: 'relative',
                  }}
                >
                  <div
                    style={{
                      height: '100%',
                      width: `${percentage}%`,
                      background: 'linear-gradient(90deg, #fbbf24 0%, #f59e0b 100%)',
                      borderRadius: '999px',
                      transition: 'width 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
                      boxShadow: percentage > 0 ? '0 0 10px rgba(251, 191, 36, 0.5)' : 'none',
                    }}
                  />
                </div>

                <div style={{ width: '45px', textAlign: 'right', fontSize: '0.82rem', color: 'var(--text-dim)' }}>
                  {count}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Reviews List Header & Filter */}
      <section>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1.75rem',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div>
            <h2 style={{ fontSize: '1.6rem', marginBottom: '0.25rem' }}>
              Commentaires des membres ({filteredAvis.length})
            </h2>
            <p style={{ fontSize: '0.9rem' }}>
              Retours d'expérience complets et évaluations des coachs par les adhérents.
            </p>
          </div>

          {/* Filter Pills */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            {/* Coach filter */}
            {coaches.length > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <UserCheck size={14} color="var(--text-dim)" />
                <select
                  className="form-select"
                  style={{ padding: '0.35rem 0.75rem', fontSize: '0.82rem', width: 'auto' }}
                  value={selectedCoachFilter}
                  onChange={(e) => setSelectedCoachFilter(e.target.value)}
                >
                  <option value="ALL">Tous les coachs</option>
                  {coaches.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.prenom} {c.nom}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Stars Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <Filter size={14} /> Notes :
              </span>
              {['ALL', '5', '4', '3', '2', '1'].map((option) => (
                <button
                  key={option}
                  onClick={() => setSelectedStarFilter(option)}
                  className={`btn btn-sm ${selectedStarFilter === option ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ padding: '0.35rem 0.65rem' }}
                >
                  {option === 'ALL' ? 'Toutes' : `${option} ★`}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Reviews Cards List */}
        {filteredAvis.length === 0 ? (
          <div className="card-glass" style={{ textAlign: 'center', padding: '3.5rem 1.5rem' }}>
            <MessageSquarePlus size={44} color="var(--text-dim)" style={{ margin: '0 auto 1rem' }} />
            <h3>Aucun avis ne correspond à vos critères</h3>
            <p style={{ marginTop: '0.5rem', marginBottom: '1.5rem' }}>
              {selectedStarFilter !== 'ALL' || selectedCoachFilter !== 'ALL'
                ? 'Aucun avis ne correspond aux filtres sélectionnés. Réinitialisez les filtres.'
                : 'Soyez le premier adhérent à partager vos sensations après cette séance EMS !'}
            </p>
            {selectedStarFilter !== 'ALL' || selectedCoachFilter !== 'ALL' ? (
              <button
                onClick={() => {
                  setSelectedStarFilter('ALL');
                  setSelectedCoachFilter('ALL');
                }}
                className="btn btn-secondary btn-sm"
              >
                Afficher tous les avis
              </button>
            ) : (
              <button onClick={() => handleOpenReviewModal()} className="btn btn-primary btn-sm">
                <Zap size={16} /> Déposer un avis & choisir mon coach
              </button>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {filteredAvis.map((item) => (
              <AvisCard
                key={item.id}
                avis={item}
                currentUserId={user?.id}
                isAdmin={isAdmin}
                onEdit={(a) => {
                  setEditingAvis(a);
                  setIsFormModalOpen(true);
                }}
                onDelete={(a) => setAvisToDelete(a)}
              />
            ))}
          </div>
        )}
      </section>

      {/* Review Form Modal */}
      <AvisFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setEditingAvis(null);
        }}
        seanceId={id}
        seanceNom={seance.nom}
        coaches={coaches}
        initialData={editingAvis}
        onSuccess={handleAvisSuccess}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!avisToDelete}
        onClose={() => setAvisToDelete(null)}
        title="Confirmer la suppression"
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
            Voulez-vous vraiment supprimer cet avis ?
          </h4>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1.75rem' }}>
            Cette action est irréversible. La moyenne globale de la séance sera recalculée immédiatement.
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
              {deleting ? 'Suppression...' : 'Supprimer définitivement'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default SeanceDetail;
