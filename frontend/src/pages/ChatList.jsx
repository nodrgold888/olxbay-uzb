import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext.jsx';
import { resolveImageUrl } from '../utils/media.js';

export default function ChatList() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/conversations')
      .then((res) => setConversations(res.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="page-loading">Yuklanmoqda...</div>;

  return (
    <div className="page">
      <h1>Xabarlar</h1>
      {conversations.length === 0 ? (
        <div className="empty-state">
          Hozircha suhbatlar yo'q. Biror e'lon sahifasida "Sotuvchiga yozish" tugmasini bosing.
        </div>
      ) : (
        <div className="chat-list">
          {conversations.map((c) => {
            const otherParty = c.buyerId === user.id ? c.seller : c.buyer;
            const lastMessage = c.messages[0];
            return (
              <Link key={c.id} to={`/chat/${c.id}`} className="chat-list-item">
                <div className="chat-list-thumb">
                  {c.listing.imageUrl ? <img src={resolveImageUrl(c.listing.imageUrl)} alt="" /> : '📦'}
                </div>
                <div className="chat-list-info">
                  <div className="chat-list-name">{otherParty.name}</div>
                  <div className="chat-list-listing">{c.listing.title}</div>
                  {lastMessage && <div className="chat-list-preview">{lastMessage.body}</div>}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
