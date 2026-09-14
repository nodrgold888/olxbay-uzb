import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext.jsx';
import { resolveImageUrl } from '../utils/media.js';

const POLL_INTERVAL_MS = 4000;

export default function ChatThread() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [conversation, setConversation] = useState(null);
  const [error, setError] = useState('');
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);
  const isFirstLoad = useRef(true);

  function load() {
    api
      .get(`/conversations/${id}`)
      .then((res) => {
        setConversation(res.data);
        if (isFirstLoad.current) {
          isFirstLoad.current = false;
          requestAnimationFrame(() => messagesEndRef.current?.scrollIntoView());
        }
      })
      .catch((err) => setError(err.response?.data?.error || 'Suhbat topilmadi'));
  }

  useEffect(() => {
    load();
    const interval = setInterval(load, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function handleSend(e) {
    e.preventDefault();
    if (!draft.trim()) return;
    setSending(true);
    try {
      await api.post(`/conversations/${id}/messages`, { body: draft.trim() });
      setDraft('');
      load();
      requestAnimationFrame(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }));
    } catch (err) {
      alert(err.response?.data?.error || 'Xabar yuborishda xatolik');
    } finally {
      setSending(false);
    }
  }

  if (error) return <div className="page empty-state">{error}</div>;
  if (!conversation) return <div className="page-loading">Yuklanmoqda...</div>;

  const otherParty = conversation.buyerId === user.id ? conversation.seller : conversation.buyer;

  return (
    <div className="page narrow">
      <button className="link-btn" onClick={() => navigate('/chat')} style={{ marginBottom: 12 }}>
        ← Xabarlar
      </button>
      <div className="chat-thread">
        <div className="chat-thread-header">
          {conversation.listing.imageUrl && <img src={resolveImageUrl(conversation.listing.imageUrl)} alt="" />}
          <div>
            <div className="chat-list-name">{otherParty.name}</div>
            <Link to={`/listing/${conversation.listing.id}`} className="chat-list-listing">
              {conversation.listing.title} ·{' '}
              {Number(conversation.listing.price).toLocaleString('ru-RU')} {conversation.listing.currency}
            </Link>
          </div>
        </div>

        <div className="chat-messages">
          {conversation.messages.length === 0 && (
            <div className="empty-state">Xabar yozib, suhbatni boshlang.</div>
          )}
          {conversation.messages.map((m) => (
            <div key={m.id} className={`chat-bubble ${m.senderId === user.id ? 'mine' : ''}`}>
              {m.body}
              <span className="chat-bubble-time">
                {new Date(m.createdAt).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <form className="chat-input-row" onSubmit={handleSend}>
          <input
            type="text"
            placeholder="Xabar yozing..."
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
          />
          <button type="submit" disabled={sending || !draft.trim()} aria-label="Yuborish">
            ➤
          </button>
        </form>
      </div>
    </div>
  );
}
