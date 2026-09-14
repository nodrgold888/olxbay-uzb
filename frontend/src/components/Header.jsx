import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import ProfileMenu from './ProfileMenu.jsx';

export default function Header() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  function closeMenu() {
    setMenuOpen(false);
  }

  function handleLogout() {
    logout();
    closeMenu();
    navigate('/');
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
            {/* Mobile: flat link list inside the hamburger dropdown */}
            <Link to="/post" className="btn-primary-small mobile-only">
              + E'lon joylash
            </Link>
            <Link to="/my-listings" className="mobile-only">
              📦 Mening e'lonlarim
            </Link>
            <Link to="/sales" className="mobile-only">
              💰 Sotuvlarim
            </Link>
            <Link to="/purchases" className="mobile-only">
              🛒 Xaridlarim
            </Link>
            <Link to="/favorites" className="mobile-only">
              ❤️ Sevimlilar
            </Link>
            <Link to="/chat" className="mobile-only">
              💬 Xabarlar
            </Link>
            <button className="link-btn mobile-only" onClick={handleLogout}>
              🚪 Chiqish
            </button>

            {/* Desktop: message icon + post button + profile avatar dropdown */}
            <Link
              to="/chat"
              className="header-icon-link desktop-only"
              title="Xabarlar"
              aria-label="Xabarlar"
              onClick={(e) => e.stopPropagation()}
            >
              💬
            </Link>
            <Link to="/post" className="btn-primary-small desktop-only" onClick={(e) => e.stopPropagation()}>
              + E'lon joylash
            </Link>
            <span className="desktop-only" onClick={(e) => e.stopPropagation()}>
              <ProfileMenu />
            </span>
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
