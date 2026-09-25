import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import coachesApi from '../../api/coaches';
import centresApi from '../../api/centres';
import {
  UserCheck,
  Building2,
  Plus,
  Edit2,
  Trash2,
  Search,
  ExternalLink,
  Phone,
  Mail,
  Award,
  AlertCircle,
  Loader2,
  Save,
  Filter,
  Star
} from 'lucide-react';
import Modal from '../../components/common/Modal';
import Toast from '../../components/common/Toast';
import Badge from '../../components/common/Badge';
import RatingDisplay from '../../components/common/RatingDisplay';

const SPECIALITE_SUGGESTIONS = [
  'Expert EMS Cardio & HIIT',
  'Coach EMS Posture & Santé du Dos',
  'Sculpt & Musculation Profonde',
  'Drainage & Tonification Minceur',
  'Performance Sportive & Athlètes',
  'Bien-être & Remise en Forme EMS',
  'Récupération Active & Mobilité',
];

export const GestionCoaches = () => {
  const [coaches, setCoaches] = useState([]);
  const [centres, setCentres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCentreFilter, setSelectedCentreFilter] = useState('ALL');
  const [toast, setToast] = useState(null);

  // Modal Create / Edit State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoach, setEditingCoach] = useState(null);
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    specialite: 'Expert EMS Cardio & HIIT',
    experience: '3 ans d\'expérience',
    bio: '',
    centreId: '',
    email: '',
    telephone: '',
  });
  const [saving, setSaving] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  // Delete Modal State
  const [coachToDelete, setCoachToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const centresData = await centresApi.getCentres().catch(() => []);
      let coachesData = [];
      try {
        coachesData = await coachesApi.getCoaches();
      } catch (e) {
        console.warn('Coachs non disponibles:', e);
      }
      setCentres(Array.isArray(centresData) ? centresData : []);
      setCoaches(Array.isArray(coachesData) ? coachesData : []);
    } catch (err) {
      console.error('Erreur chargement données coaches:', err);
      setToast({ type: 'error', message: 'Erreur lors du chargement des données.' });
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    loadData();
  }, []);

  const openCreateModal = () => {
    setEditingCoach(null);
    setFormData({
      nom: '',
      prenom: '',
      specialite: 'Expert EMS Cardio & HIIT',
      experience: '3 ans d\'expérience',
      bio: '',
      centreId: centres.length > 0 ? String(centres[0].id) : '',
      email: '',
      telephone: '',
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const openEditModal = (coach) => {
    setEditingCoach(coach);
    setFormData({
      nom: coach.nom || '',
      prenom: coach.prenom || '',
      specialite: coach.specialite || 'Coach EMS Certifié',
      experience: coach.experience || '3 ans d\'expérience',
      bio: coach.bio || '',
      centreId: coach.centreId ? String(coach.centreId) : (centres.length > 0 ? String(centres[0].id) : ''),
      email: coach.email || '',
      telephone: coach.telephone || '',
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const validateForm = () => {
    const errs = {};
    if (!formData.prenom.trim()) errs.prenom = 'Le prénom du coach est obligatoire.';
    if (!formData.nom.trim()) errs.nom = 'Le nom du coach est obligatoire.';
    if (!formData.centreId) errs.centreId = 'Veuillez assigner un centre au coach.';
    if (!formData.specialite.trim()) errs.specialite = 'La spécialité EMS est obligatoire.';
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSaveCoach = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSaving(true);
    try {
      if (editingCoach) {
        const updated = await coachesApi.updateCoach(editingCoach.id, formData);
        setCoaches((prev) =>
          prev.map((c) => (String(c.id) === String(updated.id) ? updated : c))
        );
        setToast({ type: 'success', message: 'Coach mis à jour avec succès.' });
      } else {
        const created = await coachesApi.createCoach(formData);
        setCoaches((prev) => [created, ...prev]);
        setToast({ type: 'success', message: 'Nouveau coach ajouté avec succès.' });
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error('Erreur enregistrement coach:', err);
      setToast({ type: 'error', message: err.message || 'Erreur lors de l\'enregistrement du coach.' });
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!coachToDelete) return;
    setDeleting(true);
    try {
      await coachesApi.deleteCoach(coachToDelete.id);
      setCoaches((prev) => prev.filter((c) => String(c.id) !== String(coachToDelete.id)));
      setToast({ type: 'info', message: 'Coach supprimé.' });
      setCoachToDelete(null);
    } catch (err) {
      console.error('Erreur suppression coach:', err);
      setToast({ type: 'error', message: 'Erreur lors de la suppression du coach.' });
    } finally {
      setDeleting(false);
    }
  };

  const filteredCoaches = coaches.filter((coach) => {
    const matchSearch =
      `${coach.prenom} ${coach.nom}`.toLowerCase().includes(search.toLowerCase()) ||
      (coach.specialite && coach.specialite.toLowerCase().includes(search.toLowerCase())) ||
      (coach.centreNom && coach.centreNom.toLowerCase().includes(search.toLowerCase())) ||
      (coach.bio && coach.bio.toLowerCase().includes(search.toLowerCase()));

    const matchCentre =
      selectedCentreFilter === 'ALL' || String(coach.centreId) === String(selectedCentreFilter);

    return matchSearch && matchCentre;
  });

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
            <UserCheck size={20} color="var(--electric-cyan)" />
            <span style={{ fontSize: '0.85rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: '700' }}>
              Gestion des Instructeurs & Équipe Technique
            </span>
          </div>
          <h1 style={{ fontSize: '2.2rem' }}>Gestion des Coachs i-motion Tunisie</h1>
          <p style={{ fontSize: '0.95rem' }}>
            Ajoutez les nouveaux instructeurs certifiés, assignez-les aux centres et suivez leurs notes attribuées par les membres.
          </p>
        </div>

        <button onClick={openCreateModal} className="btn btn-primary">
          <Plus size={18} /> Nouveau Coach
        </button>
      </div>

      {/* Filters and Search */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '2rem',
        }}
      >
        <div style={{ position: 'relative', width: '100%', maxWidth: '380px' }}>
          <Search
            size={18}
            color="var(--text-dim)"
            style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }}
          />
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: '2.75rem' }}
            placeholder="Rechercher par nom de coach, spécialité..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Filter by Centre */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Filter size={16} color="var(--text-dim)" />
          <span style={{ fontSize: '0.88rem', color: 'var(--text-dim)' }}>Filtrer par centre :</span>
          <select
            className="form-select"
            style={{ width: 'auto', minWidth: '220px' }}
            value={selectedCentreFilter}
            onChange={(e) => setSelectedCentreFilter(e.target.value)}
          >
            <option value="ALL">Tous les centres i-motion</option>
            {centres.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nom}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--electric-cyan)' }}>
          <Loader2 size={36} className="animate-spin" style={{ margin: '0 auto 1rem' }} />
          <p>Chargement des instructeurs...</p>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table-custom">
            <thead>
              <tr>
                <th>Coach / Instructeur</th>
                <th>Spécialité EMS</th>
                <th>Centre Associé</th>
                <th>Expérience</th>
                <th>Note & Évaluations</th>
                <th>Contact</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCoaches.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '3rem' }}>
                    Aucun coach trouvé.
                  </td>
                </tr>
              ) : (
                filteredCoaches.map((coach) => {
                  const centre = centres.find((c) => String(c.id) === String(coach.centreId));
                  const centreNom = centre ? centre.nom : (coach.centreNom || 'Non assigné');

                  return (
                    <tr key={coach.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div
                            style={{
                              width: '38px',
                              height: '38px',
                              borderRadius: '10px',
                              background: 'var(--electric-cyan-dim)',
                              border: '1px solid rgba(0, 240, 255, 0.3)',
                              color: 'var(--electric-cyan)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: '700',
                              fontSize: '0.85rem',
                              flexShrink: 0,
                            }}
                          >
                            {coach.avatar || `${coach.prenom?.[0] || 'C'}${coach.nom?.[0] || 'H'}`}
                          </div>
                          <div>
                            <div style={{ fontWeight: '700', color: 'var(--text-white)' }}>
                              {coach.prenom} {coach.nom}
                            </div>
                            <div
                              style={{
                                fontSize: '0.78rem',
                                color: 'var(--text-dim)',
                                maxWidth: '260px',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                              }}
                            >
                              {coach.bio || 'Instructeur certifié i-motion EMS'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <Badge variant="purple">{coach.specialite || 'EMS Général'}</Badge>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.88rem' }}>
                          <Building2 size={14} color="var(--electric-cyan)" />
                          <span>{centreNom}</span>
                        </div>
                      </td>
                      <td>
                        <Badge variant="lime" icon={Award}>
                          {coach.experience || 'Certifié EMS'}
                        </Badge>
                      </td>
                      <td>
                        <RatingDisplay score={coach.moyenneNote || 0} count={coach.nombreAvis || null} size="sm" />
                      </td>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', fontSize: '0.82rem' }}>
                          {coach.telephone ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--electric-lime)' }}>
                              <Phone size={12} />
                              <span>{coach.telephone}</span>
                            </div>
                          ) : null}
                          {coach.email ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-muted)' }}>
                              <Mail size={12} />
                              <span>{coach.email}</span>
                            </div>
                          ) : null}
                          {!coach.telephone && !coach.email && (
                            <span style={{ color: 'var(--text-dim)' }}>-</span>
                          )}
                        </div>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                          {centre && (
                            <Link
                              to={`/centres/${centre.id}`}
                              className="btn btn-secondary btn-icon"
                              title="Voir la page publique du centre"
                            >
                              <ExternalLink size={15} />
                            </Link>
                          )}
                          <button
                            onClick={() => openEditModal(coach)}
                            className="btn btn-secondary btn-icon"
                            title="Modifier"
                          >
                            <Edit2 size={15} color="var(--electric-cyan)" />
                          </button>
                          <button
                            onClick={() => setCoachToDelete(coach)}
                            className="btn btn-danger btn-icon"
                            title="Supprimer"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Create / Edit Coach */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => !saving && setIsModalOpen(false)}
        title={editingCoach ? 'Modifier le coach' : 'Ajouter un coach EMS'}
        maxWidth="650px"
      >
        <form onSubmit={handleSaveCoach}>
          {/* Prénom & Nom */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="coachPrenom">
                Prénom <span style={{ color: '#f43f5e' }}>*</span>
              </label>
              <input
                id="coachPrenom"
                type="text"
                className="form-input"
                placeholder="votre prénom"
                value={formData.prenom}
                onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                disabled={saving}
              />
              {formErrors.prenom && <div className="form-error">{formErrors.prenom}</div>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="coachNom">
                Nom <span style={{ color: '#f43f5e' }}>*</span>
              </label>
              <input
                id="coachNom"
                type="text"
                className="form-input"
                placeholder="votre nom"
                value={formData.nom}
                onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                disabled={saving}
              />
              {formErrors.nom && <div className="form-error">{formErrors.nom}</div>}
            </div>
          </div>

          {/* Centre d'affectation */}
          <div className="form-group">
            <label className="form-label" htmlFor="coachCentre">
              Centre i-motion d'affectation <span style={{ color: '#f43f5e' }}>*</span>
            </label>
            <select
              id="coachCentre"
              className="form-select"
              value={formData.centreId}
              onChange={(e) => setFormData({ ...formData, centreId: e.target.value })}
              disabled={saving}
            >
              <option value="">Sélectionner un centre...</option>
              {centres.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nom} ({c.ville || 'Tunisie'})
                </option>
              ))}
            </select>
            {formErrors.centreId && <div className="form-error">{formErrors.centreId}</div>}
          </div>

          {/* Spécialité EMS */}
          <div className="form-group">
            <label className="form-label" htmlFor="coachSpecialite">
              Spécialité Principale EMS <span style={{ color: '#f43f5e' }}>*</span>
            </label>
            <input
              id="coachSpecialite"
              type="text"
              className="form-input"
              placeholder="ex: Expert EMS Cardio & HIIT"
              value={formData.specialite}
              onChange={(e) => setFormData({ ...formData, specialite: e.target.value })}
              disabled={saving}
            />
            {formErrors.specialite && <div className="form-error">{formErrors.specialite}</div>}

            {/* Quick tags suggestions */}
            <div style={{ marginTop: '0.6rem' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', display: 'block', marginBottom: '0.35rem' }}>
                Suggestions rapides :
              </span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                {SPECIALITE_SUGGESTIONS.map((spec) => (
                  <button
                    key={spec}
                    type="button"
                    onClick={() => setFormData({ ...formData, specialite: spec })}
                    style={{
                      fontSize: '0.72rem',
                      padding: '0.2rem 0.55rem',
                      borderRadius: '6px',
                      background: formData.specialite === spec ? 'var(--electric-cyan-dim)' : 'rgba(255, 255, 255, 0.05)',
                      border: formData.specialite === spec ? '1px solid var(--electric-cyan)' : '1px solid var(--border-subtle)',
                      color: formData.specialite === spec ? 'var(--electric-cyan)' : 'var(--text-muted)',
                      cursor: 'pointer',
                    }}
                  >
                    {spec}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Expérience */}
          <div className="form-group">
            <label className="form-label" htmlFor="coachExperience">
              Années d'expérience & Diplômes
            </label>
            <input
              id="coachExperience"
              type="text"
              className="form-input"
              placeholder="votre années d'expérience"
              value={formData.experience}
              onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
              disabled={saving}
            />
          </div>

          {/* Biographie */}
          <div className="form-group">
            <label className="form-label" htmlFor="coachBio">
              Biographie & Profil professionnel
            </label>
            <textarea
              id="coachBio"
              className="form-textarea"
              placeholder="Présentez le parcours, les certifications i-motion et la méthode de coaching..."
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              rows={3}
              disabled={saving}
            />
          </div>

          {/* Contact (Email & Téléphone) */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="coachEmail">
                Email professionnel (Optionnel)
              </label>
              <input
                id="coachEmail"
                type="email"
                className="form-input"
                placeholder="votre email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                disabled={saving}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="coachTel">
                Numéro de téléphone (Optionnel)
              </label>
              <input
                id="coachTel"
                type="tel"
                className="form-input"
                placeholder="votre num tel"
                value={formData.telephone}
                onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                disabled={saving}
              />
            </div>
          </div>

          {/* Form Actions */}
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
              onClick={() => setIsModalOpen(false)}
              className="btn btn-secondary"
              disabled={saving}
            >
              Annuler
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Enregistrement...
                </>
              ) : (
                <>
                  <Save size={16} /> {editingCoach ? 'Mettre à jour' : 'Ajouter le coach'}
                </>
              )}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Modal */}
      <Modal
        isOpen={!!coachToDelete}
        onClose={() => setCoachToDelete(null)}
        title="Supprimer le coach"
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
            Supprimer définitivement "{coachToDelete?.prenom} {coachToDelete?.nom}" ?
          </h4>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1.75rem' }}>
            Ce coach sera retiré du centre et dissocié des programmes d'entraînement.
          </p>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
            <button
              onClick={() => setCoachToDelete(null)}
              className="btn btn-secondary"
              disabled={deleting}
            >
              Annuler
            </button>
            <button onClick={confirmDelete} className="btn btn-danger" disabled={deleting}>
              {deleting ? 'Suppression...' : 'Supprimer le coach'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default GestionCoaches;
