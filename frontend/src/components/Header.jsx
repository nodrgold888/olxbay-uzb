import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';

export default function Header() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  return (
    <header className="header">
      <Link to="/" className="logo">
        OLX<span>bay</span>
      </Link>
      <nav className="nav">
        {user ? (
          <>
            <Link to="/post">+ E'lon joylash</Link>
            <Link to="/my-listings">Mening e'lonlarim</Link>
            <Link to="/purchases">Xaridlarim</Link>
            <Link to="/sales">Sotuvlarim</Link>
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
          onClick={toggleTheme}
          title={theme === 'dark' ? "Yorug' rejim" : "Qorong'i rejim"}
          aria-label="Mavzuni almashtirish"
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
      </nav>
    </header>
  );
}
