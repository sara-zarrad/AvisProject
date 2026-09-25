import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import seancesApi from '../../api/seances';
import centresApi from '../../api/centres';
import coachesApi from '../../api/coaches';
import {
  Dumbbell,
  Building2,
  Plus,
  Edit2,
  Trash2,
  Search,
  ExternalLink,
  Star,
  AlertCircle,
  Loader2,
  Save,
  Filter,
  UserCheck,
  Check
} from 'lucide-react';
import Modal from '../../components/common/Modal';
import Toast from '../../components/common/Toast';
import Badge from '../../components/common/Badge';
import RatingDisplay from '../../components/common/RatingDisplay';

const SESSION_TYPES = [
  'Renforcement & Musculation',
  'Cardio & Perte de Poids',
  'Santé & Rééducation',
  'Tonification Ciblée',
  'Bien-être & Minceur',
  'Performance Sportive',
  'Récupération Active',
];

export const GestionSeances = () => {
  const [seances, setSeances] = useState([]);
  const [centres, setCentres] = useState([]);
  const [coaches, setCoaches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCentreFilter, setSelectedCentreFilter] = useState('ALL');
  const [toast, setToast] = useState(null);

  // Create/Edit modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSeance, setEditingSeance] = useState(null);
  const [formData, setFormData] = useState({
    nom: '',
    description: '',
    type: 'Renforcement & Musculation',
    centreId: '',
    coachIds: [],
  });
  const [saving, setSaving] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  // Delete modal state
  const [seanceToDelete, setSeanceToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const centresData = await centresApi.getCentres().catch(() => []);
      let seancesData = [];
      try {
        seancesData = await seancesApi.getSeances();
      } catch (e) {
        console.warn('Séances non disponibles:', e);
      }
      let coachesData = [];
      try {
        coachesData = await coachesApi.getCoaches();
      } catch (e) {
        console.warn('Coachs non disponibles:', e);
      }
      setCentres(Array.isArray(centresData) ? centresData : []);
      setSeances(Array.isArray(seancesData) ? seancesData : []);
      setCoaches(Array.isArray(coachesData) ? coachesData : []);
    } catch (err) {
      console.error('Erreur chargement données séances:', err);
      setToast({ type: 'error', message: 'Erreur lors du chargement des données.' });
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    loadData();
  }, []);

  const openCreateModal = () => {
    setEditingSeance(null);
    setFormData({
      nom: '',
      description: '',
      type: 'Renforcement & Musculation',
      centreId: centres.length > 0 ? String(centres[0].id) : '',
      coachIds: coaches.length > 0 ? [coaches[0].id] : [],
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const openEditModal = (seance) => {
    setEditingSeance(seance);
    const existingCoachIds = seance.coachIds || (seance.coaches ? seance.coaches.map((c) => c.id) : []);
    setFormData({
      nom: seance.nom,
      description: seance.description || '',
      type: seance.type || 'Renforcement & Musculation',
      centreId: String(seance.centreId),
      coachIds: existingCoachIds,
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const toggleCoachSelection = (coachId) => {
    const numericId = Number(coachId);
    setFormData((prev) => {
      const exists = prev.coachIds.includes(numericId);
      const newCoachIds = exists
        ? prev.coachIds.filter((id) => id !== numericId)
        : [...prev.coachIds, numericId];
      return { ...prev, coachIds: newCoachIds };
    });
  };

  const validateForm = () => {
    const errs = {};
    if (!formData.nom.trim()) errs.nom = 'Le nom de la séance est obligatoire.';
    if (!formData.centreId) errs.centreId = 'Veuillez associer un centre à cette séance.';
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSaveSeance = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSaving(true);
    try {
      if (editingSeance) {
        const updated = await seancesApi.updateSeance(editingSeance.id, formData);
        setSeances((prev) =>
          prev.map((s) => (String(s.id) === String(updated.id) ? { ...s, ...updated } : s))
        );
        setToast({ type: 'success', message: 'Séance modifiée avec succès.' });
      } else {
        const created = await seancesApi.createSeance(formData);
        const centre = centres.find((c) => String(c.id) === String(formData.centreId));
        setSeances((prev) => [{ ...created, centreNom: centre ? centre.nom : '' }, ...prev]);
        setToast({ type: 'success', message: 'Nouvelle séance ajoutée au catalogue avec ses coaches.' });
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error('Erreur enregistrement séance:', err);
      setToast({ type: 'error', message: err.message || 'Erreur lors de l\'enregistrement.' });
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!seanceToDelete) return;
    setDeleting(true);
    try {
      await seancesApi.deleteSeance(seanceToDelete.id);
      setSeances((prev) => prev.filter((s) => String(s.id) !== String(seanceToDelete.id)));
      setToast({ type: 'info', message: 'Séance supprimée.' });
      setSeanceToDelete(null);
    } catch (err) {
      console.error('Erreur suppression séance:', err);
      setToast({ type: 'error', message: 'Erreur lors de la suppression.' });
    } finally {
      setDeleting(false);
    }
  };

  const filteredSeances = seances.filter((s) => {
    const matchesSearch =
      s.nom.toLowerCase().includes(search.toLowerCase()) ||
      (s.type && s.type.toLowerCase().includes(search.toLowerCase())) ||
      (s.centreNom && s.centreNom.toLowerCase().includes(search.toLowerCase()));

    const matchesCentre =
      selectedCentreFilter === 'ALL' || String(s.centreId) === String(selectedCentreFilter);

    return matchesSearch && matchesCentre;
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
            <Dumbbell size={20} color="var(--electric-cyan)" />
            <span style={{ fontSize: '0.85rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: '700' }}>
              Gestion des Programmes & Instructeurs
            </span>
          </div>
          <h1 style={{ fontSize: '2.2rem' }}>Gestion des Séances EMS</h1>
          <p style={{ fontSize: '0.95rem' }}>
            Configurez les protocoles d'entraînement EMS, assignez les instructeurs et suivez leurs notes moyennes.
          </p>
        </div>

        <button onClick={openCreateModal} className="btn btn-primary">
          <Plus size={18} /> Nouvelle Séance EMS
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
            placeholder="Rechercher par nom de séance, type..."
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
          <p>Chargement des protocoles de séances...</p>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table-custom">
            <thead>
              <tr>
                <th>Séance EMS</th>
                <th>Type d'entraînement</th>
                <th>Centre Associé</th>
                <th>Coaches Assignés</th>
                <th>Moyenne des Avis</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSeances.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '3rem' }}>
                    Aucune séance trouvée.
                  </td>
                </tr>
              ) : (
                filteredSeances.map((seance) => {
                  const centre = centres.find((c) => String(c.id) === String(seance.centreId));
                  const seanceCoaches = seance.coaches || [];

                  return (
                    <tr key={seance.id}>
                      <td>
                        <div style={{ fontWeight: '700', color: 'var(--text-white)' }}>
                          {seance.nom}
                        </div>
                        <div
                          style={{
                            fontSize: '0.78rem',
                            color: 'var(--text-dim)',
                            maxWidth: '280px',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {seance.description}
                        </div>
                      </td>
                      <td>
                        <Badge variant="purple">{seance.type || 'Général'}</Badge>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.88rem' }}>
                          <Building2 size={14} color="var(--electric-cyan)" />
                          <span>{centre ? centre.nom : seance.centreNom || 'Non assigné'}</span>
                        </div>
                      </td>
                      <td>
                        {seanceCoaches.length === 0 ? (
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>Non assigné</span>
                        ) : (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                            {seanceCoaches.map((c) => (
                              <span
                                key={c.id}
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '0.25rem',
                                  fontSize: '0.75rem',
                                  padding: '0.15rem 0.5rem',
                                  borderRadius: '999px',
                                  background: 'rgba(0, 240, 255, 0.08)',
                                  border: '1px solid rgba(0, 240, 255, 0.2)',
                                  color: 'var(--electric-cyan)',
                                }}
                              >
                                <UserCheck size={11} /> {c.prenom} {c.nom}
                              </span>
                            ))}
                          </div>
                        )}
                      </td>
                      <td>
                        <RatingDisplay score={seance.moyenneNote || 0} size="sm" />
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                          <Link
                            to={`/seances/${seance.id}`}
                            className="btn btn-secondary btn-icon"
                            title="Voir les avis et la fiche"
                          >
                            <ExternalLink size={15} />
                          </Link>
                          <button
                            onClick={() => openEditModal(seance)}
                            className="btn btn-secondary btn-icon"
                            title="Modifier"
                          >
                            <Edit2 size={15} color="var(--electric-cyan)" />
                          </button>
                          <button
                            onClick={() => setSeanceToDelete(seance)}
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

      {/* Modal Create / Edit */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingSeance ? 'Modifier la séance EMS' : 'Créer une séance EMS'}
        maxWidth="650px"
      >
        <form onSubmit={handleSaveSeance}>
          <div className="form-group">
            <label className="form-label" htmlFor="seanceNom">
              Nom de la séance EMS <span style={{ color: '#f43f5e' }}>*</span>
            </label>
            <input
              id="seanceNom"
              type="text"
              className="form-input"
              placeholder="ex: EMS Full Body Sculpt & Strength"
              value={formData.nom}
              onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
              disabled={saving}
            />
            {formErrors.nom && <div className="form-error">{formErrors.nom}</div>}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="seanceType">
                Type de séance
              </label>
              <select
                id="seanceType"
                className="form-select"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                disabled={saving}
              >
                {SESSION_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="seanceCentre">
                Centre i-motion associé <span style={{ color: '#f43f5e' }}>*</span>
              </label>
              <select
                id="seanceCentre"
                className="form-select"
                value={formData.centreId}
                onChange={(e) => setFormData({ ...formData, centreId: e.target.value })}
                disabled={saving}
              >
                <option value="">Sélectionner un centre...</option>
                {centres.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nom} ({c.ville || 'Tunis'})
                  </option>
                ))}
              </select>
              {formErrors.centreId && <div className="form-error">{formErrors.centreId}</div>}
            </div>
          </div>

          {/* Coach assignment */}
          <div className="form-group">
            <label className="form-label" style={{ marginBottom: '0.4rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <UserCheck size={16} color="var(--electric-cyan)" /> Coaches EMS Assignés à la séance
              </span>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>
                Sélectionnez les instructeurs qui dispensent ce protocole
              </span>
            </label>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                gap: '0.5rem',
                maxHeight: '180px',
                overflowY: 'auto',
                padding: '0.5rem',
                borderRadius: '8px',
                background: 'rgba(0, 0, 0, 0.25)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              {coaches.map((c) => {
                const isSelected = formData.coachIds.includes(Number(c.id));
                return (
                  <div
                    key={c.id}
                    onClick={() => toggleCoachSelection(c.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.5rem 0.65rem',
                      borderRadius: '6px',
                      background: isSelected ? 'rgba(0, 240, 255, 0.12)' : 'rgba(255, 255, 255, 0.02)',
                      border: isSelected ? '1px solid var(--electric-cyan)' : '1px solid var(--border-subtle)',
                      cursor: 'pointer',
                      fontSize: '0.82rem',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div
                      style={{
                        width: '20px',
                        height: '20px',
                        borderRadius: '4px',
                        border: isSelected ? '1px solid var(--electric-cyan)' : '1px solid var(--text-dim)',
                        background: isSelected ? 'var(--electric-cyan)' : 'transparent',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#06090f',
                        flexShrink: 0,
                      }}
                    >
                      {isSelected && <Check size={14} strokeWidth={3} />}
                    </div>
                    <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      <span style={{ fontWeight: '600', color: isSelected ? 'var(--text-white)' : 'var(--text-main)' }}>
                        {c.prenom} {c.nom}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="seanceDesc">
              Description détaillée du protocole EMS
            </label>
            <textarea
              id="seanceDesc"
              className="form-textarea"
              placeholder="Expliquez les groupes musculaires sollicités, l'intensité cardio, les objectifs..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              disabled={saving}
            />
          </div>

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
                  <Save size={16} /> {editingSeance ? 'Mettre à jour' : 'Ajouter au catalogue'}
                </>
              )}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Modal */}
      <Modal
        isOpen={!!seanceToDelete}
        onClose={() => setSeanceToDelete(null)}
        title="Supprimer la séance EMS"
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
            Supprimer définitivement "{seanceToDelete?.nom}" ?
          </h4>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1.75rem' }}>
            Tous les avis rattachés à cette séance seront également supprimés.
          </p>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
            <button
              onClick={() => setSeanceToDelete(null)}
              className="btn btn-secondary"
              disabled={deleting}
            >
              Annuler
            </button>
            <button onClick={confirmDelete} className="btn btn-danger" disabled={deleting}>
              {deleting ? 'Suppression...' : 'Supprimer la séance'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default GestionSeances;
