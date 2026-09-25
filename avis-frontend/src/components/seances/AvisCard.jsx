import React from 'react';
import { User, Calendar, Edit3, Trash2, CheckCircle2, UserCheck, Dumbbell, Zap, Star } from 'lucide-react';
import RatingDisplay from '../common/RatingDisplay';

export const AvisCard = ({
  avis,
  currentUserId,
  isAdmin = false,
  onEdit = null,
  onDelete = null,
}) => {
  const isAuthor = currentUserId && String(avis.utilisateurId) === String(currentUserId);
  const canModify = isAuthor;

  const formatDate = (dateStr) => {
    try {
      const d = new Date(dateStr);
      return new Intl.DateTimeFormat('fr-FR', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }).format(d);
    } catch {
      return dateStr;
    }
  };

  const noteCoachVal = avis.noteCoach !== undefined ? Number(avis.noteCoach) : Number(avis.note);

  return (
    <div
      className="card-glass"
      style={{
        padding: '1.4rem',
        marginBottom: '1rem',
        border: isAuthor ? '1px solid rgba(0, 240, 255, 0.3)' : '1px solid var(--border-subtle)',
        background: isAuthor ? 'rgba(0, 240, 255, 0.03)' : 'var(--bg-card)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: '1rem',
          marginBottom: '0.9rem',
          flexWrap: 'wrap',
        }}
      >
        {/* Author info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              background: isAuthor
                ? 'linear-gradient(135deg, #00f0ff 0%, #3b82f6 100%)'
                : 'rgba(255, 255, 255, 0.08)',
              color: isAuthor ? '#06090f' : 'var(--text-white)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: '700',
              fontSize: '1rem',
            }}
          >
            {avis.utilisateurNom ? avis.utilisateurNom[0].toUpperCase() : <User size={20} />}
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <span style={{ fontWeight: '700', color: 'var(--text-white)', fontSize: '0.95rem' }}>
                {avis.utilisateurNom || 'Membre EMS'}
              </span>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.2rem',
                  fontSize: '0.72rem',
                  color: 'var(--electric-lime)',
                  background: 'var(--electric-lime-dim)',
                  padding: '0.15rem 0.45rem',
                  borderRadius: '999px',
                }}
              >
                <CheckCircle2 size={11} /> Expérience vérifiée
              </span>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                fontSize: '0.78rem',
                color: 'var(--text-dim)',
                marginTop: '0.15rem',
              }}
            >
              <Calendar size={13} />
              <span>{formatDate(avis.dateCreation)}</span>
              {avis.dateModification && <span>(modifié)</span>}
            </div>
          </div>
        </div>

        {/* Dual Ratings & Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          {/* Séance Rating Badge */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.3rem 0.6rem',
              borderRadius: '8px',
              background: 'rgba(0, 240, 255, 0.08)',
              border: '1px solid rgba(0, 240, 255, 0.25)',
            }}
            title="Note attribuée à la séance"
          >
            <span style={{ fontSize: '0.75rem', color: 'var(--electric-cyan)', fontWeight: '700' }}>
              Séance :
            </span>
            <RatingDisplay score={avis.note} showText={false} size="sm" />
          </div>

          {/* Coach Rating Badge */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.3rem 0.6rem',
              borderRadius: '8px',
              background: 'rgba(168, 85, 247, 0.08)',
              border: '1px solid rgba(168, 85, 247, 0.25)',
            }}
            title="Note attribuée au coach"
          >
            <span style={{ fontSize: '0.75rem', color: '#c084fc', fontWeight: '700' }}>
              Coach :
            </span>
            <RatingDisplay score={noteCoachVal} showText={false} size="sm" />
          </div>

          {canModify && (
            <div style={{ display: 'flex', gap: '0.35rem', marginLeft: '0.25rem' }}>
              {onEdit && isAuthor && (
                <button
                  onClick={() => onEdit(avis)}
                  className="btn btn-secondary btn-icon"
                  style={{ padding: '0.4rem' }}
                  title="Modifier mon avis"
                >
                  <Edit3 size={15} color="var(--electric-cyan)" />
                </button>
              )}
              {onDelete && isAuthor && (
                <button
                  onClick={() => onDelete(avis)}
                  className="btn btn-danger btn-icon"
                  style={{ padding: '0.4rem' }}
                  title="Supprimer mon avis"
                >
                  <Trash2 size={15} />
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Evaluated Coach Tag */}
      {avis.coachNom && (
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.35rem 0.85rem',
            borderRadius: '999px',
            background: 'rgba(168, 85, 247, 0.08)',
            border: '1px solid rgba(168, 85, 247, 0.25)',
            marginBottom: '0.9rem',
            fontSize: '0.82rem',
            flexWrap: 'wrap',
          }}
        >
          <UserCheck size={14} color="#c084fc" />
          <span style={{ color: 'var(--text-dim)' }}>Coaché par :</span>
          <strong style={{ color: 'var(--text-white)' }}>{avis.coachNom}</strong>
          {avis.coachSpecialite && (
            <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>
              ({avis.coachSpecialite})
            </span>
          )}
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: '#fbbf24', marginLeft: '0.35rem', fontSize: '0.8rem', fontWeight: '700' }}>
            <Star size={12} fill="#fbbf24" /> {noteCoachVal.toFixed(1)}/5
          </span>
        </div>
      )}

      {/* Commentary text */}
      <p
        style={{
          fontSize: '0.95rem',
          lineHeight: '1.65',
          color: 'var(--text-main)',
          whiteSpace: 'pre-line',
        }}
      >
        {avis.commentaire}
      </p>

      {/* Session/Center metadata if present */}
      {(avis.seanceNom || avis.centreNom) && (
        <div
          style={{
            marginTop: '0.9rem',
            paddingTop: '0.75rem',
            borderTop: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.8rem',
            color: 'var(--text-dim)',
          }}
        >
          <span>Séance : <strong style={{ color: 'var(--electric-cyan)' }}>{avis.seanceNom}</strong></span>
          {avis.centreNom && <span>• {avis.centreNom}</span>}
        </div>
      )}
    </div>
  );
};

export default AvisCard;
