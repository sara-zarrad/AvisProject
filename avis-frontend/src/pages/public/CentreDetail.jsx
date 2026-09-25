import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import centresApi from '../../api/centres';
import seancesApi from '../../api/seances';
import coachesApi from '../../api/coaches';
import avisApi from '../../api/avis';
import {
  Building2,
  MapPin,
  Phone,
  ArrowLeft,
  Dumbbell,
  Zap,
  ArrowRight,
  Loader2,
  ShieldCheck,
  Star,
  UserCheck,
  Award
} from 'lucide-react';
import RatingDisplay from '../../components/common/RatingDisplay';
import Badge from '../../components/common/Badge';

export const CentreDetail = () => {
  const { id } = useParams();
  const [centre, setCentre] = useState(null);
  const [seances, setSeances] = useState([]);
  const [coaches, setCoaches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadCentreAndSeances = async () => {
      try {
        setLoading(true);
        const centreData = await centresApi.getCentreById(id);
        setCentre(centreData);

        // Si le backend renvoie déjà les séances et les coachs avec findUnique(include: { coachs: true, seances: ... })
        if (centreData?.seances && Array.isArray(centreData.seances)) {
          setSeances(centreData.seances);
        } else {
          try {
            const seancesData = await seancesApi.getSeancesByCentre(id);
            setSeances(Array.isArray(seancesData) ? seancesData : []);
          } catch (e) {
            setSeances([]);
          }
        }

        if (centreData?.coachs && Array.isArray(centreData.coachs)) {
          setCoaches(centreData.coachs);
        } else {
          try {
            const coachesData = await coachesApi.getCoachesByCentre(id);
            setCoaches(Array.isArray(coachesData) ? coachesData : []);
          } catch (e) {
            setCoaches([]);
          }
        }
      } catch (err) {
        console.error('Erreur chargement détail centre:', err);
        setError('Impossible de charger les informations de ce centre i-motion.');
      } finally {
        setLoading(false);
      }
    };
    loadCentreAndSeances();
  }, [id]);


  if (loading) {
    return (
      <div className="container" style={{ padding: '5rem 0', textAlign: 'center', color: 'var(--electric-cyan)' }}>
        <Loader2 size={40} className="animate-spin" style={{ margin: '0 auto 1rem' }} />
        <p>Chargement des détails du centre EMS...</p>
      </div>
    );
  }

  if (error || !centre) {
    return (
      <div className="container" style={{ padding: '4rem 1.5rem', textAlign: 'center' }}>
        <div className="card-glass" style={{ maxWidth: '550px', margin: '0 auto', padding: '3rem 2rem' }}>
          <h2 style={{ marginBottom: '1rem', color: '#f87171' }}>Centre introuvable</h2>
          <p style={{ marginBottom: '1.5rem' }}>{error || 'Le centre demandé n\'existe pas ou a été supprimé.'}</p>
          <Link to="/" className="btn btn-primary">
            <ArrowLeft size={16} /> Retour à la liste des centres
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem 5rem' }}>
      {/* Back button */}
      <div style={{ marginBottom: '2rem' }}>
        <Link to="/" className="btn btn-secondary btn-sm" style={{ display: 'inline-flex' }}>
          <ArrowLeft size={16} /> Tous les centres Tunisie
        </Link>
      </div>

      {/* Centre Presentation Card */}
      <div
        className="card-glass"
        style={{
          padding: '2.5rem',
          marginBottom: '3rem',
          position: 'relative',
          background: 'linear-gradient(135deg, rgba(14, 21, 37, 0.9) 0%, rgba(8, 14, 26, 0.95) 100%)',
          border: '1px solid rgba(0, 240, 255, 0.25)',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5), 0 0 30px rgba(0, 240, 255, 0.08)',
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
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <Badge variant="cyan">{centre.ville || 'Tunisie'}</Badge>
              <Badge variant="lime" icon={ShieldCheck}>Équipement i-motion v2 Certifié</Badge>
            </div>
            <h1 style={{ fontSize: '2.25rem', marginBottom: '0.5rem' }}>{centre.nom}</h1>
          </div>

          <div
            style={{
              padding: '0.75rem 1.25rem',
              borderRadius: '12px',
              background: 'rgba(0, 0, 0, 0.4)',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
            }}
          >
            <Dumbbell size={24} color="var(--electric-cyan)" />
            <div>
              <div style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-white)' }}>
                {seances.length}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>
                Séances disponibles
              </div>
            </div>
          </div>
        </div>

        <p style={{ fontSize: '1.05rem', lineHeight: '1.7', color: 'var(--text-main)', maxWidth: '900px', marginBottom: '2rem' }}>
          {centre.description}
        </p>

        {/* Contact Info Box */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1rem',
            padding: '1.25rem',
            borderRadius: '12px',
            background: 'rgba(0, 0, 0, 0.3)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '8px',
                background: 'var(--electric-cyan-dim)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--electric-cyan)',
              }}
            >
              <MapPin size={20} />
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Adresse</div>
              <div style={{ fontSize: '0.92rem', color: 'var(--text-white)', fontWeight: '600' }}>{centre.adresse}</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '8px',
                background: 'var(--electric-lime-dim)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--electric-lime)',
              }}
            >
              <Phone size={20} />
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Téléphone / Réservations</div>
              <a
                href={`tel:${centre.numTel}`}
                style={{ fontSize: '0.92rem', color: 'var(--electric-lime)', fontWeight: '700' }}
              >
                {centre.numTel}
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Équipe de Coachs Certifiés */}
      {coaches.length > 0 && (
        <section style={{ marginBottom: '3.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--electric-cyan)', fontSize: '0.85rem', fontWeight: '700', textTransform: 'uppercase', marginBottom: '0.2rem' }}>
                <UserCheck size={16} /> Équipe Technique
              </div>
              <h2 style={{ fontSize: '1.6rem', marginBottom: '0.25rem' }}>
                Coachs Certifiés i-motion du Centre
              </h2>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                Nos instructeurs experts vous accompagnent lors de chaque session d'électrostimulation sans fil.
              </p>
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '1.25rem',
            }}
          >
            {coaches.map((coach) => (
              <div
                key={coach.id}
                className="card-glass"
                style={{
                  padding: '1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '1rem' }}>
                    <div
                      style={{
                        width: '46px',
                        height: '46px',
                        borderRadius: '12px',
                        background: 'linear-gradient(135deg, rgba(0, 240, 255, 0.2) 0%, rgba(59, 130, 246, 0.2) 100%)',
                        border: '1px solid var(--electric-cyan)',
                        color: 'var(--electric-cyan)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1rem',
                        fontWeight: '800',
                        flexShrink: 0,
                      }}
                    >
                      {coach.avatar || `${coach.prenom?.[0] || 'C'}${coach.nom?.[0] || 'H'}`}
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1.1rem', color: 'var(--text-white)', marginBottom: '0.15rem' }}>
                        {coach.prenom} {coach.nom}
                      </h3>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>
                        {coach.experience || 'Coach EMS Certifié'}
                      </span>
                    </div>
                  </div>

                  <div style={{ marginBottom: '0.75rem' }}>
                    <Badge variant="purple">{coach.specialite}</Badge>
                  </div>

                  {coach.bio && (
                    <p style={{ fontSize: '0.85rem', lineHeight: '1.5', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                      {coach.bio}
                    </p>
                  )}

                  <div
                    style={{
                      marginTop: '0.75rem',
                      paddingTop: '0.75rem',
                      borderTop: '1px solid var(--border-subtle)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '0.5rem',
                    }}
                  >
                    <span style={{ fontSize: '0.78rem', color: '#c084fc', fontWeight: '700' }}>
                      Note Adhérents :
                    </span>
                    <RatingDisplay score={coach.moyenneNote || 0} count={coach.nombreAvis || null} size="sm" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Séances EMS de ce centre */}
      <section>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.75rem' }}>
          <div>
            <h2 style={{ fontSize: '1.6rem', marginBottom: '0.25rem' }}>
              Programmes EMS dispensés au centre
            </h2>
            <p style={{ fontSize: '0.9rem' }}>
              Consultez les notes moyennes et les avis des adhérents pour chaque séance d'électrostimulation.
            </p>
          </div>
        </div>

        {seances.length === 0 ? (
          <div className="card-glass" style={{ textAlign: 'center', padding: '3rem' }}>
            <Dumbbell size={40} color="var(--text-dim)" style={{ margin: '0 auto 1rem' }} />
            <h3>Aucune séance enregistrée pour ce centre pour l'instant</h3>
            <p style={{ marginTop: '0.5rem' }}>Les programmes EMS seront ajoutés prochainement par le responsable du club.</p>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
              gap: '1.5rem',
            }}
          >
            {seances.map((seance) => (
              <div
                key={seance.id}
                className="card-glass card-glass-interactive"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  padding: '1.75rem',
                }}
              >
                <div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '1rem',
                    }}
                  >
                    <Badge variant="purple">{seance.type || 'EMS Général'}</Badge>
                    <RatingDisplay score={seance.moyenneNote || 0} size="sm" />
                  </div>

                  <h3 style={{ fontSize: '1.2rem', marginBottom: '0.75rem' }}>
                    <Link to={`/seances/${seance.id}`} style={{ color: 'var(--text-white)' }}>
                      {seance.nom}
                    </Link>
                  </h3>

                  <p
                    style={{
                      fontSize: '0.88rem',
                      lineHeight: '1.6',
                      color: 'var(--text-muted)',
                      marginBottom: '1rem',
                    }}
                  >
                    {seance.description}
                  </p>

                  {seance.coaches && seance.coaches.length > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Coaches :</span>
                      {seance.coaches.map((c) => (
                        <span
                          key={c.id}
                          style={{
                            fontSize: '0.75rem',
                            padding: '0.15rem 0.5rem',
                            borderRadius: '999px',
                            background: 'rgba(0, 240, 255, 0.08)',
                            border: '1px solid rgba(0, 240, 255, 0.2)',
                            color: 'var(--electric-cyan)',
                          }}
                        >
                          {c.prenom} {c.nom}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div
                  style={{
                    borderTop: '1px solid var(--border-subtle)',
                    paddingTop: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#fbbf24', fontSize: '0.85rem', fontWeight: '600' }}>
                    <Star size={16} fill="#fbbf24" />
                    <span>{seance.moyenneNote ? `${seance.moyenneNote.toFixed(1)} / 5` : 'Nouveau'}</span>
                  </div>

                  <Link to={`/seances/${seance.id}`} className="btn btn-primary btn-sm">
                    Voir les avis <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default CentreDetail;
