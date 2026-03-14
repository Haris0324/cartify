import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import ProductCard from '../components/ProductCard';
import styles from './Products.module.css';

export default function Products() {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    sort: searchParams.get('sort') || 'newest',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    page: 1
  });

  useEffect(() => {
    api.get('/products/categories').then(({ data }) => setCategories(data));
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filters.search) params.set('search', filters.search);
    if (filters.category) params.set('category', filters.category);
    if (filters.sort) params.set('sort', filters.sort);
    if (filters.minPrice) params.set('minPrice', filters.minPrice);
    if (filters.maxPrice) params.set('maxPrice', filters.maxPrice);
    params.set('page', filters.page);
    api.get(`/products?${params}`).then(({ data }) => {
      setProducts(data.products);
      setTotalPages(data.totalPages || 1);
    }).finally(() => setLoading(false));
  }, [filters]);

  const updateFilter = (key, value) => setFilters(f => ({ ...f, [key]: value, page: 1 }));

  return (
    <div className={styles.page}>
      <div className={styles.sidebar}>
        <h3>Filters</h3>
        <div className={styles.filterGroup}>
          <label>Search</label>
          <input
            type="text"
            placeholder="Search products..."
            value={filters.search}
            onChange={(e) => updateFilter('search', e.target.value)}
          />
        </div>
        <div className={styles.filterGroup}>
          <label>Category</label>
          <select value={filters.category} onChange={(e) => updateFilter('category', e.target.value)}>
            <option value="">All</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className={styles.filterGroup}>
          <label>Price Range</label>
          <div className={styles.priceInputs}>
            <input
              type="number"
              placeholder="Min"
              value={filters.minPrice}
              onChange={(e) => updateFilter('minPrice', e.target.value)}
            />
            <span>-</span>
            <input
              type="number"
              placeholder="Max"
              value={filters.maxPrice}
              onChange={(e) => updateFilter('maxPrice', e.target.value)}
            />
          </div>
        </div>
        <div className={styles.filterGroup}>
          <label>Sort By</label>
          <select value={filters.sort} onChange={(e) => updateFilter('sort', e.target.value)}>
            <option value="newest">Newest</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="rating">Top Rated</option>
          </select>
        </div>
      </div>
      <div className={styles.main}>
        <h1>Products</h1>
        {loading ? (
          <div className={styles.loading}>Loading...</div>
        ) : products.length === 0 ? (
          <p className={styles.empty}>No products found.</p>
        ) : (
          <>
            <div className={styles.grid}>
              {products.map(p => <ProductCard key={p._id} product={p} />)}
            </div>
            {totalPages > 1 && (
              <div className={styles.pagination}>
                <button
                  disabled={filters.page <= 1}
                  onClick={() => updateFilter('page', filters.page - 1)}
                >
                  Prev
                </button>
                <span>Page {filters.page} of {totalPages}</span>
                <button
                  disabled={filters.page >= totalPages}
                  onClick={() => updateFilter('page', filters.page + 1)}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
