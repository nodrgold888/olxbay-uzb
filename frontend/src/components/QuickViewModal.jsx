import { useEffect } from 'react';
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

export default function QuickViewModal({ listing, onClose }) {
  useEffect(() => {
    function handleKey(e) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  const thumbClass = `thumb-${listing.id % 6}`;
  const emoji = CATEGORY_EMOJI[listing.category?.slug] || CATEGORY_EMOJI[listing.category?.parent?.slug] || '📦';

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Yopish">
          ×
        </button>
        <div className={`modal-image ${listing.imageUrl ? '' : thumbClass}`}>
          {listing.imageUrl ? (
            <img src={resolveImageUrl(listing.imageUrl)} alt={listing.title} />
          ) : (
            <span className="listing-image-placeholder">{emoji}</span>
          )}
        </div>
        <div className="modal-body">
          <h2>{listing.title}</h2>
          <div className="listing-detail-price">
            {Number(listing.price).toLocaleString('ru-RU')} {listing.currency}
          </div>
          <div className="listing-detail-meta">
            {listing.city} · {listing.category?.nameUz}
          </div>
          <p className="listing-detail-description modal-description">{listing.description}</p>
          <div className="modal-actions">
            <Link to={`/listing/${listing.id}`} className="btn-primary" onClick={onClose}>
              To'liq ko'rish
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
