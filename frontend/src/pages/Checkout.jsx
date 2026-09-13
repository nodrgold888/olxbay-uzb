import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api';

const METHODS = [
  { id: 'click', label: 'Click', emoji: '🔵' },
  { id: 'payme', label: 'Payme', emoji: '🟢' },
  { id: 'card', label: 'Karta', emoji: '💳' },
];

function formatCardNumber(value) {
  return value
    .replace(/\D/g, '')
    .slice(0, 16)
    .replace(/(.{4})/g, '$1 ')
    .trim();
}

function formatExpiry(value) {
  const digits = value.replace(/\D/g, '').slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

export default function Checkout() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');
  const [method, setMethod] = useState('click');
  const [card, setCard] = useState({ number: '', name: '', expiry: '', cvv: '' });
  const [formError, setFormError] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    api
      .get(`/orders/${id}`)
      .then((res) => {
        if (res.data.status !== 'PENDING_PAYMENT') {
          navigate(`/orders/${id}`, { replace: true });
          return;
        }
        setOrder(res.data);
      })
      .catch((err) => setError(err.response?.data?.error || 'Buyurtma topilmadi'));
  }, [id, navigate]);

  function updateCard(key, value) {
    setCard((c) => ({ ...c, [key]: value }));
  }

  function validateCard() {
    const digitsOnly = card.number.replace(/\s/g, '');
    if (digitsOnly.length !== 16) return "Karta raqami 16 ta raqamdan iborat bo'lishi kerak";
    if (!card.name.trim()) return "Karta egasining ismini kiriting";
    if (!/^\d{2}\/\d{2}$/.test(card.expiry)) return "Amal qilish muddatini MM/YY formatida kiriting";
    if (!/^\d{3}$/.test(card.cvv)) return "CVV 3 ta raqamdan iborat bo'lishi kerak";
    return '';
  }

  async function handlePay(e) {
    e.preventDefault();
    setFormError('');

    if (method === 'card') {
      const validationError = validateCard();
      if (validationError) {
        setFormError(validationError);
        return;
      }
    }

    setProcessing(true);
    try {
      // Simulated processing delay so the flow feels like a real gateway
      // round-trip. The actual charge is mocked server-side (see README) —
      // wiring a real Payme/Click transaction here is the next step.
      await new Promise((resolve) => setTimeout(resolve, 900));
      await api.post(`/orders/${id}/pay`);
      navigate(`/orders/${id}`);
    } catch (err) {
      setFormError(err.response?.data?.error || "To'lovda xatolik yuz berdi");
    } finally {
      setProcessing(false);
    }
  }

  if (error) return <div className="page empty-state">{error}</div>;
  if (!order) return <div className="page-loading">Yuklanmoqda...</div>;

  return (
    <div className="page narrow">
      <h1>To'lov</h1>

      <div className="order-box">
        <div className="order-row">
          <strong>Mahsulot:</strong> {order.listing.title}
        </div>
        <div className="order-row">
          <strong>To'lov summasi:</strong> {Number(order.amount).toLocaleString('ru-RU')} {order.currency}
        </div>
      </div>
      <p className="escrow-note" style={{ marginBottom: 20 }}>
        Bu summa OLXbay tomonidan xavfsiz ushlab turiladi va faqat siz mahsulotni qabul
        qilib tasdiqlagandan so'ng sotuvchiga o'tkaziladi.
      </p>

      <div className="chips" style={{ padding: 0, marginBottom: 20 }}>
        {METHODS.map((m) => (
          <div
            key={m.id}
            className={`chip ${method === m.id ? 'active' : ''}`}
            onClick={() => setMethod(m.id)}
          >
            {m.emoji} {m.label}
          </div>
        ))}
      </div>

      <form className="form" onSubmit={handlePay}>
        {formError && <div className="form-error">{formError}</div>}

        {method === 'card' ? (
          <>
            <label>
              Karta raqami
              <input
                type="text"
                inputMode="numeric"
                placeholder="0000 0000 0000 0000"
                value={card.number}
                onChange={(e) => updateCard('number', formatCardNumber(e.target.value))}
              />
            </label>
            <label>
              Karta egasi
              <input
                type="text"
                placeholder="ISM FAMILIYA"
                value={card.name}
                onChange={(e) => updateCard('name', e.target.value.toUpperCase())}
              />
            </label>
            <div className="form-row">
              <label>
                Amal qilish muddati
                <input
                  type="text"
                  placeholder="MM/YY"
                  value={card.expiry}
                  onChange={(e) => updateCard('expiry', formatExpiry(e.target.value))}
                />
              </label>
              <label>
                CVV
                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={3}
                  placeholder="•••"
                  value={card.cvv}
                  onChange={(e) => updateCard('cvv', e.target.value.replace(/\D/g, '').slice(0, 3))}
                />
              </label>
            </div>
          </>
        ) : (
          <p className="hint">
            {METHODS.find((m) => m.id === method)?.label} orqali to'lash uchun davom eting — ilovaga
            yo'naltirilasiz (demo rejimida shunchaki simulyatsiya qilinadi).
          </p>
        )}

        <button type="submit" className="btn-primary" disabled={processing}>
          {processing
            ? "To'lov amalga oshirilmoqda..."
            : `${Number(order.amount).toLocaleString('ru-RU')} ${order.currency} to'lash`}
        </button>
      </form>
    </div>
  );
}
