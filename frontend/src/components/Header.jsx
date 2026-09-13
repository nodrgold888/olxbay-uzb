import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';

export default function Header() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <header className="header">
      <Link to="/" className="logo" onClick={closeMenu}>
        OLX<span>bay</span>
      </Link>

      <button
        className="menu-toggle"
        onClick={() => setMenuOpen((o) => !o)}
        aria-label="Menyu"
        aria-expanded={menuOpen}
      >
        {menuOpen ? '✕' : '☰'}
      </button>

      <nav className={`nav ${menuOpen ? 'open' : ''}`} onClick={closeMenu}>
        {user ? (
          <>
            <Link to="/post">+ E'lon joylash</Link>
            <Link to="/my-listings">Mening e'lonlarim</Link>
            <Link to="/purchases">Xaridlarim</Link>
            <Link to="/sales">Sotuvlarim</Link>
            <Link to="/chat">Xabarlar</Link>
            <span className="user-name">{user.name}</span>
            <button
              className="link-btn"
              onClick={() => {
                logout();
                navigate('/');
              }}
            >
              Chiqish
            </button>
          </>
        ) : (
          <>
            <Link to="/login">Kirish</Link>
            <Link to="/register" className="btn-primary-small">
              Ro'yxatdan o'tish
            </Link>
          </>
        )}
        <button
          className="theme-toggle"
          onClick={(e) => {
            e.stopPropagation();
            toggleTheme();
          }}
          title={theme === 'dark' ? "Yorug' rejim" : "Qorong'i rejim"}
          aria-label="Mavzuni almashtirish"
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
      </nav>

      {menuOpen && <div className="nav-backdrop" onClick={closeMenu} />}
    </header>
  );
}
