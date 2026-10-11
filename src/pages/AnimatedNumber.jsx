
import React, { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";

export default function AnimatedNumber({
  value = 0,
  prefix = "",
  duration = 1.4,
}) {
  const ref = useRef(null);
  const isVisible = useInView(ref, { once: true });
  const [count, setCount] = useState(0);

  const target = Number(value) || 0;

  useEffect(() => {
    if (!isVisible) return;

    let frame;
    let start;

    const animate = (time) => {
      if (start === undefined) start = time;

      const progress = Math.min(
        (time - start) / (duration * 1000),
        1
      );

      const eased = 1 - Math.pow(1 - progress, 3);

      setCount(Math.round(target * eased));

      if (progress < 1) {
        frame = requestAnimationFrame(animate);
      }
    };

    frame = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(frame);
  }, [target, duration, isVisible]);

  return (
    <motion.span
      ref={ref}
      initial={{ opacity: 0, y: 8 }}
      animate={isVisible ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.4 }}
    >
      {prefix}
      {count.toLocaleString("en-IN")}
    </motion.span>
  );
}
