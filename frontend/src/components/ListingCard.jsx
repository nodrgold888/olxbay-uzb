import { useState } from 'react';
import { Link } from 'react-router-dom';
import { resolveImageUrl } from '../utils/media.js';

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
  const thumbClass = `thumb-${listing.id % 6}`;
  const emoji =
    CATEGORY_EMOJI[listing.category?.slug] || CATEGORY_EMOJI[listing.category?.parent?.slug] || '📦';
  const badge = STATUS_BADGE[listing.status];
  const showImage = listing.imageUrl && !imageFailed;

  return (
    <Link to={`/listing/${listing.id}`} className="listing-card">
      <div className={`listing-image ${showImage ? '' : thumbClass}`}>
        {badge && <span className="listing-badge">{badge}</span>}
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
