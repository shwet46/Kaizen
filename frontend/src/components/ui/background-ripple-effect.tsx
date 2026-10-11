"use client";

import { useState } from "react";

export function BackgroundRippleEffect() {
  const rows = 8;
  const cols = 27;
  const [activeCell, setActiveCell] = useState<{ row: number; col: number } | null>(null);

  const triggerRipple = (row: number, col: number) => {
    setActiveCell({ row, col });
    window.setTimeout(() => setActiveCell(null), 700);
  };

  return (
    <div
      aria-hidden="true"
      className="background-ripple-effect"
    >
      <div className="background-ripple-grid" style={{ "--ripple-cols": cols } as React.CSSProperties}>
        {Array.from({ length: rows * cols }, (_, index) => {
          const row = Math.floor(index / cols);
          const col = index % cols;
          const distance = activeCell
            ? Math.hypot(row - activeCell.row, col - activeCell.col)
            : Number.POSITIVE_INFINITY;

          return (
            <div
              key={`${row}-${col}`}
              className={`background-ripple-cell${distance < 3.5 ? " is-rippling" : ""}`}
              style={{ "--ripple-delay": `${Math.max(0, distance * 45)}ms` } as React.CSSProperties}
              onPointerEnter={() => triggerRipple(row, col)}
              onClick={() => triggerRipple(row, col)}
            />
          );
        })}
      </div>
    </div>
  );
}