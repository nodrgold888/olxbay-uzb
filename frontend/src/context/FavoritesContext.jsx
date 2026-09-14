import { createContext, useContext, useEffect, useState } from 'react';
import api from '../api';
import { useAuth } from './AuthContext.jsx';

const FavoritesContext = createContext(null);

export function FavoritesProvider({ children }) {
  const { user } = useAuth();
  const [favoriteIds, setFavoriteIds] = useState(new Set());

  useEffect(() => {
    if (!user) {
      setFavoriteIds(new Set());
      return;
    }
    api.get('/favorites/ids').then((res) => setFavoriteIds(new Set(res.data)));
  }, [user]);

  async function toggleFavorite(listingId) {
    if (!user) return false;
    const isFavorited = favoriteIds.has(listingId);
    // Optimistic update — the heart should feel instant.
    setFavoriteIds((prev) => {
      const next = new Set(prev);
      if (isFavorited) next.delete(listingId);
      else next.add(listingId);
      return next;
    });
    try {
      if (isFavorited) {
        await api.delete(`/favorites/${listingId}`);
      } else {
        await api.post(`/favorites/${listingId}`);
      }
      return true;
    } catch {
      // Roll back on failure.
      setFavoriteIds((prev) => {
        const next = new Set(prev);
        if (isFavorited) next.add(listingId);
        else next.delete(listingId);
        return next;
      });
      return false;
    }
  }

  return (
    <FavoritesContext.Provider value={{ favoriteIds, toggleFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  return useContext(FavoritesContext);
}
