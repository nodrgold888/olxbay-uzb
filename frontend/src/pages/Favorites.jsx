import { useEffect, useState } from 'react';
import api from '../api';
import ListingCard from '../components/ListingCard.jsx';
import { useFavorites } from '../context/FavoritesContext.jsx';

export default function Favorites() {
  const { favoriteIds } = useFavorites();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/favorites')
      .then((res) => setListings(res.data))
      .finally(() => setLoading(false));
  }, []);

  // Filtering against the live favoriteIds set (rather than just the initial
  // fetch) means un-hearting a listing removes it from this page right away.
  const visible = listings.filter((l) => favoriteIds.has(l.id));

  if (loading) return <div className="page-loading">Yuklanmoqda...</div>;

  return (
    <div className="page">
      <h1>Sevimlilar</h1>
      {visible.length === 0 ? (
        <div className="empty-state">
          Hozircha sevimlilar yo'q. E'lonlar ustidagi yurak belgisini bosing.
        </div>
      ) : (
        <div className="listing-grid">
          {visible.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      )}
    </div>
  );
}
