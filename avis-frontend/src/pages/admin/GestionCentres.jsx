import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import centresApi from '../../api/centres';
import coachesApi from '../../api/coaches';
import {
  Building2,
  Plus,
  Edit2,
  Trash2,
  Search,
  ExternalLink,
  Phone,
  MapPin,
  AlertCircle,
  Loader2,
  Save,
  UserCheck,
  Users
} from 'lucide-react';
import Modal from '../../components/common/Modal';
import Toast from '../../components/common/Toast';
import Badge from '../../components/common/Badge';

export const GestionCentres = () => {
  const [centres, setCentres] = useState([]);
  const [coaches, setCoaches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState(null);

  // Modal create/edit state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCentre, setEditingCentre] = useState(null);
  const [formData, setFormData] = useState({
    nom: '',
    description: '',
    adresse: '',
    numTel: '',
    ville: 'Tunis',
  });
  const [saving, setSaving] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  // Delete modal state
  const [centreToDelete, setCentreToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const loadCentres = async () => {
    try {
      setLoading(true);
      const centresData = await centresApi.getCentres().catch((err) => {
        console.error('Erreur centresApi:', err);
        return [];
      });
      let coachesData = [];
      try {
        coachesData = await coachesApi.getCoaches();
      } catch (e) {
        console.warn('Coachs non disponibles:', e);
      }
      setCentres(Array.isArray(centresData) ? centresData : []);
      setCoaches(Array.isArray(coachesData) ? coachesData : []);
    } catch (err) {
      console.error('Erreur chargement centres:', err);
      setToast({ type: 'error', message: 'Erreur de chargement des centres.' });
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    loadCentres();
  }, []);

  const openCreateModal = () => {
    setEditingCentre(null);
    setFormData({
      nom: '',
      description: '',
      adresse: '',
      numTel: '',
      ville: 'Tunis',
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const openEditModal = (centre) => {
    setEditingCentre(centre);
    setFormData({
      nom: centre.nom,
      description: centre.description || '',
      adresse: centre.adresse,
      numTel: centre.numTel,
      ville: centre.ville || 'Tunis',
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const validateForm = () => {
    const errs = {};
    if (!formData.nom.trim()) errs.nom = 'Le nom du centre est obligatoire.';
    if (!formData.adresse.trim()) errs.adresse = 'L\'adresse est obligatoire.';
    if (!formData.numTel.trim()) errs.numTel = 'Le numéro de téléphone est obligatoire.';
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSaveCentre = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSaving(true);
    try {
      if (editingCentre) {
        const updated = await centresApi.updateCentre(editingCentre.id, formData);
        setCentres((prev) =>
          prev.map((c) => (String(c.id) === String(updated.id) ? updated : c))
        );
        setToast({ type: 'success', message: 'Centre mis à jour avec succès.' });
      } else {
        const created = await centresApi.createCentre(formData);
        setCentres((prev) => [created, ...prev]);
        setToast({ type: 'success', message: 'Nouveau centre créé avec succès.' });
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error('Erreur enregistrement centre:', err);
      setToast({ type: 'error', message: err.message || 'Erreur lors de l\'enregistrement.' });
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!centreToDelete) return;
    setDeleting(true);
    try {
      await centresApi.deleteCentre(centreToDelete.id);
      setCentres((prev) => prev.filter((c) => String(c.id) !== String(centreToDelete.id)));
      setToast({ type: 'info', message: 'Centre supprimé avec succès.' });
      setCentreToDelete(null);
    } catch (err) {
      console.error('Erreur suppression:', err);
      setToast({ type: 'error', message: 'Erreur lors de la suppression du centre.' });
    } finally {
      setDeleting(false);
    }
  };

  const filteredCentres = centres.filter(
    (c) =>
      c.nom.toLowerCase().includes(search.toLowerCase()) ||
      c.adresse.toLowerCase().includes(search.toLowerCase()) ||
      (c.ville && c.ville.toLowerCase().includes(search.toLowerCase()))
  );

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
            <Building2 size={20} color="var(--electric-cyan)" />
            <span style={{ fontSize: '0.85rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: '700' }}>
              Administration des Studios
            </span>
          </div>
          <h1 style={{ fontSize: '2.2rem' }}>Gestion des Centres i-motion Tunisie</h1>
          <p style={{ fontSize: '0.95rem' }}>
            Ajoutez, mettez à jour ou supprimez les centres d'électrostimulation de la plateforme.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Link to="/admin/coaches" className="btn btn-secondary">
            <UserCheck size={16} /> Gérer les Coachs
          </Link>
          <button onClick={openCreateModal} className="btn btn-primary">
            <Plus size={18} /> Nouveau Centre
          </button>
        </div>
      </div>

      {/* Search Filter */}
      <div style={{ marginBottom: '1.75rem', maxWidth: '450px', position: 'relative' }}>
        <Search
          size={18}
          color="var(--text-dim)"
          style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }}
        />
        <input
          type="text"
          className="form-input"
          style={{ paddingLeft: '2.75rem' }}
          placeholder="Rechercher par nom, ville ou adresse..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Table of Centers */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--electric-cyan)' }}>
          <Loader2 size={36} className="animate-spin" style={{ margin: '0 auto 1rem' }} />
          <p>Chargement des centres...</p>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table-custom">
            <thead>
              <tr>
                <th>Nom du Centre</th>
                <th>Ville / Région</th>
                <th>Équipe Coachs</th>
                <th>Adresse</th>
                <th>Téléphone</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCentres.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '3rem' }}>
                    Aucun centre trouvé.
                  </td>
                </tr>
              ) : (
                filteredCentres.map((centre) => {
                  const centreCoaches = coaches.filter((c) => String(c.centreId) === String(centre.id));
                  return (
                    <tr key={centre.id}>
                      <td>
                        <div style={{ fontWeight: '700', color: 'var(--text-white)' }}>
                          {centre.nom}
                        </div>
                        <div
                          style={{
                            fontSize: '0.78rem',
                            color: 'var(--text-dim)',
                            maxWidth: '300px',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {centre.description}
                        </div>
                      </td>
                      <td>
                        <Badge variant="cyan">{centre.ville || 'Tunis'}</Badge>
                      </td>
                      <td>
                        <Link
                          to="/admin/coaches"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.4rem',
                            padding: '0.2rem 0.55rem',
                            borderRadius: '999px',
                            fontSize: '0.78rem',
                            fontWeight: '600',
                            textDecoration: 'none',
                            background: centreCoaches.length > 0 ? 'rgba(0, 240, 255, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                            color: centreCoaches.length > 0 ? 'var(--electric-cyan)' : 'var(--text-dim)',
                            border: centreCoaches.length > 0 ? '1px solid rgba(0, 240, 255, 0.25)' : '1px solid var(--border-subtle)',
                          }}
                        >
                          <UserCheck size={13} /> {centreCoaches.length} coach{centreCoaches.length > 1 ? 's' : ''}
                        </Link>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}>
                          <MapPin size={14} color="var(--text-dim)" />
                          <span>{centre.adresse}</span>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}>
                          <Phone size={14} color="var(--electric-lime)" />
                          <span>{centre.numTel}</span>
                        </div>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                          <Link
                            to={`/centres/${centre.id}`}
                            className="btn btn-secondary btn-icon"
                            title="Voir la page publique"
                          >
                            <ExternalLink size={15} />
                          </Link>
                          <button
                            onClick={() => openEditModal(centre)}
                            className="btn btn-secondary btn-icon"
                            title="Modifier"
                          >
                            <Edit2 size={15} color="var(--electric-cyan)" />
                          </button>
                          <button
                            onClick={() => setCentreToDelete(centre)}
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

      {/* Create / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCentre ? 'Modifier le Centre i-motion' : 'Créer un Nouveau Centre'}
        maxWidth="600px"
      >
        <form onSubmit={handleSaveCentre}>
          <div className="form-group">
            <label className="form-label" htmlFor="centreNom">
              Nom du Centre <span style={{ color: '#f43f5e' }}>*</span>
            </label>
            <input
              id="centreNom"
              type="text"
              className="form-input"
              placeholder="ex: i-motion Club - Les Berges du Lac 2"
              value={formData.nom}
              onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
              disabled={saving}
            />
            {formErrors.nom && <div className="form-error">{formErrors.nom}</div>}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="centreVille">
                Ville / Gouvernorat <span style={{ color: '#f43f5e' }}>*</span>
              </label>
              <input
                id="centreVille"
                type="text"
                className="form-input"
                placeholder="ex: Tunis, Sousse, Sfax, Ariana..."
                value={formData.ville}
                onChange={(e) => setFormData({ ...formData, ville: e.target.value })}
                disabled={saving}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="centreTel">
                Numéro de téléphone <span style={{ color: '#f43f5e' }}>*</span>
              </label>
              <input
                id="centreTel"
                type="text"
                className="form-input"
                placeholder="ex: +216 71 860 120"
                value={formData.numTel}
                onChange={(e) => setFormData({ ...formData, numTel: e.target.value })}
                disabled={saving}
              />
              {formErrors.numTel && <div className="form-error">{formErrors.numTel}</div>}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="centreAdresse">
              Adresse complète <span style={{ color: '#f43f5e' }}>*</span>
            </label>
            <input
              id="centreAdresse"
              type="text"
              className="form-input"
              placeholder="ex: Rue de la Feuille d'Érable, Les Berges du Lac 2, Tunis"
              value={formData.adresse}
              onChange={(e) => setFormData({ ...formData, adresse: e.target.value })}
              disabled={saving}
            />
            {formErrors.adresse && <div className="form-error">{formErrors.adresse}</div>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="centreDesc">
              Description du centre & équipements
            </label>
            <textarea
              id="centreDesc"
              className="form-textarea"
              placeholder="Présentez les équipements i-motion v2, les coachs certifiés, les commodités (douches, vestiaires individuels)..."
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
                  <Save size={16} /> {editingCentre ? 'Mettre à jour' : 'Créer le centre'}
                </>
              )}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete confirmation modal */}
      <Modal
        isOpen={!!centreToDelete}
        onClose={() => setCentreToDelete(null)}
        title="Supprimer le centre"
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
            Supprimer définitivement "{centreToDelete?.nom}" ?
          </h4>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1.75rem' }}>
            Attention : toutes les séances et données rattachées à ce centre seront affectées.
          </p>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
            <button
              onClick={() => setCentreToDelete(null)}
              className="btn btn-secondary"
              disabled={deleting}
            >
              Annuler
            </button>
            <button onClick={confirmDelete} className="btn btn-danger" disabled={deleting}>
              {deleting ? 'Suppression...' : 'Confirmer la suppression'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default GestionCentres;
