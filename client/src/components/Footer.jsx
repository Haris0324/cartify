import { Link } from 'react-router-dom';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.grid}>
        <div>
          <Link to="/" className={styles.brand}>🛒 Cartify</Link>
          <p>Premium ecommerce experience. Quality products, seamless checkout.</p>
        </div>
        <div>
          <h4>Shop</h4>
          <Link to="/products">All Products</Link>
          <Link to="/products?category=Electronics">Electronics</Link>
          <Link to="/products?category=Clothing">Clothing</Link>
          <Link to="/products?category=Accessories">Accessories</Link>
        </div>
        <div>
          <h4>Account</h4>
          <Link to="/login">Sign In</Link>
          <Link to="/register">Register</Link>
          <Link to="/orders">Order History</Link>
        </div>
        <div>
          <h4>Support</h4>
          <a href="mailto:support@cartify.com">Contact Us</a>
          <Link to="/">Terms of Service</Link>
          <Link to="/">Privacy Policy</Link>
        </div>
      </div>
      <div className={styles.bottom}>
        <p>© {new Date().getFullYear()} Cartify. All rights reserved.</p>
      </div>
    </footer>
  );
}
