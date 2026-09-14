import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { resolveImageUrl } from '../utils/media.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useFavorites } from '../context/FavoritesContext.jsx';

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

const STATUS_BADGE = {
  reserved: 'BAND',
  sold: 'SOTILDI',
};

function formatPrice(price, currency) {
  return `${Number(price).toLocaleString('ru-RU')} ${currency}`;
}

export default function ListingCard({ listing, onQuickView }) {
  const [imageFailed, setImageFailed] = useState(false);
  const { user } = useAuth();
  const { favoriteIds, toggleFavorite } = useFavorites();
  const navigate = useNavigate();
  const thumbClass = `thumb-${listing.id % 6}`;
  const emoji =
    CATEGORY_EMOJI[listing.category?.slug] || CATEGORY_EMOJI[listing.category?.parent?.slug] || '📦';
  const badge = STATUS_BADGE[listing.status];
  const showImage = listing.imageUrl && !imageFailed;
  const isFavorited = favoriteIds.has(listing.id);

  function handleFavoriteClick(e) {
    e.preventDefault();
    e.stopPropagation();
    if (!user) return navigate('/login');
    toggleFavorite(listing.id);
  }

  return (
    <Link to={`/listing/${listing.id}`} className="listing-card">
      <div className={`listing-image ${showImage ? '' : thumbClass}`}>
        {badge && <span className="listing-badge">{badge}</span>}
        <button
          className={`favorite-btn ${isFavorited ? 'active' : ''}`}
          onClick={handleFavoriteClick}
          title={isFavorited ? "Sevimlilardan o'chirish" : "Sevimlilarga qo'shish"}
          aria-label={isFavorited ? "Sevimlilardan o'chirish" : "Sevimlilarga qo'shish"}
        >
          {isFavorited ? '❤️' : '🤍'}
        </button>
        {onQuickView && (
          <button
            className="quick-view-btn"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onQuickView(listing);
            }}
            title="Tezkor ko'rish"
            aria-label="Tezkor ko'rish"
          >
            👁
          </button>
        )}
        {showImage ? (
          <img src={resolveImageUrl(listing.imageUrl)} alt={listing.title} onError={() => setImageFailed(true)} />
        ) : (
          <span className="listing-image-placeholder">{emoji}</span>
        )}
      </div>
      <div className="listing-body">
        <div className="listing-price">{formatPrice(listing.price, listing.currency)}</div>
        <div className="listing-title">{listing.title}</div>
        <div className="listing-meta">
          {listing.city} · {listing.category?.nameUz}
        </div>
      </div>
    </Link>
  );
}
