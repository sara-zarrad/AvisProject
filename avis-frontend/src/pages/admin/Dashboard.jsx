import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import dashboardApi from '../../api/dashboard';
import avisApi from '../../api/avis';
import {
  Building2,
  Dumbbell,
  Users,
  UserCheck,
  MessageSquare,
  Star,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  Shield,
  Loader2,
  Zap,
  Activity,
  Award,
  Sparkles,
  Search,
  Filter,
  Smile,
  Meh,
  Frown,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';
import RatingDisplay from '../../components/common/RatingDisplay';
import Badge from '../../components/common/Badge';
import Toast from '../../components/common/Toast';

export const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [allAvis, setAllAvis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [repartitionTab, setRepartitionTab] = useState('seances'); // 'seances' | 'coaches'

  // Avis filters & search
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRating, setFilterRating] = useState('all');
  const [filterSentiment, setFilterSentiment] = useState('all'); // 'all' | 'POSITIF' | 'NEUTRE' | 'NEGATIF'
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const [toast, setToast] = useState(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsData, reviewsData] = await Promise.all([
        dashboardApi.getDashboardStats(),
        avisApi.getAllAvis().catch(() => [])
      ]);
      setStats(statsData);

      // Si reviewsData est retourné, on l'utilise pour la liste complète
      if (reviewsData && reviewsData.length > 0) {
        setAllAvis(reviewsData);
      } else if (statsData?.derniersAvis) {
        setAllAvis(statsData.derniersAvis);
      }
    } catch (err) {
      console.error('Erreur stats dashboard:', err);
      setError('Impossible de charger les données du tableau de bord administrateur.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  /**
   * Normalisation et extraction du sentiment réel de l'avis provenant du backend / IA
   * Valeurs exactes supportées : 'POSITIF', 'NEUTRE', 'NEGATIF'
   */
  const getReviewSentiment = (avis) => {
    if (!avis) return 'NEUTRE';
    if (avis.sentiment) {
      const s = String(avis.sentiment).toUpperCase().trim();
      if (s === 'POSITIF' || s === 'POSITIVE' || s.startsWith('POS') || s === '5' || s === '4' || s === 'LABEL_2') return 'POSITIF';
      if (s === 'NEGATIF' || s === 'NEGATIVE' || s.startsWith('NEG') || s === '1' || s === '2' || s === 'LABEL_0') return 'NEGATIF';
      if (s === 'NEUTRE' || s === 'NEUTRAL' || s.startsWith('NEU') || s === '3' || s === 'LABEL_1') return 'NEUTRE';
      return s;
    }
    // Fallback dynamique si le champ sentiment en BD est null / non encore renseigné par l'IA
    const n = Number(avis.note);
    if (n >= 4) return 'POSITIF';
    if (n === 3) return 'NEUTRE';
    if (n > 0) return 'NEGATIF';
    return 'NEUTRE';
  };

  // Statistiques de sentiments basées sur les données réelles
  const sentimentStats = useMemo(() => {
    const total = allAvis.length;
    let pos = 0, neu = 0, neg = 0;
    allAvis.forEach((a) => {
      const s = getReviewSentiment(a);
      if (s === 'POSITIF') pos++;
      else if (s === 'NEUTRE') neu++;
      else if (s === 'NEGATIF') neg++;
    });
    return {
      total,
      positif: pos,
      neutre: neu,
      negatif: neg,
    };
  }, [allAvis]);

  // Filtrage combiné (Sentiment réel, Note, Recherche textuelle)
  const filteredAvis = useMemo(() => {
    return allAvis.filter((a) => {
      const sentiment = getReviewSentiment(a);
      const noteSeance = Number(a.note);

      // Filtre de sentiment (POSITIF, NEUTRE, NEGATIF)
      const matchSentiment =
        filterSentiment === 'all' ||
        (filterSentiment === 'POSITIF' && sentiment === 'POSITIF') ||
        (filterSentiment === 'NEUTRE' && sentiment === 'NEUTRE') ||
        (filterSentiment === 'NEGATIF' && sentiment === 'NEGATIF');

      // Filtre de note (1 à 5)
      const matchRating = filterRating === 'all' || noteSeance === Number(filterRating);

      // Recherche textuelle (nom membre, commentaire, séance, coach)
      const query = searchTerm.toLowerCase().trim();
      const matchSearch =
        !query ||
        (a.utilisateurNom && a.utilisateurNom.toLowerCase().includes(query)) ||
        (a.commentaire && a.commentaire.toLowerCase().includes(query)) ||
        (a.seanceNom && a.seanceNom.toLowerCase().includes(query)) ||
        (a.coachNom && a.coachNom.toLowerCase().includes(query));

      return matchSentiment && matchRating && matchSearch;
    });
  }, [allAvis, filterSentiment, filterRating, searchTerm]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredAvis.length / itemsPerPage));
  const paginatedAvis = filteredAvis.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  if (loading) {
    return (
      <div className="container" style={{ padding: '5rem 0', textAlign: 'center', color: 'var(--electric-cyan)' }}>
        <Loader2 size={40} className="animate-spin" style={{ margin: '0 auto 1rem' }} />
        <p>Chargement des statistiques et KPIs de la plateforme...</p>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="container" style={{ padding: '4rem 1.5rem', textAlign: 'center' }}>
        <div className="card-glass" style={{ maxWidth: '550px', margin: '0 auto', padding: '3rem 2rem' }}>
          <h2 style={{ color: '#f87171', marginBottom: '1rem' }}>Erreur du Dashboard</h2>
          <p>{error || 'Impossible de récupérer les statistiques.'}</p>
          <button onClick={fetchDashboardData} className="btn btn-primary" style={{ marginTop: '1.5rem' }}>
            <RefreshCw size={16} /> Réessayer
          </button>
        </div>
      </div>
    );
  }

  const {
    totalCentres,
    totalSeances,
    totalCoaches,
    totalMembres,
    totalAvis,
    moyenneGlobale,
    moyenneGlobaleSeances,
    moyenneGlobaleCoaches,
    repartitionNotes,
    repartitionNotesCoach,
    topCoaches,
    topSeances,
  } = stats;

  const currentRepartition = repartitionTab === 'seances' ? repartitionNotes : repartitionNotesCoach;
  const totalVotesRepartition = Object.values(currentRepartition || {}).reduce((a, b) => a + b, 0);

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem 5rem' }}>
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}

      {/* Header */}
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
            <Shield size={20} color="#f43f5e" />
            <span style={{ fontSize: '0.85rem', color: '#fda4af', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: '700' }}>
              Panneau d'Administration
            </span>
          </div>
          <h1 style={{ fontSize: '2.2rem' }}>Tableau de Bord & Métriques EMS</h1>
          <p style={{ fontSize: '0.95rem' }}>
            Vue globale des performances, de la satisfaction adhérents, des coachs certifiés et des avis déposés.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Link to="/admin/centres" className="btn btn-secondary btn-sm">
            <Building2 size={16} /> Gérer les Centres
          </Link>
          <Link to="/admin/seances" className="btn btn-secondary btn-sm">
            <Dumbbell size={16} /> Gérer les Séances
          </Link>
          <Link to="/admin/coaches" className="btn btn-primary btn-sm">
            <UserCheck size={16} /> Gérer les Coachs
          </Link>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1.25rem',
          marginBottom: '2.5rem',
        }}
      >
        {/* KPI 1: Centres */}
        <div className="card-glass" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: '700' }}>
              Centres i-motion
            </span>
            <div style={{ padding: '0.4rem', borderRadius: '8px', background: 'var(--electric-cyan-dim)', color: 'var(--electric-cyan)' }}>
              <Building2 size={18} />
            </div>
          </div>
          <div style={{ fontSize: '2.4rem', fontWeight: '800', color: 'var(--text-white)' }}>
            {totalCentres}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--electric-cyan)', marginTop: '0.25rem' }}>
            Studios EMS en Tunisie
          </div>
        </div>

        {/* KPI 2: Séances */}
        <div className="card-glass" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: '700' }}>
              Programmes EMS
            </span>
            <div style={{ padding: '0.4rem', borderRadius: '8px', background: 'rgba(168, 85, 247, 0.15)', color: '#c084fc' }}>
              <Dumbbell size={18} />
            </div>
          </div>
          <div style={{ fontSize: '2.4rem', fontWeight: '800', color: 'var(--text-white)' }}>
            {totalSeances}
          </div>
          <div style={{ fontSize: '0.8rem', color: '#c084fc', marginTop: '0.25rem' }}>
            Moyenne : <strong style={{ color: '#fbbf24' }}>{moyenneGlobaleSeances?.toFixed(2) || '0.00'} ★</strong>
          </div>
        </div>

        {/* KPI: Coaches */}
        <Link to="/admin/coaches" className="card-glass card-glass-interactive" style={{ padding: '1.5rem', textDecoration: 'none' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: '700' }}>
              Coachs Certifiés
            </span>
            <div style={{ padding: '0.4rem', borderRadius: '8px', background: 'rgba(0, 240, 255, 0.15)', color: 'var(--electric-cyan)' }}>
              <UserCheck size={18} />
            </div>
          </div>
          <div style={{ fontSize: '2.4rem', fontWeight: '800', color: 'var(--text-white)' }}>
            {totalCoaches}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--electric-cyan)', marginTop: '0.25rem' }}>
            Moyenne : <strong style={{ color: '#fbbf24' }}>{moyenneGlobaleCoaches?.toFixed(2) || '0.00'} ★</strong>
          </div>
        </Link>

        {/* KPI 3: Membres */}
        <div className="card-glass" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: '700' }}>
              Membres Inscrits
            </span>
            <div style={{ padding: '0.4rem', borderRadius: '8px', background: 'var(--electric-lime-dim)', color: 'var(--electric-lime)' }}>
              <Users size={18} />
            </div>
          </div>
          <div style={{ fontSize: '2.4rem', fontWeight: '800', color: 'var(--text-white)' }}>
            {totalMembres}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--electric-lime)', marginTop: '0.25rem' }}>
            Adhérents actifs
          </div>
        </div>

        {/* KPI 4: Avis */}
        <div className="card-glass" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: '700' }}>
              Avis Déposés
            </span>
            <div style={{ padding: '0.4rem', borderRadius: '8px', background: 'var(--electric-yellow-dim)', color: '#fbbf24' }}>
              <MessageSquare size={18} />
            </div>
          </div>
          <div style={{ fontSize: '2.4rem', fontWeight: '800', color: 'var(--text-white)' }}>
            {allAvis.length || totalAvis}
          </div>
          <div style={{ fontSize: '0.8rem', color: '#fbbf24', marginTop: '0.25rem' }}>
            Évaluations vérifiées
          </div>
        </div>
      </div>

      {/* Analytical Section (Moyennes Duales + Graphique de répartition) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
          gap: '1.75rem',
          marginBottom: '2.5rem',
        }}
      >
        {/* Moyennes de Satisfaction Duales (Séance & Coach) */}
        <div
          className="card-glass"
          style={{
            padding: '2.25rem',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            background: 'linear-gradient(135deg, rgba(14, 21, 37, 0.95) 0%, rgba(10, 16, 30, 0.9) 100%)',
            border: '1px solid rgba(0, 240, 255, 0.25)',
          }}
        >
          <div style={{ fontSize: '0.85rem', textTransform: 'uppercase', color: 'var(--text-dim)', fontWeight: '700', letterSpacing: '0.08em', marginBottom: '1.25rem' }}>
            Scores Globaux de Satisfaction
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '1.5rem',
              padding: '1.25rem',
              borderRadius: '16px',
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
            }}
          >
            {/* Colonne 1 : Séances */}
            <div style={{ borderRight: '1px solid var(--border-subtle)', paddingRight: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', color: 'var(--electric-cyan)', fontSize: '0.85rem', fontWeight: '700', marginBottom: '0.4rem' }}>
                <Zap size={16} /> Séances EMS
              </div>
              <div style={{ fontSize: '2.6rem', fontWeight: '900', color: 'var(--text-white)' }}>
                {moyenneGlobaleSeances ? moyenneGlobaleSeances.toFixed(1) : '0.0'}
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', margin: '0.4rem 0' }}>
                <RatingDisplay score={moyenneGlobaleSeances || 0} size="md" showText={false} />
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                Qualité du protocole
              </span>
            </div>

            {/* Colonne 2 : Coaches */}
            <div style={{ paddingLeft: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', color: '#c084fc', fontSize: '0.85rem', fontWeight: '700', marginBottom: '0.4rem' }}>
                <UserCheck size={16} /> Coachs i-motion
              </div>
              <div style={{ fontSize: '2.6rem', fontWeight: '900', color: 'var(--text-white)' }}>
                {moyenneGlobaleCoaches ? moyenneGlobaleCoaches.toFixed(1) : '0.0'}
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', margin: '0.4rem 0' }}>
                <RatingDisplay score={moyenneGlobaleCoaches || 0} size="md" showText={false} />
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                Encadrement & Pédagogie
              </span>
            </div>
          </div>

          <div
            style={{
              marginTop: '1.25rem',
              padding: '0.75rem 1rem',
              borderRadius: '10px',
              background: 'rgba(0, 240, 255, 0.05)',
              border: '1px solid rgba(0, 240, 255, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <span style={{ fontSize: '0.82rem', color: 'var(--text-main)' }}>
              Note globale pondérée :
            </span>
            <strong style={{ fontSize: '1.1rem', color: '#fbbf24' }}>
              {moyenneGlobale ? moyenneGlobale.toFixed(2) : '0.00'} / 5 ★
            </strong>
          </div>
        </div>

        {/* Répartition des Notes */}
        <div className="card-glass" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <h3 style={{ fontSize: '1.15rem', color: 'var(--text-white)' }}>
              Répartition des Évaluations
            </h3>

            {/* Toggle Onglets Séances / Coaches */}
            <div style={{ display: 'flex', background: 'rgba(255, 255, 255, 0.06)', borderRadius: '8px', padding: '0.2rem' }}>
              <button
                type="button"
                onClick={() => setRepartitionTab('seances')}
                style={{
                  padding: '0.35rem 0.75rem',
                  borderRadius: '6px',
                  border: 'none',
                  background: repartitionTab === 'seances' ? 'var(--electric-cyan)' : 'transparent',
                  color: repartitionTab === 'seances' ? '#06090f' : 'var(--text-dim)',
                  fontWeight: '700',
                  fontSize: '0.78rem',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                Séances
              </button>
              <button
                type="button"
                onClick={() => setRepartitionTab('coaches')}
                style={{
                  padding: '0.35rem 0.75rem',
                  borderRadius: '6px',
                  border: 'none',
                  background: repartitionTab === 'coaches' ? '#a855f7' : 'transparent',
                  color: repartitionTab === 'coaches' ? '#fff' : 'var(--text-dim)',
                  fontWeight: '700',
                  fontSize: '0.78rem',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                Coachs
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
            {[5, 4, 3, 2, 1].map((star) => {
              const count = currentRepartition?.[star] || 0;
              const percent = totalVotesRepartition > 0 ? Math.round((count / totalVotesRepartition) * 100) : 0;

              return (
                <div key={star} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', width: '50px', fontSize: '0.9rem', fontWeight: '700', color: '#fbbf24' }}>
                    <span>{star}</span>
                    <Star size={15} fill="#fbbf24" />
                  </div>

                  <div
                    style={{
                      flex: 1,
                      height: '14px',
                      borderRadius: '999px',
                      background: 'rgba(255, 255, 255, 0.08)',
                      overflow: 'hidden',
                      position: 'relative',
                    }}
                  >
                    <div
                      style={{
                        height: '100%',
                        width: `${percent}%`,
                        background:
                          repartitionTab === 'coaches'
                            ? star >= 4
                              ? 'linear-gradient(90deg, #a855f7 0%, #3b82f6 100%)'
                              : star === 3
                                ? 'linear-gradient(90deg, #fbbf24 0%, #f59e0b 100%)'
                                : 'linear-gradient(90deg, #f43f5e 0%, #fb7185 100%)'
                            : star >= 4
                              ? 'linear-gradient(90deg, #10b981 0%, #00f0ff 100%)'
                              : star === 3
                                ? 'linear-gradient(90deg, #fbbf24 0%, #f59e0b 100%)'
                                : 'linear-gradient(90deg, #f43f5e 0%, #fb7185 100%)',
                        borderRadius: '999px',
                        transition: 'width 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
                        boxShadow: percent > 0 ? '0 0 10px rgba(0, 240, 255, 0.3)' : 'none',
                      }}
                    />
                  </div>

                  <div style={{ width: '80px', textAlign: 'right', fontSize: '0.85rem' }}>
                    <strong style={{ color: 'var(--text-white)' }}>{count}</strong>{' '}
                    <span style={{ color: 'var(--text-dim)', fontSize: '0.78rem' }}>({percent}%)</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Leaderboard: Top Coaches & Top Sessions */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: '1.75rem',
          marginBottom: '2.5rem',
        }}
      >
        {/* Top Coaches */}
        <div className="card-glass" style={{ padding: '1.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <UserCheck size={20} color="#c084fc" />
              <h3 style={{ fontSize: '1.15rem', color: 'var(--text-white)' }}>
                Top Coachs les Mieux Notés
              </h3>
            </div>
            <Link to="/admin/coaches" style={{ fontSize: '0.8rem', color: 'var(--electric-cyan)' }}>
              Voir tous
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {topCoaches?.map((c, idx) => (
              <div
                key={c.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.85rem 1rem',
                  borderRadius: '10px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      background: idx === 0 ? '#fbbf24' : idx === 1 ? '#cbd5e1' : 'rgba(255, 255, 255, 0.1)',
                      color: idx === 0 ? '#000' : 'var(--text-white)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: '800',
                      fontSize: '0.78rem',
                    }}
                  >
                    {idx + 1}
                  </div>
                  <div>
                    <div style={{ fontWeight: '600', color: 'var(--text-white)', fontSize: '0.92rem' }}>
                      {c.prenom} {c.nom}
                    </div>
                    <div style={{ fontSize: '0.76rem', color: 'var(--text-dim)' }}>
                      {c.centreNom} • {c.specialite}
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <RatingDisplay score={c.moyenneNote || 0} size="sm" showText={false} />
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-dim)' }}>
                    {c.nombreAvis} avis coach
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Sessions */}
        <div className="card-glass" style={{ padding: '1.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <TrendingUp size={20} color="var(--electric-lime)" />
              <h3 style={{ fontSize: '1.15rem', color: 'var(--text-white)' }}>
                Top Séances les Mieux Notées
              </h3>
            </div>
            <Link to="/admin/seances" style={{ fontSize: '0.8rem', color: 'var(--electric-cyan)' }}>
              Voir toutes
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {topSeances?.map((s, idx) => (
              <div
                key={s.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.85rem 1rem',
                  borderRadius: '10px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      background: idx === 0 ? '#fbbf24' : idx === 1 ? '#cbd5e1' : 'rgba(255, 255, 255, 0.1)',
                      color: idx === 0 ? '#000' : 'var(--text-white)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: '800',
                      fontSize: '0.78rem',
                    }}
                  >
                    {idx + 1}
                  </div>
                  <div>
                    <Link to={`/seances/${s.id}`} style={{ fontWeight: '600', color: 'var(--text-white)', fontSize: '0.92rem' }}>
                      {s.nom}
                    </Link>
                    <div style={{ fontSize: '0.76rem', color: 'var(--text-dim)' }}>
                      {s.centreNom}
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <RatingDisplay score={s.moyenneNote} size="sm" showText={false} />
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-dim)' }}>
                    {s.nombreAvis} avis séance
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* =========================================================================
          SECTION DÉDIÉE : CENTRE DE GESTION & ANALYSE DES AVIS (REVIEWS & AI)
          ========================================================================= */}
      <div className="card-glass" style={{ padding: '2rem', border: '1px solid rgba(0, 240, 255, 0.2)' }}>
        {/* Header de la section Avis */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.3rem' }}>
              <div style={{ padding: '0.35rem', borderRadius: '8px', background: 'rgba(0, 240, 255, 0.15)', color: 'var(--electric-cyan)' }}>
                <Activity size={20} />
              </div>
              <h2 style={{ fontSize: '1.4rem', color: 'var(--text-white)', margin: 0 }}>
                Avis & Analyse de Sentiment IA
              </h2>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)', margin: 0 }}>
              Consultez et filtrez les avis selon leur classification de sentiment (POSITIF, NEUTRE, NEGATIF).
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span
              style={{
                fontSize: '0.85rem',
                color: 'var(--electric-cyan)',
                background: 'rgba(0, 240, 255, 0.08)',
                padding: '0.4rem 0.8rem',
                borderRadius: '8px',
                border: '1px solid rgba(0, 240, 255, 0.2)',
                fontWeight: '700'
              }}
            >
              {filteredAvis.length} {filteredAvis.length > 1 ? 'avis affichés' : 'avis affiché'}
            </span>
          </div>
        </div>

        {/* Statistics Cards par sentiment réel (Données réelles de la BD/API) */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
            gap: '1rem',
            padding: '1.25rem',
            borderRadius: '12px',
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid var(--border-subtle)',
            marginBottom: '1.75rem',
          }}
        >
          {/* Total Avis */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ padding: '0.6rem', borderRadius: '50%', background: 'rgba(0, 240, 255, 0.12)', color: 'var(--electric-cyan)' }}>
              <MessageSquare size={20} />
            </div>
            <div>
              <div style={{ fontSize: '1.3rem', fontWeight: '800', color: 'var(--text-white)' }}>
                {sentimentStats.total}
              </div>
              <div style={{ fontSize: '0.76rem', color: 'var(--text-dim)', fontWeight: '600' }}>
                Total avis
              </div>
            </div>
          </div>

          {/* 🟢 Positifs */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ padding: '0.6rem', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
              <Smile size={20} />
            </div>
            <div>
              <div style={{ fontSize: '1.3rem', fontWeight: '800', color: '#34d399' }}>
                {sentimentStats.positif}
              </div>
              <div style={{ fontSize: '0.76rem', color: 'var(--text-dim)', fontWeight: '600' }}>
                🟢 Positifs
              </div>
            </div>
          </div>

          {/* 🟡 Neutres */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ padding: '0.6rem', borderRadius: '50%', background: 'rgba(251, 191, 36, 0.15)', color: '#fbbf24' }}>
              <Meh size={20} />
            </div>
            <div>
              <div style={{ fontSize: '1.3rem', fontWeight: '800', color: '#fbbf24' }}>
                {sentimentStats.neutre}
              </div>
              <div style={{ fontSize: '0.76rem', color: 'var(--text-dim)', fontWeight: '600' }}>
                🟡 Neutres
              </div>
            </div>
          </div>

          {/* 🔴 Négatifs */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ padding: '0.6rem', borderRadius: '50%', background: 'rgba(244, 63, 94, 0.15)', color: '#f43f5e' }}>
              <Frown size={20} />
            </div>
            <div>
              <div style={{ fontSize: '1.3rem', fontWeight: '800', color: '#f43f5e' }}>
                {sentimentStats.negatif}
              </div>
              <div style={{ fontSize: '0.76rem', color: 'var(--text-dim)', fontWeight: '600' }}>
                🔴 Négatifs
              </div>
            </div>
          </div>
        </div>

        {/* Filtre de Sentiment Rapide (Boutons [Tous] [🟢 Positifs] [🟡 Neutres] [🔴 Négatifs]) */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.65rem' }}>
            <Filter size={15} color="var(--electric-cyan)" />
            <span style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-white)' }}>
              Filtrer par Sentiment :
            </span>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
            {/* Tous les avis */}
            <button
              type="button"
              onClick={() => {
                setFilterSentiment('all');
                setCurrentPage(1);
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.5rem 0.9rem',
                borderRadius: '8px',
                border: filterSentiment === 'all' ? '1.5px solid var(--electric-cyan)' : '1px solid var(--border-subtle)',
                background: filterSentiment === 'all' ? 'rgba(0, 240, 255, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                color: filterSentiment === 'all' ? 'var(--electric-cyan)' : 'var(--text-main)',
                fontWeight: '700',
                fontSize: '0.82rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              Tous les avis ({sentimentStats.total})
            </button>

            {/* Positifs */}
            <button
              type="button"
              onClick={() => {
                setFilterSentiment('POSITIF');
                setCurrentPage(1);
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.5rem 0.9rem',
                borderRadius: '8px',
                border: filterSentiment === 'POSITIF' ? '1.5px solid #10b981' : '1px solid var(--border-subtle)',
                background: filterSentiment === 'POSITIF' ? 'rgba(16, 185, 129, 0.18)' : 'rgba(255, 255, 255, 0.03)',
                color: filterSentiment === 'POSITIF' ? '#34d399' : 'var(--text-main)',
                fontWeight: '700',
                fontSize: '0.82rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              🟢 Positifs ({sentimentStats.positif})
            </button>

            {/* Neutres */}
            <button
              type="button"
              onClick={() => {
                setFilterSentiment('NEUTRE');
                setCurrentPage(1);
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.5rem 0.9rem',
                borderRadius: '8px',
                border: filterSentiment === 'NEUTRE' ? '1.5px solid #f59e0b' : '1px solid var(--border-subtle)',
                background: filterSentiment === 'NEUTRE' ? 'rgba(245, 158, 11, 0.18)' : 'rgba(255, 255, 255, 0.03)',
                color: filterSentiment === 'NEUTRE' ? '#fbbf24' : 'var(--text-main)',
                fontWeight: '700',
                fontSize: '0.82rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              🟡 Neutres ({sentimentStats.neutre})
            </button>

            {/* Négatifs */}
            <button
              type="button"
              onClick={() => {
                setFilterSentiment('NEGATIF');
                setCurrentPage(1);
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.5rem 0.9rem',
                borderRadius: '8px',
                border: filterSentiment === 'NEGATIF' ? '1.5px solid #f43f5e' : '1px solid var(--border-subtle)',
                background: filterSentiment === 'NEGATIF' ? 'rgba(244, 63, 94, 0.18)' : 'rgba(255, 255, 255, 0.03)',
                color: filterSentiment === 'NEGATIF' ? '#fda4af' : 'var(--text-main)',
                fontWeight: '700',
                fontSize: '0.82rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              🔴 Négatifs ({sentimentStats.negatif})
            </button>
          </div>
        </div>

        {/* Barre de Recherche et Filtre par Note */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '1rem',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1.5rem',
            paddingBottom: '1.25rem',
            borderBottom: '1px solid var(--border-subtle)',
          }}
        >
          {/* Recherche */}
          <div style={{ position: 'relative', flex: '1 1 280px', minWidth: '220px' }}>
            <Search size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
            <input
              type="text"
              placeholder="Rechercher par membre, séance, coach, mot-clé..."
              className="form-input"
              style={{ paddingLeft: '2.5rem', width: '100%' }}
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>

          {/* Filtre Note */}
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <select
              className="form-select"
              style={{ width: 'auto', minWidth: '140px' }}
              value={filterRating}
              onChange={(e) => {
                setFilterRating(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="all">Toutes notes ★</option>
              <option value="5">5 Étoiles ★★★★★</option>
              <option value="4">4 Étoiles ★★★★</option>
              <option value="3">3 Étoiles ★★★</option>
              <option value="2">2 Étoiles ★★</option>
              <option value="1">1 Étoile ★</option>
            </select>

            {(searchTerm || filterRating !== 'all' || filterSentiment !== 'all') && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('');
                  setFilterRating('all');
                  setFilterSentiment('all');
                  setCurrentPage(1);
                }}
                className="btn btn-secondary btn-sm"
              >
                Réinitialiser
              </button>
            )}
          </div>
        </div>

        {/* Liste des avis */}
        {paginatedAvis.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-dim)' }}>
            <MessageSquare size={36} style={{ margin: '0 auto 0.75rem', opacity: 0.5 }} />
            <p style={{ fontSize: '1rem', color: 'var(--text-white)', fontWeight: '600' }}>
              Aucun avis ne correspond aux filtres sélectionnés.
            </p>
            <p style={{ fontSize: '0.85rem' }}>
              Modifiez le filtre de sentiment ou réinitialisez la recherche.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {paginatedAvis.map((a) => {
              const noteCoachVal = a.noteCoach !== undefined ? Number(a.noteCoach) : Number(a.note);
              const sentiment = getReviewSentiment(a);

              return (
                <div
                  key={a.id}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    gap: '1.25rem',
                    padding: '1.25rem 1.5rem',
                    borderRadius: '12px',
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid var(--border-subtle)',
                    transition: 'all 0.2s ease',
                    flexWrap: 'wrap',
                  }}
                >
                  <div style={{ flex: '1 1 360px', minWidth: '280px' }}>
                    {/* Header avis : Utilisateur, séance, coach, date, sentiment */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                      <div
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          background: 'linear-gradient(135deg, #00f0ff 0%, #3b82f6 100%)',
                          color: '#06090f',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: '800',
                          fontSize: '0.82rem',
                          flexShrink: 0
                        }}
                      >
                        {a.utilisateurNom ? a.utilisateurNom[0].toUpperCase() : 'M'}
                      </div>

                      <strong style={{ color: 'var(--text-white)', fontSize: '0.95rem' }}>
                        {a.utilisateurNom || 'Membre EMS'}
                      </strong>

                      <span style={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>sur</span>

                      <Link
                        to={`/seances/${a.seanceId}`}
                        style={{ color: 'var(--electric-cyan)', fontSize: '0.9rem', fontWeight: '600', textDecoration: 'none' }}
                      >
                        {a.seanceNom || `Séance #${a.seanceId}`}
                      </Link>

                      {a.coachNom && (
                        <span
                          style={{
                            fontSize: '0.74rem',
                            color: '#c084fc',
                            background: 'rgba(168, 85, 247, 0.1)',
                            border: '1px solid rgba(168, 85, 247, 0.25)',
                            padding: '0.15rem 0.55rem',
                            borderRadius: '999px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.3rem',
                            fontWeight: '600'
                          }}
                        >
                          <UserCheck size={12} /> Coach : {a.coachNom}
                        </span>
                      )}

                      {/* Badges explicites de sentiment : 🟢 POSITIF, 🟡 NEUTRE, 🔴 NEGATIF */}
                      {sentiment === 'POSITIF' && (
                        <span
                          style={{
                            fontSize: '0.74rem',
                            color: '#34d399',
                            background: 'rgba(16, 185, 129, 0.12)',
                            border: '1px solid rgba(16, 185, 129, 0.35)',
                            padding: '0.18rem 0.55rem',
                            borderRadius: '999px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                            fontWeight: '700',
                            letterSpacing: '0.02em'
                          }}
                        >
                          🟢 POSITIF
                        </span>
                      )}
                      {sentiment === 'NEUTRE' && (
                        <span
                          style={{
                            fontSize: '0.74rem',
                            color: '#fbbf24',
                            background: 'rgba(251, 191, 36, 0.12)',
                            border: '1px solid rgba(251, 191, 36, 0.35)',
                            padding: '0.18rem 0.55rem',
                            borderRadius: '999px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                            fontWeight: '700',
                            letterSpacing: '0.02em'
                          }}
                        >
                          🟡 NEUTRE
                        </span>
                      )}
                      {sentiment === 'NEGATIF' && (
                        <span
                          style={{
                            fontSize: '0.74rem',
                            color: '#f43f5e',
                            background: 'rgba(244, 63, 94, 0.12)',
                            border: '1px solid rgba(244, 63, 94, 0.35)',
                            padding: '0.18rem 0.55rem',
                            borderRadius: '999px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                            fontWeight: '700',
                            letterSpacing: '0.02em'
                          }}
                        >
                          🔴 NEGATIF
                        </span>
                      )}
                    </div>

                    {/* Contenu du commentaire */}
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-main)', lineHeight: '1.5', margin: '0.3rem 0 0.5rem', fontStyle: 'italic' }}>
                      "{a.commentaire || 'Aucun commentaire rédigé.'}"
                    </p>

                    <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                      Déposé le {new Date(a.dateCreation || Date.now()).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </div>
                  </div>

                  {/* Bloc Notes & Actions */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                    {/* Séance rating */}
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                        gap: '0.2rem',
                        padding: '0.4rem 0.65rem',
                        borderRadius: '8px',
                        background: 'rgba(0, 240, 255, 0.05)',
                        border: '1px solid rgba(0, 240, 255, 0.2)',
                      }}
                    >
                      <span style={{ fontSize: '0.72rem', color: 'var(--electric-cyan)', fontWeight: '700' }}>
                        Note Séance :
                      </span>
                      <RatingDisplay score={a.note} size="sm" showText={false} />
                    </div>

                    {/* Coach rating */}
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                        gap: '0.2rem',
                        padding: '0.4rem 0.65rem',
                        borderRadius: '8px',
                        background: 'rgba(168, 85, 247, 0.05)',
                        border: '1px solid rgba(168, 85, 247, 0.2)',
                      }}
                    >
                      <span style={{ fontSize: '0.72rem', color: '#c084fc', fontWeight: '700' }}>
                        Note Coach :
                      </span>
                      <RatingDisplay score={noteCoachVal} size="sm" showText={false} />
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              marginTop: '1.75rem',
              paddingTop: '1.25rem',
              borderTop: '1px solid var(--border-subtle)',
            }}
          >
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            >
              Précédent
            </button>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-dim)', padding: '0 0.5rem' }}>
              Page <strong style={{ color: 'var(--text-white)' }}>{currentPage}</strong> sur {totalPages}
            </span>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            >
              Suivant
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
