import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const CITIES = ['Tashkent', 'Samarkand', 'Bukhara', 'Andijan', 'Namangan', 'Fergana', 'Nukus'];

export default function PostListing() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    title: '',
    description: '',
    price: '',
    currency: 'UZS',
    city: 'Tashkent',
    categoryId: '',
  });
  const [image, setImage] = useState(null);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.get('/categories').then((res) => {
      setCategories(res.data);
      if (res.data.length) setForm((f) => ({ ...f, categoryId: res.data[0].id }));
    });
  }, []);

  function update(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const data = new FormData();
      Object.entries(form).forEach(([k, v]) => data.append(k, v));
      if (image) data.append('image', image);
      const res = await api.post('/listings', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      navigate(`/listing/${res.data.id}`);
    } catch (err) {
      setError(err.response?.data?.error || "E'lon joylashda xatolik yuz berdi");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="page narrow">
      <h1>Yangi e'lon joylash</h1>
      <form className="form" onSubmit={handleSubmit}>
        {error && <div className="form-error">{error}</div>}
        <label>
          Sarlavha
          <input value={form.title} onChange={(e) => update('title', e.target.value)} required />
        </label>
        <label>
          Tavsif
          <textarea
            value={form.description}
            onChange={(e) => update('description', e.target.value)}
            rows={5}
            required
          />
        </label>
        <div className="form-row">
          <label>
            Narx
            <input
              type="number"
              min="0"
              value={form.price}
              onChange={(e) => update('price', e.target.value)}
              required
            />
          </label>
          <label>
            Valyuta
            <select value={form.currency} onChange={(e) => update('currency', e.target.value)}>
              <option value="UZS">UZS</option>
              <option value="USD">USD</option>
            </select>
          </label>
        </div>
        <div className="form-row">
          <label>
            Shahar
            <select value={form.city} onChange={(e) => update('city', e.target.value)}>
              {CITIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>
          <label>
            Kategoriya
            <select value={form.categoryId} onChange={(e) => update('categoryId', e.target.value)}>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nameUz}
                </option>
              ))}
            </select>
          </label>
        </div>
        <label>
          Rasm
          <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files[0])} />
        </label>
        <button type="submit" className="btn-primary" disabled={submitting}>
          {submitting ? 'Joylanmoqda...' : "E'lonni joylash"}
        </button>
      </form>
    </div>
  );
}
