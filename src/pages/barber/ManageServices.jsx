import { useState } from 'react';
import { MOCK_SERVICES, formatPrice } from '../../utils/mockData';
import Navbar from '../../components/Navbar';
import { Plus, Pencil, Trash2, Clock, X, Scissors } from 'lucide-react';
import './ManageServices.css';

const emptyService = { name: '', price: '', duration: '', description: '' };

export default function ManageServices() {
  const [services, setServices] = useState(() => MOCK_SERVICES.map((s) => ({ ...s })));
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(emptyService);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.price || !formData.duration) return;

    if (editingId) {
      setServices((prev) =>
        prev.map((s) =>
          s.id === editingId
            ? {
                ...s,
                name: formData.name,
                price: parseFloat(formData.price),
                duration: parseInt(formData.duration, 10),
                description: formData.description,
              }
            : s
        )
      );
    } else {
      const newService = {
        id: `svc-${Date.now()}`,
        name: formData.name,
        price: parseFloat(formData.price),
        duration: parseInt(formData.duration, 10),
        description: formData.description,
        active: true,
        icon: '✂️',
      };
      setServices((prev) => [...prev, newService]);
    }
    closeModal();
  };

  const handleToggleActive = (id) => {
    setServices((prev) =>
      prev.map((s) => (s.id === id ? { ...s, active: !s.active } : s))
    );
  };

  const handleDelete = (id) => {
    setServices((prev) => prev.filter((s) => s.id !== id));
    setDeleteConfirm(null);
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
        {modalOpen && (
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
          </div>
        )}
      </div>
    </>
  );
}
