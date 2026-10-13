import React, { useState, useEffect } from 'react';
import { 
  X, User, Mail, Lock, ShieldCheck, Zap, 
  ArrowRight, Users, CheckCircle, PlusCircle, AlertCircle, Sparkles, Building2
} from 'lucide-react';

export function AuthModal({
  isOpen,
  onClose,
  currentUser,
  onAccountSwitched,
  dbService
}) {
  const [activeTab, setActiveTab] = useState('switch'); // 'switch', 'signin', 'register'
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Form states
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [regFullName, setRegFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConsumerId, setRegConsumerId] = useState('');
  const [regTariff, setRegTariff] = useState('in_residential');

  // Load accounts when modal opens
  useEffect(() => {
    if (isOpen) {
      loadAccounts();
      setErrorMsg('');
      setSuccessMsg('');
    }
  }, [isOpen]);

  const loadAccounts = async () => {
    try {
      const list = await dbService.getAccounts();
      setAccounts(list);
    } catch {
      // ignore
    }
  };

  if (!isOpen) return null;

  const handleQuickSwitch = async (userId) => {
    if (userId === currentUser?.id) return;
    setLoading(true);
    setErrorMsg('');
    try {
      const data = await dbService.switchAccount(userId);
      setSuccessMsg(`Switched to ${data.user.fullName}'s account! Data loaded.`);
      setTimeout(() => {
        onAccountSwitched(data);
        onClose();
      }, 500);
    } catch (err) {
      setErrorMsg('Failed to switch account.');
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!loginIdentifier.trim() || !loginPassword.trim()) {
      setErrorMsg('Please enter both identifier and password.');
      return;
    }
    setLoading(true);
    setErrorMsg('');
    try {
      const result = await dbService.login(loginIdentifier, loginPassword);
      if (result.success) {
        setSuccessMsg(`Welcome back, ${result.user.fullName}!`);
        const fullData = await dbService.loadUserData(result.user.id);
        setTimeout(() => {
          onAccountSwitched(fullData);
          onClose();
        }, 600);
      } else {
        setErrorMsg(result.message || 'Invalid credentials.');
      }
    } catch (err) {
      setErrorMsg('Login failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!regFullName.trim() || !regEmail.trim() || !regPassword.trim()) {
      setErrorMsg('Please fill in all required fields.');
      return;
    }

    const consumerNum = regConsumerId.trim() || `CONS-${Math.floor(100000 + Math.random() * 900000)}`;
    setLoading(true);
    setErrorMsg('');

    try {
      const result = await dbService.register({
        fullName: regFullName,
        email: regEmail,
        password: regPassword,
        consumerId: consumerNum,
        tariffCategory: regTariff
      });

      if (result.success) {
        setSuccessMsg(`Account created for ${result.user.fullName}! Loading your database record...`);
        const fullData = await dbService.loadUserData(result.user.id);
        setTimeout(() => {
          onAccountSwitched(fullData);
          onClose();
        }, 700);
      } else {
        setErrorMsg('Failed to create account.');
      }
    } catch (err) {
      setErrorMsg('Registration error. Email may already be in use.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-modal-overlay animate-fade-in" onClick={onClose}>
      <div 
        className="auth-modal-container glass-panel-elevated animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="auth-modal-header">
          <div className="auth-modal-title-row">
            <div className="auth-icon-badge">
              <ShieldCheck className="auth-badge-icon" />
            </div>
            <div>
              <h2 className="auth-modal-title">User Accounts & Database Isolation</h2>
              <p className="auth-modal-subtitle">
                Each user gets an isolated database partition for appliances, bills, and habits.
              </p>
            </div>
          </div>
          <button className="auth-modal-close-btn" onClick={onClose} title="Close">
            <X size={20} />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="auth-tabs-row">
          <button
            className={`auth-tab-btn ${activeTab === 'switch' ? 'active' : ''}`}
            onClick={() => { setActiveTab('switch'); setErrorMsg(''); setSuccessMsg(''); }}
          >
            <Users size={16} />
            <span>Switch Account ({accounts.length})</span>
          </button>
          <button
            className={`auth-tab-btn ${activeTab === 'signin' ? 'active' : ''}`}
            onClick={() => { setActiveTab('signin'); setErrorMsg(''); setSuccessMsg(''); }}
          >
            <User size={16} />
            <span>Sign In</span>
          </button>
          <button
            className={`auth-tab-btn ${activeTab === 'register' ? 'active' : ''}`}
            onClick={() => { setActiveTab('register'); setErrorMsg(''); setSuccessMsg(''); }}
          >
            <PlusCircle size={16} />
            <span>Create New Account</span>
          </button>
        </div>

        {/* Status Alerts */}
        {errorMsg && (
          <div className="auth-alert error animate-shake">
            <AlertCircle size={16} />
            <span>{errorMsg}</span>
          </div>
        )}
        {successMsg && (
          <div className="auth-alert success animate-fade-in">
            <CheckCircle size={16} />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Modal Body */}
        <div className="auth-modal-body">
          {/* TAB 1: QUICK SWITCH */}
          {activeTab === 'switch' && (
            <div className="auth-switch-section">
              <div className="auth-section-desc">
                Click any profile to instantly switch database context and observe separate consumption records:
              </div>

              <div className="auth-accounts-grid">
                {accounts.map((acc) => {
                  const isActive = acc.id === currentUser?.id;
                  const initial = acc.fullName?.charAt(0) || 'U';

                  return (
                    <div
                      key={acc.id}
                      className={`auth-account-card ${isActive ? 'active-account' : ''}`}
                      onClick={() => handleQuickSwitch(acc.id)}
                    >
                      <div className="acc-card-left">
                        <div 
                          className="acc-avatar"
                          style={{ backgroundColor: acc.avatarColor || '#00F2FE' }}
                        >
                          {initial}
                        </div>
                        <div className="acc-info">
                          <div className="acc-name-row">
                            <span className="acc-name">{acc.fullName}</span>
                            {isActive && <span className="acc-badge-active">ACTIVE USER</span>}
                          </div>
                          <span className="acc-meta font-mono">
                            {acc.consumerId} • {acc.email}
                          </span>
                          <span className="acc-role text-muted">
                            {acc.role || 'Residential Consumer'}
                          </span>
                        </div>
                      </div>

                      <div className="acc-card-right">
                        {isActive ? (
                          <div className="acc-current-tag">
                            <CheckCircle size={18} className="text-cyan" />
                          </div>
                        ) : (
                          <button
                            className="btn-secondary btn-sm switch-btn"
                            disabled={loading}
                          >
                            <span>Load Data</span>
                            <ArrowRight size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="auth-switch-footer">
                <span className="text-muted text-xs">
                  Tip: Changes made to appliances or tariffs are strictly saved to the active account's database record.
                </span>
                <button 
                  className="btn-accent-sm"
                  onClick={() => setActiveTab('register')}
                >
                  <PlusCircle size={14} />
                  <span>Register Another Person</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: SIGN IN */}
          {activeTab === 'signin' && (
            <form onSubmit={handleLoginSubmit} className="auth-form">
              <div className="auth-field-group">
                <label className="auth-field-label">Email or Consumer ID</label>
                <div className="auth-input-wrapper">
                  <Mail className="auth-input-icon" size={17} />
                  <input
                    type="text"
                    className="auth-input"
                    placeholder="e.g. rajesh@voltwise.ai or CONS-IN-482910"
                    value={loginIdentifier}
                    onChange={(e) => setLoginIdentifier(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="auth-field-group">
                <label className="auth-field-label">Password</label>
                <div className="auth-input-wrapper">
                  <Lock className="auth-input-icon" size={17} />
                  <input
                    type="password"
                    className="auth-input"
                    placeholder="Enter your account password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="auth-hint">
                  Demo password for pre-seeded accounts is <code className="font-mono">password123</code>
                </div>
              </div>

              <div className="auth-actions-row">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setActiveTab('switch')}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={loading}
                >
                  {loading ? (
                    <span>Authenticating...</span>
                  ) : (
                    <>
                      <span>Sign In & Load Data</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: REGISTER NEW USER */}
          {activeTab === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="auth-form">
              <div className="auth-form-grid">
                <div className="auth-field-group">
                  <label className="auth-field-label">Full Name *</label>
                  <div className="auth-input-wrapper">
                    <User className="auth-input-icon" size={17} />
                    <input
                      type="text"
                      className="auth-input"
                      placeholder="e.g. Ananya Sen"
                      value={regFullName}
                      onChange={(e) => setRegFullName(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="auth-field-group">
                  <label className="auth-field-label">Email Address *</label>
                  <div className="auth-input-wrapper">
                    <Mail className="auth-input-icon" size={17} />
                    <input
                      type="email"
                      className="auth-input"
                      placeholder="e.g. ananya@company.com"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="auth-field-group">
                  <label className="auth-field-label">Password *</label>
                  <div className="auth-input-wrapper">
                    <Lock className="auth-input-icon" size={17} />
                    <input
                      type="password"
                      className="auth-input"
                      placeholder="Create a strong password"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="auth-field-group">
                  <label className="auth-field-label">DISCOM Consumer / Meter ID</label>
                  <div className="auth-input-wrapper">
                    <Building2 className="auth-input-icon" size={17} />
                    <input
                      type="text"
                      className="auth-input"
                      placeholder="e.g. CONS-MH-827419 (or leave blank to auto-generate)"
                      value={regConsumerId}
                      onChange={(e) => setRegConsumerId(e.target.value)}
                    />
                  </div>
                </div>

                <div className="auth-field-group full-width">
                  <label className="auth-field-label">Initial Tariff Scheme</label>
                  <select
                    className="auth-select"
                    value={regTariff}
                    onChange={(e) => setRegTariff(e.target.value)}
                  >
                    <option value="in_residential">India State Domestic Tariff (Tiered ₹ Slab)</option>
                    <option value="us_residential">US Residential Tiered Electric ($)</option>
                    <option value="eu_dynamic">EU Domestic Eco Tariff (€)</option>
                  </select>
                </div>
              </div>

              <div className="auth-actions-row">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setActiveTab('switch')}
                >
                  Back to Accounts
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={loading}
                >
                  {loading ? (
                    <span>Creating Database Records...</span>
                  ) : (
                    <>
                      <Sparkles size={16} />
                      <span>Create Account & Separate Database</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
