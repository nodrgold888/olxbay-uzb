import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const SOCIAL_PROVIDERS = [
  { id: 'google', label: 'Google orqali davom etish', icon: '🔴' },
  { id: 'facebook', label: 'Facebook orqali davom etish', icon: '🔵' },
  { id: 'apple', label: 'Apple orqali davom etish', icon: '⚫' },
];

export default function AuthPage() {
  const { login, register, guestLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [tab, setTab] = useState(location.pathname === '/register' ? 'register' : 'login');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [guestLoading, setGuestLoading] = useState(false);

  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState({ name: '', email: '', password: '', phone: '' });

  function switchTab(next) {
    setTab(next);
    setError('');
    navigate(next === 'login' ? '/login' : '/register', { replace: true });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      if (tab === 'login') {
        await login(loginForm.email, loginForm.password);
      } else {
        await register(registerForm);
      }
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || (tab === 'login' ? 'Kirishda xatolik' : "Ro'yxatdan o'tishda xatolik"));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleGuest() {
    setError('');
    setGuestLoading(true);
    try {
      await guestLogin();
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Mehmon sifatida kirishda xatolik');
    } finally {
      setGuestLoading(false);
    }
  }

  function handleSocialClick(provider) {
    alert(
      `${provider.label} hozircha mavjud emas — bu demo loyihada faqat email/parol yoki mehmon sifatida kirish ishlaydi.`
    );
  }

  function handleForgotPassword(e) {
    e.preventDefault();
    alert(
      "Bu demo tizimda parol tekshirilmaydi — mavjud email bilan istalgan parolni kiritsangiz kirasiz. Parolni tiklashning hojati yo'q."
    );
  }

  return (
    <div className="auth-wrapper">
      <div className="auth-backdrop" />
      <div className="auth-card">
        <button className="auth-guest-btn" onClick={handleGuest} disabled={guestLoading}>
          {guestLoading ? 'Kirilmoqda...' : "🎭 Mehmon sifatida kirish (parolsiz)"}
        </button>
        <p className="hint auth-guest-hint">
          Bitta bosishda sinov hisobi yaratiladi — ro'yxatdan o'tish shart emas.
        </p>

        <div className="auth-divider">
          <span>yoki</span>
        </div>

        <div className="auth-social-list">
          {SOCIAL_PROVIDERS.map((p) => (
            <button key={p.id} className="auth-social-btn" onClick={() => handleSocialClick(p)} type="button">
              <span>{p.icon}</span> {p.label}
            </button>
          ))}
        </div>

        <div className="auth-divider">
          <span>yoki</span>
        </div>

        <div className="auth-tabs">
          <button
            className={`auth-tab ${tab === 'login' ? 'active' : ''}`}
            onClick={() => switchTab('login')}
            type="button"
          >
            Kirish
          </button>
          <button
            className={`auth-tab ${tab === 'register' ? 'active' : ''}`}
            onClick={() => switchTab('register')}
            type="button"
          >
            Ro'yxatdan o'tish
          </button>
        </div>

        <form className="form auth-form" onSubmit={handleSubmit}>
          {error && <div className="form-error">{error}</div>}

          {tab === 'register' && (
            <label>
              Ism
              <input
                value={registerForm.name}
                onChange={(e) => setRegisterForm((f) => ({ ...f, name: e.target.value }))}
                required
              />
            </label>
          )}

          <label>
            Email yoki telefon
            <input
              type="email"
              value={tab === 'login' ? loginForm.email : registerForm.email}
              onChange={(e) =>
                tab === 'login'
                  ? setLoginForm((f) => ({ ...f, email: e.target.value }))
                  : setRegisterForm((f) => ({ ...f, email: e.target.value }))
              }
              required
            />
          </label>

          <label>
            Parol
            <div className="auth-password-field">
              <input
                type={showPassword ? 'text' : 'password'}
                value={tab === 'login' ? loginForm.password : registerForm.password}
                onChange={(e) =>
                  tab === 'login'
                    ? setLoginForm((f) => ({ ...f, password: e.target.value }))
                    : setRegisterForm((f) => ({ ...f, password: e.target.value }))
                }
                minLength={tab === 'register' ? 6 : undefined}
                required
              />
              <button
                type="button"
                className="auth-password-toggle"
                onClick={() => setShowPassword((s) => !s)}
                aria-label={showPassword ? 'Parolni yashirish' : "Parolni ko'rsatish"}
              >
                {showPassword ? '🙈' : '👁'}
              </button>
            </div>
          </label>

          {tab === 'register' && (
            <label>
              Telefon
              <input
                value={registerForm.phone}
                onChange={(e) => setRegisterForm((f) => ({ ...f, phone: e.target.value }))}
                placeholder="+998901234567"
              />
            </label>
          )}

          {tab === 'login' && (
            <a href="#" className="auth-forgot-link" onClick={handleForgotPassword}>
              Parolni unutdingizmi?
            </a>
          )}

          <button type="submit" className="btn-primary" disabled={submitting}>
            {submitting ? 'Yuklanmoqda...' : tab === 'login' ? 'Kirish' : "Ro'yxatdan o'tish"}
          </button>
        </form>

        {tab === 'login' && (
          <p className="hint auth-demo-hint">Demo hisob: demo@ebayuz.uz / password123</p>
        )}

        <p className="auth-terms">
          {tab === 'login' ? 'Kirish orqali siz bizning' : "Ro'yxatdan o'tish orqali siz bizning"}{' '}
          <a href="#" onClick={(e) => e.preventDefault()}>
            foydalanish shartlarimizga
          </a>{' '}
          rozilik bildirasiz.
        </p>
      </div>
    </div>
  );
}
