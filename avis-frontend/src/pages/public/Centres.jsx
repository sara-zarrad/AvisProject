import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import centresApi from '../../api/centres';
import seancesApi from '../../api/seances';
import {
  Building2,
  MapPin,
  Phone,
  Search,
  Zap,
  ArrowRight,
  Sparkles,
  Dumbbell,
  Shield,
  Loader2
} from 'lucide-react';
import Badge from '../../components/common/Badge';

export const Centres = () => {
  const [centres, setCentres] = useState([]);
  const [seances, setSeances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVille, setSelectedVille] = useState('ALL');

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const centresData = await centresApi.getCentres().catch(() => []);
        let seancesData = [];
        try {
          seancesData = await seancesApi.getSeances();
        } catch (e) {
          console.warn('Séances non disponibles pour le moment:', e);
        }
        setCentres(Array.isArray(centresData) ? centresData : []);
        setSeances(Array.isArray(seancesData) ? seancesData : []);
      } catch (err) {
        console.error('Erreur chargement centres:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);


  const villes = ['ALL', ...new Set(centres.map((c) => c.ville || 'Tunis'))];

  const filteredCentres = centres.filter((c) => {
    const matchesSearch =
      c.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.adresse.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesVille = selectedVille === 'ALL' || (c.ville || 'Tunis') === selectedVille;

    return matchesSearch && matchesVille;
  });

  return (
    <div style={{ paddingBottom: '5rem' }}>
      {/* Hero Section */}
      <section
        style={{
          position: 'relative',
          padding: '4.5rem 0 3.5rem',
          borderBottom: '1px solid var(--border-subtle)',
          background: 'linear-gradient(180deg, rgba(0, 240, 255, 0.04) 0%, rgba(6, 9, 15, 0) 100%)',
        }}
      >
        <div className="container" style={{ textAlign: 'center' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.4rem 1rem',
              borderRadius: '999px',
              background: 'var(--electric-cyan-dim)',
              border: '1px solid rgba(0, 240, 255, 0.3)',
              color: 'var(--electric-cyan)',
              fontSize: '0.85rem',
              fontWeight: '700',
              marginBottom: '1.5rem',
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
            }}
          >
            <Zap size={15} /> Clubs d'électrostimulation sans fil • Tunisie
          </div>

          <h1 style={{ maxWidth: '900px', margin: '0 auto 1.25rem', fontWeight: '800' }}>
            Avis & Évaluations des Centres{' '}
            <span
              style={{
                background: 'linear-gradient(135deg, #00f0ff 0%, #38bdf8 50%, #10b981 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              i-motion EMS
            </span>
          </h1>

          <p
            style={{
              maxWidth: '720px',
              margin: '0 auto 2.5rem',
              fontSize: '1.1rem',
              lineHeight: '1.7',
              color: 'var(--text-muted)',
            }}
          >
            Découvrez les retours d'expérience certifiés, les notes moyennes des séances EMS 
            et trouvez le studio i-motion le plus proche de chez vous en Tunisie.
          </p>

          {/* Quick Highlight Stats */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1.25rem',
              maxWidth: '850px',
              margin: '0 auto',
            }}
          >
            <div className="card-glass" style={{ padding: '1.25rem', textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--electric-cyan)' }}>
                {centres.length}
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Centres en Tunisie</div>
            </div>
            <div className="card-glass" style={{ padding: '1.25rem', textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--electric-lime)' }}>
                {seances.length}
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Programmes EMS Disponibles</div>
            </div>
            <div className="card-glass" style={{ padding: '1.25rem', textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', fontWeight: '800', color: '#fbbf24' }}>
                4.8 / 5
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Moyenne de Satisfaction</div>
            </div>
          </div>
        </div>
      </section>

      {/* Catalogue & Filters Section */}
      <section className="container" style={{ marginTop: '3.5rem' }}>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem',
            marginBottom: '2.5rem',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1rem',
            }}
          >
            <div>
              <h2 style={{ fontSize: '1.8rem', marginBottom: '0.35rem' }}>Nos Studios i-motion</h2>
              <p style={{ fontSize: '0.92rem' }}>
                Sélectionnez un centre pour consulter ses séances EMS et les avis des adhérents.
              </p>
            </div>

            {/* City filter tabs */}
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {villes.map((ville) => (
                <button
                  key={ville}
                  onClick={() => setSelectedVille(ville)}
                  className={`btn btn-sm ${selectedVille === ville ? 'btn-primary' : 'btn-secondary'}`}
                >
                  {ville === 'ALL' ? 'Toutes les villes' : ville}
                </button>
              ))}
            </div>
          </div>

          {/* Search bar */}
          <div style={{ position: 'relative', width: '100%', maxWidth: '500px' }}>
            <Search
              size={18}
              color="var(--text-dim)"
              style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }}
            />
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '2.75rem' }}
              placeholder="Rechercher par nom de centre, quartier ou ville..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Loading / Results Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '5rem 0', color: 'var(--electric-cyan)' }}>
            <Loader2 size={40} className="animate-spin" style={{ margin: '0 auto 1rem' }} />
            <p>Chargement des centres i-motion...</p>
          </div>
        ) : filteredCentres.length === 0 ? (
          <div className="card-glass" style={{ textAlign: 'center', padding: '3.5rem 1.5rem' }}>
            <Building2 size={48} color="var(--text-dim)" style={{ margin: '0 auto 1rem' }} />
            <h3>Aucun centre trouvé</h3>
            <p style={{ marginTop: '0.5rem' }}>
              Essayez de modifier votre recherche ou sélectionnez une autre ville.
            </p>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
              gap: '1.75rem',
            }}
          >
            {filteredCentres.map((centre) => {
              const centreSeances = seances.filter((s) => String(s.centreId) === String(centre.id));
              const seanceCount = centre._count?.seances !== undefined ? centre._count.seances : centreSeances.length;
              
              return (
                <div
                  key={centre.id}
                  className="card-glass card-glass-interactive"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    {/* Header */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        justifyContent: 'space-between',
                        gap: '0.75rem',
                        marginBottom: '1rem',
                      }}
                    >
                      <div
                        style={{
                          width: '46px',
                          height: '46px',
                          borderRadius: '12px',
                          background: 'rgba(0, 240, 255, 0.1)',
                          border: '1px solid rgba(0, 240, 255, 0.3)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'var(--electric-cyan)',
                          flexShrink: 0,
                        }}
                      >
                        <Building2 size={24} />
                      </div>

                      <Badge variant="cyan">{centre.ville || 'Tunisie'}</Badge>
                    </div>

                    <h3 style={{ fontSize: '1.25rem', marginBottom: '0.65rem' }}>
                      <Link to={`/centres/${centre.id}`} style={{ color: 'var(--text-white)' }}>
                        {centre.nom}
                      </Link>
                    </h3>

                    <p
                      style={{
                        fontSize: '0.9rem',
                        lineHeight: '1.6',
                        color: 'var(--text-muted)',
                        marginBottom: '1.25rem',
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {centre.description}
                    </p>

                    {/* Address & Phone */}
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.6rem',
                        padding: '0.85rem 1rem',
                        borderRadius: '10px',
                        background: 'rgba(0, 0, 0, 0.25)',
                        border: '1px solid var(--border-subtle)',
                        marginBottom: '1.5rem',
                        fontSize: '0.85rem',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                        <MapPin size={15} color="var(--electric-cyan)" style={{ marginTop: '2px', flexShrink: 0 }} />
                        <span style={{ color: 'var(--text-main)' }}>{centre.adresse}</span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Phone size={15} color="var(--electric-lime)" style={{ flexShrink: 0 }} />
                        <a href={`tel:${centre.numTel}`} style={{ color: 'var(--electric-lime)' }}>
                          {centre.numTel}
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Footer & Action */}
                  <div
                    style={{
                      borderTop: '1px solid var(--border-subtle)',
                      paddingTop: '1rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '0.5rem',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: 'var(--text-dim)' }}>
                      <Dumbbell size={16} color="var(--electric-cyan)" />
                      <span>{seanceCount} séance{seanceCount > 1 ? 's' : ''} EMS</span>
                    </div>


                    <Link
                      to={`/centres/${centre.id}`}
                      className="btn btn-primary btn-sm"
                    >
                      Voir les séances <ArrowRight size={15} />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};

export default Centres;
