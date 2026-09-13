import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Kirishda xatolik');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="page narrow">
      <h1>Kirish</h1>
      <form className="form" onSubmit={handleSubmit}>
        {error && <div className="form-error">{error}</div>}
        <label>
          Email
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <label>
          Parol
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </label>
        <button type="submit" className="btn-primary" disabled={submitting}>
          {submitting ? 'Kirilmoqda...' : 'Kirish'}
        </button>
      </form>
      <p className="hint">
        Demo hisob: demo@ebayuz.uz / password123
      </p>
      <p>
        Hisobingiz yo'qmi? <Link to="/register">Ro'yxatdan o'tish</Link>
      </p>
    </div>
  );
}
