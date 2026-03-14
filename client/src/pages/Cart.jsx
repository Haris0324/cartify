import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import styles from './Cart.module.css';

export default function Cart() {
  const { cart, updateQuantity, removeFromCart, loading } = useCart();
  const items = cart?.items || [];

  const subtotal = items.reduce((s, i) => s + (i.price || 0) * (i.quantity || 0), 0);
  const shipping = subtotal >= 50 ? 0 : 9.99;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  if (loading) return <div className={styles.loading}>Loading cart...</div>;

  if (items.length === 0) {
    return (
      <div className={styles.empty}>
        <h2>Your cart is empty</h2>
        <Link to="/products">Continue Shopping</Link>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <h1>Shopping Cart</h1>
      <div className={styles.wrap}>
        <div className={styles.items}>
          {items.map(item => (
            <div key={item._id} className={styles.item}>
              <img src={item.image || 'https://via.placeholder.com/100'} alt={item.name} />
              <div className={styles.itemInfo}>
                <Link to={`/products/${item.product?._id || item.product}`}>{item.name}</Link>
                <span className={styles.itemPrice}>${(item.price * item.quantity).toFixed(2)}</span>
              </div>
              <div className={styles.qty}>
                <button onClick={() => updateQuantity(item._id, Math.max(1, (item.quantity || 1) - 1))}>−</button>
                <span>{item.quantity}</span>
                <button onClick={() => updateQuantity(item._id, (item.quantity || 1) + 1)}>+</button>
              </div>
              <button className={styles.remove} onClick={() => removeFromCart(item._id)}>Remove</button>
            </div>
          ))}
        </div>
        <div className={styles.summary}>
          <h3>Order Summary</h3>
          <div className={styles.row}>
            <span>Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div className={styles.row}>
            <span>Shipping</span>
            <span>{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span>
          </div>
          <div className={styles.row}>
            <span>Tax</span>
            <span>${tax.toFixed(2)}</span>
          </div>
          <div className={styles.total}>
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>
          <Link to="/checkout" className={styles.checkoutBtn}>Proceed to Checkout</Link>
        </div>
      </div>
    </div>
  );
}
