import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

const STATUS_LABELS = {
  PENDING_PAYMENT: "To'lov kutilmoqda",
  PAID_ESCROW: "To'landi (ushlab turilmoqda)",
  SHIPPED: "Jo'natildi",
  RELEASED: 'Yakunlandi',
  DISPUTED: 'Nizoli holat',
  CANCELLED: 'Bekor qilindi',
};

export default function OrderList({ mode }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const endpoint = mode === 'selling' ? '/orders/selling' : '/orders/mine';
  const title = mode === 'selling' ? 'Sotuvlarim' : 'Xaridlarim';
  const otherPartyLabel = mode === 'selling' ? 'Xaridor' : 'Sotuvchi';

  useEffect(() => {
    api
      .get(endpoint)
      .then((res) => setOrders(res.data))
      .finally(() => setLoading(false));
  }, [endpoint]);

  if (loading) return <div className="page-loading">Yuklanmoqda...</div>;

  return (
    <div className="page">
      <h1>{title}</h1>
      {orders.length === 0 ? (
        <div className="empty-state">Hozircha buyurtmalar yo'q.</div>
      ) : (
        <div className="order-list">
          {orders.map((order) => (
            <Link key={order.id} to={`/orders/${order.id}`} className="order-list-item">
              <div>
                <div className="order-list-title">{order.listing.title}</div>
                <div className="order-list-meta">
                  {otherPartyLabel}: {(mode === 'selling' ? order.buyer : order.seller)?.name}
                </div>
              </div>
              <div className="order-list-right">
                <div>{Number(order.amount).toLocaleString('ru-RU')} {order.currency}</div>
                <div className="order-list-status">{STATUS_LABELS[order.status] || order.status}</div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
