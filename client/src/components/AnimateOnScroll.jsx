import { useAnimateOnScroll } from '../hooks/useAnimateOnScroll';
import styles from './AnimateOnScroll.module.css';

export default function AnimateOnScroll({ children, className = '', delay = 0 }) {
  const [ref, visible] = useAnimateOnScroll();
  return (
    <div
      ref={ref}
      className={`${styles.animate} ${visible ? styles.visible : ''} ${className}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}
