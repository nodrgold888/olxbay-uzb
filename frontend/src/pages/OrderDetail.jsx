import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext.jsx';

const STATUS_LABELS = {
  PENDING_PAYMENT: "To'lov kutilmoqda",
  PAID_ESCROW: "To'landi (OLXbay ushlab turibdi)",
  SHIPPED: 'Jo\'natildi',
  RELEASED: 'Yakunlandi — sotuvchiga o\'tkazildi',
  DISPUTED: 'Nizoli holat',
  CANCELLED: 'Bekor qilindi',
};

export default function OrderDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  function load() {
    api
      .get(`/orders/${id}`)
      .then((res) => setOrder(res.data))
      .catch((err) => setError(err.response?.data?.error || 'Buyurtma topilmadi'));
  }

  useEffect(load, [id]);

  async function runAction(action) {
    setBusy(true);
    try {
      await api.post(`/orders/${id}/${action}`);
      load();
    } catch (err) {
      alert(err.response?.data?.error || 'Amalni bajarishda xatolik');
    } finally {
      setBusy(false);
    }
  }

  if (error) return <div className="page empty-state">{error}</div>;
  if (!order) return <div className="page-loading">Yuklanmoqda...</div>;

  const isBuyer = user.id === order.buyerId;
  const isSeller = user.id === order.sellerId;
  const contactVisible = order.status !== 'PENDING_PAYMENT' && order.status !== 'CANCELLED';

  return (
    <div className="page narrow">
      <h1>Buyurtma #{order.id}</h1>
      <div className="order-status">{STATUS_LABELS[order.status] || order.status}</div>

      <div className="order-box">
        <div className="order-row">
          <strong>Mahsulot:</strong> {order.listing.title}
        </div>
        <div className="order-row">
          <strong>Summa:</strong> {Number(order.amount).toLocaleString('ru-RU')} {order.currency}
        </div>
        {contactVisible && isBuyer && (
          <div className="order-row">
            <strong>Sotuvchi:</strong> {order.seller.name}
            {order.seller.phone && ` · ${order.seller.phone}`}
          </div>
        )}
        {contactVisible && isSeller && (
          <div className="order-row">
            <strong>Xaridor:</strong> {order.buyer.name}
            {order.buyer.phone && ` · ${order.buyer.phone}`}
          </div>
        )}
      </div>

      <div className="escrow-steps">
        <div className={order.status !== 'PENDING_PAYMENT' ? 'step done' : 'step'}>
          1. To'lov (OLXbay ushlab turadi)
        </div>
        <div className={['SHIPPED', 'RELEASED'].includes(order.status) ? 'step done' : 'step'}>
          2. Sotuvchi jo'natadi
        </div>
        <div className={order.status === 'RELEASED' ? 'step done' : 'step'}>
          3. Xaridor qabul qilib tasdiqlaydi → pul sotuvchiga o'tkaziladi
        </div>
      </div>

      {isBuyer && order.status === 'PENDING_PAYMENT' && (
        <div className="order-actions">
          <button className="btn-primary" onClick={() => navigate(`/orders/${id}/checkout`)}>
            To'lovga o'tish
          </button>
          <button className="link-btn" disabled={busy} onClick={() => runAction('cancel')}>
            Bekor qilish
          </button>
        </div>
      )}

      {isSeller && order.status === 'PAID_ESCROW' && (
        <div className="order-actions">
          <button className="btn-primary" disabled={busy} onClick={() => runAction('ship')}>
            Jo'natildi deb belgilash
          </button>
        </div>
      )}

      {isBuyer && order.status === 'SHIPPED' && (
        <div className="order-actions">
          <button className="btn-primary" disabled={busy} onClick={() => runAction('confirm')}>
            Qabul qildim — sotuvchiga to'lovni chiqarish
          </button>
          <button className="btn-danger" disabled={busy} onClick={() => runAction('dispute')}>
            Muammo bor — nizo ochish
          </button>
        </div>
      )}

      {isBuyer && order.status === 'PAID_ESCROW' && (
        <div className="order-actions">
          <button className="btn-danger" disabled={busy} onClick={() => runAction('dispute')}>
            Muammo bor — nizo ochish
          </button>
        </div>
      )}

      {order.status === 'DISPUTED' && (
        <div className="empty-state">
          Nizo ochildi. OLXbay yordam xizmati pulni xaridorga qaytarish yoki sotuvchiga
          o'tkazish bo'yicha qaror qabul qiladi.
        </div>
      )}

      <button className="link-btn" onClick={() => navigate(-1)}>
        ← Ortga
      </button>
    </div>
  );
}
