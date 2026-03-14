import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import ProductCard from '../components/ProductCard';
import AnimateOnScroll from '../components/AnimateOnScroll';
import styles from './Home.module.css';

export default function Home() {
  const [featured, setFeatured] = useState([]);

  useEffect(() => {
    api.get('/products/featured').then(({ data }) => setFeatured(data));
  }, []);

  return (
    <div className={styles.home}>
      <section className={styles.hero}>
        <AnimateOnScroll className={styles.heroContent}>
          <h1>Discover Premium Products</h1>
          <p>Curated selection of high-quality items. Seamless shopping, secure checkout.</p>
          <Link to="/products" className={styles.cta}>Shop Now</Link>
        </AnimateOnScroll>
        <AnimateOnScroll delay={150}>
          <div className={styles.heroVisual}>
            <img src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800&q=80" alt="Shopping" />
          </div>
        </AnimateOnScroll>
      </section>

      <section className={styles.categories}>
        <h2>Shop by Category</h2>
        <div className={styles.catGrid}>
          {['Electronics', 'Clothing', 'Accessories', 'Footwear', 'Beauty', 'Sports'].map(cat => (
            <Link key={cat} to={`/products?category=${cat}`} className={styles.catCard}>
              {cat}
            </Link>
          ))}
        </div>
      </section>

      <section className={styles.featured}>
        <AnimateOnScroll><h2>Featured Products</h2></AnimateOnScroll>
        <div className={styles.grid}>
          {featured.map((p, i) => (
            <AnimateOnScroll key={p._id} delay={i * 60}>
              <ProductCard product={p} />
            </AnimateOnScroll>
          ))}
        </div>
        <AnimateOnScroll>
          <Link to="/products" className={styles.viewAll}>View All Products</Link>
        </AnimateOnScroll>
      </section>

      <section className={styles.banner}>
        <AnimateOnScroll>
          <div>
            <h3>Free Shipping on Orders $50+</h3>
            <p>No minimum. Quality guaranteed.</p>
          </div>
        </AnimateOnScroll>
      </section>
    </div>
  );
}
