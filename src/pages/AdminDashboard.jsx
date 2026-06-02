import { useState, useMemo } from 'react';
import { useData } from '../contexts/DataContext';
import { MOCK_BARBERSHOPS, MOCK_CLIENTS, formatPrice, getInitials } from '../utils/mockData';
import {
  TrendingUp,
  DollarSign,
  Scissors,
  Users,
  Building,
  Star,
  MapPin,
  Calendar,
  Search,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import './AdminDashboard.css';

export default function AdminDashboard() {
  const { appointments } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('barbearias'); // barbearias, usuarios, servicos

  // Aggregated stats
  const totalRevenue = useMemo(() => {
    return appointments
      .filter((a) => a.status === 'concluído' || a.status === 'confirmado')
      .reduce((sum, a) => sum + a.price, 0);
  }, [appointments]);

  const barbershopRevenue = useMemo(() => {
    const revs = {};
    MOCK_BARBERSHOPS.forEach((b) => {
      revs[b.id] = 0;
    });
    appointments
      .filter((a) => a.status === 'concluído' || a.status === 'confirmado')
      .forEach((a) => {
        if (revs[a.barbershopId] !== undefined) {
          revs[a.barbershopId] += a.price;
        } else {
          revs[a.barbershopId] = a.price;
        }
      });
    return revs;
  }, [appointments]);

  const servicePopularity = useMemo(() => {
    const counts = {};
    appointments.forEach((a) => {
      counts[a.service] = (counts[a.service] || 0) + 1;
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => ({ name, count }));
  }, [appointments]);

  const filteredShops = useMemo(() => {
    return MOCK_BARBERSHOPS.filter((b) =>
      b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.address.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  const filteredClients = useMemo(() => {
    return MOCK_CLIENTS.filter((c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  return (
    <div className="page-enter admin-dashboard">
      {/* Header Banner */}
      <section className="admin-welcome-card card animate-fade-in-up">
        <div className="admin-welcome-content">
          <div className="admin-badge">
            <ShieldCheck size={14} />
            <span>Acesso Administrativo</span>
          </div>
          <h1 className="heading-lg mt-sm">Painel do Administrador Master</h1>
          <p className="text-body text-muted">Controle global de faturamento, barbearias parceiras e métricas de uso da plataforma.</p>
        </div>
      </section>

      {/* Grid Stats */}
      <div className="admin-stats-grid stagger-children">
        <div className="admin-stat-card card">
          <div className="admin-stat-icon icon-revenue">
            <DollarSign size={24} />
          </div>
          <div className="admin-stat-info">
            <span className="stat-label">Faturamento Geral</span>
            <h3 className="stat-value">{formatPrice(totalRevenue)}</h3>
            <span className="stat-trend text-success">
              <TrendingUp size={12} /> +12.4% este mês
            </span>
          </div>
        </div>

        <div className="admin-stat-card card">
          <div className="admin-stat-icon icon-shops">
            <Building size={24} />
          </div>
          <div className="admin-stat-info">
            <span className="stat-label">Barbearias Ativas</span>
            <h3 className="stat-value">{MOCK_BARBERSHOPS.length}</h3>
            <span className="stat-subtext">Parceiros comerciais</span>
          </div>
        </div>

        <div className="admin-stat-card card">
          <div className="admin-stat-icon icon-users">
            <Users size={24} />
          </div>
          <div className="admin-stat-info">
            <span className="stat-label">Usuários Cadastrados</span>
            <h3 className="stat-value">{MOCK_CLIENTS.length + 1}</h3>
            <span className="stat-subtext">Clientes + Equipe</span>
          </div>
        </div>

        <div className="admin-stat-card card">
          <div className="admin-stat-icon icon-apts">
            <Calendar size={24} />
          </div>
          <div className="admin-stat-info">
            <span className="stat-label">Total Agendamentos</span>
            <h3 className="stat-value">{appointments.length}</h3>
            <span className="stat-subtext">Solicitações efetuadas</span>
          </div>
        </div>
      </div>

      {/* Main Administrative Layout */}
      <div className="admin-layout mt-lg">
        {/* Navigation Tabs & Search */}
        <div className="admin-tabs-row animate-fade-in-up">
          <div className="tabs admin-tabs">
            <button
              className={`tab ${activeTab === 'barbearias' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('barbearias');
                setSearchTerm('');
              }}
            >
              Barbearias
            </button>
            <button
              className={`tab ${activeTab === 'usuarios' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('usuarios');
                setSearchTerm('');
              }}
            >
              Usuários
            </button>
            <button
              className={`tab ${activeTab === 'servicos' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('servicos');
                setSearchTerm('');
              }}
            >
              Serviços Populares
            </button>
          </div>

          {activeTab !== 'servicos' && (
            <div className="input-with-icon admin-search">
              <Search size={18} className="input-icon" />
              <input
                type="text"
                placeholder={activeTab === 'barbearias' ? "Buscar barbearia..." : "Buscar usuário..."}
                className="input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          )}
        </div>

        {/* Tab Contents */}
        <div className="admin-tab-content mt-md stagger-children">
          {/* Barbearias Tab */}
          {activeTab === 'barbearias' && (
            <div className="admin-table-wrapper card">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Barbearia</th>
                    <th>Avaliação</th>
                    <th>Localização</th>
                    <th>Faturamento Est.</th>
                    <th>Serviços</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredShops.map((shop) => (
                    <tr key={shop.id}>
                      <td>
                        <div className="admin-shop-cell">
                          <div className="avatar avatar-sm avatar-placeholder">
                            {getInitials(shop.name)}
                          </div>
                          <div>
                            <span className="font-bold block text-primary">{shop.name}</span>
                            <span className="text-small text-muted">{shop.phone}</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="admin-rating-cell text-accent">
                          <Star size={14} fill="currentColor" />
                          <span>{shop.rating} ({shop.totalReviews})</span>
                        </div>
                      </td>
                      <td>
                        <div className="admin-location-cell text-small">
                          <MapPin size={14} />
                          <span>{shop.address.split('—')[1] || shop.address}</span>
                        </div>
                      </td>
                      <td className="font-bold text-success">
                        {formatPrice(barbershopRevenue[shop.id] || 0)}
                      </td>
                      <td>
                        <span className="badge badge-accent">
                          {shop.services.length} ativos
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Usuarios Tab */}
          {activeTab === 'usuarios' && (
            <div className="admin-table-wrapper card">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>Email</th>
                    <th>WhatsApp</th>
                    <th>Função</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Barber entry manually added */}
                  <tr>
                    <td>
                      <div className="admin-shop-cell">
                        <div className="avatar avatar-sm avatar-placeholder">
                          JB
                        </div>
                        <span className="font-bold text-primary">João Barbeiro</span>
                      </div>
                    </td>
                    <td>joao@barbearia.com</td>
                    <td>5511999998888</td>
                    <td><span className="badge badge-info">Barbeiro</span></td>
                    <td><span className="badge badge-success">Ativo</span></td>
                  </tr>

                  {/* Clients */}
                  {filteredClients.map((client) => (
                    <tr key={client.id}>
                      <td>
                        <div className="admin-shop-cell">
                          <div className="avatar avatar-sm avatar-placeholder">
                            {getInitials(client.name)}
                          </div>
                          <span className="font-bold text-primary">{client.name}</span>
                        </div>
                      </td>
                      <td>{client.email}</td>
                      <td>{client.whatsapp}</td>
                      <td><span className="badge badge-accent">Cliente</span></td>
                      <td><span className="badge badge-success">Ativo</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Servicos Tab */}
          {activeTab === 'servicos' && (
            <div className="admin-services-chart-card card">
              <h3 className="heading-sm mb-lg">Distribuição de Demandas</h3>
              <div className="admin-bar-chart">
                {servicePopularity.map((svc) => {
                  const max = Math.max(...servicePopularity.map((s) => s.count)) || 1;
                  const percent = (svc.count / max) * 100;
                  return (
                    <div className="chart-row" key={svc.name}>
                      <span className="chart-label font-bold">{svc.name}</span>
                      <div className="chart-bar-wrapper">
                        <div className="chart-bar" style={{ width: `${percent}%` }} />
                      </div>
                      <span className="chart-value font-bold">{svc.count} agendamentos</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
