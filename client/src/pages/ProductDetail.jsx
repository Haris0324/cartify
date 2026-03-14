import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/axios';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import styles from './ProductDetail.module.css';

export default function ProductDetail() {
  const { id } = useParams();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [product, setProduct] = useState(null);
  const [qty, setQty] = useState(1);
  const [adding, setAdding] = useState(false);
  const [review, setReview] = useState({ rating: 5, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    api.get(`/products/${id}`).then(({ data }) => setProduct(data));
  }, [id]);

  const handleAddToCart = async () => {
    setAdding(true);
    try {
      await addToCart(product._id, qty);
    } finally {
      setAdding(false);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!user) return;
    setSubmittingReview(true);
    try {
      await api.post(`/reviews/${id}`, review);
      const { data } = await api.get(`/products/${id}`);
      setProduct(data);
      setReview({ rating: 5, comment: '' });
    } finally {
      setSubmittingReview(false);
    }
  };

  if (!product) return <div className={styles.loading}>Loading...</div>;

  const img = product.images?.[0] || 'https://via.placeholder.com/600';

  return (
    <div className={styles.page}>
      <div className={styles.gallery}>
        <img src={img} alt={product.name} />
      </div>
      <div className={styles.info}>
        <span className={styles.category}>{product.category}</span>
        <h1>{product.name}</h1>
        {product.ratings > 0 && (
          <div className={styles.rating}>⭐ {product.ratings?.toFixed(1)} ({product.numReviews} reviews)</div>
        )}
        <div className={styles.priceRow}>
          <span className={styles.price}>${product.price?.toFixed(2)}</span>
          {product.compareAtPrice && (
            <span className={styles.oldPrice}>${product.compareAtPrice?.toFixed(2)}</span>
          )}
        </div>
        <p className={styles.desc}>{product.description}</p>
        <div className={styles.actions}>
          <div className={styles.qty}>
            <button onClick={() => setQty(Math.max(1, qty - 1))}>−</button>
            <span>{qty}</span>
            <button onClick={() => setQty(qty + 1)}>+</button>
          </div>
          <button
            className={styles.addBtn}
            onClick={handleAddToCart}
            disabled={adding || product.stock < 1}
          >
            {adding ? 'Adding...' : 'Add to Cart'}
          </button>
        </div>
        {product.stock < 10 && product.stock > 0 && (
          <p className={styles.lowStock}>Only {product.stock} left!</p>
        )}
      </div>

      {product.reviews?.length > 0 && (
        <section className={styles.reviews}>
          <h3>Reviews</h3>
          {product.reviews.map(r => (
            <div key={r._id} className={styles.review}>
              <span className={styles.reviewRating}>⭐ {r.rating}</span>
              <span className={styles.reviewName}>{r.name}</span>
              {r.comment && <p>{r.comment}</p>}
            </div>
          ))}
        </section>
      )}

      {user && (
        <form className={styles.reviewForm} onSubmit={handleSubmitReview}>
          <h3>Write a Review</h3>
          <div>
            <label>Rating</label>
            <select value={review.rating} onChange={(e) => setReview(r => ({ ...r, rating: +e.target.value }))}>
              {[5,4,3,2,1].map(n => <option key={n} value={n}>{n} stars</option>)}
            </select>
          </div>
          <div>
            <label>Comment</label>
            <textarea
              value={review.comment}
              onChange={(e) => setReview(r => ({ ...r, comment: e.target.value }))}
              rows={3}
              placeholder="Share your experience..."
            />
          </div>
          <button type="submit" disabled={submittingReview}>
            {submittingReview ? 'Submitting...' : 'Submit Review'}
          </button>
        </form>
      )}
    </div>
  );
}
