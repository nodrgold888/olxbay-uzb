import { useEffect, useState } from 'react';
import api from '../api';
import ListingCard from '../components/ListingCard.jsx';

export default function MyListings() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/listings/mine')
      .then((res) => setListings(res.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="page-loading">Yuklanmoqda...</div>;

  return (
    <div className="page">
      <h1>Mening e'lonlarim</h1>
      {listings.length === 0 ? (
        <div className="empty-state">Sizda hali e'lonlar yo'q.</div>
      ) : (
        <div className="listing-grid">
          {listings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      )}
    </div>
  );
}
