import { Link } from 'react-router-dom';

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

export default function ListingCard({ listing }) {
  const thumbClass = `thumb-${listing.id % 6}`;
  const emoji = CATEGORY_EMOJI[listing.category?.slug] || '📦';
  const badge = STATUS_BADGE[listing.status];

  return (
    <Link to={`/listing/${listing.id}`} className="listing-card">
      <div className={`listing-image ${listing.imageUrl ? '' : thumbClass}`}>
        {badge && <span className="listing-badge">{badge}</span>}
        {listing.imageUrl ? (
          <img src={listing.imageUrl} alt={listing.title} />
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
