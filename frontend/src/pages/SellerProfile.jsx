import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api';
import ListingCard from '../components/ListingCard.jsx';

// Uzbek month names, spelled out manually: the 'uz-UZ' Intl locale isn't
// consistently supported across browsers/engines (some fall back to "M09"
// instead of a real month name).
const UZ_MONTHS = [
  'Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun',
  'Iyul', 'Avgust', 'Sentyabr', 'Oktyabr', 'Noyabr', 'Dekabr',
];

function memberSince(dateStr) {
  const date = new Date(dateStr);
  return `${UZ_MONTHS[date.getMonth()]} ${date.getFullYear()}`;
}

export default function SellerProfile() {
  const { id } = useParams();
  const [seller, setSeller] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get(`/users/${id}`)
      .then((res) => setSeller(res.data))
      .catch(() => setError('Foydalanuvchi topilmadi'));
  }, [id]);

  if (error) return <div className="page empty-state">{error}</div>;
  if (!seller) return <div className="page-loading">Yuklanmoqda...</div>;

  return (
    <div className="page">
      <div className="seller-profile-header">
        <div className="seller-avatar">{seller.name.charAt(0).toUpperCase()}</div>
        <div>
          <h1>{seller.name}</h1>
          <div className="seller-profile-meta">
            {seller.city && `${seller.city} · `}
            OLXbay'da {memberSince(seller.createdAt)}dan beri
          </div>
          <div className="seller-profile-stats">
            <span>{seller.activeCount} ta faol e'lon</span>
            <span>{seller.soldCount} ta sotilgan</span>
          </div>
        </div>
      </div>

      <div className="section-head">
        <h2>Faol e'lonlar</h2>
      </div>
      {seller.listings.length === 0 ? (
        <div className="empty-state">Hozircha faol e'lonlar yo'q.</div>
      ) : (
        <div className="listing-grid">
          {seller.listings.map((listing) => (
            <ListingCard key={listing.id} listing={{ ...listing, seller }} />
          ))}
        </div>
      )}
    </div>
  );
}
