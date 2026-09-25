import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import centresApi from '../../api/centres';
import avisApi from '../../api/avis';
import {
  Zap,
  Building2,
  Dumbbell,
  Sparkles,
  HeartPulse,
  Flame,
  UserCheck,
  CheckCircle2,
  ArrowRight,
  Shield,
  Apple,
  Activity,
  Smile,
  Star,
  MapPin,
  Clock,
  Award,
  ChevronRight,
  Layers,
  Sparkle,
  Loader2,
  Phone
} from 'lucide-react';
import RatingDisplay from '../../components/common/RatingDisplay';
import Badge from '../../components/common/Badge';

export const Accueil = () => {
  const [centres, setCentres] = useState([]);
  const [derniersAvis, setDerniersAvis] = useState([]);
  const [loading, setLoading] = useState(true);

  // Les 4 technologies EMS & Séances
  const TECHNOLOGIES = [
    {
      id: 'i-motion',
      tag: '01 • STIMULATION GLOBALE',
      titre: 'I-Motion',
      soustitre: 'Activateur Musculaire Complet en 20 Minutes',
      badge: 'RAPIDE & INTENSE',
      badgeColor: 'var(--electric-cyan)',
      icon: Zap,
      accentGradient: 'linear-gradient(135deg, rgba(0, 240, 255, 0.15) 0%, rgba(59, 130, 246, 0.05) 100%)',
      borderColor: 'rgba(0, 240, 255, 0.3)',
      description:
        "L'appareil d'électrostimulation i-motion a été conçu pour réaliser des stimulations activant plus de 300 muscles simultanément au cours d'une séance de seulement 20 minutes.",
      avantages: [
        'Perte de poids et combustion calorique maximale',
        'Tonification accélérée de l\'ensemble du corps',
        'Renforcement musculaire profond sans charge articulaire',
        'Amélioration notable de la posture et du gainage',
      ],
      stats: '300+ muscles activés en simultané',
    },
    {
      id: 'i-model',
      tag: '02 • CONFORT & PROFONDEUR',
      titre: 'I-Model',
      soustitre: 'Entraînement en Position Allongée Sans Effort Excessif',
      badge: 'POST-PARTUM & RÉCUPÉRATION',
      badgeColor: '#c084fc',
      icon: Layers,
      accentGradient: 'linear-gradient(135deg, rgba(168, 85, 247, 0.15) 0%, rgba(59, 130, 246, 0.05) 100%)',
      borderColor: 'rgba(168, 85, 247, 0.3)',
      description:
        "L'entraînement avec I-Model est simple et extrêmement confortable : il se réalise en position allongée, ce qui permet d'effectuer des exercices profonds sans effort excessif. En seulement 20 minutes, la séance offre des résultats concrets grâce à une stimulation ciblée.",
      avantages: [
        'Renforcement musculaire profond et ciblé',
        'Effet antalgique immédiat (soulagement des douleurs lombaires et dos)',
        'Amélioration harmonieuse de la silhouette',
        'Récupération post-partum douce et sécurisée pour les mamans',
      ],
      stats: 'Position allongée • Action antalgique ciblée',
    },
    {
      id: 'i-shape',
      tag: '03 • MODELAGE & MINCEUR',
      titre: 'I-Shape',
      soustitre: 'Modelage de la Silhouette & Raffermissement Ciblé',
      badge: 'DRAINAGE & ANTI-CELLULITE',
      badgeColor: '#34d399',
      icon: Flame,
      accentGradient: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(0, 240, 255, 0.05) 100%)',
      borderColor: 'rgba(16, 185, 129, 0.3)',
      description:
        "I-Shape est un équipement d'électrostimulation de haute précision conçu pour le modelage de la silhouette, le raffermissement cutané, la perte de masse grasse localisée, la réduction de la cellulite et le drainage lymphatique profond.",
      avantages: [
        'Modelage et affinement de la silhouette',
        'Raffermissement cutané ciblé (cuisses, fessiers, taille)',
        'Perte de masse grasse localisée',
        'Réduction de l\'aspect peau d\'orange et drainage lymphatique',
      ],
      stats: 'Effet lissant & détox lymphatique',
    },
    {
      id: 'i-face',
      tag: '04 • BEAUTÉ & JEUNESSE',
      titre: 'i-Face (Face Esthétique)',
      soustitre: 'Lifting Naturel & Rajeunissement Cutané du Visage',
      badge: 'LIFTING SANS CHIRURGIE',
      badgeColor: '#fb7185',
      icon: Sparkles,
      accentGradient: 'linear-gradient(135deg, rgba(244, 63, 94, 0.15) 0%, rgba(168, 85, 247, 0.05) 100%)',
      borderColor: 'rgba(244, 63, 94, 0.3)',
      description:
        "Une technologie révolutionnaire de lifting naturel conçue pour le raffermissement du visage, le rajeunissement cutané et l'amélioration de la texture de la peau. Grâce à des micro-impulsions douces stimulant les muscles faciaux profonds, i-Face réactive la circulation et relance la production naturelle de collagène.",
      avantages: [
        'Lifting et raffermissement naturel des traits du visage',
        'Relance de la production naturelle de collagène et élastine',
        'Amélioration de la fermeté, de l\'éclat et de la qualité de peau',
        'Stimulation douce de la microcirculation sans injection ni chirurgie',
      ],
      stats: 'Booster de collagène naturel',
    },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Récupération directe depuis la base de données réelle (PostgreSQL / MySQL / Prisma)
        const [centresData, reviewsData] = await Promise.all([
          centresApi.getCentres().catch(() => []),
          avisApi.getAllAvis().catch(() => []),
        ]);
        if (Array.isArray(centresData) && centresData.length > 0) {
          setCentres(centresData);
        }
        if (Array.isArray(reviewsData) && reviewsData.length > 0) {
          setDerniersAvis(reviewsData.slice(0, 3));
        }
      } catch (err) {
        console.error('Erreur chargement données accueil:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div style={{ paddingBottom: '6rem' }}>
      {/* =========================================================================
          HERO BANNER
          ========================================================================= */}
      <section
        style={{
          position: 'relative',
          padding: '5.5rem 0 4.5rem',
          borderBottom: '1px solid var(--border-subtle)',
          background: 'radial-gradient(ellipse at 50% 10%, rgba(0, 240, 255, 0.12) 0%, rgba(6, 9, 15, 0) 70%)',
          overflow: 'hidden',
        }}
      >
        <div className="container" style={{ textAlign: 'center', position: 'relative', zIndex: 2 }}>
          {/* Badge Top */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.6rem',
              padding: '0.45rem 1.25rem',
              borderRadius: '999px',
              background: 'rgba(0, 240, 255, 0.08)',
              border: '1px solid rgba(0, 240, 255, 0.3)',
              color: 'var(--electric-cyan)',
              fontSize: '0.85rem',
              fontWeight: '700',
              letterSpacing: '0.04em',
              marginBottom: '1.75rem',
              boxShadow: '0 0 20px rgba(0, 240, 255, 0.15)',
            }}
          >
            <Zap size={16} fill="var(--electric-cyan)" />
            <span>Leader de l'Électrostimulation Musculaire (EMS) en Tunisie</span>
          </div>

          {/* Main Title */}
          <h1
            style={{
              fontSize: 'clamp(2.4rem, 5.5vw, 4.2rem)',
              lineHeight: 1.1,
              marginBottom: '1.5rem',
              letterSpacing: '-0.03em',
            }}
          >
            I-Motion Club <span className="gradient-text">Tunisia</span>
          </h1>

          {/* Subtitle description */}
          <p
            style={{
              fontSize: 'clamp(1rem, 2vw, 1.25rem)',
              maxWidth: '850px',
              margin: '0 auto 2.25rem',
              color: 'var(--text-main)',
              lineHeight: 1.65,
            }}
          >
            I-Motion Club Tunisia est un réseau de centres spécialisés dans l’électrostimulation musculaire (EMS),
            une technologie d’entraînement innovante permettant d’obtenir des{' '}
            <strong style={{ color: 'var(--electric-cyan)' }}>résultats rapides, efficaces et adaptés</strong> en seulement 20 minutes par séance.
          </p>

          {/* Target audience tags */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              gap: '0.75rem',
              marginBottom: '2.5rem',
            }}
          >
            {[
              'RAPIDE & INTENSE',
              'POST-PARTUM & RÉCUPÉRATION',
              'DRAINAGE & ANTI-CELLULITE',
              'LIFTING SANS CHIRURGIE',
            ].map((tag, idx) => (
              <span
                key={idx}
                style={{
                  fontSize: '0.82rem',
                  padding: '0.4rem 0.9rem',
                  borderRadius: '999px',
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-white)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                }}
              >
                <CheckCircle2 size={13} color="var(--electric-lime)" /> {tag}
              </span>
            ))}
          </div>

          {/* Action Buttons */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '1rem',
              flexWrap: 'wrap',
            }}
          >
            <a href="#technologies" className="btn btn-primary" style={{ padding: '0.85rem 1.75rem', fontSize: '1rem' }}>
              <Zap size={18} /> Découvrir les 4 Séances EMS
            </a>
            <Link to="/centres" className="btn btn-secondary" style={{ padding: '0.85rem 1.75rem', fontSize: '1rem' }}>
              <Building2 size={18} /> Nos Clubs en Tunisie <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 1 : LES 4 TECHNOLOGIES & SÉANCES EMS PHARES
          ========================================================================= */}
      <section id="technologies" className="container" style={{ paddingTop: '5rem', paddingBottom: '4rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--electric-cyan)', fontSize: '0.85rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem' }}>
            <Sparkles size={16} /> Programmes & Équipements de Pointe
          </div>
          <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>
            Nos 4 Technologies EMS Avancées
          </h2>
          <p style={{ maxWidth: '720px', margin: '0 auto', fontSize: '1.05rem', color: 'var(--text-dim)' }}>
            I-Motion Club Tunisia utilise les équipements les plus sophistiqués du marché mondial pour s'adapter précisément à vos objectifs physiques et esthétiques.
          </p>
        </div>

        <div className="technologies-grid">
          {TECHNOLOGIES.map((tech) => {
            const Icon = tech.icon;

            return (
              <div
                key={tech.id}
                className="card-glass"
                style={{
                  padding: '2.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  border: `1px solid ${tech.borderColor}`,
                  background: tech.accentGradient,
                  borderRadius: '16px',
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                }}
              >
                <div>
                  {/* Top Bar Card */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: '800', color: tech.badgeColor, letterSpacing: '0.08em' }}>
                      {tech.tag}
                    </span>
                    <span
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: '800',
                        color: tech.badgeColor,
                        background: 'rgba(255, 255, 255, 0.06)',
                        padding: '0.2rem 0.6rem',
                        borderRadius: '999px',
                        border: `1px solid ${tech.badgeColor}40`,
                      }}
                    >
                      {tech.badge}
                    </span>
                  </div>

                  {/* Icon & Title */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '0.75rem' }}>
                    <div
                      style={{
                        width: '46px',
                        height: '46px',
                        borderRadius: '12px',
                        background: 'rgba(255, 255, 255, 0.08)',
                        border: `1px solid ${tech.badgeColor}60`,
                        color: tech.badgeColor,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Icon size={24} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1.6rem', color: 'var(--text-white)', margin: 0 }}>
                        {tech.titre}
                      </h3>
                    </div>
                  </div>

                  <p style={{ fontSize: '0.92rem', color: tech.badgeColor, fontWeight: '600', marginBottom: '1rem' }}>
                    {tech.soustitre}
                  </p>

                  <p style={{ fontSize: '0.92rem', color: 'var(--text-main)', lineHeight: '1.6', marginBottom: '1.5rem' }}>
                    {tech.description}
                  </p>

                  {/* Avantages list */}
                  <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '1.25rem', marginBottom: '1.5rem' }}>
                    <strong style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-white)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.75rem' }}>
                      Bénéfices & Avantages :
                    </strong>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {tech.avantages.map((av, i) => (
                        <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.86rem', color: 'var(--text-main)', lineHeight: '1.4' }}>
                          <CheckCircle2 size={15} color={tech.badgeColor} style={{ flexShrink: 0, marginTop: '2px' }} />
                          <span>{av}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Footer Card */}
                <div
                  style={{
                    padding: '0.75rem 1rem',
                    borderRadius: '10px',
                    background: 'rgba(0, 0, 0, 0.25)',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '0.82rem',
                    color: 'var(--text-dim)',
                  }}
                >
                  <span style={{ color: 'var(--text-white)', fontWeight: '700' }}>{tech.stats}</span>
                  <span style={{ color: tech.badgeColor, fontWeight: '700' }}>Séance 20 min</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* =========================================================================
          SECTION 2 : LE RÉSEAU DES CLUBS EN TUNISIE (CHARGÉ DEPUIS LA BD)
          ========================================================================= */}
      <section
        id="centres"
        style={{
          background: 'linear-gradient(180deg, rgba(6, 9, 15, 0) 0%, rgba(0, 240, 255, 0.03) 50%, rgba(6, 9, 15, 0) 100%)',
          padding: '5rem 0',
          borderTop: '1px solid var(--border-subtle)',
          borderBottom: '1px solid var(--border-subtle)',
        }}
      >
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--electric-lime)', fontSize: '0.85rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem' }}>
              <Building2 size={16} /> Présence Nationale • Centres Actifs
            </div>
            <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>
              {centres.length > 0 ? `${centres.length} ${centres.length > 1 ? 'Clubs Répartis en Tunisie' : 'Club en Tunisie'}` : 'Nos Clubs Répartis en Tunisie'}
            </h2>
            <p style={{ maxWidth: '780px', margin: '0 auto', fontSize: '1.05rem', color: 'var(--text-main)', lineHeight: '1.6' }}>
              Avec nos clubs répartis à travers la Tunisie, notre réseau offre une accessibilité optimale et un accompagnement personnalisé dans un cadre moderne et professionnel.
            </p>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--electric-cyan)' }}>
              <Loader2 size={36} className="animate-spin" style={{ margin: '0 auto 1rem' }} />
              <p style={{ fontSize: '0.95rem' }}>Chargement des clubs depuis la base de données...</p>
            </div>
          ) : centres.length === 0 ? (
            <div className="card-glass" style={{ textAlign: 'center', padding: '3rem 2rem', maxWidth: '500px', margin: '0 auto' }}>
              <Building2 size={40} style={{ margin: '0 auto 1rem', color: 'var(--text-dim)' }} />
              <p style={{ color: 'var(--text-white)', fontWeight: '600' }}>Aucun centre enregistré pour le moment.</p>
              <Link to="/admin/centres" className="btn btn-primary btn-sm" style={{ marginTop: '1rem' }}>
                Ajouter un centre (Admin)
              </Link>
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: '1.25rem',
                marginBottom: '2.5rem',
              }}
            >
              {centres.map((club, idx) => (
                <div
                  key={club.id}
                  className="card-glass"
                  style={{
                    padding: '1.5rem',
                    borderRadius: '14px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    border: '1px solid var(--border-subtle)',
                    background: 'rgba(255, 255, 255, 0.02)',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                      <div
                        style={{
                          width: '34px',
                          height: '34px',
                          borderRadius: '8px',
                          background: 'rgba(0, 240, 255, 0.12)',
                          color: 'var(--electric-cyan)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: '800',
                          fontSize: '0.85rem',
                        }}
                      >
                        {idx + 1}
                      </div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--electric-lime)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontWeight: '700' }}>
                        <MapPin size={13} /> {club.ville || 'Tunisie'}
                      </span>
                    </div>

                    <h3 style={{ fontSize: '1.15rem', color: 'var(--text-white)', marginBottom: '0.45rem' }}>
                      {club.nom}
                    </h3>

                    {club.adresse && (
                      <p style={{ fontSize: '0.78rem', color: 'var(--text-dim)', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <MapPin size={12} style={{ flexShrink: 0 }} /> {club.adresse}
                      </p>
                    )}

                    <p style={{ fontSize: '0.85rem', color: 'var(--text-main)', lineHeight: '1.45', margin: 0 }}>
                      {club.description || 'Studio EMS de pointe équipé des technologies I-Motion avec accompagnement personnalisé.'}
                    </p>

                    {club.numTel && (
                      <div style={{ marginTop: '0.6rem', fontSize: '0.78rem', color: 'var(--electric-cyan)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <Phone size={12} /> {club.numTel}
                      </div>
                    )}
                  </div>

                  <div style={{ marginTop: '1.25rem', paddingTop: '0.85rem', borderTop: '1px solid rgba(255, 255, 255, 0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Link
                      to={`/centres/${club.id}`}
                      style={{
                        fontSize: '0.85rem',
                        color: 'var(--electric-cyan)',
                        fontWeight: '700',
                        textDecoration: 'none',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                      }}
                    >
                      Voir le centre <ChevronRight size={14} />
                    </Link>

                    {club._count?.seances !== undefined && (
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                        {club._count.seances} {club._count.seances > 1 ? 'séances' : 'séance'}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div style={{ textAlign: 'center' }}>
            <Link to="/centres" className="btn btn-secondary">
              <Building2 size={16} /> Explorer tous les centres et réserver une séance
            </Link>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 3 : SERVICE NUTRITION & BILAN SPORT-SANTÉ
          ========================================================================= */}
      <section className="container" style={{ paddingTop: '5rem', paddingBottom: '4rem' }}>
        <div
          className="card-glass"
          style={{
            padding: '3rem 2.5rem',
            borderRadius: '20px',
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(0, 240, 255, 0.04) 100%)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
          }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2.5rem', alignItems: 'center' }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#34d399', fontSize: '0.82rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>
                <Apple size={16} /> Bilan Sport-Santé & Accompagnement
              </div>
              <h2 style={{ fontSize: '2.3rem', marginBottom: '1.25rem', color: 'var(--text-white)' }}>
                Service Nutrition Complet & Suivi Personnalisé
              </h2>
              <p style={{ fontSize: '1rem', color: 'var(--text-main)', lineHeight: '1.65', marginBottom: '1.5rem' }}>
                En complément de vos séances d'électrostimulation, I-Motion Club propose un service de nutrition complet,
                assuré par des nutritionnistes qualifiés, avec un suivi alimentaire régulier, des bilans corporels continus
                et des programmes personnalisés pour accompagner chaque objectif.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={{ padding: '0.85rem', borderRadius: '10px', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-subtle)' }}>
                  <strong style={{ color: '#34d399', fontSize: '0.9rem', display: 'block', marginBottom: '0.2rem' }}>Perte de Poids</strong>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>Déficit calorique maîtrisé & brûlage des graisses</span>
                </div>
                <div style={{ padding: '0.85rem', borderRadius: '10px', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-subtle)' }}>
                  <strong style={{ color: '#34d399', fontSize: '0.9rem', display: 'block', marginBottom: '0.2rem' }}>Prise de Masse</strong>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>Apport protéique et développement musculaire</span>
                </div>
                <div style={{ padding: '0.85rem', borderRadius: '10px', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-subtle)' }}>
                  <strong style={{ color: '#34d399', fontSize: '0.9rem', display: 'block', marginBottom: '0.2rem' }}>Équilibre Alimentaire</strong>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>Rééquilibrage durable sans frustration</span>
                </div>
                <div style={{ padding: '0.85rem', borderRadius: '10px', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-subtle)' }}>
                  <strong style={{ color: '#34d399', fontSize: '0.9rem', display: 'block', marginBottom: '0.2rem' }}>Optimisation Sportive</strong>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>Énergie, endurance et récupération rapide</span>
                </div>
              </div>
            </div>

            {/* Nutrition Features Cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ padding: '1.25rem', borderRadius: '12px', background: 'rgba(0, 0, 0, 0.3)', border: '1px solid rgba(16, 185, 129, 0.2)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ padding: '0.75rem', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
                  <Activity size={24} />
                </div>
                <div>
                  <strong style={{ color: 'var(--text-white)', fontSize: '0.98rem', display: 'block' }}>Bilans Corporels Continus</strong>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-dim)', margin: 0 }}>Analyse précise de la masse musculaire, masse grasse et rétention d'eau.</p>
                </div>
              </div>

              <div style={{ padding: '1.25rem', borderRadius: '12px', background: 'rgba(0, 0, 0, 0.3)', border: '1px solid rgba(16, 185, 129, 0.2)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ padding: '0.75rem', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
                  <UserCheck size={24} />
                </div>
                <div>
                  <strong style={{ color: 'var(--text-white)', fontSize: '0.98rem', display: 'block' }}>Nutritionnistes Diplômés</strong>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-dim)', margin: 0 }}>Consultations régulières et ajustement du plan selon vos progrès EMS.</p>
                </div>
              </div>

              <div style={{ padding: '1.25rem', borderRadius: '12px', background: 'rgba(0, 0, 0, 0.3)', border: '1px solid rgba(16, 185, 129, 0.2)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ padding: '0.75rem', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
                  <HeartPulse size={24} />
                </div>
                <div>
                  <strong style={{ color: 'var(--text-white)', fontSize: '0.98rem', display: 'block' }}>Santé & Vitalité Globale</strong>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-dim)', margin: 0 }}>Synergie complète entre impulsions EMS et apports nutritionnels ciblés.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 4 : AVIS ADHÉRENTS & EXPÉRIENCES VÉRIFIÉES
          ========================================================================= */}
      {derniersAvis.length > 0 && (
        <section className="container" style={{ paddingBottom: '4rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#fbbf24', fontSize: '0.82rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.4rem' }}>
                <Star size={15} fill="#fbbf24" /> Expériences Adhérents
              </div>
              <h2 style={{ fontSize: '2rem', color: 'var(--text-white)', margin: 0 }}>
                Ce Que Disent Nos Membres
              </h2>
            </div>
            <Link to="/centres" style={{ fontSize: '0.88rem', color: 'var(--electric-cyan)', display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontWeight: '700' }}>
              Consulter tous les avis <ArrowRight size={14} />
            </Link>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '1.5rem',
            }}
          >
            {derniersAvis.map((avis) => (
              <div
                key={avis.id}
                className="card-glass"
                style={{
                  padding: '1.5rem',
                  borderRadius: '14px',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                    <strong style={{ color: 'var(--text-white)', fontSize: '0.95rem' }}>
                      {avis.utilisateurNom || 'Membre EMS'}
                    </strong>
                    <RatingDisplay score={avis.note} size="sm" showText={false} />
                  </div>
                  <p style={{ fontSize: '0.88rem', color: 'var(--text-main)', fontStyle: 'italic', lineHeight: '1.5', marginBottom: '1rem' }}>
                    "{avis.commentaire}"
                  </p>
                </div>

                <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.06)', paddingTop: '0.65rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.76rem', color: 'var(--text-dim)' }}>
                  <span>{avis.seanceNom || 'Séance EMS'}</span>
                  {avis.coachNom && <span style={{ color: '#c084fc' }}>Coach : {avis.coachNom}</span>}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* =========================================================================
          SECTION 5 : CALL TO ACTION FINAL
          ========================================================================= */}
      <section className="container" style={{ textAlign: 'center', paddingTop: '2rem' }}>
        <div
          className="card-glass"
          style={{
            padding: '3.5rem 2rem',
            borderRadius: '20px',
            background: 'linear-gradient(135deg, rgba(0, 240, 255, 0.1) 0%, rgba(168, 85, 247, 0.1) 100%)',
            border: '1px solid rgba(0, 240, 255, 0.3)',
          }}
        >
          <h2 style={{ fontSize: '2.4rem', marginBottom: '1rem' }}>
            Prêt(e) à Transformer Votre Corps en 20 Minutes ?
          </h2>
          <p style={{ maxWidth: '650px', margin: '0 auto 2rem', fontSize: '1.05rem', color: 'var(--text-main)' }}>
            Rejoignez I-Motion Club Tunisia dans l'un de nos centres et bénéficiez d'un accompagnement personnalisé avec nos coachs et nutritionnistes certifiés.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <Link to="/centres" className="btn btn-primary" style={{ padding: '0.85rem 1.75rem', fontSize: '1rem' }}>
              <Building2 size={18} /> Choisir Mon Club en Tunisie
            </Link>
            <Link to="/register" className="btn btn-secondary" style={{ padding: '0.85rem 1.75rem', fontSize: '1rem' }}>
              Créer mon Espace Membre
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Accueil;
