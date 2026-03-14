import { useEffect, useRef, useState } from 'react';

export function useAnimateOnScroll(options = {}) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  const { threshold = 0.1, rootMargin = '0px 0px -50px 0px' } = options;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true);
      },
      { threshold, rootMargin }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, rootMargin]);

  return [ref, visible];
}
