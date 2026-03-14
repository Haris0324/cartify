import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import api from '../api/axios';
import styles from './Checkout.module.css';

let stripePromise = null;

function CheckoutForm({ orderId, amount, onSuccess }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setLoading(true);
    setError('');
    try {
      const { error: submitError } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/orders/${orderId}`,
          receipt_email: undefined
        }
      });
      if (submitError) setError(submitError.message || 'Payment failed');
      else onSuccess?.();
    } catch (err) {
      setError(err.message || 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.paymentForm}>
      <PaymentElement />
      {error && <p className={styles.error}>{error}</p>}
      <button type="submit" disabled={!stripe || loading}>
        {loading ? 'Processing...' : `Pay $${amount?.toFixed(2)}`}
      </button>
    </form>
  );
}

export default function Checkout() {
  const { user } = useAuth();
  const { cart } = useCart();
  const navigate = useNavigate();
  const [clientSecret, setClientSecret] = useState('');
  const [order, setOrder] = useState(null);
  const [address, setAddress] = useState({ name: '', street: '', city: '', state: '', zip: '', country: 'US', phone: '' });
  const [step, setStep] = useState(1);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
  }, [user, navigate]);

  useEffect(() => {
    api.get('/stripe/config').then(({ data }) => {
      if (data.publishableKey && data.publishableKey.startsWith('pk_')) {
        stripePromise = loadStripe(data.publishableKey);
      }
    });
  }, []);

  const items = cart?.items || [];
  const subtotal = items.reduce((s, i) => s + (i.price || 0) * (i.quantity || 0), 0);
  const shipping = subtotal >= 50 ? 0 : 9.99;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  const handleCreateOrder = async () => {
    const orderItems = items.map(i => ({
      product: i.product?._id || i.product,
      name: i.name,
      image: i.image,
      price: i.price,
      quantity: i.quantity
    }));
    const { data: newOrder } = await api.post('/orders', {
      orderItems,
      shippingAddress: address,
      subtotal,
      tax,
      shippingCost: shipping,
      total
    });
    setOrder(newOrder);
    const { data } = await api.post('/stripe/create-payment-intent', {
      amount: total,
      orderId: newOrder._id
    });
    setClientSecret(data.clientSecret);
    setStep(2);
  };

  if (items.length === 0 && !order) {
    return (
      <div className={styles.empty}>
        <h2>Your cart is empty</h2>
        <button onClick={() => navigate('/products')}>Continue Shopping</button>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <h1>Checkout</h1>
      <div className={styles.wrap}>
        <div className={styles.main}>
          {step === 1 ? (
            <>
              <section className={styles.section}>
                <h3>Shipping Address</h3>
                <div className={styles.form}>
                  <input placeholder="Full Name" value={address.name} onChange={(e) => setAddress(a => ({ ...a, name: e.target.value }))} required />
                  <input placeholder="Street" value={address.street} onChange={(e) => setAddress(a => ({ ...a, street: e.target.value }))} required />
                  <div className={styles.row}>
                    <input placeholder="City" value={address.city} onChange={(e) => setAddress(a => ({ ...a, city: e.target.value }))} required />
                    <input placeholder="State" value={address.state} onChange={(e) => setAddress(a => ({ ...a, state: e.target.value }))} />
                    <input placeholder="ZIP" value={address.zip} onChange={(e) => setAddress(a => ({ ...a, zip: e.target.value }))} required />
                  </div>
                  <input placeholder="Country" value={address.country} onChange={(e) => setAddress(a => ({ ...a, country: e.target.value }))} />
                  <input placeholder="Phone" value={address.phone} onChange={(e) => setAddress(a => ({ ...a, phone: e.target.value }))} />
                </div>
              </section>
              <button className={styles.continueBtn} onClick={handleCreateOrder}>Continue to Payment</button>
            </>
          ) : clientSecret && stripePromise ? (
            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <CheckoutForm orderId={order?._id} amount={total} />
            </Elements>
          ) : !stripePromise && clientSecret ? (
            <p className={styles.error}>Stripe is not configured. Add STRIPE_PUBLISHABLE_KEY to .env</p>
          ) : (
            <div>Loading payment...</div>
          )}
        </div>
        <div className={styles.summary}>
          <h3>Order Summary</h3>
          {items.map(i => (
            <div key={i._id} className={styles.summaryItem}>
              <span>{i.name} × {i.quantity}</span>
              <span>${((i.price || 0) * (i.quantity || 0)).toFixed(2)}</span>
            </div>
          ))}
          <div className={styles.divider} />
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
        </div>
      </div>
    </div>
  );
}
