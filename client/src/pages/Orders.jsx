import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import styles from './Orders.module.css';

export default function Orders() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    api.get('/orders').then(({ data }) => setOrders(data));
  }, [user, navigate]);

  if (!user) return null;

  return (
    <div className={styles.page}>
      <h1>Order History</h1>
      {orders.length === 0 ? (
        <p className={styles.empty}>No orders yet.</p>
      ) : (
        <div className={styles.list}>
          {orders.map(order => (
            <Link key={order._id} to={`/orders/${order._id}`} className={styles.card}>
              <div className={styles.header}>
                <span>#{order._id.slice(-8)}</span>
                <span className={styles[order.status]}>{order.status}</span>
              </div>
              <div className={styles.items}>
                {order.orderItems?.slice(0, 3).map((item, i) => (
                  <span key={i}>{item.name} × {item.quantity}</span>
                ))}
                {order.orderItems?.length > 3 && <span>+{order.orderItems.length - 3} more</span>}
              </div>
              <div className={styles.footer}>
                <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                <span>${order.total?.toFixed(2)}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
