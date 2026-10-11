"use client";

import { useRef, useEffect } from "react";
import type { ReactNode } from "react";
import { motion, useInView, useAnimation } from "framer-motion";
import type { Variant } from "framer-motion";

interface AnimateOnScrollProps {
  children: ReactNode;
  delay?: number;
  duration?: number;
  once?: boolean;
  className?: string;
  variant?: "fadeUp" | "fadeIn" | "scaleIn" | "slideLeft" | "slideRight";
}

const variants: Record<string, { hidden: Variant; visible: Variant }> = {
  fadeUp: {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0 },
  },
  fadeIn: {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  },
  scaleIn: {
    hidden: { opacity: 0, scale: 0.92 },
    visible: { opacity: 1, scale: 1 },
  },
  slideLeft: {
    hidden: { opacity: 0, x: -40 },
    visible: { opacity: 1, x: 0 },
  },
  slideRight: {
    hidden: { opacity: 0, x: 40 },
    visible: { opacity: 1, x: 0 },
  },
};

export function AnimateOnScroll({
  children,
  delay = 0,
  duration = 0.7,
  once = true,
  className,
  variant = "fadeUp",
}: AnimateOnScrollProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once, margin: "-80px" });
  const controls = useAnimation();

  useEffect(() => {
    if (isInView) {
      controls.start("visible");
    } else if (!once) {
      controls.start("hidden");
    }
  }, [isInView, controls, once]);

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={variants[variant]}
      transition={{
        duration,
        delay,
        ease: [0.16, 1, 0.3, 1],
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* Staggered children */
interface StaggerContainerProps {
  children: ReactNode;
  className?: string;
  staggerDelay?: number;
}

export function StaggerContainer({
  children,
  className,
  staggerDelay = 0.1,
}: StaggerContainerProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: staggerDelay,
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 30 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* Text reveal word-by-word on scroll */
export function TextReveal({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const words = text.split(" ");

  return (
    <motion.p ref={ref} className={`text-reveal-container ${className || ""}`}>
      {words.map((word, i) => (
        <motion.span
          key={i}
          className="text-reveal-word"
          initial={{ opacity: 0.15 }}
          animate={isInView ? { opacity: 1 } : { opacity: 0.15 }}
          transition={{
            duration: 0.5,
            delay: i * 0.04,
            ease: "easeOut",
          }}
          style={{ marginRight: "0.3em" }}
        >
          {word}
        </motion.span>
      ))}
    </motion.p>
  );
}

/* Magnetic button */
interface MagneticProps {
  children: ReactNode;
  className?: string;
  strength?: number;
}

export function Magnetic({ children, className, strength = 0.3 }: MagneticProps) {
  const ref = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    el.style.transform = `translate(${x * strength}px, ${y * strength}px)`;
  };

  const handleMouseLeave = () => {
    const el = ref.current;
    if (!el) return;
    el.style.transform = "translate(0px, 0px)";
    el.style.transition = "transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)";
  };

  const handleMouseEnter = () => {
    const el = ref.current;
    if (!el) return;
    el.style.transition = "none";
  };

  return (
    <div
      ref={ref}
      className={className}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={handleMouseEnter}
      style={{ display: "inline-block" }}
    >
      {children}
    </div>
  );
}

/* Tilt card with 3D effect */
export function TiltCard({
  children,
  className,
  style,
}: {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  const ref = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    el.style.transform = `perspective(800px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg) scale(1.02)`;
  };

  const handleMouseLeave = () => {
    const el = ref.current;
    if (!el) return;
    el.style.transform = "perspective(800px) rotateY(0deg) rotateX(0deg) scale(1)";
  };

  return (
    <div
      ref={ref}
      className={className}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transition: "transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
        transformStyle: "preserve-3d",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/* Counter animation */
export function AnimatedCounter({
  value,
  suffix = "",
  prefix = "",
  className,
}: {
  value: number;
  suffix?: string;
  prefix?: string;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });
  const controls = useAnimation();

  useEffect(() => {
    if (isInView && ref.current) {
      let start = 0;
      const duration = 2000;
      const startTime = Date.now();

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 4);
        const current = Math.floor(eased * value);
        if (ref.current) {
          ref.current.textContent = `${prefix}${current}${suffix}`;
        }
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else if (ref.current) {
          ref.current.textContent = `${prefix}${value}${suffix}`;
        }
      };

      requestAnimationFrame(animate);
    }
  }, [isInView, value, suffix, prefix]);

  return (
    <span ref={ref} className={className}>
      {prefix}0{suffix}
    </span>
  );
}
