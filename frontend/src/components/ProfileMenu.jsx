import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function ProfileMenu() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (rootRef.current && !rootRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function close() {
    setOpen(false);
  }

  return (
    <div className="profile-menu" ref={rootRef}>
      <button className="profile-menu-trigger" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
        <span className="profile-avatar">{user.name.charAt(0).toUpperCase()}</span>
        <span className="profile-menu-name">{user.name}</span>
        <span className={`profile-menu-chevron ${open ? 'open' : ''}`}>▾</span>
      </button>

      {open && (
        <div className="profile-menu-dropdown">
          <div className="profile-menu-header">
            <span className="profile-avatar large">{user.name.charAt(0).toUpperCase()}</span>
            <div>
              <div className="profile-menu-name-full">{user.name}</div>
              {user.city && <div className="profile-menu-city">{user.city}</div>}
            </div>
          </div>

          <div className="profile-menu-section">
            <div className="profile-menu-label">Sotuvchi sifatida</div>
            <Link to="/post" onClick={close}>
              ➕ Yangi e'lon joylash
            </Link>
            <Link to="/my-listings" onClick={close}>
              📦 Mening e'lonlarim
            </Link>
            <Link to="/sales" onClick={close}>
              💰 Sotuvlarim
            </Link>
          </div>

          <div className="profile-menu-section">
            <div className="profile-menu-label">Xaridor sifatida</div>
            <Link to="/purchases" onClick={close}>
              🛒 Xaridlarim
            </Link>
            <Link to="/favorites" onClick={close}>
              ❤️ Sevimlilar
            </Link>
          </div>

          <div className="profile-menu-section">
            <button
              className="profile-menu-logout"
              onClick={() => {
                logout();
                close();
                navigate('/');
              }}
            >
              🚪 Chiqish
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
