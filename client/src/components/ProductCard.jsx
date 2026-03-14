import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { useState } from 'react';
import styles from './ProductCard.module.css';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [adding, setAdding] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);

  const handleAddToCart = async (e) => {
    e.preventDefault();
    setAdding(true);
    try {
      await addToCart(product._id);
      toast.success('Added to cart');
    } catch {
      toast.error('Failed to add to cart');
    } finally {
      setAdding(false);
    }
  };

  const toggleWishlist = async (e) => {
    e.preventDefault();
    if (!user) return;
    try {
      if (wishlisted) {
        await api.delete(`/wishlist/${product._id}`);
        setWishlisted(false);
      } else {
        await api.post('/wishlist', { productId: product._id });
        setWishlisted(true);
      }
    } catch (err) {
      if (!wishlisted) setWishlisted(true);
    }
  };

  const img = product.images?.[0] || 'https://via.placeholder.com/400';
  const discount = product.compareAtPrice ? Math.round((1 - product.price / product.compareAtPrice) * 100) : 0;

  return (
    <Link to={`/products/${product._id}`} className={styles.card}>
      <div className={styles.imgWrap}>
        <img src={img} alt={product.name} loading="lazy" />
        {discount > 0 && <span className={styles.badge}>-{discount}%</span>}
        {product.isFeatured && <span className={styles.featured}>Featured</span>}
        <button className={styles.wishlist} onClick={toggleWishlist} aria-label="Wishlist">
          {wishlisted ? '❤️' : '🤍'}
        </button>
        <button
          className={styles.addBtn}
          onClick={handleAddToCart}
          disabled={adding || product.stock < 1}
        >
          {adding ? '...' : 'Add to Cart'}
        </button>
      </div>
      <div className={styles.info}>
        <span className={styles.category}>{product.category}</span>
        <h3>{product.name}</h3>
        <div className={styles.priceRow}>
          <span className={styles.price}>${product.price?.toFixed(2)}</span>
          {product.compareAtPrice && (
            <span className={styles.oldPrice}>${product.compareAtPrice?.toFixed(2)}</span>
          )}
        </div>
        {product.ratings > 0 && (
          <div className={styles.rating}>⭐ {product.ratings?.toFixed(1)} ({product.numReviews})</div>
        )}
      </div>
    </Link>
  );
}
