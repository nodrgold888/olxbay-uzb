import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext.jsx';

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

export default function ListingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [listing, setListing] = useState(null);
  const [error, setError] = useState('');
  const [buying, setBuying] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);
  const [messaging, setMessaging] = useState(false);

  useEffect(() => {
    api
      .get(`/listings/${id}`)
      .then((res) => setListing(res.data))
      .catch(() => setError('E\'lon topilmadi'));
  }, [id]);

  async function handleDelete() {
    if (!confirm("Ushbu e'lonni o'chirmoqchimisiz?")) return;
    await api.delete(`/listings/${id}`);
    navigate('/my-listings');
  }

  async function handleBuy() {
    if (!user) return navigate('/login');
    setBuying(true);
    try {
      const res = await api.post('/orders', { listingId: listing.id });
      navigate(`/orders/${res.data.id}/checkout`);
    } catch (err) {
      alert(err.response?.data?.error || "Xarid boshlashda xatolik yuz berdi");
    } finally {
      setBuying(false);
    }
  }

  async function handleMessageSeller() {
    if (!user) return navigate('/login');
    setMessaging(true);
    try {
      const res = await api.post('/conversations', { listingId: listing.id });
      navigate(`/chat/${res.data.id}`);
    } catch (err) {
      alert(err.response?.data?.error || "Xabar yozishda xatolik yuz berdi");
    } finally {
      setMessaging(false);
    }
  }

  if (error) return <div className="page empty-state">{error}</div>;
  if (!listing) return <div className="page-loading">Yuklanmoqda...</div>;

  const isOwner = user && user.id === listing.sellerId;
  const thumbClass = `thumb-${listing.id % 6}`;
  const emoji =
    CATEGORY_EMOJI[listing.category?.slug] || CATEGORY_EMOJI[listing.category?.parent?.slug] || '📦';
  const showImage = listing.imageUrl && !imageFailed;

  return (
    <div className="page listing-detail">
      <div className={`listing-detail-image ${showImage ? '' : thumbClass}`}>
        {showImage ? (
          <img src={listing.imageUrl} alt={listing.title} onError={() => setImageFailed(true)} />
        ) : (
          <div className="listing-image-placeholder large">{emoji}</div>
        )}
      </div>
      <div className="listing-detail-info">
        <h1>{listing.title}</h1>
        <div className="listing-detail-price">
          {Number(listing.price).toLocaleString('ru-RU')} {listing.currency}
        </div>
        <div className="listing-detail-meta">
          {listing.city} ·{' '}
          {listing.category?.parent ? `${listing.category.parent.nameUz} / ` : ''}
          {listing.category?.nameUz}
        </div>
        <p className="listing-detail-description">{listing.description}</p>
        <div className="seller-box">
          <strong>Sotuvchi:</strong> {listing.seller?.name}
        </div>

        {!isOwner && (
          <div className="owner-actions">
            <button className="btn-secondary" onClick={handleMessageSeller} disabled={messaging}>
              💬 {messaging ? 'Ochilmoqda...' : 'Sotuvchiga yozish'}
            </button>
          </div>
        )}

        {!isOwner && listing.status === 'active' && (
          <div className="escrow-box">
            <button className="btn-primary" onClick={handleBuy} disabled={buying}>
              {buying ? 'Boshlanmoqda...' : "Xavfsiz to'lash — Sotib olish"}
            </button>
            <p className="escrow-note">
              To'lovingiz OLXbay tomonidan ushlab turiladi va faqat siz mahsulotni qabul
              qilib, tasdiqlagandan so'ng sotuvchiga o'tkaziladi. Sotuvchining shaxsiy
              kartasiga to'g'ridan-to'g'ri pul o'tkazmang — bu firibgarlikdan himoya qiladi.
            </p>
          </div>
        )}
        {!isOwner && listing.status === 'reserved' && (
          <div className="empty-state">Bu mahsulot hozirda boshqa xaridor tomonidan bron qilingan.</div>
        )}
        {!isOwner && listing.status === 'sold' && (
          <div className="empty-state">Bu mahsulot allaqachon sotilgan.</div>
        )}

        {isOwner && (
          <div className="owner-actions">
            <button className="btn-danger" onClick={handleDelete}>
              E'lonni o'chirish
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
