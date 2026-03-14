import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import styles from './Navbar.module.css';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenu, setUserMenu] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setUserMenu(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) navigate(`/products?search=${encodeURIComponent(query.trim())}`);
  };

  const handleLogout = () => {
    logout();
    setUserMenu(false);
    navigate(user?.role === 'admin' ? '/login?redirect=admin' : '/');
  };

  return (
    <nav className={styles.nav}>
      <div className={styles.container}>
        <Link to={user?.role === 'admin' ? '/admin' : '/'} className={styles.logo}>
          <span className={styles.logoIcon}>🛒</span>
          <span>Cartify</span>
        </Link>

        {user?.role !== 'admin' && (
          <form className={styles.search} onSubmit={handleSearch}>
            <input
              type="search"
              placeholder="Search products..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button type="submit" aria-label="Search">🔍</button>
          </form>
        )}

        <div className={styles.actions}>
          {user?.role !== 'admin' && (
            <>
              <Link to="/products" className={styles.link}>Shop</Link>
              <Link to="/cart" className={styles.cartBtn}>
                <span className={styles.cartIcon}>🛒</span>
                {cartCount > 0 && <span className={styles.badge}>{cartCount}</span>}
              </Link>
            </>
          )}
          {user ? (
            <div className={styles.userWrap} ref={dropdownRef}>
              <button className={styles.userBtn} onClick={() => setUserMenu(!userMenu)}>
                <span className={styles.avatar}>{user.name?.[0]}</span>
                <span className={styles.chevron}>▼</span>
              </button>
              {userMenu && (
                <div className={styles.dropdown}>
                  <Link to="/account" onClick={() => setUserMenu(false)}>Account</Link>
                  <Link to="/orders" onClick={() => setUserMenu(false)}>Orders</Link>
                  {user.role === 'admin' && <Link to="/admin" onClick={() => setUserMenu(false)}>Admin</Link>}
                  <button onClick={handleLogout}>Logout</button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className={styles.loginBtn}>Sign In</Link>
          )}
        </div>

        <button className={styles.mobileMenu} onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">
          {menuOpen ? '✕' : '☰'}
        </button>
      </div>
      {menuOpen && (
        <div className={styles.mobileNav}>
          {user?.role !== 'admin' && (
            <>
              <form onSubmit={handleSearch}>
                <input placeholder="Search..." value={query} onChange={(e) => setQuery(e.target.value)} />
                <button type="submit">Search</button>
              </form>
              <Link to="/products" onClick={() => setMenuOpen(false)}>Shop</Link>
              <Link to="/cart" onClick={() => setMenuOpen(false)}>Cart ({cartCount})</Link>
            </>
          )}
          {user ? (
            <>
              <Link to="/account" onClick={() => setMenuOpen(false)}>Account</Link>
              <Link to="/orders" onClick={() => setMenuOpen(false)}>Orders</Link>
              {user.role === 'admin' && <Link to="/admin" onClick={() => setMenuOpen(false)}>Admin</Link>}
              <button onClick={() => { handleLogout(); setMenuOpen(false); }}>Logout</button>
            </>
          ) : (
            <Link to="/login" onClick={() => setMenuOpen(false)}>Sign In</Link>
          )}
        </div>
      )}
    </nav>
  );
}
