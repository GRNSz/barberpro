import { useState, useEffect, useMemo, useCallback } from 'react';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { formatPrice } from '../../utils/mockData';
import { 
  TrendingUp, TrendingDown, DollarSign, Plus, Trash2, 
  Calendar, Briefcase, Percent, PieChart, X, HelpCircle
} from 'lucide-react';
import { createPortal } from 'react-dom';
import './FinancialAnalysis.css';

const EXPENSE_CATEGORIES = ['Aluguel', 'Produtos', 'Energia', 'Marketing', 'Salários', 'Outros'];
const REVENUE_CATEGORIES = ['Serviços', 'Produtos', 'Comissão', 'Outros'];
const ALL_CATEGORIES = Array.from(new Set([...EXPENSE_CATEGORIES, ...REVENUE_CATEGORIES]));

const CATEGORY_COLORS = {
  Aluguel: '#ef4444',
  Produtos: '#3b82f6',
  Energia: '#f59e0b',
  Marketing: '#a855f7',
  Salários: '#ec4899',
  Serviços: '#10b981',
  Comissão: '#8b5cf6',
  Outros: '#6b7280'
};

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
  const [category, setCategory] = useState(EXPENSE_CATEGORIES[0]);
  const [type, setType] = useState('despesa');
  const [saving, setSaving] = useState(false);

  // Dynamic category list reset when type changes
  useEffect(() => {
    if (type === 'despesa') {
      setCategory(EXPENSE_CATEGORIES[0]);
    } else {
      setCategory(REVENUE_CATEGORIES[0]);
    }
  }, [type]);

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

  // Gains from completed and confirmed appointments that were paid + manual revenues
  const gains = useMemo(() => {
    const appointmentGains = appointments
      .filter((a) => a.paymentReceived)
      .reduce((sum, a) => sum + parseFloat(a.price || 0), 0);
    const manualRevenues = costs
      .filter((c) => c.type === 'receita')
      .reduce((sum, c) => sum + parseFloat(c.value || 0), 0);
    return appointmentGains + manualRevenues;
  }, [appointments, costs]);

  // Total costs (only despesas)
  const totalCosts = useMemo(() => {
    return costs
      .filter((c) => c.type === 'despesa')
      .reduce((sum, c) => sum + parseFloat(c.value || 0), 0);
  }, [costs]);

  const netProfit = gains - totalCosts;

  const margin = useMemo(() => {
    if (gains <= 0) return 0;
    return (netProfit / gains) * 100;
  }, [gains, netProfit]);

  // Filtered expense/revenue items and unified ledger
  const mergedTransactions = useMemo(() => {
    const manualItems = costs.map(c => ({
      id: c.id,
      description: c.description,
      value: parseFloat(c.value || 0),
      date: c.date,
      category: c.category,
      type: c.type || 'despesa',
      isManual: true
    }));

    const appointmentItems = appointments
      .filter(a => a.paymentReceived)
      .map(a => ({
        id: a.id,
        description: `${a.clientName} — ${a.service}`,
        value: parseFloat(a.price || 0),
        date: a.date,
        category: 'Serviços',
        type: 'receita',
        isManual: false
      }));

    const merged = [...manualItems, ...appointmentItems];
    return merged.sort((a, b) => {
      const dateCompare = b.date.localeCompare(a.date);
      if (dateCompare !== 0) return dateCompare;
      return b.id.localeCompare(a.id);
    });
  }, [costs, appointments]);

  const filteredCosts = useMemo(() => {
    if (filterCategory === 'Todos') return mergedTransactions;
    return mergedTransactions.filter((c) => c.category === filterCategory);
  }, [mergedTransactions, filterCategory]);

  // Expense Category breakdown
  const expenseCategoryBreakdown = useMemo(() => {
    const breakdown = EXPENSE_CATEGORIES.reduce((acc, cat) => {
      acc[cat] = 0;
      return acc;
    }, {});

    const despesas = costs.filter((c) => c.type === 'despesa');

    despesas.forEach((c) => {
      if (breakdown[c.category] !== undefined) {
        breakdown[c.category] += parseFloat(c.value || 0);
      } else {
        breakdown['Outros'] += parseFloat(c.value || 0);
      }
    });

    const totalDespesas = despesas.reduce((sum, c) => sum + parseFloat(c.value || 0), 0);

    return Object.entries(breakdown).map(([name, val]) => {
      const pct = totalDespesas > 0 ? (val / totalDespesas) * 100 : 0;
      return { name, value: val, percentage: pct };
    }).sort((a, b) => b.value - a.value);
  }, [costs]);

  // Revenue Category breakdown (includes manual revenues + appointment gains)
  const revenueCategoryBreakdown = useMemo(() => {
    const breakdown = REVENUE_CATEGORIES.reduce((acc, cat) => {
      acc[cat] = 0;
      return acc;
    }, {});

    // Manual revenues
    const manualRevenues = costs.filter((c) => c.type === 'receita');
    manualRevenues.forEach((c) => {
      if (breakdown[c.category] !== undefined) {
        breakdown[c.category] += parseFloat(c.value || 0);
      } else {
        breakdown['Outros'] += parseFloat(c.value || 0);
      }
    });

    // Appointment gains go to 'Serviços' category
    const appointmentGains = appointments
      .filter((a) => a.paymentReceived)
      .reduce((sum, a) => sum + parseFloat(a.price || 0), 0);
    
    breakdown['Serviços'] = (breakdown['Serviços'] || 0) + appointmentGains;

    const totalRevenues = manualRevenues.reduce((sum, c) => sum + parseFloat(c.value || 0), 0) + appointmentGains;

    return Object.entries(breakdown).map(([name, val]) => {
      const pct = totalRevenues > 0 ? (val / totalRevenues) * 100 : 0;
      return { name, value: val, percentage: pct };
    }).sort((a, b) => b.value - a.value);
  }, [appointments, costs]);

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

    // Add gains from paid appointments
    appointments
      .filter((a) => a.paymentReceived)
      .forEach((a) => {
        const key = a.date.slice(0, 7); // YYYY-MM
        if (data[key]) {
          data[key].gains += parseFloat(a.price || 0);
        }
      });

    // Add costs and manual revenues from ledger
    costs.forEach((c) => {
      const key = c.date.slice(0, 7); // YYYY-MM
      if (data[key]) {
        if (c.type === 'receita') {
          data[key].gains += parseFloat(c.value || 0);
        } else {
          data[key].costs += parseFloat(c.value || 0);
        }
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
    setType('despesa');
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  const handleAddCostSubmit = async (e) => {
    e.preventDefault();
    if (!description || !value || !date || !category || !type) return;
    setSaving(true);

    try {
      const res = await fetch('/api/barbershops/me/costs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description,
          value: parseFloat(value),
          date,
          category,
          type
        })
      });
      if (res.ok) {
        const newCost = await res.json();
        setCosts(prev => [newCost, ...prev]);
        handleCloseModal();
      } else {
        const err = await res.json();
        alert(err.error || 'Erro ao salvar transação.');
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
          Lançar Transação
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
            {ALL_CATEGORIES.map(cat => (
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
                <p>Carregando transações...</p>
              </div>
            ) : filteredCosts.length === 0 ? (
              <div className="empty-state-mini">
                <HelpCircle size={32} style={{ opacity: 0.3, marginBottom: '8px' }} />
                <p className="text-muted text-small">Nenhuma transação lançada nesta categoria.</p>
              </div>
            ) : (
              filteredCosts.map(cost => (
                <div className="expense-item" key={cost.id} style={{ borderLeft: cost.type === 'receita' ? '4px solid #10b981' : '4px solid #ef4444' }}>
                  <div className="expense-details">
                    <span className="expense-desc" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {cost.description}
                      <span className={`badge badge-${cost.type === 'receita' ? 'success' : 'danger'}`} style={{ fontSize: '0.625rem', padding: '2px 6px' }}>
                        {cost.type === 'receita' ? 'Receita' : 'Despesa'}
                      </span>
                    </span>
                    <div className="expense-meta">
                      <span className={`expense-category-badge ${getCategoryClass(cost.category)}`}>
                        {cost.category}
                      </span>
                      <span>•</span>
                      <span>{cost.date.split('-').reverse().join('/')}</span>
                    </div>
                  </div>
                  <div className="expense-right">
                    <span className="expense-value" style={{ color: cost.type === 'receita' ? '#10b981' : '#ef4444', fontWeight: 'bold' }}>
                      {cost.type === 'receita' ? '+' : '-'} {formatPrice(cost.value)}
                    </span>
                     {cost.isManual && (
                      <button 
                        className="btn-icon btn-ghost expense-delete-btn"
                        onClick={() => handleDeleteCost(cost.id)}
                        aria-label="Excluir transação"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
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
          <div className="category-breakdown" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Distribuição de Receitas */}
            <div>
              <h2 className="financial-section-title" style={{ marginBottom: '10px' }}>
                <PieChart size={20} style={{ color: '#10b981' }} />
                Distribuição de Receitas
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {revenueCategoryBreakdown.map(cat => {
                  const color = CATEGORY_COLORS[cat.name] || '#6b7280';
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
                {gains === 0 && (
                  <p className="text-small text-muted text-center" style={{ padding: '10px' }}>
                    Nenhuma receita registada.
                  </p>
                )}
              </div>
            </div>

            {/* Distribuição de Despesas */}
            <div>
              <h2 className="financial-section-title" style={{ marginBottom: '10px' }}>
                <PieChart size={20} style={{ color: '#ef4444' }} />
                Distribuição de Despesas
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {expenseCategoryBreakdown.map(cat => {
                  const color = CATEGORY_COLORS[cat.name] || '#6b7280';
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
                {totalCosts === 0 && (
                  <p className="text-small text-muted text-center" style={{ padding: '10px' }}>
                    Nenhuma despesa lançada.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lançar Transação Modal */}
      {modalOpen && createPortal(
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal animate-scale-in" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '450px', width: '100%' }}>
            <div className="modal-header">
              <h2 className="heading-md">Lançar Nova Transação</h2>
              <button className="btn btn-icon btn-ghost" onClick={handleCloseModal} aria-label="Fechar">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddCostSubmit} className="financial-modal-form">
              <div className="input-group">
                <label className="input-label" htmlFor="expense-type">Tipo de Transação</label>
                <select
                  id="expense-type"
                  className="input"
                  style={{ background: 'var(--bg-body)', color: 'var(--text-primary)' }}
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  required
                >
                  <option value="despesa">Despesa (Custo/Saída)</option>
                  <option value="receita">Receita (Ganho Manual/Entrada)</option>
                </select>
              </div>

              <div className="input-group">
                <label className="input-label" htmlFor="expense-desc">Descrição</label>
                <input
                  id="expense-desc"
                  className="input"
                  type="text"
                  placeholder="Ex: Venda de Cera Capilar"
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
                  {type === 'despesa'
                    ? EXPENSE_CATEGORIES.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))
                    : REVENUE_CATEGORIES.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))
                  }
                </select>
              </div>

              <button className="btn btn-primary btn-full mt-md" type="submit" disabled={saving}>
                {saving ? 'Lançando...' : 'Lançar Transação'}
              </button>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
