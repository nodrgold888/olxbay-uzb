import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import ListingCard from '../components/ListingCard.jsx';

const CITIES = ['Tashkent', 'Samarkand', 'Bukhara', 'Andijan', 'Namangan', 'Fergana', 'Nukus'];

const CATEGORY_EMOJI = {
  electronics: '📱',
  vehicles: '🚗',
  'real-estate': '🏠',
  'home-garden': '🛋️',
  fashion: '👕',
  jobs: '💼',
  services: '🧰',
  kids: '🧸',
};

export default function Home() {
  const [categories, setCategories] = useState([]);
  const [listings, setListings] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ q: '', categoryId: '', city: '', minPrice: '', maxPrice: '' });

  useEffect(() => {
    api.get('/categories').then((res) => setCategories(res.data));
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== ''));
    api
      .get('/listings', { params })
      .then((res) => {
        setListings(res.data.listings);
        setTotal(res.data.total);
      })
      .finally(() => setLoading(false));
  }, [filters]);

  function updateFilter(key, value) {
    setFilters((f) => ({ ...f, [key]: value }));
  }

  return (
    <div className="page">
      <div className="search-row">
        <div className="search-box">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
          <input
            type="text"
            placeholder="Qidirish: mashina, telefon, kvartira..."
            value={filters.q}
            onChange={(e) => updateFilter('q', e.target.value)}
          />
        </div>
      </div>

      <div className="chips">
        <div
          className={`chip ${filters.categoryId === '' ? 'active' : ''}`}
          onClick={() => updateFilter('categoryId', '')}
        >
          <span className="dot" /> Barchasi
        </div>
        {categories.map((c) => (
          <div
            key={c.id}
            className={`chip ${String(filters.categoryId) === String(c.id) ? 'active' : ''}`}
            onClick={() => updateFilter('categoryId', String(c.id))}
          >
            {CATEGORY_EMOJI[c.slug] || '📦'} {c.nameUz}
          </div>
        ))}
      </div>

      <div className="extra-filters">
        <select value={filters.city} onChange={(e) => updateFilter('city', e.target.value)}>
          <option value="">Barcha shaharlar</option>
          {CITIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <input
          type="number"
          placeholder="Narx dan"
          value={filters.minPrice}
          onChange={(e) => updateFilter('minPrice', e.target.value)}
        />
        <input
          type="number"
          placeholder="Narx gacha"
          value={filters.maxPrice}
          onChange={(e) => updateFilter('maxPrice', e.target.value)}
        />
      </div>

      {loading ? (
        <div className="page-loading">Yuklanmoqda...</div>
      ) : (
        <>
          <div className="section-head">
            <h2>Sizga yaqin e'lonlar</h2>
          </div>
          <div className="results-count">{total} ta e'lon topildi</div>
          <div className="listing-grid">
            {listings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
          {listings.length === 0 && <div className="empty-state">Hech qanday e'lon topilmadi.</div>}
        </>
      )}

      <Link to="/post" className="fab" title="E'lon joylash">
        +
      </Link>
    </div>
  );
}
