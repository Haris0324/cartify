import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import styles from './OrderDetail.module.css';

export default function OrderDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    api.get(`/orders/${id}`).then(({ data }) => setOrder(data));
  }, [id, user, navigate]);

  if (!order) return <div className={styles.loading}>Loading...</div>;

  return (
    <div className={styles.page}>
      <Link to="/orders" className={styles.back}>← Back to Orders</Link>
      <h1>Order #{order._id?.slice(-8)}</h1>
      <div className={styles.status}>Status: <span className={styles[order.status]}>{order.status}</span></div>
      <div className={styles.grid}>
        <section>
          <h3>Items</h3>
          {order.orderItems?.map((item, i) => (
            <div key={i} className={styles.item}>
              <img src={item.image || 'https://via.placeholder.com/80'} alt={item.name} />
              <div>
                <p>{item.name}</p>
                <span>${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            </div>
          ))}
        </section>
        <section>
          <h3>Shipping Address</h3>
          <p>{order.shippingAddress?.name}</p>
          <p>{order.shippingAddress?.street}</p>
          <p>{order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.zip}</p>
          <p>{order.shippingAddress?.country}</p>
        </section>
      </div>
      <div className={styles.total}>
        <span>Total</span>
        <span>${order.total?.toFixed(2)}</span>
      </div>
    </div>
  );
}
