"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, useScroll, useTransform, useSpring, AnimatePresence } from "framer-motion";

/* ================================================================
  1. Animated SVG Gradient Background
  Soft, blurred SVG color fields inspired by Fancy Components
  ================================================================ */
export function AnimatedSvgGradient({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animated-svg-gradient-wrap ${className}`}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        overflow: "hidden",
        pointerEvents: "none",
        zIndex: 0,
        opacity: 0.65,
      }}
    >
      <svg
        viewBox="0 0 1440 900"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
      >
        <defs>
          <filter id="animated-gradient-blur" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="70" />
          </filter>
        </defs>
        <g filter="url(#animated-gradient-blur)" opacity="0.9">
          <circle cx="180" cy="180" r="230" fill="#C4B5E0">
            <animate attributeName="cx" values="180;420;260;180" dur="18s" repeatCount="indefinite" />
            <animate attributeName="cy" values="180;300;120;180" dur="21s" repeatCount="indefinite" />
          </circle>
          <circle cx="1120" cy="220" r="250" fill="#A8D8C8">
            <animate attributeName="cx" values="1120;940;1220;1120" dur="20s" repeatCount="indefinite" />
            <animate attributeName="cy" values="220;120;340;220" dur="24s" repeatCount="indefinite" />
          </circle>
          <circle cx="760" cy="720" r="280" fill="#F5C4A1">
            <animate attributeName="cx" values="760;620;860;760" dur="22s" repeatCount="indefinite" />
            <animate attributeName="cy" values="720;620;780;720" dur="19s" repeatCount="indefinite" />
          </circle>
        </g>
      </svg>
    </div>
  );
}

/* ================================================================
   2. Gooey SVG Filter
   Creates organic liquid merge effect between adjacent elements
   ================================================================ */
export function GooeyFilter() {
  return (
    <svg style={{ position: "absolute", width: 0, height: 0, pointerEvents: "none" }} aria-hidden="true">
      <defs>
        <filter id="fancy-gooey">
          <feGaussianBlur in="SourceGraphic" stdDeviation="8" result="blur" />
          <feColorMatrix
            in="blur"
            mode="matrix"
            values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -9"
            result="goo"
          />
          <feComposite in="SourceGraphic" in2="goo" operator="atop" />
        </filter>
      </defs>
    </svg>
  );
}

/* ================================================================
  3. Cursor Attractor & Gravity for Hero Section
  Subtle interactive particles that pull toward the cursor
  and settle back into place with soft physics.
  ================================================================ */
interface AttractorNode {
  id: string;
  color: string;
  initialX: number; // percentage
  initialY: number; // percentage
  mass: number;
}

const ATTRACTOR_NODES: AttractorNode[] = [
  { id: "1", color: "#2F7D78", initialX: 10, initialY: 18, mass: 1.1 },
  { id: "2", color: "#54739A", initialX: 24, initialY: 32, mass: 0.8 },
  { id: "3", color: "#A56F54", initialX: 88, initialY: 18, mass: 1.3 },
  { id: "4", color: "#65769B", initialX: 78, initialY: 34, mass: 0.9 },
  { id: "5", color: "#2F7D78", initialX: 7, initialY: 76, mass: 1.2 },
  { id: "6", color: "#A56F54", initialX: 21, initialY: 88, mass: 0.9 },
  { id: "7", color: "#54739A", initialX: 91, initialY: 76, mass: 1.1 },
  { id: "8", color: "#65769B", initialX: 76, initialY: 88, mass: 0.8 },
];

export function CursorGravityHero({
  children,
  className = "",
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: -1000, y: -1000 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setMousePos({ x: -1000, y: -1000 });
      }}
      className={`cursor-gravity-container ${className}`}
      style={{
        position: "sticky",
        bottom: 0,
        width: "100%",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
      }}
    >
      {/* Physics particles that gravitate toward the cursor */}
      {ATTRACTOR_NODES.map((node) => (
        <PhysicsNodeItem
          key={node.id}
          node={node}
          mousePos={mousePos}
          isHovered={isHovered}
          containerRef={containerRef}
        />
      ))}

      {/* Content slot */}
      <div style={{ position: "relative", zIndex: 10 }}>{children}</div>
    </div>
  );
}

function PhysicsNodeItem({
  node,
  mousePos,
  isHovered,
  containerRef,
}: {
  node: AttractorNode;
  mousePos: { x: number; y: number };
  isHovered: boolean;
  containerRef: React.RefObject<HTMLDivElement | null>;
}) {
  const itemRef = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    let animId: number;
    const updatePhysics = () => {
      if (!itemRef.current || !containerRef.current) return;

      const containerRect = containerRef.current.getBoundingClientRect();
      const originX = (node.initialX / 100) * containerRect.width;
      const originY = (node.initialY / 100) * containerRect.height;

      if (isHovered && mousePos.x > 0) {
        // Distance to cursor
        const dx = mousePos.x - originX;
        const dy = mousePos.y - originY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // Attractor radius
        const maxDist = 380;
        if (dist < maxDist && dist > 1) {
          const force = (1 - dist / maxDist) * 38 * node.mass;
          const targetX = (dx / dist) * force;
          const targetY = (dy / dist) * force;
          setOffset((prev) => ({
            x: prev.x + (targetX - prev.x) * 0.12,
            y: prev.y + (targetY - prev.y) * 0.12,
          }));
        } else {
          // Soft return to origin
          setOffset((prev) => ({
            x: prev.x * 0.9,
            y: prev.y * 0.9,
          }));
        }
      } else {
        setOffset((prev) => ({
          x: prev.x * 0.9,
          y: prev.y * 0.9,
        }));
      }

      animId = requestAnimationFrame(updatePhysics);
    };

    animId = requestAnimationFrame(updatePhysics);
    return () => cancelAnimationFrame(animId);
  }, [mousePos, isHovered, node, containerRef]);

    return (
      <div
      ref={itemRef}
      style={{
        position: "absolute",
        left: `${node.initialX}%`,
        top: `${node.initialY}%`,
        transform: `translate(calc(-50% + ${offset.x}px), calc(-50% + ${offset.y}px))`,
        zIndex: 4,
        pointerEvents: "none",
        userSelect: "none",
      }}
    >
      <div
        aria-hidden="true"
        style={{
          width: 18,
          height: 18,
          borderRadius: "50%",
          background: node.color,
          opacity: 0.34,
          border: `1px solid ${node.color}66`,
          boxShadow: `0 0 0 10px ${node.color}14, 0 8px 22px ${node.color}18`,
        }}
      />
    </div>
  );
}

/* ================================================================
   4. Scramble In Text
   Random glyph shuffling effect before decoding into final string
   ================================================================ */
const GLYPHS = "!<>-_\\/[]{}—=+*^?#________";

export function ScrambleText({
  text,
  className = "",
  triggerOnHover = false,
  scrambleSpeed = 35,
}: {
  text: string;
  className?: string;
  triggerOnHover?: boolean;
  scrambleSpeed?: number;
}) {
  const [displayText, setDisplayText] = useState(text);
  const [isScrambling, setIsScrambling] = useState(false);

  const startScramble = () => {
    if (isScrambling) return;
    setIsScrambling(true);

    let iteration = 0;
    const length = text.length;

    const interval = setInterval(() => {
      setDisplayText(
        text
          .split("")
          .map((char, index) => {
            if (char === " ") return " ";
            if (index < iteration) {
              return text[index];
            }
            return GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
          })
          .join("")
      );

      if (iteration >= length) {
        clearInterval(interval);
        setIsScrambling(false);
        setDisplayText(text);
      }

      iteration += 1 / 2;
    }, scrambleSpeed);
  };

  useEffect(() => {
    startScramble();
  }, [text]);

  return (
    <span
      className={`scramble-text ${className}`}
      onMouseEnter={triggerOnHover ? startScramble : undefined}
      style={{ display: "inline-block", fontVariantNumeric: "tabular-nums" }}
    >
      {displayText}
    </span>
  );
}

/* ================================================================
   5. Text Highlighter
   Animated SVG marker brush/underline that fills on viewport entry
   ================================================================ */
export function TextHighlighter({
  children,
  color = "var(--accent-lavender-light)",
  className = "",
  strokeColor = "var(--accent-lavender)",
}: {
  children: React.ReactNode;
  color?: string;
  strokeColor?: string;
  className?: string;
}) {
  return (
    <span
      className={`text-highlighter-wrapper ${className}`}
      style={{
        position: "relative",
        display: "inline-block",
        padding: "0 4px",
      }}
    >
      {/* Background marker fill */}
      <motion.span
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
        style={{
          position: "absolute",
          left: 0,
          bottom: 2,
          width: "100%",
          height: "40%",
          background: color,
          borderRadius: 4,
          zIndex: 0,
          transformOrigin: "left center",
        }}
      />

      {/* Hand-drawn SVG underline loop */}
      <svg
        viewBox="0 0 100 12"
        fill="none"
        preserveAspectRatio="none"
        style={{
          position: "absolute",
          left: 0,
          bottom: -4,
          width: "100%",
          height: 8,
          overflow: "visible",
          zIndex: 1,
          pointerEvents: "none",
        }}
      >
        <motion.path
          d="M 1 9 C 25 3, 75 11, 99 5"
          stroke={strokeColor}
          strokeWidth="2.5"
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          whileInView={{ pathLength: 1, opacity: 0.85 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.4, ease: "easeOut" }}
        />
      </svg>

      <span style={{ position: "relative", zIndex: 2 }}>{children}</span>
    </span>
  );
}

/* ================================================================
   6. Text Rotate
   Rotating cycling headline words with smooth 3D flip slide
   ================================================================ */
export function TextRotate({
  words,
  interval = 2800,
  className = "",
}: {
  words: string[];
  interval?: number;
  className?: string;
}) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % words.length);
    }, interval);
    return () => clearInterval(timer);
  }, [words.length, interval]);

  return (
    <span
      className={`text-rotate-container ${className}`}
      style={{
        display: "inline-block",
        position: "relative",
        height: "1.25em",
        overflow: "hidden",
        verticalAlign: "bottom",
        perspective: 600,
      }}
    >
      <AnimatePresence mode="wait">
        <motion.span
          key={words[index]}
          initial={{ y: "100%", opacity: 0, rotateX: -60 }}
          animate={{ y: "0%", opacity: 1, rotateX: 0 }}
          exit={{ y: "-100%", opacity: 0, rotateX: 60 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          style={{
            display: "inline-block",
            transformOrigin: "center center",
            color: "inherit",
          }}
        >
          {words[index]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

/* ================================================================
   7. Letter 3D Swap
   Splits text into letters; each flips 90 deg in 3D on hover
   ================================================================ */
export function Letter3DSwap({
  text,
  className = "",
}: {
  text: string;
  className?: string;
}) {
  return (
    <span
      className={`letter-3d-swap-container ${className}`}
      style={{
        display: "inline-flex",
        perspective: 600,
        cursor: "pointer",
      }}
    >
      {text.split("").map((char, i) => (
        <motion.span
          key={i}
          className="letter-3d-item"
          whileHover={{
            rotateX: 360,
            scale: 1.15,
            color: "var(--accent-lavender)",
          }}
          transition={{
            duration: 0.45,
            delay: i * 0.02,
            ease: [0.34, 1.56, 0.64, 1],
          }}
          style={{
            display: "inline-block",
            transformStyle: "preserve-3d",
            whiteSpace: char === " " ? "pre" : "normal",
          }}
        >
          {char}
        </motion.span>
      ))}
    </span>
  );
}

/* ================================================================
   8. Simple Marquee
   Infinite horizontal ticker with pause-on-hover & smooth translation
   ================================================================ */
export function SimpleMarquee({
  children,
  speed = 40,
  direction = "left",
  pauseOnHover = true,
  className = "",
}: {
  children: React.ReactNode;
  speed?: number; // seconds for full cycle
  direction?: "left" | "right";
  pauseOnHover?: boolean;
  className?: string;
}) {
  return (
    <div
      className={`simple-marquee-container ${className}`}
      style={{
        overflow: "hidden",
        display: "flex",
        userSelect: "none",
        maskImage: "linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)",
        WebkitMaskImage: "linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)",
      }}
    >
      <motion.div
        className="simple-marquee-track"
        animate={{
          x: direction === "left" ? ["0%", "-50%"] : ["-50%", "0%"],
        }}
        transition={{
          repeat: Infinity,
          ease: "linear",
          duration: speed,
        }}
        whileHover={pauseOnHover ? { animationPlayState: "paused" } : {}}
        style={{
          display: "flex",
          flexShrink: 0,
          gap: "2rem",
          alignItems: "center",
        }}
      >
        {children}
        {children}
      </motion.div>
    </div>
  );
}

/* ================================================================
   9. Stacking Cards
   Cards stack smoothly on scroll with sticky positioning & scale
   ================================================================ */
interface StackingCardItem {
  id: string;
  badge: string;
  title: string;
  subtitle: string;
  description: string;
  stats: { label: string; value: string; trend: string }[];
  accentColor: string;
  bgColor: string;
  icon: React.ReactNode;
}

export function StackingCards({
  cards,
  className = "",
}: {
  cards: StackingCardItem[];
  className?: string;
}) {
  return (
    <div
      className={`stacking-cards-wrapper ${className}`}
      style={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        gap: "4rem",
        paddingBottom: "4rem",
      }}
    >
      {cards.map((card, index) => (
        <StackingCardRow key={card.id} card={card} index={index} total={cards.length} />
      ))}
    </div>
  );
}

function StackingCardRow({
  card,
  index,
  total,
}: {
  card: StackingCardItem;
  index: number;
  total: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "start start"],
  });

  const scale = useTransform(scrollYProgress, [0, 1], [0.94, 1]);
  const opacity = useTransform(scrollYProgress, [0, 0.4, 1], [0.6, 0.9, 1]);

  return (
    <div
      ref={ref}
      style={{
        position: "sticky",
        top: `calc(100px + ${index * 28}px)`,
        zIndex: index + 1,
      }}
    >
      <motion.div
        style={{
          scale,
          opacity,
          background: "var(--bg-card)",
          border: "var(--border-comic)",
          borderRadius: "var(--radius-xl)",
          padding: "36px 40px",
          boxShadow: `var(--shadow-comic-md)`,
          transformOrigin: "center top",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 20 }}>
          <div style={{ maxWidth: 640 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: "50%",
                  background: card.bgColor,
                  color: card.accentColor,
                  border: "var(--border-comic)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1.2rem",
                }}
              >
                {card.icon}
              </div>
              <span
                style={{
                  background: card.bgColor,
                  color: card.accentColor,
                  padding: "4px 12px",
                  borderRadius: 20,
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  border: "1px solid rgba(26,26,26,0.08)",
                }}
              >
                {card.badge}
              </span>
              <span style={{ fontSize: "0.8rem", color: "var(--text-tertiary)" }}>
                0{index + 1} / 0{total}
              </span>
            </div>

            <h3 style={{ fontFamily: "'Instrument Serif', serif", fontSize: "2rem", fontWeight: 400, marginBottom: 8 }}>
              {card.title}
            </h3>

            <p style={{ fontSize: "1rem", color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: 24 }}>
              {card.description}
            </p>
          </div>

          {/* Quick Metrics Pillar */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 16,
              background: "var(--bg-secondary)",
              padding: "20px 24px",
              borderRadius: "var(--radius-lg)",
              border: "var(--border-light)",
              minWidth: 320,
            }}
          >
            {card.stats.map((s, i) => (
              <div key={i}>
                <div style={{ fontSize: "0.7rem", color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  {s.label}
                </div>
                <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: "1.6rem", fontWeight: 700, margin: "2px 0" }}>
                  {s.value}
                </div>
                <div style={{ fontSize: "0.7rem", color: "#1E6B4A", fontWeight: 600 }}>
                  {s.trend}
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

/* ================================================================
   10. Sticky Footer (Parallax Reveal)
   Footer that is revealed from underneath as the main content leaves
   ================================================================ */
export function StickyFooter({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <footer
      className={`sticky-footer-wrap ${className}`}
      style={{
        position: "relative",
        background: "var(--bg-primary)",
        color: "var(--text-primary)",
        zIndex: 1,
        marginTop: "6rem",
      }}
    >
      {children}
    </footer>
  );
}
