import React, { useCallback, useEffect, useRef } from "react";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useSpring,
} from "motion/react";
import { cn } from "../../lib/utils";

export function MagicCard({
  children,
  className,
  gradientSize = 220,
  gradientFrom = "#86efac",
  gradientTo = "#60a5fa",
  glow = true,
}) {
  const mouseX = useMotionValue(-gradientSize);
  const mouseY = useMotionValue(-gradientSize);

  const orbX = useSpring(mouseX, { stiffness: 250, damping: 30, mass: 0.6 });
  const orbY = useSpring(mouseY, { stiffness: 250, damping: 30, mass: 0.6 });
  const orbVisible = useSpring(0, { stiffness: 300, damping: 35 });

  const gradientSizeRef = useRef(gradientSize);

  useEffect(() => {
    gradientSizeRef.current = gradientSize;
  }, [gradientSize]);

  const reset = useCallback(
    (show = false) => {
      const off = -gradientSizeRef.current;
      mouseX.set(off);
      mouseY.set(off);
      orbVisible.set(show ? 0.75 : 0);
    },
    [mouseX, mouseY, orbVisible]
  );

  const handlePointerMove = useCallback(
    (event) => {
      const rect = event.currentTarget.getBoundingClientRect();
      mouseX.set(event.clientX - rect.left);
      mouseY.set(event.clientY - rect.top);
    },
    [mouseX, mouseY]
  );

  useEffect(() => {
    reset(false);
  }, [reset]);

  return (
    <motion.div
      className={cn(
        "group relative isolate overflow-hidden rounded-[inherit] border border-transparent",
        className
      )}
      onPointerMove={handlePointerMove}
      onPointerLeave={() => reset(false)}
      onPointerEnter={() => reset(true)}
      style={{
        background: useMotionTemplate`
          linear-gradient(#ffffff 0 0) padding-box,
          radial-gradient(${gradientSize}px circle at ${mouseX}px ${mouseY}px,
            ${gradientFrom},
            ${gradientTo},
            rgba(203, 213, 225, 0.85) 100%
          ) border-box
        `,
      }}
    >
      <div className="absolute inset-px z-20 rounded-[inherit] bg-white/95" />

      {glow && (
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute z-30 rounded-full"
          style={{
            width: 320,
            height: 320,
            x: orbX,
            y: orbY,
            translateX: "-50%",
            translateY: "-50%",
            filter: "blur(56px)",
            opacity: orbVisible,
            background: `linear-gradient(135deg, ${gradientFrom}, ${gradientTo})`,
            mixBlendMode: "multiply",
            willChange: "transform, opacity",
          }}
        />
      )}

      <div className="relative z-40">{children}</div>
    </motion.div>
  );
}