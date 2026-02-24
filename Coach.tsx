import { useState, useEffect, useRef } from "react";

export function useAnimatedNumber(target: number, duration = 1200, decimals = 2) {
  const [value, setValue] = useState(0);
  const startRef = useRef(0);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    startRef.current = value;
    startTimeRef.current = null;

    const animate = (timestamp: number) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = startRef.current + (target - startRef.current) * eased;
      setValue(Number(current.toFixed(decimals)));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [target, duration, decimals]);

  return value;
}
