import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import ListingCard from '../components/ListingCard.jsx';
import QuickViewModal from '../components/QuickViewModal.jsx';

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
  const [quickViewListing, setQuickViewListing] = useState(null);

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

  // The active top-level category is whichever one is directly selected, or
  // whichever one owns the selected subcategory — either way, that's the
  // category whose children we show as the second chip row.
  const activeTop =
    categories.find((c) => String(c.id) === String(filters.categoryId)) ||
    categories.find((c) => c.children.some((ch) => String(ch.id) === String(filters.categoryId))) ||
    null;

  return (
    <div className="page">
      <div className="location-row">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 22s7-7.5 7-13a7 7 0 1 0-14 0c0 5.5 7 13 7 13Z" />
          <circle cx="12" cy="9" r="2.5" />
        </svg>
        Yetkazib berish:
        <select value={filters.city} onChange={(e) => updateFilter('city', e.target.value)}>
          <option value="">Barcha shaharlar</option>
          {CITIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

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
            className={`chip ${activeTop?.id === c.id ? 'active' : ''}`}
            onClick={() => updateFilter('categoryId', String(c.id))}
          >
            {CATEGORY_EMOJI[c.slug] || '📦'} {c.nameUz}
          </div>
        ))}
      </div>

      {activeTop && activeTop.children.length > 0 && (
        <div className="chips subcategory-chips">
          <div
            className={`chip ${String(filters.categoryId) === String(activeTop.id) ? 'active' : ''}`}
            onClick={() => updateFilter('categoryId', String(activeTop.id))}
          >
            Barcha {activeTop.nameUz.toLowerCase()}
          </div>
          {activeTop.children.map((child) => (
            <div
              key={child.id}
              className={`chip ${String(filters.categoryId) === String(child.id) ? 'active' : ''}`}
              onClick={() => updateFilter('categoryId', String(child.id))}
            >
              {child.nameUz}
            </div>
          ))}
        </div>
      )}

      <div className="extra-filters">
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
              <ListingCard key={listing.id} listing={listing} onQuickView={setQuickViewListing} />
            ))}
          </div>
          {listings.length === 0 && <div className="empty-state">Hech qanday e'lon topilmadi.</div>}
        </>
      )}

      <Link to="/post" className="fab" title="E'lon joylash">
        +
      </Link>

      {quickViewListing && (
        <QuickViewModal listing={quickViewListing} onClose={() => setQuickViewListing(null)} />
      )}
    </div>
  );
}
