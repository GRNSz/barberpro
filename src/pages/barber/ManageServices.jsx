import { useState, useEffect } from 'react';
import { formatPrice } from '../../utils/mockData';
import Navbar from '../../components/Navbar';
import { Plus, Pencil, Trash2, Clock, X, Scissors } from 'lucide-react';
import { createPortal } from 'react-dom';
import './ManageServices.css';

const emptyService = { name: '', price: '', duration: '', description: '' };

export default function ManageServices() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(emptyService);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await fetch('/api/barbershops/me/services');
        if (!res.ok) throw new Error('Falha ao carregar serviços');
        const data = await res.json();
        setServices(data);
      } catch (err) {
        setError(err.message || 'Erro ao buscar serviços do servidor');
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, []);

  const openAddModal = () => {
    setEditingId(null);
    setFormData(emptyService);
    setModalOpen(true);
  };

  const openEditModal = (svc) => {
    setEditingId(svc.id);
    setFormData({
      name: svc.name,
      price: String(svc.price),
      duration: String(svc.duration),
      description: svc.description,
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingId(null);
    setFormData(emptyService);
  };

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.price || !formData.duration) return;

    try {
      if (editingId) {
        const existingSvc = services.find((s) => s.id === editingId);
        const response = await fetch('/api/barbershops/me/services', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: editingId,
            name: formData.name,
            price: parseFloat(formData.price),
            duration: parseInt(formData.duration, 10),
            description: formData.description,
            active: existingSvc ? existingSvc.active : true
          })
        });
        if (!response.ok) throw new Error('Erro ao salvar alterações do serviço');
        const savedService = await response.json();
        setServices((prev) =>
          prev.map((s) => (s.id === editingId ? savedService : s))
        );
      } else {
        const response = await fetch('/api/barbershops/me/services', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formData.name,
            price: parseFloat(formData.price),
            duration: parseInt(formData.duration, 10),
            description: formData.description,
            active: true
          })
        });
        if (!response.ok) throw new Error('Erro ao adicionar novo serviço');
        const savedService = await response.json();
        setServices((prev) => [...prev, savedService]);
      }
      closeModal();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleToggleActive = async (id) => {
    const svc = services.find((s) => s.id === id);
    if (!svc) return;
    const newActive = !svc.active;

    // Optimistic UI update
    setServices((prev) =>
      prev.map((s) => (s.id === id ? { ...s, active: newActive } : s))
    );

    try {
      const response = await fetch('/api/barbershops/me/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: svc.id,
          name: svc.name,
          price: svc.price,
          duration: svc.duration,
          description: svc.description,
          active: newActive
        })
      });
      if (!response.ok) throw new Error('Erro ao atualizar status');
    } catch (err) {
      console.error(err);
      // Revert on error
      setServices((prev) =>
        prev.map((s) => (s.id === id ? { ...s, active: !newActive } : s))
      );
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`/api/barbershops/me/services/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Erro ao excluir serviço');
      setServices((prev) => prev.filter((s) => s.id !== id));
      setDeleteConfirm(null);
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <>
      <Navbar title="Serviços" />
      <div className="page-enter manage-services">
        {/* Header */}
        <div className="services-header animate-fade-in-up">
          <div>
            <h1 className="heading-lg">Gerenciar Serviços</h1>
            <p className="text-body">Configure os serviços oferecidos na barbearia</p>
          </div>
          <button className="btn btn-primary" onClick={openAddModal}>
            <Plus size={18} />
            Adicionar Serviço
          </button>
        </div>

        {/* Services Grid */}
        <div className="services-grid stagger-children">
          {services.map((svc) => (
            <div className={`service-card card ${!svc.active ? 'service-inactive' : ''}`} key={svc.id}>
              <div className="service-card-header">
                <div className="service-card-icon">{svc.icon}</div>
                <div className="service-card-toggle">
                  <label className="toggle-switch" aria-label={`Ativar/desativar ${svc.name}`}>
                    <input
                      type="checkbox"
                      checked={svc.active}
                      onChange={() => handleToggleActive(svc.id)}
                    />
                    <span className="toggle-slider" />
                  </label>
                </div>
              </div>

              <h3 className="service-card-name">{svc.name}</h3>

              <div className="service-card-meta">
                <span className="service-card-price">{formatPrice(svc.price)}</span>
                <span className="service-card-duration">
                  <Clock size={14} />
                  {svc.duration} min
                </span>
              </div>

              {svc.description && (
                <p className="service-card-desc">{svc.description}</p>
              )}

              <div className="service-card-actions">
                <button
                  className="btn btn-sm btn-secondary"
                  onClick={() => openEditModal(svc)}
                >
                  <Pencil size={14} />
                  Editar
                </button>
                {deleteConfirm === svc.id ? (
                  <div className="service-delete-confirm">
                    <span className="text-small">Confirmar?</span>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => handleDelete(svc.id)}
                    >
                      Sim
                    </button>
                    <button
                      className="btn btn-sm btn-ghost"
                      onClick={() => setDeleteConfirm(null)}
                    >
                      Não
                    </button>
                  </div>
                ) : (
                  <button
                    className="btn btn-sm btn-ghost service-btn-delete"
                    onClick={() => setDeleteConfirm(svc.id)}
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Modal */}
        {modalOpen && createPortal(
          <div className="modal-overlay" onClick={closeModal}>
            <div className="modal animate-scale-in" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2 className="heading-md">
                  {editingId ? 'Editar Serviço' : 'Novo Serviço'}
                </h2>
                <button className="btn btn-icon btn-ghost" onClick={closeModal} aria-label="Fechar">
                  <X size={20} />
                </button>
              </div>

              <form className="service-form" onSubmit={handleSubmit}>
                <div className="input-group">
                  <label className="input-label">Nome do Serviço</label>
                  <input
                    className="input"
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Ex: Corte Masculino"
                    required
                  />
                </div>

                <div className="service-form-row">
                  <div className="input-group">
                    <label className="input-label">Preço (R$)</label>
                    <input
                      className="input"
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleChange}
                      placeholder="45.00"
                      step="0.01"
                      min="0"
                      required
                    />
                  </div>
                  <div className="input-group">
                    <label className="input-label">Duração (min)</label>
                    <input
                      className="input"
                      type="number"
                      name="duration"
                      value={formData.duration}
                      onChange={handleChange}
                      placeholder="30"
                      min="5"
                      required
                    />
                  </div>
                </div>

                <div className="input-group">
                  <label className="input-label">Descrição</label>
                  <textarea
                    className="input service-textarea"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Descreva o serviço..."
                    rows={3}
                  />
                </div>

                <button className="btn btn-primary btn-full" type="submit">
                  {editingId ? 'Salvar Alterações' : 'Adicionar Serviço'}
                </button>
              </form>
            </div>
          </div>,
          document.body
        )}
      </div>
    </>
  );
}
