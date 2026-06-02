import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getInitials } from '../../utils/mockData';
import { Camera, Mail, Phone, MapPin, Lock, Check, User, ArrowLeft, AlignLeft, Scissors } from 'lucide-react';
import './EditProfile.css';

export default function EditProfile() {
  const { user, userType, updateProfile, updatePassword } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // Profile fields state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [avatar, setAvatar] = useState(null);
  const [barbershopName, setBarbershopName] = useState('');
  const [barbershopDescription, setBarbershopDescription] = useState('');

  // Password fields state
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // UI state
  const [profileMessage, setProfileMessage] = useState({ text: '', type: '' });
  const [passwordMessage, setPasswordMessage] = useState({ text: '', type: '' });
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setWhatsapp(user.whatsapp || '');
      setPhone(user.phone || '');
      setAddress(user.address || '');
      setAvatar(user.avatar || null);
      if (userType === 'barber') {
        setBarbershopName(user.barbershopName || '');
        setBarbershopDescription(user.barbershopDescription || '');
      }
    }
  }, [user, userType]);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileMessage({ text: '', type: '' });

    try {
      const updateData = {
        name,
        email,
        whatsapp,
        phone,
        address,
        avatar,
      };

      if (userType === 'barber') {
        updateData.barbershopName = barbershopName;
        updateData.barbershopDescription = barbershopDescription;
      }

      await updateProfile(updateData);
      setProfileMessage({ text: 'Perfil atualizado com sucesso!', type: 'success' });
      setTimeout(() => setProfileMessage({ text: '', type: '' }), 3000);
    } catch (err) {
      setProfileMessage({ text: err.message || 'Erro ao atualizar perfil.', type: 'danger' });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSavePassword = async (e) => {
    e.preventDefault();
    if (!oldPassword || !newPassword || !confirmPassword) {
      setPasswordMessage({ text: 'Por favor, preencha todos os campos de senha.', type: 'danger' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordMessage({ text: 'As senhas novas não coincidem.', type: 'danger' });
      return;
    }

    if (newPassword.length < 6) {
      setPasswordMessage({ text: 'A nova senha deve ter pelo menos 6 caracteres.', type: 'danger' });
      return;
    }

    setSavingPassword(true);
    setPasswordMessage({ text: '', type: '' });

    try {
      await updatePassword(oldPassword, newPassword);
      setPasswordMessage({ text: 'Senha alterada com sucesso!', type: 'success' });
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordMessage({ text: '', type: '' }), 3000);
    } catch (err) {
      setPasswordMessage({ text: err.message || 'Erro ao alterar a senha.', type: 'danger' });
    } finally {
      setSavingPassword(false);
    }
  };

  const handleBack = () => {
    navigate(userType === 'barber' ? '/barbeiro' : '/cliente');
  };

  return (
    <div className="page-enter edit-profile">
      {/* Top Nav */}
      <div className="profile-nav">
        <button className="btn-icon btn-ghost back-btn" onClick={handleBack} aria-label="Voltar">
          <ArrowLeft size={20} />
        </button>
        <span className="profile-nav-title">Editar Perfil</span>
      </div>

      <div className="profile-layout">
        {/* Left Col / Avatar Info */}
        <div className="profile-sidebar-card card animate-fade-in-up">
          <div className="avatar-upload-wrapper">
            <div className="profile-avatar avatar avatar-xl avatar-placeholder clickable" onClick={handleAvatarClick}>
              {avatar ? (
                <img src={avatar} alt="Avatar do usuário" className="avatar-img" />
              ) : (
                getInitials(name || 'U')
              )}
              <div className="avatar-overlay">
                <Camera size={20} />
              </div>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden-file-input"
            />
            <button className="btn btn-ghost btn-sm" onClick={handleAvatarClick}>
              Alterar Foto
            </button>
          </div>
          <div className="profile-sidebar-info">
            <h2 className="user-name">{name || 'Usuário'}</h2>
            <span className="user-badge">{userType === 'barber' ? 'Barbeiro' : 'Cliente'}</span>
          </div>
        </div>

        {/* Right Col / Forms */}
        <div className="profile-forms-wrapper">
          {/* Main Info Form */}
          <form className="profile-card card animate-fade-in-up" onSubmit={handleSaveProfile} style={{ animationDelay: '0.1s' }}>
            <h3 className="profile-card-title">Dados Pessoais</h3>

            {profileMessage.text && (
              <div className={`alert alert-${profileMessage.type}`}>
                {profileMessage.text}
              </div>
            )}

            <div className="form-grid">
              <div className="form-group">
                <label className="form-label" htmlFor="profile-name">Nome Completo</label>
                <div className="input-wrapper">
                  <User className="input-icon" size={18} />
                  <input
                    id="profile-name"
                    type="text"
                    className="form-input"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="profile-email">E-mail</label>
                <div className="input-wrapper">
                  <Mail className="input-icon" size={18} />
                  <input
                    id="profile-email"
                    type="email"
                    className="form-input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="profile-whatsapp">WhatsApp (com DDD)</label>
                <div className="input-wrapper">
                  <Phone className="input-icon" size={18} />
                  <input
                    id="profile-whatsapp"
                    type="text"
                    placeholder="Ex: 5511999998888"
                    className="form-input"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                  />
                </div>
                <span className="input-hint">Insira apenas números com código do país (ex: 5511...)</span>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="profile-phone">Telefone Celular</label>
                <div className="input-wrapper">
                  <Phone className="input-icon" size={18} />
                  <input
                    id="profile-phone"
                    type="text"
                    placeholder="Ex: (11) 98765-4321"
                    className="form-input"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group full-width">
                <label className="form-label" htmlFor="profile-address">Endereço Residencial</label>
                <div className="input-wrapper">
                  <MapPin className="input-icon" size={18} />
                  <input
                    id="profile-address"
                    type="text"
                    className="form-input"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                  />
                </div>
              </div>

              {userType === 'barber' && (
                <>
                  <div className="form-group full-width">
                    <label className="form-label" htmlFor="profile-barbershop-name">Nome da Barbearia</label>
                    <div className="input-wrapper">
                      <Scissors className="input-icon" size={18} />
                      <input
                        id="profile-barbershop-name"
                        type="text"
                        className="form-input"
                        value={barbershopName}
                        onChange={(e) => setBarbershopName(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group full-width">
                    <label className="form-label" htmlFor="profile-barbershop-desc">Descrição da Barbearia</label>
                    <div className="textarea-wrapper">
                      <AlignLeft className="textarea-icon" size={18} />
                      <textarea
                        id="profile-barbershop-desc"
                        rows={3}
                        className="form-input form-textarea"
                        value={barbershopDescription}
                        onChange={(e) => setBarbershopDescription(e.target.value)}
                      />
                    </div>
                  </div>
                </>
              )}
            </div>

            <button type="submit" className="btn btn-primary btn-full" disabled={savingProfile}>
              {savingProfile ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          </form>

          {/* Change Password Form */}
          <form className="profile-card card animate-fade-in-up" onSubmit={handleSavePassword} style={{ animationDelay: '0.2s' }}>
            <h3 className="profile-card-title">Alterar Senha</h3>

            {passwordMessage.text && (
              <div className={`alert alert-${passwordMessage.type}`}>
                {passwordMessage.text}
              </div>
            )}

            <div className="form-grid">
              <div className="form-group">
                <label className="form-label" htmlFor="profile-old-pass">Senha Atual</label>
                <div className="input-wrapper">
                  <Lock className="input-icon" size={18} />
                  <input
                    id="profile-old-pass"
                    type="password"
                    className="form-input"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="profile-new-pass">Nova Senha</label>
                <div className="input-wrapper">
                  <Lock className="input-icon" size={18} />
                  <input
                    id="profile-new-pass"
                    type="password"
                    className="form-input"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="profile-confirm-pass">Confirmar Nova Senha</label>
                <div className="input-wrapper">
                  <Lock className="input-icon" size={18} />
                  <input
                    id="profile-confirm-pass"
                    type="password"
                    className="form-input"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-full" disabled={savingPassword}>
              {savingPassword ? 'Alterando...' : 'Alterar Senha'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
