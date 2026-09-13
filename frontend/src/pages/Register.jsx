import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', city: 'Tashkent' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function update(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await register(form);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || "Ro'yxatdan o'tishda xatolik");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="page narrow">
      <h1>Ro'yxatdan o'tish</h1>
      <form className="form" onSubmit={handleSubmit}>
        {error && <div className="form-error">{error}</div>}
        <label>
          Ism
          <input value={form.name} onChange={(e) => update('name', e.target.value)} required />
        </label>
        <label>
          Email
          <input type="email" value={form.email} onChange={(e) => update('email', e.target.value)} required />
        </label>
        <label>
          Parol
          <input
            type="password"
            value={form.password}
            onChange={(e) => update('password', e.target.value)}
            minLength={6}
            required
          />
        </label>
        <label>
          Telefon
          <input value={form.phone} onChange={(e) => update('phone', e.target.value)} placeholder="+998901234567" />
        </label>
        <button type="submit" className="btn-primary" disabled={submitting}>
          {submitting ? "Yaratilmoqda..." : "Ro'yxatdan o'tish"}
        </button>
      </form>
      <p>
        Hisobingiz bormi? <Link to="/login">Kirish</Link>
      </p>
    </div>
  );
}
