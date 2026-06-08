import { useState, useEffect, useMemo, useCallback } from 'react';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { formatPrice } from '../../utils/mockData';
import { 
  TrendingUp, TrendingDown, DollarSign, Plus, Trash2, 
  Calendar, Briefcase, Percent, PieChart, X, HelpCircle
} from 'lucide-react';
import './FinancialAnalysis.css';

const CATEGORIES = ['Aluguel', 'Produtos', 'Energia', 'Marketing', 'Outros'];

export default function FinancialAnalysis() {
  const { user } = useAuth();
  const { appointments } = useData();

  // Costs states
  const [costs, setCosts] = useState([]);
  const [loadingCosts, setLoadingCosts] = useState(true);
  const [filterCategory, setFilterCategory] = useState('Todos');

  // Modal form states
  const [modalOpen, setModalOpen] = useState(false);
  const [description, setDescription] = useState('');
  const [value, setValue] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState('Outros');
  const [saving, setSaving] = useState(false);

  // Fetch costs from DB
  const fetchCosts = useCallback(async () => {
    setLoadingCosts(true);
    try {
      const res = await fetch('/api/barbershops/me/costs');
      if (res.ok) {
        const data = await res.json();
        setCosts(data);
      }
    } catch (err) {
      console.warn('Erro ao buscar custos:', err);
    } finally {
      setLoadingCosts(false);
    }
  }, []);

  useEffect(() => {
    fetchCosts();
  }, [fetchCosts]);

  // --- Calculations ---

  // Gains from completed and confirmed appointments
  const gains = useMemo(() => {
    return appointments
      .filter((a) => a.status === 'concluído' || a.status === 'confirmado')
      .reduce((sum, a) => sum + parseFloat(a.price || 0), 0);
  }, [appointments]);

  // Total costs
  const totalCosts = useMemo(() => {
    return costs.reduce((sum, c) => sum + parseFloat(c.value || 0), 0);
  }, [costs]);

  const netProfit = gains - totalCosts;

  const margin = useMemo(() => {
    if (gains <= 0) return 0;
    return (netProfit / gains) * 100;
  }, [gains, netProfit]);

  // Filtered expense items
  const filteredCosts = useMemo(() => {
    if (filterCategory === 'Todos') return costs;
    return costs.filter((c) => c.category === filterCategory);
  }, [costs, filterCategory]);

  // Category breakdown
  const categoryBreakdown = useMemo(() => {
    const breakdown = CATEGORIES.reduce((acc, cat) => {
      acc[cat] = 0;
      return acc;
    }, {});

    costs.forEach((c) => {
      if (breakdown[c.category] !== undefined) {
        breakdown[c.category] += parseFloat(c.value || 0);
      } else {
        breakdown['Outros'] += parseFloat(c.value || 0);
      }
    });

    return Object.entries(breakdown).map(([name, val]) => {
      const pct = totalCosts > 0 ? (val / totalCosts) * 100 : 0;
      return { name, value: val, percentage: pct };
    }).sort((a, b) => b.value - a.value);
  }, [costs, totalCosts]);

  // Monthly groups for visual bar charts (last 6 months)
  const monthlyData = useMemo(() => {
    const data = {};
    const monthsNames = [
      'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 
      'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
    ];

    // Initialize last 6 months
    const today = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      data[key] = {
        label: `${monthsNames[d.getMonth()]}/${String(d.getFullYear()).slice(-2)}`,
        gains: 0,
        costs: 0
      };
    }

    // Add gains
    appointments
      .filter((a) => a.status === 'concluído' || a.status === 'confirmado')
      .forEach((a) => {
        const key = a.date.slice(0, 7); // YYYY-MM
        if (data[key]) {
          data[key].gains += parseFloat(a.price || 0);
        }
      });

    // Add costs
    costs.forEach((c) => {
      const key = c.date.slice(0, 7); // YYYY-MM
      if (data[key]) {
        data[key].costs += parseFloat(c.value || 0);
      }
    });

    return Object.values(data);
  }, [appointments, costs]);

  // --- Handlers ---

  const handleOpenModal = () => {
    setDescription('');
    setValue('');
    setDate(new Date().toISOString().split('T')[0]);
    setCategory('Outros');
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  const handleAddCostSubmit = async (e) => {
    e.preventDefault();
    if (!description || !value || !date || !category) return;
    setSaving(true);

    try {
      const res = await fetch('/api/barbershops/me/costs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description,
          value: parseFloat(value),
          date,
          category
        })
      });
      if (res.ok) {
        const newCost = await res.json();
        setCosts(prev => [newCost, ...prev]);
        handleCloseModal();
      } else {
        const err = await res.json();
        alert(err.error || 'Erro ao salvar despesa.');
      }
    } catch (err) {
      console.error(err);
      alert('Erro ao se conectar ao servidor.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCost = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir esta despesa?')) return;
    try {
      const res = await fetch(`/api/barbershops/me/costs/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setCosts(prev => prev.filter(c => c.id !== id));
      } else {
        alert('Erro ao excluir despesa.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Helper color indicators for category badges
  const getCategoryClass = (cat) => {
    const slug = cat.toLowerCase();
    return `badge-${slug}`;
  };

  return (
    <div className="page-enter financial-page">
      {/* Header */}
      <div className="financial-header animate-fade-in-up">
        <div>
          <h1 className="heading-lg">Financeiro</h1>
          <p className="text-body text-muted">Controle de receitas, despesas e margens de lucro</p>
        </div>
        <button className="btn btn-primary" onClick={handleOpenModal}>
          <Plus size={18} />
          Lançar Despesa
        </button>
      </div>

      {/* Summary Stats Grid */}
      <div className="financial-stats-grid stagger-children">
        <div className="financial-stat-card card">
          <div className="financial-stat-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
            <TrendingUp size={24} />
          </div>
          <div className="financial-stat-info">
            <span className="financial-stat-label">Faturamento Total</span>
            <span className="financial-stat-value" style={{ color: '#10b981' }}>{formatPrice(gains)}</span>
          </div>
        </div>

        <div className="financial-stat-card card">
          <div className="financial-stat-icon" style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444' }}>
            <TrendingDown size={24} />
          </div>
          <div className="financial-stat-info">
            <span className="financial-stat-label">Custos / Despesas</span>
            <span className="financial-stat-value" style={{ color: '#ef4444' }}>{formatPrice(totalCosts)}</span>
          </div>
        </div>

        <div className="financial-stat-card card">
          <div className="financial-stat-icon" style={{ 
            background: netProfit >= 0 ? 'rgba(52, 211, 153, 0.1)' : 'rgba(239, 68, 68, 0.1)', 
            color: netProfit >= 0 ? '#10b981' : '#ef4444' 
          }}>
            <DollarSign size={24} />
          </div>
          <div className="financial-stat-info">
            <span className="financial-stat-label">Lucro Líquido</span>
            <span className="financial-stat-value">{formatPrice(netProfit)}</span>
          </div>
        </div>

        <div className="financial-stat-card card">
          <div className="financial-stat-icon" style={{ background: 'rgba(200, 169, 110, 0.15)', color: 'var(--accent-primary)' }}>
            <Percent size={24} />
          </div>
          <div className="financial-stat-info">
            <span className="financial-stat-label">Margem de Lucro</span>
            <span className="financial-stat-value" style={{ color: 'var(--accent-primary)' }}>{margin.toFixed(1)}%</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Left = Expense Manager, Right = Chart Analysis */}
      <div className="financial-main-grid">
        {/* Expenses Manager */}
        <div className="expenses-manager-card card animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <h2 className="financial-section-title">
            <Briefcase size={20} className="text-accent" />
            Gerenciamento de Custos
          </h2>

          {/* Filter Categories scroll bar */}
          <div className="expenses-filter-bar">
            <button 
              className={`expenses-filter-btn ${filterCategory === 'Todos' ? 'active' : ''}`}
              onClick={() => setFilterCategory('Todos')}
            >
              Todos
            </button>
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                className={`expenses-filter-btn ${filterCategory === cat ? 'active' : ''}`}
                onClick={() => setFilterCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Expense Item list */}
          <div className="expenses-list">
            {loadingCosts ? (
              <div className="empty-state-mini">
                <p>Carregando despesas...</p>
              </div>
            ) : filteredCosts.length === 0 ? (
              <div className="empty-state-mini">
                <HelpCircle size={32} style={{ opacity: 0.3, marginBottom: '8px' }} />
                <p className="text-muted text-small">Nenhuma despesa lançada nesta categoria.</p>
              </div>
            ) : (
              filteredCosts.map(cost => (
                <div className="expense-item" key={cost.id}>
                  <div className="expense-details">
                    <span className="expense-desc">{cost.description}</span>
                    <div className="expense-meta">
                      <span className={`expense-category-badge ${getCategoryClass(cost.category)}`}>
                        {cost.category}
                      </span>
                      <span>•</span>
                      <span>{cost.date.split('-').reverse().join('/')}</span>
                    </div>
                  </div>
                  <div className="expense-right">
                    <span className="expense-value">{formatPrice(cost.value)}</span>
                    <button 
                      className="btn-icon btn-ghost expense-delete-btn"
                      onClick={() => handleDeleteCost(cost.id)}
                      aria-label="Excluir despesa"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Charts & Analysis */}
        <div className="analysis-panel-card card animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          {/* Revenue vs Cost Monthly graph */}
          <div className="monthly-chart">
            <h2 className="financial-section-title">
              <PieChart size={20} className="text-accent" />
              Ganhos x Custos (Últimos 6 meses)
            </h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {monthlyData.map(m => {
                const max = Math.max(...monthlyData.map(item => Math.max(item.gains, item.costs))) || 1;
                const gainWidth = (m.gains / max) * 100;
                const costWidth = (m.costs / max) * 100;
                
                return (
                  <div className="chart-bar-group" key={m.label}>
                    <div className="chart-bar-label">
                      <span>{m.label}</span>
                      <span className="text-small text-muted">
                        <span style={{ color: '#10b981', fontWeight: 'bold' }}>{formatPrice(m.gains)}</span>
                        {' '}/{' '}
                        <span style={{ color: '#ef4444', fontWeight: 'bold' }}>{formatPrice(m.costs)}</span>
                      </span>
                    </div>
                    <div className="chart-bar-container">
                      <div className="chart-bar-gain" style={{ width: `${gainWidth}%`, position: 'absolute', left: 0, zIndex: 2 }} />
                      <div className="chart-bar-cost" style={{ width: `${costWidth}%`, position: 'absolute', left: 0, top: 0, zIndex: 1, opacity: 0.6 }} />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="chart-legend">
              <div className="legend-item">
                <span className="legend-dot" style={{ background: '#10b981' }} />
                <span>Ganhos (Faturamento)</span>
              </div>
              <div className="legend-item">
                <span className="legend-dot" style={{ background: '#ef4444' }} />
                <span>Custos (Despesas)</span>
              </div>
            </div>
          </div>

          {/* Category Breakdown Progress indicators */}
          <div className="category-breakdown">
            <h2 className="financial-section-title">
              <PieChart size={20} className="text-accent" />
              Distribuição de Despesas
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {categoryBreakdown.map(cat => {
                const colors = {
                  Aluguel: '#ef4444',
                  Produtos: '#3b82f6',
                  Energia: '#f59e0b',
                  Marketing: '#a855f7',
                  Outros: '#6b7280'
                };
                const color = colors[cat.name] || '#6b7280';
                
                return (
                  <div className="category-bar-row" key={cat.name}>
                    <div className="category-bar-info">
                      <span>{cat.name}</span>
                      <span>{formatPrice(cat.value)} ({cat.percentage.toFixed(0)}%)</span>
                    </div>
                    <div className="category-progress-track">
                      <div 
                        className="category-progress-fill" 
                        style={{ width: `${cat.percentage}%`, background: color }} 
                      />
                    </div>
                  </div>
                );
              })}
              {costs.length === 0 && (
                <p className="text-small text-muted text-center" style={{ padding: '10px' }}>
                  Nenhum custo lançado para gerar distribuição.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Lançar Despesa Modal */}
      {modalOpen && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal animate-scale-in" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '450px', width: '100%' }}>
            <div className="modal-header">
              <h2 className="heading-md">Lançar Nova Despesa</h2>
              <button className="btn btn-icon btn-ghost" onClick={handleCloseModal} aria-label="Fechar">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddCostSubmit} className="financial-modal-form">
              <div className="input-group">
                <label className="input-label" htmlFor="expense-desc">Descrição</label>
                <input
                  id="expense-desc"
                  className="input"
                  type="text"
                  placeholder="Ex: Aluguel de Junho"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </div>

              <div className="financial-form-row">
                <div className="input-group">
                  <label className="input-label" htmlFor="expense-value">Valor (R$)</label>
                  <input
                    id="expense-value"
                    className="input"
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="0.00"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    required
                  />
                </div>

                <div className="input-group">
                  <label className="input-label" htmlFor="expense-date">Data</label>
                  <input
                    id="expense-date"
                    className="input"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="input-group">
                <label className="input-label" htmlFor="expense-category">Categoria</label>
                <select
                  id="expense-category"
                  className="input"
                  style={{ background: 'var(--bg-body)', color: 'var(--text-primary)' }}
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  required
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <button className="btn btn-primary btn-full mt-md" type="submit" disabled={saving}>
                {saving ? 'Lançando...' : 'Lançar Despesa'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
