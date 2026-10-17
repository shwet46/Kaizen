"use client";

import React, { useState } from "react";
import { Link } from "react-router-dom";
import "../styles/kaizen-pitch.css";
import { LenisProvider } from "@/components/LenisProvider";
import { ScrambleText } from "@/components/FancyComponents";
import { motion } from "framer-motion";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from "recharts";
import {
  LiaCoinsSolid as FaCoins,
  LiaUsersSolid as FaUsers,
  LiaChartLineSolid as FaChartLine,
  LiaCodeBranchSolid as FaCodeBranch,
  LiaCheckSolid as FaCheck,
  LiaServerSolid as FaServer,
  LiaGithub as FaGithub,
  LiaJira as FaJira,
  LiaTachometerAltSolid as FaGaugeHigh,
  LiaHeartbeatSolid as FaHeartPulse,
  LiaBoltSolid as FaBolt,
  LiaDatabaseSolid as FaDatabase,
  LiaSlidersHSolid as FaSliders,
  LiaExclamationTriangleSolid as FaExclamationTriangle,
  LiaTimesSolid as FaTimes,
  LiaArrowRightSolid as FaArrowRight,
  LiaShieldAltSolid as FaShieldAlt,
  LiaRobotSolid as FaRobot,
  LiaSyncSolid as FaSync,
  LiaFileInvoiceDollarSolid as FaInvoice,
  LiaLinkedin as FaLinkedin,
} from "react-icons/lia";

// Reusable viewport reveal animation matching transition physics
function MotionReveal({
  children,
  delay = 0,
  direction = "up",
  width = "auto",
  fullHeight = false,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  direction?: "up" | "down" | "left" | "right";
  width?: string;
  fullHeight?: boolean;
  className?: string;
}) {
  const directions = {
    up: { y: 25, x: 0 },
    down: { y: -25, x: 0 },
    left: { x: 25, y: 0 },
    right: { x: -25, y: 0 },
  };

  return (
    <motion.div
      className={className}
      style={{ width, height: fullHeight ? "100%" : "auto", minWidth: 0, boxSizing: "border-box" }}
      initial={{ opacity: 0, ...directions[direction] }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, margin: "-30px" }}
      transition={{ duration: 0.65, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

// Market Growth Data
const marketData = [
  { year: "2024", market: 28.5, aiAdoption: 14.2 },
  { year: "2025", market: 37.8, aiAdoption: 28.6 },
  { year: "2026", market: 48.2, aiAdoption: 47.9 },
  { year: "2027", market: 62.0, aiAdoption: 68.4 },
  { year: "2028 (Proj)", market: 79.5, aiAdoption: 89.1 },
];

// Software Capitalization Quarterly Data (CapEx vs OpEx)
const financialCapExData = [
  { quarter: "Q1 2025", capex: 620, opex: 380, taxCredits: 124 },
  { quarter: "Q2 2025", capex: 780, opex: 340, taxCredits: 156 },
  { quarter: "Q3 2025", capex: 920, opex: 310, taxCredits: 184 },
  { quarter: "Q4 2025", capex: 1050, opex: 290, taxCredits: 210 },
  { quarter: "Q1 2026 (Est)", capex: 1240, opex: 260, taxCredits: 248 },
];

// Cycle Time Reduction & Monte Carlo Probability
const cycleTimeData = [
  { week: "W1 (Pre-Kaizen)", latencyDays: 5.4, adherence: 46 },
  { week: "W3 (PR Triage)", latencyDays: 4.1, adherence: 61 },
  { week: "W6 (Load Balanced)", latencyDays: 3.2, adherence: 78 },
  { week: "W9 (Full Graph)", latencyDays: 2.4, adherence: 88 },
  { week: "W12 (Continuous)", latencyDays: 2.1, adherence: 96 },
];

export default function PitchPage() {
  const [activeEngineTab, setActiveEngineTab] = useState<number>(0);

  // Interactive ROI Calculator State
  const [calcDevs, setCalcDevs] = useState<number>(120);
  const [calcSalary, setCalcSalary] = useState<number>(150000);

  // ROI Calculator computed metrics
  const annualPayroll = calcDevs * calcSalary;
  // ASC 350-40 eligible software R&D capitalization (~18% of payroll)
  const capExRecovered = Math.round(annualPayroll * 0.18);
  // Engineering hours saved per year (~48 hours/dev/year in unblocked PRs & automated timesheets)
  const hoursSavedPerYear = calcDevs * 48;
  const hoursSavedValue = Math.round(hoursSavedPerYear * (calcSalary / 2000));
  // Regretted senior engineer turnover avoided (1.8% saved, replacement cost ~1.25x salary)
  const seniorReplacementsAvoided = Math.max(1, Math.round(calcDevs * 0.018));
  const turnoverCostAvoided = Math.round(seniorReplacementsAvoided * calcSalary * 1.25);
  // Total economic yield
  const totalAnnualYield = capExRecovered + hoursSavedValue + turnoverCostAvoided;
  // Kaizen cost ($49/dev/month)
  const kaizenAnnualCost = calcDevs * 49 * 12;
  const netRoiRatio = (totalAnnualYield / kaizenAnnualCost).toFixed(1);
  const paybackDays = Math.max(7, Math.round((kaizenAnnualCost / totalAnnualYield) * 365));

  return (
    <LenisProvider>
      <div className="pitch-root">
        {/* Floating Top Navigation Header */}
        <header
          style={{
            position: "fixed",
            top: "16px",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            gap: "12px",
            padding: "8px 18px",
            background: "rgba(255, 255, 255, 0.92)",
            backdropFilter: "blur(16px)",
            borderRadius: "999px",
            border: "1px solid rgba(226, 232, 240, 0.9)",
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
          }}
        >
          <Link
            to="/"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "0.82rem",
              fontWeight: 700,
              color: "#1e293b",
              textDecoration: "none",
            }}
          >
            <FaArrowRight style={{ transform: "rotate(180deg)", fontSize: "0.75rem" }} />
            <span>Kaizen Home</span>
          </Link>
          <span style={{ color: "#cbd5e1" }}>|</span>
          <span style={{ fontSize: "0.75rem", fontFamily: "var(--font-mono)", fontWeight: 700, color: "#64748b" }}>
            EXECUTIVE PITCH DECK
          </span>
          <span style={{ color: "#cbd5e1" }}>|</span>
          <Link
            to="/dashboard"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "4px 14px",
              background: "var(--accent-blue, #4285F4)",
              color: "#ffffff",
              borderRadius: "999px",
              fontSize: "0.78rem",
              fontWeight: 700,
              textDecoration: "none",
            }}
          >
            Launch Dashboard
          </Link>
        </header>

        {/* ================================================================
            SECTION 0: COVER SPLASH HERO (COLORFUL PASTEL MESH BG)
            ================================================================ */}
        <section
          id="cover"
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            padding: "5rem 1.5rem",
            overflow: "hidden",
            background: "radial-gradient(circle at 15% 25%, #DBEAFE 0%, #EFF6FF 35%, #FEF3C7 70%, #DCFCE7 100%)",
            boxSizing: "border-box",
            borderBottom: "var(--pitch-border-medium)",
          }}
        >
          {/* Ambient blurred gradient orbs */}
          <div className="pitch-bg-mesh">
            <div className="pitch-orb-1" />
            <div className="pitch-orb-2" />
          </div>

          <div style={{ maxWidth: "60rem", margin: "0 auto", textAlign: "center", position: "relative", zIndex: 10, boxSizing: "border-box", width: "100%" }}>
            <MotionReveal delay={0.1}>
              <h1
                style={{
                  fontFamily: "var(--font-serif)",
                  fontSize: "clamp(3.75rem, 8.5vw, 6.5rem)",
                  fontWeight: 400,
                  marginBottom: "0.85rem",
                  color: "var(--pitch-text-primary)",
                  letterSpacing: "-0.01em",
                  lineHeight: 1.05,
                }}
              >
                Kaizen.
              </h1>
            </MotionReveal>

            <MotionReveal delay={0.25}>
              <h2
                className="text-gradient"
                style={{
                  fontFamily: "var(--font-serif)",
                  fontStyle: "italic",
                  fontSize: "clamp(1.85rem, 4vw, 2.85rem)",
                  fontWeight: 400,
                  marginBottom: "1.75rem",
                  lineHeight: 1.2,
                }}
              >
                The autonomous engineering capital layer
              </h2>
            </MotionReveal>

            <MotionReveal delay={0.35}>
              <p
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "clamp(1.05rem, 1.8vw, 1.2rem)",
                  color: "var(--pitch-text-secondary)",
                  maxWidth: "46rem",
                  margin: "0 auto 2.5rem",
                  lineHeight: 1.65,
                  fontWeight: 400,
                }}
              >
                Seamlessly transforming Git, Jira, CI/CD, and Cloud telemetry into statistical release forecasting, automated ASC 350-40 software capitalization, and zero-surveillance workforce resilience.
              </p>
            </MotionReveal>

            <MotionReveal delay={0.45}>
              <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
                <a href="#value-prop" className="pitch-btn pitch-btn-primary pitch-btn-lg">
                  Explore Executive Deck <FaArrowRight />
                </a>
                <Link to="/" className="pitch-btn pitch-btn-secondary pitch-btn-lg">
                  Launch Live Workspace
                </Link>
              </div>
            </MotionReveal>
          </div>
        </section>

        {/* ================================================================
            SECTION 1: HERO VALUE PROP & TELEMETRY (SOFT SKY BLUE GRADIENT BG)
            ================================================================ */}
        <section
          id="value-prop"
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            padding: "6rem 1.5rem 5rem",
            overflow: "hidden",
            background: "linear-gradient(180deg, #EFF6FF 0%, #DBEAFE 45%, #E0E7FF 100%)",
            borderBottom: "var(--pitch-border-medium)",
            boxSizing: "border-box",
          }}
        >
          <div className="pitch-bg-mesh">
            <div className="pitch-orb-2" style={{ top: "15%", left: "5%" }} />
            <div className="pitch-orb-1" style={{ bottom: "5%", right: "-5%" }} />
          </div>

          <div className="pitch-container" style={{ position: "relative", zIndex: 10 }}>
            <div className="pitch-hero-grid">
              {/* Left Column: Core Value Proposition */}
              <div style={{ textAlign: "left", minWidth: 0 }}>
                <MotionReveal>
                  <div className="pitch-pill-badge" style={{ marginBottom: "1.25rem" }}>
                    <span
                      style={{
                        width: "8px",
                        height: "8px",
                        backgroundColor: "var(--pitch-green)",
                        display: "inline-block",
                      }}
                    />
                    <span>AUTONOMOUS CAPITAL LAYER · ENTERPRISE AI</span>
                  </div>
                </MotionReveal>

                <MotionReveal delay={0.15}>
                  <h2
                    style={{
                      fontFamily: "var(--font-serif)",
                      fontSize: "clamp(2.25rem, 4.5vw, 3.5rem)",
                      fontWeight: 400,
                      marginBottom: "1rem",
                      color: "var(--pitch-text-primary)",
                      letterSpacing: "-0.01em",
                      lineHeight: 1.15,
                    }}
                  >
                    Turn raw engineering signals into{" "}
                    <span className="text-gradient font-serif italic">boardroom certainty</span>.
                  </h2>
                </MotionReveal>

                {/* Removed TextRotate / Flip text: Clean authoritative statement */}
                <MotionReveal delay={0.25}>
                  <p
                    style={{
                      fontFamily: "var(--font-sans)",
                      fontSize: "1.05rem",
                      color: "var(--pitch-text-secondary)",
                      lineHeight: 1.6,
                      marginBottom: "1.5rem",
                    }}
                  >
                    The enterprise operating layer that transforms Git, Jira, CI/CD, and Cloud telemetry into statistical release forecasting, automated ASC 350-40 software capitalization, zero-surveillance workforce resilience, and boardroom-ready delivery certainty.
                  </p>
                </MotionReveal>

                {/* Active Telemetry Pill (Squared) */}
                <MotionReveal delay={0.35}>
                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.6rem",
                      padding: "0.5rem 1rem",
                      backgroundColor: "#ffffff",
                      border: "1.5px solid var(--pitch-text-primary)",
                      boxShadow: "2px 2px 0px rgba(15, 23, 42, 0.15)",
                      fontSize: "0.8rem",
                      color: "var(--pitch-text-secondary)",
                      marginBottom: "2rem",
                      maxWidth: "100%",
                      flexWrap: "wrap",
                    }}
                  >
                    <span
                      style={{
                        width: "8px",
                        height: "8px",
                        backgroundColor: "var(--pitch-green)",
                        boxShadow: "0 0 6px var(--pitch-green)",
                        flexShrink: 0,
                      }}
                    />
                    <span>Active Telemetry: </span>
                    <strong style={{ color: "var(--pitch-text-primary)", fontFamily: "var(--font-mono)" }}>
                      <ScrambleText text="248 Engineers · 34 Repos · 14.6 Deploys/Day" scrambleSpeed={28} />
                    </strong>
                  </div>
                </MotionReveal>

                {/* 3 Metric Highlight Cards (Squared) */}
                <MotionReveal delay={0.45}>
                  <div className="pitch-grid-3">
                    <div className="pitch-card" style={{ borderLeft: "4px solid var(--pitch-blue)", padding: "1.1rem", backgroundColor: "#ffffff" }}>
                      <span className="pitch-card-metric-label">Delivery Certainty</span>
                      <div className="pitch-card-metric-val" style={{ color: "var(--pitch-blue)" }}>
                        85%+
                      </div>
                      <p style={{ fontSize: "0.78rem", color: "var(--pitch-text-secondary)", lineHeight: 1.45, margin: 0 }}>
                        Monte Carlo probabilistic release date forecasting versus subjective sprint guesswork.
                      </p>
                    </div>

                    <div className="pitch-card" style={{ borderLeft: "4px solid var(--pitch-yellow)", padding: "1.1rem", backgroundColor: "#ffffff" }}>
                      <span className="pitch-card-metric-label">Automated CapEx</span>
                      <div className="pitch-card-metric-val" style={{ color: "#d97706" }}>
                        $1.05M+
                      </div>
                      <p style={{ fontSize: "0.78rem", color: "var(--pitch-text-secondary)", lineHeight: 1.45, margin: 0 }}>
                        Monthly software R&D capital eligible for tax write-offs under ASC 350-40 GAAP with 0 timesheets.
                      </p>
                    </div>

                    <div className="pitch-card" style={{ borderLeft: "4px solid var(--pitch-green)", padding: "1.1rem", backgroundColor: "#ffffff" }}>
                      <span className="pitch-card-metric-label">Retention & Bus</span>
                      <div className="pitch-card-metric-val" style={{ color: "var(--pitch-green)" }}>
                        94.6%
                      </div>
                      <p style={{ fontSize: "0.78rem", color: "var(--pitch-text-secondary)", lineHeight: 1.45, margin: 0 }}>
                        Passive detection of developer burnout and single-point-of-failure bottlenecks.
                      </p>
                    </div>
                  </div>
                </MotionReveal>
              </div>

              {/* Right Column: Simulated Live Telemetry Mockup Card (Squared) */}
              <MotionReveal direction="left" delay={0.3}>
                <div style={{ position: "relative", width: "100%", minWidth: 0, boxSizing: "border-box" }}>
                  {/* Backdrop shadow offset box (Squared) */}
                  <div
                    style={{
                      position: "absolute",
                      top: "0.65rem",
                      left: "0.65rem",
                      right: "-0.65rem",
                      bottom: "-0.65rem",
                      backgroundColor: "#bfdbfe",
                      border: "1.5px solid #60a5fa",
                      zIndex: 0,
                    }}
                  />

                  {/* Main Simulation Window (Squared) */}
                  <div
                    style={{
                      backgroundColor: "#ffffff",
                      border: "2px solid var(--pitch-text-primary)",
                      boxShadow: "var(--pitch-shadow-card)",
                      position: "relative",
                      zIndex: 1,
                      overflow: "hidden",
                      boxSizing: "border-box",
                    }}
                  >
                    {/* Simulated Window Bar */}
                    <div
                      style={{
                        padding: "0.85rem 1.25rem",
                        backgroundColor: "#f1f5f9",
                        borderBottom: "1.5px solid var(--pitch-text-primary)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "0.45rem" }}>
                        <span style={{ width: "9px", height: "9px", backgroundColor: "#ef4444" }} />
                        <span style={{ width: "9px", height: "9px", backgroundColor: "#f59e0b" }} />
                        <span style={{ width: "9px", height: "9px", backgroundColor: "#10b981" }} />
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                        <span
                          style={{
                            width: "6px",
                            height: "6px",
                            backgroundColor: "var(--pitch-blue)",
                          }}
                        />
                        <span
                          style={{
                            fontFamily: "var(--font-mono)",
                            fontSize: "0.72rem",
                            fontWeight: 700,
                            color: "var(--pitch-text-primary)",
                            textTransform: "uppercase",
                          }}
                        >
                          Kaizen Core · Streaming Telemetry
                        </span>
                      </div>
                      <span
                        style={{
                          fontSize: "0.68rem",
                          fontFamily: "var(--font-mono)",
                          backgroundColor: "#dbeafe",
                          color: "#1e40af",
                          padding: "2px 7px",
                          fontWeight: 700,
                          border: "1px solid #93c5fd",
                        }}
                      >
                        LIVE
                      </span>
                    </div>

                    {/* Simulated Event Stream Feed */}
                    <div style={{ padding: "1.25rem", display: "flex", flexDirection: "column", gap: "0.85rem", backgroundColor: "#ffffff" }}>
                      <div
                        style={{
                          padding: "0.85rem 1rem",
                          backgroundColor: "#f0f7ff",
                          border: "1px solid #bfdbfe",
                          display: "flex",
                          alignItems: "flex-start",
                          gap: "0.75rem",
                        }}
                      >
                        <div
                          style={{
                            width: "1.85rem",
                            height: "1.85rem",
                            backgroundColor: "var(--pitch-blue)",
                            color: "white",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                            fontSize: "0.95rem",
                          }}
                        >
                          <FaCodeBranch />
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginBottom: "0.15rem" }}>
                            <strong style={{ fontSize: "0.82rem", color: "#1e3a8a" }}>PR Queue Rebalanced</strong>
                            <span style={{ fontSize: "0.68rem", fontFamily: "var(--font-mono)", color: "#6b7280" }}>Just now</span>
                          </div>
                          <p style={{ fontSize: "0.78rem", color: "#374151", margin: 0, lineHeight: 1.4 }}>
                            PR #418 latency reduced from 4.2d → Reassigned to Squad B. Capacity won: +35%.
                          </p>
                        </div>
                      </div>

                      <div
                        style={{
                          padding: "0.85rem 1rem",
                          backgroundColor: "#fefce8",
                          border: "1px solid #fef08a",
                          display: "flex",
                          alignItems: "flex-start",
                          gap: "0.75rem",
                        }}
                      >
                        <div
                          style={{
                            width: "1.85rem",
                            height: "1.85rem",
                            backgroundColor: "#d97706",
                            color: "white",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                            fontSize: "0.95rem",
                          }}
                        >
                          <FaCoins />
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginBottom: "0.15rem" }}>
                            <strong style={{ fontSize: "0.82rem", color: "#854d0e" }}>ASC 350-40 GAAP Journal Voucher</strong>
                            <span style={{ fontSize: "0.68rem", fontFamily: "var(--font-mono)", color: "#6b7280" }}>2m ago</span>
                          </div>
                          <p style={{ fontSize: "0.78rem", color: "#374151", margin: 0, lineHeight: 1.4 }}>
                            Commit SHA 9f2a71d mapped to R&D Software Asset ($14.2k CapEx) with 0 manual timesheets.
                          </p>
                        </div>
                      </div>

                      <div
                        style={{
                          padding: "0.85rem 1rem",
                          backgroundColor: "#f0fdf4",
                          border: "1px solid #bbf7d0",
                          display: "flex",
                          alignItems: "flex-start",
                          gap: "0.75rem",
                        }}
                      >
                        <div
                          style={{
                            width: "1.85rem",
                            height: "1.85rem",
                            backgroundColor: "var(--pitch-green)",
                            color: "white",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                            fontSize: "0.95rem",
                          }}
                        >
                          <FaChartLine />
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginBottom: "0.15rem" }}>
                            <strong style={{ fontSize: "0.82rem", color: "#166534" }}>Monte Carlo Forecast Confirmed</strong>
                            <span style={{ fontSize: "0.68rem", fontFamily: "var(--font-mono)", color: "#6b7280" }}>8m ago</span>
                          </div>
                          <p style={{ fontSize: "0.78rem", color: "#374151", margin: 0, lineHeight: 1.4 }}>
                            Sprint delivery adherence calibrated to 88% (+12% MoM) across 34 active repositories.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Metrics Strip */}
                    <div
                      style={{
                        padding: "0.75rem 1.25rem",
                        backgroundColor: "#f8fafc",
                        borderTop: "1.5px solid var(--pitch-text-primary)",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        fontSize: "0.75rem",
                        flexWrap: "wrap",
                        gap: "0.5rem",
                      }}
                    >
                      <span style={{ color: "var(--pitch-text-secondary)" }}>Cycle Time: <strong style={{ color: "var(--pitch-text-primary)" }}>2.1d (↓ 61%)</strong></span>
                      <span style={{ color: "var(--pitch-text-secondary)" }}>Quarterly CapEx: <strong style={{ color: "var(--pitch-text-primary)" }}>$1.24M</strong></span>
                      <span style={{ color: "var(--pitch-text-secondary)" }}>DORA: <strong style={{ color: "var(--pitch-green)" }}>Elite Tier</strong></span>
                    </div>
                  </div>
                </div>
              </MotionReveal>
            </div>
          </div>
        </section>

        {/* ================================================================
            SECTION 2: THE PROBLEM (WARM ROSE/PEACH TINTED BG)
            ================================================================ */}
        <section
          id="problem"
          style={{
            padding: "6rem 1.5rem",
            background: "linear-gradient(180deg, #FEF2F2 0%, #FEE2E2 50%, #FFF1F2 100%)",
            position: "relative",
            borderBottom: "var(--pitch-border-medium)",
            boxSizing: "border-box",
          }}
        >
          <div className="pitch-container">
            <MotionReveal>
              <div className="pitch-section-header">
                <span className="pitch-section-eyebrow" style={{ color: "var(--pitch-red)" }}>
                  01 · THE ENTERPRISE PROBLEM
                </span>
                <h2 className="pitch-section-title">
                  Engineering is the largest, most expensive black box in the modern enterprise.
                </h2>
                <p className="pitch-section-subtitle">
                  C-suite executives and VP Engineering leaders fly blind at 100mph. Millions in R&D payroll bleed into delayed releases, uncaptured tax credits, and quiet engineer burnout.
                </p>
              </div>
            </MotionReveal>

            <div className="pitch-grid-2" style={{ alignItems: "center" }}>
              {/* Left Column: Squared Offset Elevated Stat Card */}
              <MotionReveal direction="right" delay={0.15}>
                <div className="pitch-offset-wrapper">
                  <div className="pitch-offset-backdrop" />
                  <div className="pitch-offset-foreground">
                    <div style={{ display: "flex", alignItems: "center", gap: "0.85rem", marginBottom: "1.75rem" }}>
                      <div
                        style={{
                          width: "2.75rem",
                          height: "2.75rem",
                          backgroundColor: "#fee2e2",
                          border: "1.5px solid #ef4444",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "var(--pitch-red)",
                          fontSize: "1.35rem",
                          flexShrink: 0,
                        }}
                      >
                        <FaExclamationTriangle />
                      </div>
                      <div>
                        <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "1.4rem", fontWeight: 400, color: "var(--pitch-text-primary)", margin: 0 }}>
                          Bleeding Capital
                        </h3>
                        <p style={{ fontFamily: "var(--font-sans)", color: "var(--pitch-text-secondary)", margin: 0, fontSize: "0.85rem" }}>
                          The cost of subjective tracking
                        </p>
                      </div>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "1.35rem" }}>
                      <div style={{ borderLeft: "4px solid var(--pitch-red)", paddingLeft: "1rem" }}>
                        <div style={{ fontFamily: "var(--font-sans)", fontSize: "2.25rem", fontWeight: 700, color: "var(--pitch-red)", lineHeight: 1 }}>
                          42%
                        </div>
                        <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.85rem", color: "var(--pitch-text-secondary)", margin: "0.25rem 0 0" }}>
                          Sprint spillover rate — majority of engineering roadmaps miss committed quarterly deadlines.
                        </p>
                      </div>

                      <div style={{ borderLeft: "4px solid #d97706", paddingLeft: "1rem" }}>
                        <div style={{ fontFamily: "var(--font-sans)", fontSize: "2.25rem", fontWeight: 700, color: "#d97706", lineHeight: 1 }}>
                          $2.4M
                        </div>
                        <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.85rem", color: "var(--pitch-text-secondary)", margin: "0.25rem 0 0" }}>
                          Annual lost CapEx yield per 100 devs in missed IRS Sec 41 and GAAP software capitalization.
                        </p>
                      </div>

                      <div style={{ borderLeft: "4px solid var(--pitch-purple)", paddingLeft: "1rem" }}>
                        <div style={{ fontFamily: "var(--font-sans)", fontSize: "2.25rem", fontWeight: 700, color: "var(--pitch-purple)", lineHeight: 1 }}>
                          18.4%
                        </div>
                        <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.85rem", color: "var(--pitch-text-secondary)", margin: "0.25rem 0 0" }}>
                          Silent attrition rate — senior engineers burning out undetected from review queue stalls.
                        </p>
                      </div>

                      <div style={{ borderLeft: "4px solid var(--pitch-blue)", paddingLeft: "1rem" }}>
                        <div style={{ fontFamily: "var(--font-sans)", fontSize: "2.25rem", fontWeight: 700, color: "var(--pitch-blue)", lineHeight: 1 }}>
                          3.4 Days
                        </div>
                        <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.85rem", color: "var(--pitch-text-secondary)", margin: "0.25rem 0 0" }}>
                          Average pull request sits idle before first meaningful review, dragging cycle time by 35%.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </MotionReveal>

              {/* Right Column: Traditional Guesswork vs Kaizen Autonomous Layer */}
              <MotionReveal direction="left" delay={0.25}>
                <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                  <div className="pitch-card" style={{ backgroundColor: "#fff5f5", borderColor: "#f87171" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.6rem" }}>
                      <span style={{ color: "var(--pitch-red)", fontSize: "1.1rem" }}><FaTimes /></span>
                      <h4 style={{ fontFamily: "var(--font-sans)", fontSize: "1.05rem", fontWeight: 700, color: "#991b1b", margin: 0 }}>
                        Traditional Status Quo: Flying Blind
                      </h4>
                    </div>
                    <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.45rem", fontSize: "0.82rem", color: "#7f1d1d" }}>
                      <li style={{ display: "flex", gap: "0.45rem" }}>• Subjective story point fibonacci poker guesses with 40% error variance</li>
                      <li style={{ display: "flex", gap: "0.45rem" }}>• Engineers forced to submit manual timesheets nobody in finance trusts</li>
                      <li style={{ display: "flex", gap: "0.45rem" }}>• Developer burnout noticed only after two-week resignation notice is submitted</li>
                      <li style={{ display: "flex", gap: "0.45rem" }}>• Squad review queues completely unbalanced without cross-repo visibility</li>
                    </ul>
                  </div>

                  <div className="pitch-card" style={{ backgroundColor: "#f0fdf4", borderColor: "#4ade80", borderLeft: "5px solid var(--pitch-green)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.6rem" }}>
                      <span style={{ color: "var(--pitch-green)", fontSize: "1.1rem" }}><FaCheck /></span>
                      <h4 style={{ fontFamily: "var(--font-sans)", fontSize: "1.05rem", fontWeight: 700, color: "#166534", margin: 0 }}>
                        With Kaizen Autonomous Layer
                      </h4>
                    </div>
                    <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.45rem", fontSize: "0.82rem", color: "#14532d" }}>
                      <li style={{ display: "flex", gap: "0.45rem" }}>• Monte Carlo probabilistic release confidence updated every code commit</li>
                      <li style={{ display: "flex", gap: "0.45rem" }}>• 100% automated SHA commit & epic mapping directly to GAAP CapEx vouchers</li>
                      <li style={{ display: "flex", gap: "0.45rem" }}>• Non-invasive early detection of after-hours work spikes and bus factor 1 silos</li>
                      <li style={{ display: "flex", gap: "0.45rem" }}>• Closed-loop smart allocation rebalances reviewers across squads automatically</li>
                    </ul>
                  </div>
                </div>
              </MotionReveal>
            </div>
          </div>
        </section>

        {/* ================================================================
            SECTION 3: FAMILIAR PAIN POINTS & MATRIX (SLATE LAVENDER BG)
            ================================================================ */}
        <section
          id="pain-points"
          style={{
            padding: "6rem 1.5rem",
            background: "linear-gradient(180deg, #F1F5F9 0%, #E2E8F0 50%, #F8FAFC 100%)",
            borderBottom: "var(--pitch-border-medium)",
            boxSizing: "border-box",
          }}
        >
          <div className="pitch-container">
            <MotionReveal>
              <div className="pitch-section-header">
                <span className="pitch-section-eyebrow" style={{ color: "var(--pitch-text-secondary)" }}>
                  FAMILIAR PAIN POINTS
                </span>
                <h2 className="pitch-section-title">
                  Every engineering leader faces the same bottlenecks
                </h2>
                <p className="pitch-section-subtitle">
                  When every task is manual, errors compound — costing time, money, and developer trust.
                </p>
              </div>
            </MotionReveal>

            {/* 4 Fatal Breakdowns Grid (Squared) */}
            <div className="pitch-grid-2" style={{ marginBottom: "3rem" }}>
              <MotionReveal delay={0.1}>
                <div className="pitch-card" style={{ display: "flex", gap: "1rem", height: "100%", backgroundColor: "#ffffff" }}>
                  <div
                    style={{
                      width: "2.75rem",
                      height: "2.75rem",
                      backgroundColor: "var(--pitch-blue-surface)",
                      color: "var(--pitch-blue)",
                      border: "1.5px solid var(--pitch-blue)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "1.3rem",
                      flexShrink: 0,
                    }}
                  >
                    <FaCodeBranch />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <h3 style={{ fontFamily: "var(--font-sans)", fontWeight: 700, fontSize: "1.05rem", color: "var(--pitch-text-primary)", marginBottom: "0.3rem" }}>
                      01. PR Stagnation & Stalled Queues
                    </h3>
                    <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.82rem", color: "var(--pitch-text-secondary)", lineHeight: 1.55, margin: 0 }}>
                      Code sits blocked in queues without cross-squad load balancing. Squad A is overloaded with 45 PRs while Squad B has excess review bandwidth, dragging cycle time by 35%.
                    </p>
                  </div>
                </div>
              </MotionReveal>

              <MotionReveal delay={0.2}>
                <div className="pitch-card" style={{ display: "flex", gap: "1rem", height: "100%", backgroundColor: "#ffffff" }}>
                  <div
                    style={{
                      width: "2.75rem",
                      height: "2.75rem",
                      backgroundColor: "var(--pitch-yellow-surface)",
                      color: "#d97706",
                      border: "1.5px solid #d97706",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "1.3rem",
                      flexShrink: 0,
                    }}
                  >
                    <FaCoins />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <h3 style={{ fontFamily: "var(--font-sans)", fontWeight: 700, fontSize: "1.05rem", color: "var(--pitch-text-primary)", marginBottom: "0.3rem" }}>
                      02. Manual ASC 350-40 CapEx Hell
                    </h3>
                    <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.82rem", color: "var(--pitch-text-secondary)", lineHeight: 1.55, margin: 0 }}>
                      Finance forces engineers to fill subjective weekly timesheets. R&D capital is miscategorized, forfeiting enterprise tax credits and cloud unit cost attribution.
                    </p>
                  </div>
                </div>
              </MotionReveal>

              <MotionReveal delay={0.3}>
                <div className="pitch-card" style={{ display: "flex", gap: "1rem", height: "100%", backgroundColor: "#ffffff" }}>
                  <div
                    style={{
                      width: "2.75rem",
                      height: "2.75rem",
                      backgroundColor: "var(--pitch-purple-surface)",
                      color: "var(--pitch-purple)",
                      border: "1.5px solid var(--pitch-purple)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "1.3rem",
                      flexShrink: 0,
                    }}
                  >
                    <FaUsers />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <h3 style={{ fontFamily: "var(--font-sans)", fontWeight: 700, fontSize: "1.05rem", color: "var(--pitch-text-primary)", marginBottom: "0.3rem" }}>
                      03. Silent Burnout & Knowledge Silos
                    </h3>
                    <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.82rem", color: "var(--pitch-text-secondary)", lineHeight: 1.55, margin: 0 }}>
                      Critical microservices rely on a single engineer who handles 80% of reviews (bus factor of 1). When they leave, core product delivery grinds to an absolute halt.
                    </p>
                  </div>
                </div>
              </MotionReveal>

              <MotionReveal delay={0.4}>
                <div className="pitch-card" style={{ display: "flex", gap: "1rem", height: "100%", backgroundColor: "#ffffff" }}>
                  <div
                    style={{
                      width: "2.75rem",
                      height: "2.75rem",
                      backgroundColor: "var(--pitch-green-surface)",
                      color: "var(--pitch-green)",
                      border: "1.5px solid var(--pitch-green)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "1.3rem",
                      flexShrink: 0,
                    }}
                  >
                    <FaChartLine />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <h3 style={{ fontFamily: "var(--font-sans)", fontWeight: 700, fontSize: "1.05rem", color: "var(--pitch-text-primary)", marginBottom: "0.3rem" }}>
                      04. Subjective Sprint Point Fiction
                    </h3>
                    <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.82rem", color: "var(--pitch-text-secondary)", lineHeight: 1.55, margin: 0 }}>
                      Story points are arbitrary guesses. Traditional tooling cannot calculate probabilistic completion distributions across code churn complexity or dependency graphs.
                    </p>
                  </div>
                </div>
              </MotionReveal>
            </div>

            {/* Before vs With Kaizen Comparison Matrix Table (Squared) */}
            <MotionReveal delay={0.45}>
              <div className="pitch-matrix-wrap">
                <table className="pitch-matrix">
                  <thead>
                    <tr>
                      <th style={{ width: "26%" }}>Operational Dimension</th>
                      <th style={{ width: "37%", color: "var(--pitch-red)" }}>Traditional Status Quo</th>
                      <th style={{ width: "37%", color: "var(--pitch-green)" }}>With Kaizen Autonomous Layer</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={{ fontWeight: 600, color: "var(--pitch-text-primary)", backgroundColor: "#ffffff" }}>Sprint Delivery Forecasting</td>
                      <td style={{ color: "#991b1b", backgroundColor: "#fff5f5" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.45rem" }}>
                          <FaTimes style={{ color: "#ef4444", flexShrink: 0 }} /> Story point guessing; delays discovered during retrospectives
                        </div>
                      </td>
                      <td style={{ color: "#14532d", backgroundColor: "#f0fdf4", fontWeight: 600 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.45rem" }}>
                          <FaCheck style={{ color: "#16a34a", flexShrink: 0 }} /> Monte Carlo statistical confidence intervals updated every commit
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td style={{ fontWeight: 600, color: "var(--pitch-text-primary)", backgroundColor: "#ffffff" }}>Software CapEx (ASC 350-40)</td>
                      <td style={{ color: "#991b1b", backgroundColor: "#fff5f5" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.45rem" }}>
                          <FaTimes style={{ color: "#ef4444", flexShrink: 0 }} /> Engineers forced to log weekly timesheets nobody believes
                        </div>
                      </td>
                      <td style={{ color: "#14532d", backgroundColor: "#f0fdf4", fontWeight: 600 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.45rem" }}>
                          <FaCheck style={{ color: "#16a34a", flexShrink: 0 }} /> 100% automated SHA commit & epic mapping directly to GAAP vouchers
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td style={{ fontWeight: 600, color: "var(--pitch-text-primary)", backgroundColor: "#ffffff" }}>Talent Retention & Burnout</td>
                      <td style={{ color: "#991b1b", backgroundColor: "#fff5f5" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.45rem" }}>
                          <FaTimes style={{ color: "#ef4444", flexShrink: 0 }} /> Discovered when senior developer submits their 2-week notice
                        </div>
                      </td>
                      <td style={{ color: "#14532d", backgroundColor: "#f0fdf4", fontWeight: 600 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.45rem" }}>
                          <FaCheck style={{ color: "#16a34a", flexShrink: 0 }} /> Passive detection of after-hours review spikes without surveillance
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td style={{ fontWeight: 600, color: "var(--pitch-text-primary)", backgroundColor: "#ffffff" }}>PR Review Balancing</td>
                      <td style={{ color: "#991b1b", backgroundColor: "#fff5f5" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.45rem" }}>
                          <FaTimes style={{ color: "#ef4444", flexShrink: 0 }} /> Squad A overloaded with 40 PRs while Squad B has excess capacity
                        </div>
                      </td>
                      <td style={{ color: "#14532d", backgroundColor: "#f0fdf4", fontWeight: 600 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.45rem" }}>
                          <FaCheck style={{ color: "#16a34a", flexShrink: 0 }} /> Closed-loop smart allocation rebalances reviewers across squads
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </MotionReveal>
          </div>
        </section>

        {/* ================================================================
            SECTION 4: MARKET SIZE & TAM (EMERALD MINT GRADIENT BG)
            ================================================================ */}
        <section
          id="market"
          style={{
            padding: "6rem 1.5rem",
            background: "linear-gradient(180deg, #F0FDF4 0%, #DCFCE7 50%, #F0FDF4 100%)",
            borderBottom: "var(--pitch-border-medium)",
            boxSizing: "border-box",
          }}
        >
          <div className="pitch-container">
            <MotionReveal>
              <div className="pitch-section-header">
                <span className="pitch-section-eyebrow" style={{ color: "var(--pitch-green)" }}>
                  02 · MARKET OPPORTUNITY
                </span>
                <h2 className="pitch-section-title">
                  A massive <span className="text-gradient-green font-serif italic">$62B</span> convergence of Value Stream, FinOps, and AI Ops.
                </h2>
                <p className="pitch-section-subtitle">
                  As AI assistants accelerate code generation, engineering leadership urgently needs an automated capital & delivery intelligence layer.
                </p>
              </div>
            </MotionReveal>

            <div className="pitch-grid-2" style={{ alignItems: "center" }}>
              {/* Left Column: 3 Tiered Bento Cards (Squared) */}
              <MotionReveal direction="right" delay={0.15}>
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  <div className="pitch-card" style={{ backgroundColor: "#ffffff" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.4rem" }}>
                      <span className="pitch-card-metric-label" style={{ margin: 0, color: "var(--pitch-blue)" }}>
                        TAM · Total Addressable
                      </span>
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.72rem", backgroundColor: "var(--pitch-blue-surface)", color: "#1d4ed8", padding: "2px 7px", fontWeight: 700, border: "1px solid #93c5fd" }}>
                        30M+ Developers
                      </span>
                    </div>
                    <div style={{ fontFamily: "var(--font-sans)", fontSize: "1.85rem", fontWeight: 700, color: "var(--pitch-text-primary)", marginBottom: "0.2rem" }}>
                      $62 Billion
                    </div>
                    <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.82rem", color: "var(--pitch-text-secondary)", lineHeight: 1.5, margin: 0 }}>
                      Global DevSecOps, Value Stream Management (VSM), and Engineering Capital Governance across 280k software enterprises.
                    </p>
                  </div>

                  <div className="pitch-card" style={{ backgroundColor: "#ffffff" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.4rem" }}>
                      <span className="pitch-card-metric-label" style={{ margin: 0, color: "#d97706" }}>
                        SAM · Serviceable Addressable
                      </span>
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.72rem", backgroundColor: "var(--pitch-yellow-surface)", color: "#b45309", padding: "2px 7px", fontWeight: 700, border: "1px solid #fde68a" }}>
                        50–5,000+ Eng Orgs
                      </span>
                    </div>
                    <div style={{ fontFamily: "var(--font-sans)", fontSize: "1.85rem", fontWeight: 700, color: "var(--pitch-text-primary)", marginBottom: "0.2rem" }}>
                      $18 Billion
                    </div>
                    <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.82rem", color: "var(--pitch-text-secondary)", lineHeight: 1.5, margin: 0 }}>
                      Mid-to-large software enterprises running GitHub/GitLab + Jira with strict board governance, SOX, and GAAP CapEx requirements.
                    </p>
                  </div>

                  <div className="pitch-card" style={{ backgroundColor: "#ffffff" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.4rem" }}>
                      <span className="pitch-card-metric-label" style={{ margin: 0, color: "var(--pitch-green)" }}>
                        SOM · Serviceable Obtainable
                      </span>
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.72rem", backgroundColor: "var(--pitch-green-surface)", color: "#15803d", padding: "2px 7px", fontWeight: 700, border: "1px solid #86efac" }}>
                        Immediate Wedge
                      </span>
                    </div>
                    <div style={{ fontFamily: "var(--font-sans)", fontSize: "1.85rem", fontWeight: 700, color: "var(--pitch-text-primary)", marginBottom: "0.2rem" }}>
                      $3.8 Billion
                    </div>
                    <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.82rem", color: "var(--pitch-text-secondary)", lineHeight: 1.5, margin: 0 }}>
                      AI-forward tech enterprises and scale-ups seeking immediate ASC 350-40 tax recovery, Copilot ROI attribution, and DORA velocity.
                    </p>
                  </div>
                </div>
              </MotionReveal>

              {/* Right Column: Recharts Market Growth Bar Chart Card (Squared) */}
              <MotionReveal direction="left" delay={0.25}>
                <div className="pitch-card" style={{ padding: "1.75rem", width: "100%", minWidth: 0, overflow: "hidden", backgroundColor: "#ffffff" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem", flexWrap: "wrap", gap: "0.5rem" }}>
                    <div>
                      <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.82rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--pitch-text-primary)", display: "block" }}>
                        Market Expansion & Telemetry ($B)
                      </span>
                      <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.78rem", color: "var(--pitch-text-secondary)" }}>
                        Global Value Stream & FinOps Adoption
                      </span>
                    </div>
                    <span
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "0.72rem",
                        color: "var(--pitch-green)",
                        fontWeight: 700,
                        backgroundColor: "var(--pitch-green-surface)",
                        padding: "0.3rem 0.75rem",
                        border: "1px solid #86efac",
                      }}
                    >
                      28.4% 5-Yr CAGR
                    </span>
                  </div>

                  <div style={{ width: "100%", height: 250, minWidth: 0 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={marketData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis dataKey="year" tick={{ fontSize: 11, fontFamily: "var(--font-mono)" }} stroke="#64748b" />
                        <YAxis tick={{ fontSize: 11, fontFamily: "var(--font-mono)" }} stroke="#64748b" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#0f172a",
                            borderRadius: "0px",
                            border: "1px solid #334155",
                            color: "#fff",
                            fontSize: "12px",
                            boxShadow: "3px 3px 0px rgba(0,0,0,0.3)",
                          }}
                        />
                        <Bar dataKey="market" name="Market Size ($B)" fill="var(--pitch-blue)" radius={[0, 0, 0, 0]}>
                          {marketData.map((_, i) => (
                            <Cell key={`cell-${i}`} fill={i === 2 ? "var(--pitch-green)" : "var(--pitch-blue)"} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </MotionReveal>
            </div>
          </div>
        </section>

        {/* ================================================================
            SECTION 5: THE SOLUTION (MIDNIGHT OBSIDIAN & BLUE GRADIENT BG)
            ================================================================ */}
        <section
          id="solution"
          style={{
            padding: "6rem 1.5rem",
            background: "linear-gradient(135deg, #090D16 0%, #0F172A 50%, #1E293B 100%)",
            color: "white",
            position: "relative",
            overflow: "hidden",
            boxSizing: "border-box",
            borderBottom: "var(--pitch-border-strong)",
          }}
        >
          {/* Subtle radial corner glow */}
          <div
            style={{
              position: "absolute",
              top: "-100px",
              right: "-100px",
              width: "450px",
              height: "450px",
              background: "radial-gradient(circle, rgba(37, 99, 235, 0.3) 0%, transparent 70%)",
              pointerEvents: "none",
            }}
          />

          <div className="pitch-container" style={{ position: "relative", zIndex: 1 }}>
            <MotionReveal>
              <div className="pitch-section-header">
                <span className="pitch-section-eyebrow" style={{ color: "#93c5fd" }}>
                  03 · THE KAIZEN SOLUTION
                </span>
                <h2 className="pitch-section-title" style={{ color: "white" }}>
                  Four autonomous engines. One unified operating plane.
                </h2>
                <p className="pitch-section-subtitle" style={{ color: "rgba(255, 255, 255, 0.75)" }}>
                  Kaizen turns raw technical telemetry from Git, Jira, CI/CD, and cloud infrastructure into precision metrics for every leadership stakeholder.
                </p>
              </div>
            </MotionReveal>

            {/* Interactive Engine Tabs Selector (Squared) */}
            <MotionReveal delay={0.2}>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.6rem", justifyContent: "center", marginBottom: "2.25rem" }}>
                {[
                  { label: "1. Delivery Health & Monte Carlo", icon: <FaHeartPulse /> },
                  { label: "2. Automated FinOps & CapEx", icon: <FaCoins /> },
                  { label: "3. Workforce & Bus Factor", icon: <FaUsers /> },
                  { label: "4. DORA & AI Assistant ROI", icon: <FaGaugeHigh /> },
                ].map((tab, idx) => (
                  <button
                    key={idx}
                    className={`pitch-tab-pill ${activeEngineTab === idx ? "active" : ""}`}
                    onClick={() => setActiveEngineTab(idx)}
                  >
                    {tab.icon}
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>
            </MotionReveal>

            {/* Active Tab Showcase Card (Squared) */}
            <MotionReveal delay={0.3}>
              <div
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.06)",
                  border: "1.5px solid rgba(255, 255, 255, 0.18)",
                  backdropFilter: "blur(20px)",
                  padding: "clamp(1.5rem, 3.5vw, 2.5rem)",
                  boxShadow: "4px 4px 0px rgba(0, 0, 0, 0.5)",
                  boxSizing: "border-box",
                  minWidth: 0,
                  overflow: "hidden",
                }}
              >
                {activeEngineTab === 0 && (
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.85rem", marginBottom: "0.85rem" }}>
                      <span
                        style={{
                          width: "2.75rem",
                          height: "2.75rem",
                          backgroundColor: "rgba(37, 99, 235, 0.25)",
                          color: "#93c5fd",
                          border: "1px solid #3b82f6",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "1.35rem",
                          flexShrink: 0,
                        }}
                      >
                        <FaHeartPulse />
                      </span>
                      <div style={{ minWidth: 0 }}>
                        <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "1.35rem", fontWeight: 400, color: "white", margin: 0 }}>
                          Predictive Release Forecasting & Monte Carlo Simulation
                        </h3>
                        <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "rgba(255, 255, 255, 0.6)", margin: 0 }}>
                          Probabilistic delivery confidence over Git PR queues & issue dependency graphs
                        </p>
                      </div>
                    </div>
                    <p style={{ fontSize: "0.95rem", color: "rgba(255, 255, 255, 0.85)", lineHeight: 1.6, margin: "1.25rem 0", maxWidth: "52rem" }}>
                      Replaces static release dates with statistical probability distributions. Detects PR latency stagnation 4 days before sprint reviews notice, auto-recommending reviewer reassignment.
                    </p>
                    <div className="pitch-grid-3" style={{ paddingTop: "1.25rem", borderTop: "1px solid rgba(255, 255, 255, 0.15)" }}>
                      <div style={{ padding: "1.1rem", backgroundColor: "rgba(255, 255, 255, 0.05)", border: "1px solid rgba(255, 255, 255, 0.12)" }}>
                        <div style={{ fontSize: "0.72rem", color: "rgba(255, 255, 255, 0.6)", textTransform: "uppercase", fontFamily: "var(--font-mono)" }}>
                          Cycle Time Reduction
                        </div>
                        <div style={{ fontSize: "1.6rem", fontWeight: 700, color: "#93c5fd", fontFamily: "var(--font-sans)", marginTop: "0.2rem" }}>
                          ↓ 18.2% MoM
                        </div>
                        <p style={{ fontSize: "0.72rem", color: "rgba(255, 255, 255, 0.6)", margin: "0.2rem 0 0" }}>
                          Shaved 1.2 days off average PR review cycle
                        </p>
                      </div>
                      <div style={{ padding: "1.1rem", backgroundColor: "rgba(255, 255, 255, 0.05)", border: "1px solid rgba(255, 255, 255, 0.12)" }}>
                        <div style={{ fontSize: "0.72rem", color: "rgba(255, 255, 255, 0.6)", textTransform: "uppercase", fontFamily: "var(--font-mono)" }}>
                          Forecast Confidence
                        </div>
                        <div style={{ fontSize: "1.6rem", fontWeight: 700, color: "#86efac", fontFamily: "var(--font-sans)", marginTop: "0.2rem" }}>
                          85.4%
                        </div>
                        <p style={{ fontSize: "0.72rem", color: "rgba(255, 255, 255, 0.6)", margin: "0.2rem 0 0" }}>
                          Probabilistic adherence to quarterly release targets
                        </p>
                      </div>
                      <div style={{ padding: "1.1rem", backgroundColor: "rgba(255, 255, 255, 0.05)", border: "1px solid rgba(255, 255, 255, 0.12)" }}>
                        <div style={{ fontSize: "0.72rem", color: "rgba(255, 255, 255, 0.6)", textTransform: "uppercase", fontFamily: "var(--font-mono)" }}>
                          Early Warning Lead
                        </div>
                        <div style={{ fontSize: "1.6rem", fontWeight: 700, color: "#d8b4fe", fontFamily: "var(--font-sans)", marginTop: "0.2rem" }}>
                          4 Days Ahead
                        </div>
                        <p style={{ fontSize: "0.72rem", color: "rgba(255, 255, 255, 0.6)", margin: "0.2rem 0 0" }}>
                          Bottlenecks flagged before retrospectives occur
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {activeEngineTab === 1 && (
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.85rem", marginBottom: "0.85rem" }}>
                      <span
                        style={{
                          width: "2.75rem",
                          height: "2.75rem",
                          backgroundColor: "rgba(217, 119, 6, 0.25)",
                          color: "#fde047",
                          border: "1px solid #d97706",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "1.35rem",
                          flexShrink: 0,
                        }}
                      >
                        <FaCoins />
                      </span>
                      <div style={{ minWidth: 0 }}>
                        <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "1.35rem", fontWeight: 400, color: "white", margin: 0 }}>
                          Automated Software Capitalization (ASC 350-40 GAAP)
                        </h3>
                        <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "rgba(255, 255, 255, 0.6)", margin: 0 }}>
                          Algorithmic commit SHA mapping directly to GAAP CapEx schedules
                        </p>
                      </div>
                    </div>
                    <p style={{ fontSize: "0.95rem", color: "rgba(255, 255, 255, 0.85)", lineHeight: 1.6, margin: "1.25rem 0", maxWidth: "52rem" }}>
                      Zero manual timesheets. Kaizen traces Git commit messages, Jira epics, and pull requests directly into capitalized R&D vs maintenance operating expenses, producing audit-ready schedules for Big 4 accounting firms.
                    </p>
                    <div className="pitch-grid-3" style={{ paddingTop: "1.25rem", borderTop: "1px solid rgba(255, 255, 255, 0.15)" }}>
                      <div style={{ padding: "1.1rem", backgroundColor: "rgba(255, 255, 255, 0.05)", border: "1px solid rgba(255, 255, 255, 0.12)" }}>
                        <div style={{ fontSize: "0.72rem", color: "rgba(255, 255, 255, 0.6)", textTransform: "uppercase", fontFamily: "var(--font-mono)" }}>
                          CapEx Mapped
                        </div>
                        <div style={{ fontSize: "1.6rem", fontWeight: 700, color: "#fde047", fontFamily: "var(--font-sans)", marginTop: "0.2rem" }}>
                          $1.05M / mo
                        </div>
                        <p style={{ fontSize: "0.72rem", color: "rgba(255, 255, 255, 0.6)", margin: "0.2rem 0 0" }}>
                          Eligible R&D software payroll identified
                        </p>
                      </div>
                      <div style={{ padding: "1.1rem", backgroundColor: "rgba(255, 255, 255, 0.05)", border: "1px solid rgba(255, 255, 255, 0.12)" }}>
                        <div style={{ fontSize: "0.72rem", color: "rgba(255, 255, 255, 0.6)", textTransform: "uppercase", fontFamily: "var(--font-mono)" }}>
                          IRS Sec 41 Credit
                        </div>
                        <div style={{ fontSize: "1.6rem", fontWeight: 700, color: "#86efac", fontFamily: "var(--font-sans)", marginTop: "0.2rem" }}>
                          $412k Found
                        </div>
                        <p style={{ fontSize: "0.72rem", color: "rgba(255, 255, 255, 0.6)", margin: "0.2rem 0 0" }}>
                          Direct enterprise tax credit recovery
                        </p>
                      </div>
                      <div style={{ padding: "1.1rem", backgroundColor: "rgba(255, 255, 255, 0.05)", border: "1px solid rgba(255, 255, 255, 0.12)" }}>
                        <div style={{ fontSize: "0.72rem", color: "rgba(255, 255, 255, 0.6)", textTransform: "uppercase", fontFamily: "var(--font-mono)" }}>
                          Timesheet Overhead
                        </div>
                        <div style={{ fontSize: "1.6rem", fontWeight: 700, color: "#93c5fd", fontFamily: "var(--font-sans)", marginTop: "0.2rem" }}>
                          0 Hours / Month
                        </div>
                        <p style={{ fontSize: "0.72rem", color: "rgba(255, 255, 255, 0.6)", margin: "0.2rem 0 0" }}>
                          100% automated metadata extraction
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {activeEngineTab === 2 && (
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.85rem", marginBottom: "0.85rem" }}>
                      <span
                        style={{
                          width: "2.75rem",
                          height: "2.75rem",
                          backgroundColor: "rgba(124, 58, 237, 0.25)",
                          color: "#d8b4fe",
                          border: "1px solid #7c3aed",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "1.35rem",
                          flexShrink: 0,
                        }}
                      >
                        <FaUsers />
                      </span>
                      <div style={{ minWidth: 0 }}>
                        <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "1.35rem", fontWeight: 400, color: "white", margin: 0 }}>
                          Passive Burnout & Bus Factor Protection
                        </h3>
                        <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "rgba(255, 255, 255, 0.6)", margin: 0 }}>
                          Non-invasive metadata analysis without keystroke spying
                        </p>
                      </div>
                    </div>
                    <p style={{ fontSize: "0.95rem", color: "rgba(255, 255, 255, 0.85)", lineHeight: 1.6, margin: "1.25rem 0", maxWidth: "52rem" }}>
                      Identifies after-hours commit spikes, code review pressure, and single-point-of-failure microservices where critical knowledge lives in only one engineer's head, enabling proactive support before resignation.
                    </p>
                    <div className="pitch-grid-3" style={{ paddingTop: "1.25rem", borderTop: "1px solid rgba(255, 255, 255, 0.15)" }}>
                      <div style={{ padding: "1.1rem", backgroundColor: "rgba(255, 255, 255, 0.05)", border: "1px solid rgba(255, 255, 255, 0.12)" }}>
                        <div style={{ fontSize: "0.72rem", color: "rgba(255, 255, 255, 0.6)", textTransform: "uppercase", fontFamily: "var(--font-mono)" }}>
                          Retention Rate
                        </div>
                        <div style={{ fontSize: "1.6rem", fontWeight: 700, color: "#d8b4fe", fontFamily: "var(--font-sans)", marginTop: "0.2rem" }}>
                          94.6%
                        </div>
                        <p style={{ fontSize: "0.72rem", color: "rgba(255, 255, 255, 0.6)", margin: "0.2rem 0 0" }}>
                          Top-decile engineering retention rate
                        </p>
                      </div>
                      <div style={{ padding: "1.1rem", backgroundColor: "rgba(255, 255, 255, 0.05)", border: "1px solid rgba(255, 255, 255, 0.12)" }}>
                        <div style={{ fontSize: "0.72rem", color: "rgba(255, 255, 255, 0.6)", textTransform: "uppercase", fontFamily: "var(--font-mono)" }}>
                          Bus Factors Resolved
                        </div>
                        <div style={{ fontSize: "1.6rem", fontWeight: 700, color: "#86efac", fontFamily: "var(--font-sans)", marginTop: "0.2rem" }}>
                          14 Squads
                        </div>
                        <p style={{ fontSize: "0.72rem", color: "rgba(255, 255, 255, 0.6)", margin: "0.2rem 0 0" }}>
                          Knowledge distribution safely rebalanced
                        </p>
                      </div>
                      <div style={{ padding: "1.1rem", backgroundColor: "rgba(255, 255, 255, 0.05)", border: "1px solid rgba(255, 255, 255, 0.12)" }}>
                        <div style={{ fontSize: "0.72rem", color: "rgba(255, 255, 255, 0.6)", textTransform: "uppercase", fontFamily: "var(--font-mono)" }}>
                          Privacy Trust
                        </div>
                        <div style={{ fontSize: "1.6rem", fontWeight: 700, color: "#93c5fd", fontFamily: "var(--font-sans)", marginTop: "0.2rem" }}>
                          100% Non-Invasive
                        </div>
                        <p style={{ fontSize: "0.72rem", color: "rgba(255, 255, 255, 0.6)", margin: "0.2rem 0 0" }}>
                          Zero surveillance, zero keylogging
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {activeEngineTab === 3 && (
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.85rem", marginBottom: "0.85rem" }}>
                      <span
                        style={{
                          width: "2.75rem",
                          height: "2.75rem",
                          backgroundColor: "rgba(22, 163, 74, 0.25)",
                          color: "#86efac",
                          border: "1px solid #16a34a",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "1.35rem",
                          flexShrink: 0,
                        }}
                      >
                        <FaGaugeHigh />
                      </span>
                      <div style={{ minWidth: 0 }}>
                        <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "1.35rem", fontWeight: 400, color: "white", margin: 0 }}>
                          Elite DORA Telemetry & AI Assistant ROI
                        </h3>
                        <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "rgba(255, 255, 255, 0.6)", margin: 0 }}>
                          Quantifying the true business yield of modern AI assistants
                        </p>
                      </div>
                    </div>
                    <p style={{ fontSize: "0.95rem", color: "rgba(255, 255, 255, 0.85)", lineHeight: 1.6, margin: "1.25rem 0", maxWidth: "52rem" }}>
                      Measures deployment frequency, lead time to changes, and MTTR while attributing capacity gains from tools like GitHub Copilot and Cursor directly to feature delivery velocity.
                    </p>
                    <div className="pitch-grid-3" style={{ paddingTop: "1.25rem", borderTop: "1px solid rgba(255, 255, 255, 0.15)" }}>
                      <div style={{ padding: "1.1rem", backgroundColor: "rgba(255, 255, 255, 0.05)", border: "1px solid rgba(255, 255, 255, 0.12)" }}>
                        <div style={{ fontSize: "0.72rem", color: "rgba(255, 255, 255, 0.6)", textTransform: "uppercase", fontFamily: "var(--font-mono)" }}>
                          Deploy Frequency
                        </div>
                        <div style={{ fontSize: "1.6rem", fontWeight: 700, color: "#86efac", fontFamily: "var(--font-sans)", marginTop: "0.2rem" }}>
                          14.6 / Day
                        </div>
                        <p style={{ fontSize: "0.72rem", color: "rgba(255, 255, 255, 0.6)", margin: "0.2rem 0 0" }}>
                          DORA Elite Performance Tier
                        </p>
                      </div>
                      <div style={{ padding: "1.1rem", backgroundColor: "rgba(255, 255, 255, 0.05)", border: "1px solid rgba(255, 255, 255, 0.12)" }}>
                        <div style={{ fontSize: "0.72rem", color: "rgba(255, 255, 255, 0.6)", textTransform: "uppercase", fontFamily: "var(--font-mono)" }}>
                          AI Adoption Yield
                        </div>
                        <div style={{ fontSize: "1.6rem", fontWeight: 700, color: "#93c5fd", fontFamily: "var(--font-sans)", marginTop: "0.2rem" }}>
                          9.8x Net ROI
                        </div>
                        <p style={{ fontSize: "0.72rem", color: "rgba(255, 255, 255, 0.6)", margin: "0.2rem 0 0" }}>
                          Direct engineering output attribution
                        </p>
                      </div>
                      <div style={{ padding: "1.1rem", backgroundColor: "rgba(255, 255, 255, 0.05)", border: "1px solid rgba(255, 255, 255, 0.12)" }}>
                        <div style={{ fontSize: "0.72rem", color: "rgba(255, 255, 255, 0.6)", textTransform: "uppercase", fontFamily: "var(--font-mono)" }}>
                          Capacity Won
                        </div>
                        <div style={{ fontSize: "1.6rem", fontWeight: 700, color: "#d8b4fe", fontFamily: "var(--font-sans)", marginTop: "0.2rem" }}>
                          410 hrs / mo
                        </div>
                        <p style={{ fontSize: "0.72rem", color: "rgba(255, 255, 255, 0.6)", margin: "0.2rem 0 0" }}>
                          Across 208 active developers
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div style={{ marginTop: "1.5rem", paddingTop: "0.85rem", borderTop: "1px solid rgba(255, 255, 255, 0.15)", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.75rem", color: "rgba(255, 255, 255, 0.6)", flexWrap: "wrap", gap: "0.5rem" }}>
                  <span>Connected to GitHub, GitLab, Jira, CI/CD, Datadog & Cloud Billing APIs</span>
                  <span style={{ fontFamily: "var(--font-mono)", color: "#93c5fd" }}>Continuous Real-Time Sync</span>
                </div>
              </div>
            </MotionReveal>
          </div>
        </section>

        {/* ================================================================
            SECTION 6: SIMPLE WORKFLOW (GOLDEN HONEY GRADIENT BG)
            ================================================================ */}
        <section
          id="workflow"
          style={{
            padding: "6rem 1.5rem",
            background: "linear-gradient(180deg, #FEFCE8 0%, #FEF3C7 50%, #FFFBEB 100%)",
            borderBottom: "var(--pitch-border-medium)",
            boxSizing: "border-box",
          }}
        >
          <div className="pitch-container">
            <MotionReveal>
              <div className="pitch-section-header">
                <span className="pitch-section-eyebrow" style={{ color: "#d97706" }}>
                  04 · SIMPLE WORKFLOW
                </span>
                <h2 className="pitch-section-title">
                  Three steps. Fully automated.
                </h2>
                <p className="pitch-section-subtitle">
                  No intrusive agents to install. Zero manual timesheets. Just connect your repositories and issue trackers — Kaizen handles the rest.
                </p>
              </div>
            </MotionReveal>

            {/* 3 Step Connected Cards (Squared) */}
            <div style={{ position: "relative" }}>
              <div className="pitch-workflow-line" />

              <div className="pitch-grid-3" style={{ position: "relative", zIndex: 1 }}>
                {[
                  {
                    num: "01",
                    title: "Ingest & Trace",
                    desc: "Connect your GitHub, GitLab, and Jira organizations in 2 minutes. Kaizen immediately ingests commit SHAs, PR review queues, line diffs, and epic milestones with zero agent installation.",
                    color: "var(--pitch-blue)",
                    bg: "var(--pitch-blue-surface)",
                  },
                  {
                    num: "02",
                    title: "Graph Intelligence",
                    desc: "Our multi-model Neo4j knowledge graph links code complexity, reviewer workload, and developer dependencies without surveillance — automatically flagging delivery risks and R&D capital.",
                    color: "var(--pitch-purple)",
                    bg: "var(--pitch-purple-surface)",
                  },
                  {
                    num: "03",
                    title: "Executive Action",
                    desc: "CFOs receive audit-ready ASC 350-40 CapEx vouchers, while VP Eng gets Monte Carlo delivery certainty and smart squad review rebalancing that cuts cycle times by 61%.",
                    color: "var(--pitch-green)",
                    bg: "var(--pitch-green-surface)",
                  },
                ].map((step, idx) => (
                  <MotionReveal key={idx} delay={0.15 * (idx + 1)} fullHeight>
                    <div
                      className="pitch-card"
                      style={{
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "flex-start",
                        padding: "2rem 1.75rem",
                        backgroundColor: "#ffffff",
                      }}
                    >
                      <div
                        style={{
                          width: "2.75rem",
                          height: "2.75rem",
                          backgroundColor: step.bg,
                          color: step.color,
                          border: `1.5px solid ${step.color}`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "1.15rem",
                          fontWeight: 700,
                          fontFamily: "var(--font-sans)",
                          marginBottom: "1.25rem",
                          boxShadow: "2px 2px 0px rgba(15, 23, 42, 0.1)",
                        }}
                      >
                        {step.num}
                      </div>
                      <h3
                        style={{
                          fontFamily: "var(--font-serif)",
                          fontSize: "1.3rem",
                          fontWeight: 400,
                          color: "var(--pitch-text-primary)",
                          marginBottom: "0.5rem",
                        }}
                      >
                        {step.title}
                      </h3>
                      <p
                        style={{
                          fontFamily: "var(--font-sans)",
                          fontSize: "0.85rem",
                          color: "var(--pitch-text-secondary)",
                          lineHeight: 1.6,
                          margin: 0,
                        }}
                      >
                        {step.desc}
                      </p>
                    </div>
                  </MotionReveal>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ================================================================
            SECTION 7: OUR MOAT & USP (ROYAL PURPLE TINTED BG)
            ================================================================ */}
        <section
          id="moat"
          style={{
            padding: "6rem 1.5rem",
            background: "linear-gradient(180deg, #FAF5FF 0%, #F3E8FF 50%, #FAF5FF 100%)",
            borderBottom: "var(--pitch-border-medium)",
            boxSizing: "border-box",
          }}
        >
          <div className="pitch-container">
            <MotionReveal>
              <div className="pitch-section-header">
                <span className="pitch-section-eyebrow" style={{ color: "var(--pitch-purple)" }}>
                  05 · OUR MOAT & USP
                </span>
                <h2 className="pitch-section-title">
                  Why Kaizen Wins
                </h2>
                <p className="pitch-section-subtitle">
                  Architectural defensibility rooted in multi-dimensional graph reasoning, zero-surveillance trust, and enterprise GAAP compliance.
                </p>
              </div>
            </MotionReveal>

            <div className="pitch-grid-4">
              {[
                {
                  title: "Multi-Dimensional Graph",
                  desc: "Neo4j knowledge graph links code churn, PR dependencies, and epics directly to financial ledgers, preventing siloed BI.",
                  icon: <FaDatabase />,
                  color: "var(--pitch-blue)",
                },
                {
                  title: "Zero Surveillance",
                  desc: "Analyzes passive metadata without keystroke spying, screen recording, or employee mistrust. 100% developer trust.",
                  icon: <FaShieldAlt />,
                  color: "var(--pitch-purple)",
                },
                {
                  title: "Closed-Loop Rebalancing",
                  desc: "Beyond passive analytics: smart allocation rebalances reviewers and unblocks stalled squads automatically.",
                  icon: <FaSync />,
                  color: "#d97706",
                },
                {
                  title: "Audit-Ready GAAP",
                  desc: "Instant ASC 350-40 and IRS Sec 41 compliance with immutable commit SHA vouchers, built for Big 4 audit sign-off.",
                  icon: <FaInvoice />,
                  color: "var(--pitch-green)",
                },
              ].map((moat, idx) => (
                <MotionReveal key={idx} delay={0.12 * (idx + 1)} fullHeight>
                  <div
                    className="pitch-card"
                    style={{
                      backgroundColor: "#ffffff",
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      textAlign: "center",
                      padding: "2rem 1.5rem",
                    }}
                  >
                    <div
                      style={{
                        width: "3rem",
                        height: "3rem",
                        backgroundColor: "var(--pitch-purple-surface)",
                        border: `1.5px solid ${moat.color}`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "1.35rem",
                        color: moat.color,
                        boxShadow: "2px 2px 0px rgba(15, 23, 42, 0.1)",
                        marginBottom: "1.25rem",
                      }}
                    >
                      {moat.icon}
                    </div>
                    <h3
                      style={{
                        fontFamily: "var(--font-serif)",
                        fontSize: "1.2rem",
                        fontWeight: 400,
                        color: "var(--pitch-text-primary)",
                        marginBottom: "0.5rem",
                      }}
                    >
                      {moat.title}
                    </h3>
                    <p
                      style={{
                        fontFamily: "var(--font-sans)",
                        fontSize: "0.82rem",
                        color: "var(--pitch-text-secondary)",
                        lineHeight: 1.55,
                        margin: 0,
                      }}
                    >
                      {moat.desc}
                    </p>
                  </div>
                </MotionReveal>
              ))}
            </div>
          </div>
        </section>

        {/* ================================================================
            SECTION 8: CORE CAPABILITIES (COOL CYAN SKY GRADIENT BG)
            ================================================================ */}
        <section
          id="capabilities"
          style={{
            padding: "6rem 1.5rem",
            background: "linear-gradient(180deg, #F0F9FF 0%, #E0F2FE 50%, #F0F9FF 100%)",
            borderBottom: "var(--pitch-border-medium)",
            boxSizing: "border-box",
          }}
        >
          <div className="pitch-container">
            <MotionReveal>
              <div className="pitch-section-header">
                <span className="pitch-section-eyebrow" style={{ color: "var(--pitch-blue)" }}>
                  06 · CORE CAPABILITIES
                </span>
                <h2 className="pitch-section-title">
                  Everything in one place
                </h2>
                <p className="pitch-section-subtitle">
                  Purpose-built for engineering and finance leadership — without the enterprise complexity.
                </p>
              </div>
            </MotionReveal>

            <div className="pitch-grid-3">
              {[
                {
                  icon: <FaHeartPulse />,
                  title: "Monte Carlo Release Forecasting",
                  desc: "Probabilistic completion dates updated with every commit SHA and PR, eliminating subjective story point guesswork.",
                },
                {
                  icon: <FaCoins />,
                  title: "Automated Software CapEx (ASC 350-40)",
                  desc: "Algorithmic mapping of developer payroll directly to GAAP R&D balance sheet assets with zero manual timesheets.",
                },
                {
                  icon: <FaUsers />,
                  title: "Bus Factor & Knowledge Silo Detection",
                  desc: "Passive detection of critical microservices that depend on a single engineer, preventing single-point delivery failures.",
                },
                {
                  icon: <FaCodeBranch />,
                  title: "PR Queue & Review Rebalancing",
                  desc: "Cross-squad review load balancing that detects queue bottlenecks 4 days ahead and re-routes pull requests automatically.",
                },
                {
                  icon: <FaGaugeHigh />,
                  title: "Elite DORA Metrics & Copilot ROI",
                  desc: "Rigorous measurement of deployment frequency, lead time, MTTR, and the direct velocity attribution of AI coding assistants.",
                },
                {
                  icon: <FaRobot />,
                  title: "Closed-Loop AI Executive Briefings",
                  desc: "Synthesized natural-language executive briefings for VP Eng and CFO with actionable trade-off simulations.",
                },
              ].map((cap, idx) => (
                <MotionReveal key={idx} delay={0.08 * (idx + 1)} fullHeight>
                  <div className="pitch-card" style={{ height: "100%", padding: "1.75rem", backgroundColor: "#ffffff" }}>
                    <div
                      style={{
                        width: "2.75rem",
                        height: "2.75rem",
                        backgroundColor: "var(--pitch-blue-surface)",
                        border: "1.5px solid var(--pitch-blue)",
                        color: "var(--pitch-blue)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "1.3rem",
                        marginBottom: "1rem",
                      }}
                    >
                      {cap.icon}
                    </div>
                    <h3
                      style={{
                        fontFamily: "var(--font-serif)",
                        fontSize: "1.2rem",
                        fontWeight: 400,
                        color: "var(--pitch-text-primary)",
                        marginBottom: "0.4rem",
                      }}
                    >
                      {cap.title}
                    </h3>
                    <p
                      style={{
                        fontFamily: "var(--font-sans)",
                        fontSize: "0.82rem",
                        color: "var(--pitch-text-secondary)",
                        lineHeight: 1.55,
                        margin: 0,
                      }}
                    >
                      {cap.desc}
                    </p>
                  </div>
                </MotionReveal>
              ))}
            </div>
          </div>
        </section>

        {/* ================================================================
            SECTION 9: ARCHITECTURE & TOPOLOGY (SLATE STEEL BG)
            ================================================================ */}
        <section
          id="graph-arch"
          style={{
            padding: "6rem 1.5rem",
            background: "linear-gradient(180deg, #F8FAFC 0%, #EDF2F7 50%, #E2E8F0 100%)",
            borderBottom: "var(--pitch-border-medium)",
            boxSizing: "border-box",
          }}
        >
          <div className="pitch-container">
            <MotionReveal>
              <div className="pitch-section-header">
                <span className="pitch-section-eyebrow" style={{ color: "#d97706" }}>
                  07 · ARCHITECTURE & INFRASTRUCTURE
                </span>
                <h2 className="pitch-section-title">
                  Built on a modern, scalable stack.
                </h2>
                <p className="pitch-section-subtitle">
                  Our architecture is designed for extreme reliability, sub-second telemetry ingestion, and multi-model AI reasoning.
                </p>
              </div>
            </MotionReveal>

            {/* Tech Stack Badges & Architecture Narrative */}
            <div className="pitch-grid-2" style={{ alignItems: "center", marginBottom: "3rem" }}>
              <MotionReveal direction="right">
                <div style={{ minWidth: 0 }}>
                  <h3
                    style={{
                      fontFamily: "var(--font-serif)",
                      fontSize: "clamp(1.6rem, 3vw, 2.25rem)",
                      fontWeight: 400,
                      color: "var(--pitch-text-primary)",
                      letterSpacing: "-0.01em",
                      marginBottom: "0.85rem",
                    }}
                  >
                    Enterprise Knowledge Graph & AI Reasoning Core
                  </h3>
                  <p
                    style={{
                      fontFamily: "var(--font-sans)",
                      fontSize: "0.95rem",
                      color: "var(--pitch-text-secondary)",
                      marginBottom: "1.5rem",
                      lineHeight: 1.6,
                    }}
                  >
                    Neo4j knowledge graphs link code churn and PR dependencies directly to financial CapEx ledgers, powered by Gemini LLM reasoning on Google Vertex AI with sub-second WebSocket telemetry.
                  </p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                    {[
                      "React 19 / Vite",
                      "Node.js & Express",
                      "Neo4j Graph DB",
                      "MongoDB Atlas",
                      "Gemini 2.0 Flash / Pro",
                      "Google Vertex AI",
                      "WebSockets Telemetry",
                      "Docker & Cloud Run",
                    ].map((tech, i) => (
                      <span
                        key={i}
                        style={{
                          padding: "0.35rem 0.85rem",
                          backgroundColor: "#ffffff",
                          border: "1.5px solid var(--pitch-text-primary)",
                          boxShadow: "2px 2px 0px rgba(15, 23, 42, 0.1)",
                          fontFamily: "var(--font-sans)",
                          fontWeight: 700,
                          color: "var(--pitch-text-primary)",
                          fontSize: "0.78rem",
                        }}
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              </MotionReveal>

              {/* 5-Node Knowledge Graph Architecture (Squared) */}
              <MotionReveal direction="left" delay={0.2}>
                <div className="pitch-card" style={{ padding: "1.5rem", backgroundColor: "#ffffff" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
                    <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.78rem", fontWeight: 700, textTransform: "uppercase", color: "var(--pitch-text-primary)" }}>
                      Live Multi-Model Knowledge Graph
                    </span>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.72rem", backgroundColor: "var(--pitch-blue-surface)", color: "#1d4ed8", padding: "2px 7px", fontWeight: 700, border: "1px solid #93c5fd" }}>
                      Sub-second Telemetry
                    </span>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "0.65rem" }}>
                    <div className="pitch-topology-node">
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--pitch-text-primary)", display: "flex", alignItems: "center", gap: "0.45rem" }}>
                          <FaGithub style={{ color: "var(--pitch-blue)" }} /> 01 · Repositories
                        </span>
                        <span style={{ fontSize: "0.72rem", fontFamily: "var(--font-mono)", color: "var(--pitch-blue)", fontWeight: 700 }}>GitHub & GitLab</span>
                      </div>
                      <p style={{ fontSize: "0.72rem", color: "var(--pitch-text-secondary)", margin: "0.2rem 0 0" }}>Webhook events, commit SHAs, line diffs & PR metadata</p>
                    </div>

                    <div className="pitch-topology-node">
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--pitch-text-primary)", display: "flex", alignItems: "center", gap: "0.45rem" }}>
                          <FaUsers style={{ color: "var(--pitch-purple)" }} /> 02 · Workforce
                        </span>
                        <span style={{ fontSize: "0.72rem", fontFamily: "var(--font-mono)", color: "var(--pitch-purple)", fontWeight: 700 }}>Squads & Devs</span>
                      </div>
                      <p style={{ fontSize: "0.72rem", color: "var(--pitch-text-secondary)", margin: "0.2rem 0 0" }}>Review latency, after-hours burnout cues & bus factor 1</p>
                    </div>

                    <div className="pitch-topology-node">
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--pitch-text-primary)", display: "flex", alignItems: "center", gap: "0.45rem" }}>
                          <FaJira style={{ color: "#d97706" }} /> 03 · Epics & Tasks
                        </span>
                        <span style={{ fontSize: "0.72rem", fontFamily: "var(--font-mono)", color: "#d97706", fontWeight: 700 }}>Jira & Linear</span>
                      </div>
                      <p style={{ fontSize: "0.72rem", color: "var(--pitch-text-secondary)", margin: "0.2rem 0 0" }}>Story dependencies, epic milestones & velocity blockers</p>
                    </div>

                    <div className="pitch-topology-node">
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--pitch-text-primary)", display: "flex", alignItems: "center", gap: "0.45rem" }}>
                          <FaServer style={{ color: "var(--pitch-red)" }} /> 04 · Cloud Infra
                        </span>
                        <span style={{ fontSize: "0.72rem", fontFamily: "var(--font-mono)", color: "var(--pitch-red)", fontWeight: 700 }}>AWS & GCP</span>
                      </div>
                      <p style={{ fontSize: "0.72rem", color: "var(--pitch-text-secondary)", margin: "0.2rem 0 0" }}>Kubernetes clusters, serverless unit cost & idle compute</p>
                    </div>

                    <div className="pitch-topology-node">
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--pitch-text-primary)", display: "flex", alignItems: "center", gap: "0.45rem" }}>
                          <FaCoins style={{ color: "var(--pitch-green)" }} /> 05 · Financial Ledger
                        </span>
                        <span style={{ fontSize: "0.72rem", fontFamily: "var(--font-mono)", color: "var(--pitch-green)", fontWeight: 700 }}>GAAP CapEx</span>
                      </div>
                      <p style={{ fontSize: "0.72rem", color: "var(--pitch-text-secondary)", margin: "0.2rem 0 0" }}>ASC 350-40 vouchers & IRS Sec 41 tax schedules</p>
                    </div>
                  </div>
                </div>
              </MotionReveal>
            </div>

            {/* Delivery Velocity & Cycle Time Area Charts (Squared) */}
            <div className="pitch-grid-2">
              <MotionReveal delay={0.25}>
                <div className="pitch-card" style={{ padding: "1.5rem", minWidth: 0, overflow: "hidden", backgroundColor: "#ffffff" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.85rem", flexWrap: "wrap", gap: "0.5rem" }}>
                    <div>
                      <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.78rem", fontWeight: 700, textTransform: "uppercase", color: "var(--pitch-text-primary)", display: "block" }}>
                        PR Review Latency Drop (Days)
                      </span>
                      <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.72rem", color: "var(--pitch-text-secondary)" }}>
                        From 5.4 days to 2.1 days via smart squad rebalancing
                      </span>
                    </div>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.72rem", color: "var(--pitch-blue)", fontWeight: 700, backgroundColor: "var(--pitch-blue-surface)", padding: "0.25rem 0.6rem", border: "1px solid #93c5fd" }}>
                      -61% Latency
                    </span>
                  </div>
                  <div style={{ width: "100%", height: 170, minWidth: 0 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={cycleTimeData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                        <defs>
                          <linearGradient id="latencyGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="var(--pitch-blue)" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="var(--pitch-blue)" stopOpacity={0.0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis dataKey="week" tick={{ fontSize: 10, fontFamily: "var(--font-mono)" }} stroke="#64748b" />
                        <YAxis tick={{ fontSize: 10, fontFamily: "var(--font-mono)" }} stroke="#64748b" />
                        <Tooltip contentStyle={{ backgroundColor: "#0f172a", borderRadius: "0px", border: "1px solid #334155", color: "#fff", fontSize: "11px" }} />
                        <Area type="monotone" dataKey="latencyDays" stroke="var(--pitch-blue)" strokeWidth={2} fillOpacity={1} fill="url(#latencyGradient)" name="PR Latency (Days)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </MotionReveal>

              <MotionReveal delay={0.35}>
                <div className="pitch-card" style={{ padding: "1.5rem", minWidth: 0, overflow: "hidden", backgroundColor: "#ffffff" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.85rem", flexWrap: "wrap", gap: "0.5rem" }}>
                    <div>
                      <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.78rem", fontWeight: 700, textTransform: "uppercase", color: "var(--pitch-text-primary)", display: "block" }}>
                        Sprint Milestone Adherence (%)
                      </span>
                      <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.72rem", color: "var(--pitch-text-secondary)" }}>
                        Monte Carlo probabilistic forecasting adherence
                      </span>
                    </div>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.72rem", color: "var(--pitch-green)", fontWeight: 700, backgroundColor: "var(--pitch-green-surface)", padding: "0.25rem 0.6rem", border: "1px solid #86efac" }}>
                      96% Confidence
                    </span>
                  </div>
                  <div style={{ width: "100%", height: 170, minWidth: 0 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={cycleTimeData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                        <defs>
                          <linearGradient id="adherenceGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="var(--pitch-green)" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="var(--pitch-green)" stopOpacity={0.0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis dataKey="week" tick={{ fontSize: 10, fontFamily: "var(--font-mono)" }} stroke="#64748b" />
                        <YAxis tick={{ fontSize: 10, fontFamily: "var(--font-mono)" }} stroke="#64748b" />
                        <Tooltip contentStyle={{ backgroundColor: "#0f172a", borderRadius: "0px", border: "1px solid #334155", color: "#fff", fontSize: "11px" }} />
                        <Area type="monotone" dataKey="adherence" stroke="var(--pitch-green)" strokeWidth={2} fillOpacity={1} fill="url(#adherenceGradient)" name="Adherence (%)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </MotionReveal>
            </div>
          </div>
        </section>

        {/* ================================================================
            SECTION 10: INTERACTIVE ROI SIMULATOR (MINT EMERALD GRADIENT BG)
            ================================================================ */}
        <section
          id="roi"
          style={{
            padding: "6rem 1.5rem",
            background: "linear-gradient(180deg, #ECFDF5 0%, #D1FAE5 50%, #F0FDF4 100%)",
            borderBottom: "var(--pitch-border-medium)",
            boxSizing: "border-box",
          }}
        >
          <div className="pitch-container">
            <MotionReveal>
              <div className="pitch-section-header">
                <span className="pitch-section-eyebrow" style={{ color: "var(--pitch-green)" }}>
                  08 · INTERACTIVE ROI SIMULATOR
                </span>
                <h2 className="pitch-section-title">
                  Quantifiable enterprise yield that pays for itself in{" "}
                  <span className="text-gradient-green font-serif italic">{paybackDays} days</span>.
                </h2>
                <p className="pitch-section-subtitle">
                  Slide engineering headcount and compensation below to simulate total annual economic value creation.
                </p>
              </div>
            </MotionReveal>

            <MotionReveal delay={0.2}>
              <div className="pitch-card" style={{ padding: "clamp(1.5rem, 3.5vw, 2.5rem)", backgroundColor: "#ffffff" }}>
                <div className="pitch-grid-2" style={{ alignItems: "center" }}>
                  {/* Left Column: Sliders (Squared) */}
                  <div
                    style={{
                      backgroundColor: "#f8fafc",
                      padding: "1.75rem",
                      border: "1.5px solid var(--pitch-text-primary)",
                      boxSizing: "border-box",
                      boxShadow: "3px 3px 0px rgba(15, 23, 42, 0.1)",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.72rem", fontFamily: "var(--font-mono)", fontWeight: 700, color: "var(--pitch-text-secondary)", textTransform: "uppercase", marginBottom: "1.25rem" }}>
                      <FaSliders style={{ color: "var(--pitch-blue)" }} /> Organization Parameters
                    </div>

                    <div style={{ marginBottom: "1.5rem" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.4rem" }}>
                        <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--pitch-text-primary)" }}>Engineering Headcount</span>
                        <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.95rem", fontWeight: 700, color: "var(--pitch-blue)" }}>
                          {calcDevs} Engineers
                        </span>
                      </div>
                      <input
                        type="range"
                        min="25"
                        max="600"
                        step="5"
                        value={calcDevs}
                        onChange={(e) => setCalcDevs(Number(e.target.value))}
                        className="pitch-range-slider"
                      />
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.72rem", color: "var(--pitch-text-secondary)", fontFamily: "var(--font-mono)", marginTop: "0.2rem" }}>
                        <span>25 Devs</span>
                        <span>300 Devs</span>
                        <span>600+ Devs</span>
                      </div>
                    </div>

                    <div style={{ marginBottom: "1rem" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.4rem" }}>
                        <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--pitch-text-primary)" }}>Avg Developer Salary</span>
                        <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.95rem", fontWeight: 700, color: "var(--pitch-green)" }}>
                          ${(calcSalary / 1000).toFixed(0)}k / yr
                        </span>
                      </div>
                      <input
                        type="range"
                        min="90000"
                        max="240000"
                        step="5000"
                        value={calcSalary}
                        onChange={(e) => setCalcSalary(Number(e.target.value))}
                        className="pitch-range-slider"
                      />
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.72rem", color: "var(--pitch-text-secondary)", fontFamily: "var(--font-mono)", marginTop: "0.2rem" }}>
                        <span>$90k</span>
                        <span>$165k</span>
                        <span>$240k</span>
                      </div>
                    </div>

                    <div style={{ paddingTop: "0.85rem", borderTop: "1px solid #cbd5e1", fontSize: "0.75rem", color: "var(--pitch-text-secondary)" }}>
                      Total Annual Engineering Payroll: <strong style={{ color: "var(--pitch-text-primary)", fontFamily: "var(--font-mono)" }}>${(annualPayroll / 1000000).toFixed(2)}M</strong>
                    </div>
                  </div>

                  {/* Right Column: Calculated Outputs Grid (Squared) */}
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "0.85rem" }}>
                    <div className="pitch-card" style={{ padding: "1.1rem", backgroundColor: "#fffbeb", borderColor: "#f59e0b" }}>
                      <span className="pitch-card-metric-label" style={{ color: "#92400e" }}>CapEx Tax Recovery</span>
                      <div className="pitch-card-metric-val" style={{ color: "#b45309", fontSize: "1.6rem" }}>
                        +${(capExRecovered / 1000).toFixed(0)}k / yr
                      </div>
                      <p style={{ fontSize: "0.72rem", color: "#78350f", margin: "0.2rem 0 0", lineHeight: 1.4 }}>
                        Software R&D capitalized under ASC 350-40 and IRS Sec 41.
                      </p>
                    </div>

                    <div className="pitch-card" style={{ padding: "1.1rem", backgroundColor: "#eff6ff", borderColor: "#3b82f6" }}>
                      <span className="pitch-card-metric-label" style={{ color: "#1e40af" }}>Hours Won</span>
                      <div className="pitch-card-metric-val" style={{ color: "var(--pitch-blue)", fontSize: "1.6rem" }}>
                        +{hoursSavedPerYear.toLocaleString()} hrs
                      </div>
                      <p style={{ fontSize: "0.72rem", color: "#1e3a8a", margin: "0.2rem 0 0", lineHeight: 1.4 }}>
                        Worth ~${(hoursSavedValue / 1000).toFixed(0)}k in engineering velocity.
                      </p>
                    </div>

                    <div className="pitch-card" style={{ padding: "1.1rem", backgroundColor: "#faf5ff", borderColor: "#a855f7" }}>
                      <span className="pitch-card-metric-label" style={{ color: "#6b21a8" }}>Turnover Avoided</span>
                      <div className="pitch-card-metric-val" style={{ color: "var(--pitch-purple)", fontSize: "1.6rem" }}>
                        +${(turnoverCostAvoided / 1000).toFixed(0)}k / yr
                      </div>
                      <p style={{ fontSize: "0.72rem", color: "#581c87", margin: "0.2rem 0 0", lineHeight: 1.4 }}>
                        {seniorReplacementsAvoided} senior departures mitigated via burnout triage.
                      </p>
                    </div>

                    <div className="pitch-card" style={{ padding: "1.1rem", backgroundColor: "#f0fdf4", borderColor: "#16a34a", border: "2px solid #16a34a" }}>
                      <span className="pitch-card-metric-label" style={{ color: "#166534" }}>Net Annual Value</span>
                      <div className="pitch-card-metric-val" style={{ color: "#15803d", fontSize: "1.6rem" }}>
                        ${(totalAnnualYield / 1000000).toFixed(2)}M
                      </div>
                      <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "#14532d", marginTop: "0.2rem" }}>
                        {netRoiRatio}x Net ROI · Payback: {paybackDays} Days
                      </div>
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    marginTop: "1.75rem",
                    padding: "0.85rem 1.25rem",
                    backgroundColor: "#f8fafc",
                    border: "1.5px solid var(--pitch-text-primary)",
                    display: "flex",
                    flexWrap: "wrap",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "0.75rem",
                    fontSize: "0.82rem",
                  }}
                >
                  <span style={{ color: "var(--pitch-text-secondary)" }}>
                    Kaizen Enterprise Investment: <strong style={{ color: "var(--pitch-text-primary)", fontFamily: "var(--font-mono)" }}>${(kaizenAnnualCost / 1000).toFixed(1)}k / yr</strong> ($49/developer/month)
                  </span>
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      color: "var(--pitch-green)",
                      fontWeight: 700,
                      backgroundColor: "var(--pitch-green-surface)",
                      padding: "0.3rem 0.75rem",
                      border: "1px solid #86efac",
                    }}
                  >
                    Guaranteed 10x ROI in Enterprise Pilot
                  </span>
                </div>
              </div>
            </MotionReveal>
          </div>
        </section>

        {/* ================================================================
            SECTION 11: ECONOMICS & SCALE / BUSINESS MODEL (WARM AMBER TINT BG)
            ================================================================ */}
        <section
          id="model"
          style={{
            padding: "6rem 1.5rem",
            background: "linear-gradient(180deg, #FFFBEB 0%, #FDE68A 40%, #FEF3C7 100%)",
            borderBottom: "var(--pitch-border-medium)",
            boxSizing: "border-box",
          }}
        >
          <div className="pitch-container">
            <MotionReveal>
              <div className="pitch-section-header">
                <span className="pitch-section-eyebrow" style={{ color: "var(--pitch-purple)" }}>
                  09 · ECONOMICS & SCALE
                </span>
                <h2 className="pitch-section-title">
                  Built for Exponential Growth
                </h2>
                <p className="pitch-section-subtitle">
                  A frictionless self-serve entry point creates viral squad usage, which triggers enterprise-wide rollout when finance sees CapEx ROI.
                </p>
              </div>
            </MotionReveal>

            {/* 3 Pricing / Revenue Tier Cards (Squared) */}
            <div className="pitch-grid-3" style={{ marginBottom: "2.5rem" }}>
              <MotionReveal delay={0.15} fullHeight>
                <div className="pitch-card" style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", backgroundColor: "#ffffff" }}>
                  <div>
                    <span style={{ fontSize: "0.72rem", fontFamily: "var(--font-mono)", textTransform: "uppercase", fontWeight: 700, color: "var(--pitch-text-secondary)" }}>
                      Squad Pilot
                    </span>
                    <div style={{ fontFamily: "var(--font-sans)", fontSize: "2rem", fontWeight: 700, color: "var(--pitch-text-primary)", margin: "0.4rem 0 0.85rem" }}>
                      $29 <span style={{ fontSize: "0.85rem", color: "var(--pitch-text-secondary)", fontWeight: 400 }}>/ dev / mo</span>
                    </div>
                    <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.5rem", fontSize: "0.82rem", color: "var(--pitch-text-secondary)" }}>
                      <li style={{ display: "flex", alignItems: "center", gap: "0.45rem" }}><FaCheck style={{ color: "var(--pitch-green)" }} /> Git & Jira Telemetry Ingestion</li>
                      <li style={{ display: "flex", alignItems: "center", gap: "0.45rem" }}><FaCheck style={{ color: "var(--pitch-green)" }} /> PR Queue Stagnation Alerts</li>
                      <li style={{ display: "flex", alignItems: "center", gap: "0.45rem" }}><FaCheck style={{ color: "var(--pitch-green)" }} /> Basic DORA Velocity Metrics</li>
                    </ul>
                  </div>
                  <div style={{ paddingTop: "0.85rem", borderTop: "var(--pitch-border-light)", fontSize: "0.72rem", fontFamily: "var(--font-mono)", color: "var(--pitch-text-secondary)", marginTop: "1.25rem" }}>
                    Self-Serve Setup (5 mins)
                  </div>
                </div>
              </MotionReveal>

              <MotionReveal delay={0.25} fullHeight>
                <div
                  className="pitch-card"
                  style={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    borderColor: "var(--pitch-blue)",
                    borderWidth: "2.5px",
                    backgroundColor: "#ffffff",
                    position: "relative",
                  }}
                >
                  <span
                    style={{
                      position: "absolute",
                      top: "0",
                      right: "0",
                      backgroundColor: "var(--pitch-blue)",
                      color: "white",
                      fontSize: "0.68rem",
                      fontFamily: "var(--font-mono)",
                      fontWeight: 700,
                      padding: "3px 9px",
                      textTransform: "uppercase",
                    }}
                  >
                    Flagship
                  </span>
                  <div>
                    <span style={{ fontSize: "0.72rem", fontFamily: "var(--font-mono)", textTransform: "uppercase", fontWeight: 700, color: "var(--pitch-blue)" }}>
                      Enterprise Scale
                    </span>
                    <div style={{ fontFamily: "var(--font-sans)", fontSize: "2rem", fontWeight: 700, color: "var(--pitch-text-primary)", margin: "0.4rem 0 0.85rem" }}>
                      $49 <span style={{ fontSize: "0.85rem", color: "var(--pitch-text-secondary)", fontWeight: 400 }}>/ dev / mo</span>
                    </div>
                    <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.5rem", fontSize: "0.82rem", color: "var(--pitch-text-primary)" }}>
                      <li style={{ display: "flex", alignItems: "center", gap: "0.45rem" }}><FaCheck style={{ color: "var(--pitch-blue)" }} /> Monte Carlo Delay Forecasting</li>
                      <li style={{ display: "flex", alignItems: "center", gap: "0.45rem" }}><FaCheck style={{ color: "var(--pitch-blue)" }} /> Automated ASC 350-40 CapEx Ledger</li>
                      <li style={{ display: "flex", alignItems: "center", gap: "0.45rem" }}><FaCheck style={{ color: "var(--pitch-blue)" }} /> Neo4j 3D Knowledge Graph</li>
                      <li style={{ display: "flex", alignItems: "center", gap: "0.45rem" }}><FaCheck style={{ color: "var(--pitch-blue)" }} /> Retention Risk & Bus Factor Engine</li>
                    </ul>
                  </div>
                  <div style={{ paddingTop: "0.85rem", borderTop: "1.5px solid var(--pitch-blue)", fontSize: "0.72rem", fontFamily: "var(--font-mono)", color: "var(--pitch-blue)", fontWeight: 700, marginTop: "1.25rem" }}>
                    ACV: $58k - $145k / year
                  </div>
                </div>
              </MotionReveal>

              <MotionReveal delay={0.35} fullHeight>
                <div className="pitch-card" style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", backgroundColor: "#ffffff" }}>
                  <div>
                    <span style={{ fontSize: "0.72rem", fontFamily: "var(--font-mono)", textTransform: "uppercase", fontWeight: 700, color: "var(--pitch-purple)" }}>
                      Global Strategic
                    </span>
                    <div style={{ fontFamily: "var(--font-sans)", fontSize: "2rem", fontWeight: 700, color: "var(--pitch-text-primary)", margin: "0.4rem 0 0.85rem" }}>
                      Custom <span style={{ fontSize: "0.85rem", color: "var(--pitch-text-secondary)", fontWeight: 400 }}>/ enterprise</span>
                    </div>
                    <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.5rem", fontSize: "0.82rem", color: "var(--pitch-text-secondary)" }}>
                      <li style={{ display: "flex", alignItems: "center", gap: "0.45rem" }}><FaCheck style={{ color: "var(--pitch-purple)" }} /> Dedicated Vertex AI Instance</li>
                      <li style={{ display: "flex", alignItems: "center", gap: "0.45rem" }}><FaCheck style={{ color: "var(--pitch-purple)" }} /> SAP & Workday ERP Auto-Sync</li>
                      <li style={{ display: "flex", alignItems: "center", gap: "0.45rem" }}><FaCheck style={{ color: "var(--pitch-purple)" }} /> Voice Executive Briefings</li>
                      <li style={{ display: "flex", alignItems: "center", gap: "0.45rem" }}><FaCheck style={{ color: "var(--pitch-purple)" }} /> Bespoke 99.99% Enterprise SLA</li>
                    </ul>
                  </div>
                  <div style={{ paddingTop: "0.85rem", borderTop: "var(--pitch-border-light)", fontSize: "0.72rem", fontFamily: "var(--font-mono)", color: "var(--pitch-purple)", fontWeight: 700, marginTop: "1.25rem" }}>
                    ACV: $180k - $450k+
                  </div>
                </div>
              </MotionReveal>
            </div>

            {/* Quarterly Software R&D CapEx Chart & Flywheel (Squared) */}
            <div className="pitch-grid-2" style={{ alignItems: "center" }}>
              <MotionReveal direction="right">
                <div className="pitch-card" style={{ padding: "1.75rem", minWidth: 0, overflow: "hidden", backgroundColor: "#ffffff" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.85rem", flexWrap: "wrap", gap: "0.5rem" }}>
                    <div>
                      <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.78rem", fontWeight: 700, textTransform: "uppercase", color: "var(--pitch-text-primary)", display: "block" }}>
                        Software R&D Capitalization ($k)
                      </span>
                      <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.72rem", color: "var(--pitch-text-secondary)" }}>
                        Automated ASC 350-40 GAAP Journal Entries
                      </span>
                    </div>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.72rem", color: "#b45309", fontWeight: 700, backgroundColor: "var(--pitch-yellow-surface)", padding: "0.25rem 0.6rem", border: "1px solid #fde68a" }}>
                      Audit-Ready Schedule
                    </span>
                  </div>
                  <div style={{ width: "100%", height: 200, minWidth: 0 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={financialCapExData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis dataKey="quarter" tick={{ fontSize: 10, fontFamily: "var(--font-mono)" }} stroke="#64748b" />
                        <YAxis tick={{ fontSize: 10, fontFamily: "var(--font-mono)" }} stroke="#64748b" />
                        <Tooltip contentStyle={{ backgroundColor: "#0f172a", borderRadius: "0px", border: "1px solid #334155", color: "#fff", fontSize: "11px" }} />
                        <Bar dataKey="capex" name="CapEx Capitalized ($k)" fill="#fbbf24" radius={[0, 0, 0, 0]} />
                        <Bar dataKey="taxCredits" name="IRS Sec 41 Credit ($k)" fill="var(--pitch-green)" radius={[0, 0, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </MotionReveal>

              <MotionReveal direction="left" delay={0.2}>
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  <div className="pitch-card" style={{ backgroundColor: "#ffffff", padding: "1.5rem" }}>
                    <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.78rem", fontWeight: 700, textTransform: "uppercase", color: "var(--pitch-text-primary)", display: "block", marginBottom: "0.6rem" }}>
                      GTM Expansion Flywheel
                    </span>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem", fontSize: "0.82rem", color: "var(--pitch-text-primary)", fontWeight: 500 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                        <span style={{ width: "1.35rem", height: "1.35rem", backgroundColor: "var(--pitch-blue)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.7rem", flexShrink: 0 }}>1</span>
                        <span>Dev Lead Installs GitHub App (5-minute self-serve setup)</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                        <span style={{ width: "1.35rem", height: "1.35rem", backgroundColor: "var(--pitch-blue)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.7rem", flexShrink: 0 }}>2</span>
                        <span>Squad PR Queue Unblocked & review latency drops by 61%</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                        <span style={{ width: "1.35rem", height: "1.35rem", backgroundColor: "var(--pitch-blue)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.7rem", flexShrink: 0 }}>3</span>
                        <span>VP Eng Standardizes Monte Carlo Sprint Forecasting org-wide</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                        <span style={{ width: "1.35rem", height: "1.35rem", backgroundColor: "var(--pitch-green)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.7rem", flexShrink: 0 }}>4</span>
                        <span>CFO Mandates ASC 350-40 CapEx Ledger for millions in tax write-offs</span>
                      </div>
                    </div>
                  </div>

                  <div className="pitch-card" style={{ padding: "1.25rem", backgroundColor: "#ffffff" }}>
                    <h4 style={{ fontFamily: "var(--font-serif)", fontSize: "1.1rem", fontWeight: 400, color: "var(--pitch-text-primary)", margin: "0 0 0.35rem" }}>
                      The AI Network Effect
                    </h4>
                    <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.82rem", color: "var(--pitch-text-secondary)", margin: 0, lineHeight: 1.5 }}>
                      More repositories & commits ingested = Higher Monte Carlo probabilistic accuracy = Faster sprint cycle time = Higher enterprise contract expansion.
                    </p>
                  </div>
                </div>
              </MotionReveal>
            </div>
          </div>
        </section>

        {/* ================================================================
            SECTION 12: ROADMAP & EXECUTION (ICE BLUE LAVENDER GRADIENT BG)
            ================================================================ */}
        <section
          id="roadmap"
          style={{
            padding: "6rem 1.5rem",
            background: "linear-gradient(180deg, #EEF2FF 0%, #C7D2FE 40%, #E0E7FF 100%)",
            borderBottom: "var(--pitch-border-medium)",
            boxSizing: "border-box",
          }}
        >
          <div className="pitch-container">
            <MotionReveal>
              <div className="pitch-section-header">
                <span className="pitch-section-eyebrow" style={{ color: "var(--pitch-blue)" }}>
                  10 · ROADMAP & EXECUTION
                </span>
                <h2 className="pitch-section-title">
                  From engineering observability to autonomous execution.
                </h2>
                <p className="pitch-section-subtitle">
                  We've proven core telemetry ingestion and 3D graph modeling. Our next milestone delivers autonomous closed-loop squad orchestration.
                </p>
              </div>
            </MotionReveal>

            <div className="pitch-grid-4" style={{ marginBottom: "2rem" }}>
              <MotionReveal delay={0.1} fullHeight>
                <div className="pitch-card" style={{ borderColor: "#16a34a", backgroundColor: "#f0fdf4", height: "100%" }}>
                  <span style={{ fontSize: "0.68rem", fontFamily: "var(--font-mono)", fontWeight: 700, textTransform: "uppercase", color: "#166534", backgroundColor: "#dcfce7", padding: "2px 7px", border: "1px solid #86efac" }}>
                    Q4 2025 · SHIPPED
                  </span>
                  <h4 style={{ fontFamily: "var(--font-serif)", fontWeight: 400, fontSize: "1.15rem", color: "var(--pitch-text-primary)", margin: "0.75rem 0 0.3rem" }}>
                    Graph & Forecasting Core
                  </h4>
                  <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.8rem", color: "var(--pitch-text-secondary)", lineHeight: 1.55, margin: 0 }}>
                    Multi-repo Git ingestion, Neo4j 3D graph, Monte Carlo delay prediction, meeting transcript AI feature extractor.
                  </p>
                </div>
              </MotionReveal>

              <MotionReveal delay={0.2} fullHeight>
                <div className="pitch-card" style={{ borderColor: "#2563eb", backgroundColor: "#eff6ff", height: "100%" }}>
                  <span style={{ fontSize: "0.68rem", fontFamily: "var(--font-mono)", fontWeight: 700, textTransform: "uppercase", color: "#1e40af", backgroundColor: "#dbeafe", padding: "2px 7px", border: "1px solid #93c5fd" }}>
                    Q1-Q2 2026 · ACTIVE
                  </span>
                  <h4 style={{ fontFamily: "var(--font-serif)", fontWeight: 400, fontSize: "1.15rem", color: "var(--pitch-text-primary)", margin: "0.75rem 0 0.3rem" }}>
                    FinOps & Voice Briefings
                  </h4>
                  <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.8rem", color: "var(--pitch-text-secondary)", lineHeight: 1.55, margin: 0 }}>
                    ASC 350-40 automated journal vouchers, AI voice briefings, real-time PR rebalancing engine.
                  </p>
                </div>
              </MotionReveal>

              <MotionReveal delay={0.3} fullHeight>
                <div className="pitch-card" style={{ height: "100%", backgroundColor: "#ffffff" }}>
                  <span style={{ fontSize: "0.68rem", fontFamily: "var(--font-mono)", fontWeight: 700, textTransform: "uppercase", color: "var(--pitch-purple)", backgroundColor: "var(--pitch-purple-surface)", padding: "2px 7px", border: "1px solid #d8b4fe" }}>
                    Q3 2026 · IN FLIGHT
                  </span>
                  <h4 style={{ fontFamily: "var(--font-serif)", fontWeight: 400, fontSize: "1.15rem", color: "var(--pitch-text-primary)", margin: "0.75rem 0 0.3rem" }}>
                    Cloud Unit FinOps
                  </h4>
                  <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.8rem", color: "var(--pitch-text-secondary)", lineHeight: 1.55, margin: 0 }}>
                    Connect cloud spend (Datadog/New Relic) to feature velocity, giving CFOs a precise unit cost per feature.
                  </p>
                </div>
              </MotionReveal>

              <MotionReveal delay={0.4} fullHeight>
                <div className="pitch-card" style={{ height: "100%", backgroundColor: "#ffffff" }}>
                  <span style={{ fontSize: "0.68rem", fontFamily: "var(--font-mono)", fontWeight: 700, textTransform: "uppercase", color: "#475569", backgroundColor: "#e2e8f0", padding: "2px 7px", border: "1px solid #cbd5e1" }}>
                    Q4 2026 · NEXT
                  </span>
                  <h4 style={{ fontFamily: "var(--font-serif)", fontWeight: 400, fontSize: "1.15rem", color: "var(--pitch-text-primary)", margin: "0.75rem 0 0.3rem" }}>
                    Autonomous Orchestration
                  </h4>
                  <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.8rem", color: "var(--pitch-text-secondary)", lineHeight: 1.55, margin: 0 }}>
                    Closed-loop remediation: Automatically re-route PRs, spin up sandbox environments, and auto-deprecate low-yield cloud resources.
                  </p>
                </div>
              </MotionReveal>
            </div>

            <MotionReveal delay={0.45}>
              <div
                style={{
                  padding: "1rem 1.5rem",
                  backgroundColor: "#ffffff",
                  border: "1.5px solid var(--pitch-text-primary)",
                  boxShadow: "3px 3px 0px rgba(15, 23, 42, 0.1)",
                  display: "flex",
                  flexWrap: "wrap",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: "0.75rem",
                  fontSize: "0.82rem",
                }}
              >
                <span style={{ fontWeight: 600, color: "var(--pitch-text-primary)" }}>
                  Seed round fuels our acceleration into fully autonomous, closed-loop cloud and code orchestration.
                </span>
                <span style={{ fontFamily: "var(--font-mono)", color: "var(--pitch-blue)", fontWeight: 700 }}>
                  18-Month Execution Runway
                </span>
              </div>
            </MotionReveal>
          </div>
        </section>

        {/* ================================================================
            SECTION 13: THE ASK & CLOSING HERO (DEEP OBSIDIAN GRADIENT BG)
            ================================================================ */}
        <section
          id="ask"
          style={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "5rem 1.5rem 3rem",
            background: "linear-gradient(180deg, #090D16 0%, #0F172A 50%, #030712 100%)",
            textAlign: "center",
            position: "relative",
            overflow: "hidden",
            color: "white",
            boxSizing: "border-box",
            width: "100%",
          }}
        >
          {/* Watermark Brand Logo */}
          <div
            style={{
              position: "absolute",
              bottom: "-5%",
              left: "50%",
              transform: "translateX(-50%)",
              width: "100%",
              maxWidth: "800px",
              display: "flex",
              justifyContent: "center",
              pointerEvents: "none",
              zIndex: 0,
              overflow: "hidden",
            }}
          >
            <img
              src="/icon.svg"
              alt="Kaizen Watermark"
              style={{
                width: "100%",
                maxHeight: "450px",
                opacity: 0.05,
                filter: "brightness(0) invert(1)",
              }}
            />
          </div>

          <div className="pitch-container" style={{ maxWidth: "52rem", position: "relative", zIndex: 10 }}>
            <MotionReveal delay={0.15}>
              <h2
                style={{
                  fontFamily: "var(--font-serif)",
                  fontSize: "clamp(2.5rem, 5.5vw, 4.25rem)",
                  fontWeight: 400,
                  color: "white",
                  letterSpacing: "-0.01em",
                  marginBottom: "1.25rem",
                  lineHeight: 1.1,
                }}
              >
                Ready to redefine{" "}
                <span className="text-gradient font-serif italic">engineering intelligence?</span>
              </h2>
            </MotionReveal>

            <MotionReveal delay={0.25}>
              <p
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "clamp(1.05rem, 1.8vw, 1.25rem)",
                  color: "rgba(255, 255, 255, 0.75)",
                  maxWidth: "42rem",
                  margin: "0 auto 2.25rem",
                  lineHeight: 1.6,
                }}
              >
                The autonomous engineering capital layer for modern enterprise organizations. Connected to enterprise Git & Jira.
              </p>
            </MotionReveal>

            <MotionReveal delay={0.35}>
              <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap", marginBottom: "3rem" }}>
                <Link to="/" className="pitch-btn pitch-btn-primary pitch-btn-lg">
                  Launch Live Workspace <FaArrowRight />
                </Link>
                <a
                  href="https://github.com/shwet46/Kaizen"
                  target="_blank"
                  rel="noreferrer"
                  className="pitch-btn pitch-btn-outline pitch-btn-lg"
                >
                  <FaGithub /> View GitHub Repo
                </a>
              </div>
            </MotionReveal>

            {/* Contact Details Card (Centered) */}
            <MotionReveal delay={0.45}>
              <div
                style={{
                  maxWidth: "32rem",
                  margin: "0 auto",
                  textAlign: "left",
                  backgroundColor: "rgba(255, 255, 255, 0.06)",
                  border: "1.5px solid rgba(255, 255, 255, 0.16)",
                  boxShadow: "3px 3px 0px rgba(0, 0, 0, 0.3)",
                  padding: "1.75rem 2rem",
                  boxSizing: "border-box",
                }}
              >
                <span className="pitch-card-metric-label" style={{ color: "var(--pitch-yellow)" }}>Contact & Team</span>
                <div style={{ fontFamily: "var(--font-sans)", fontSize: "1.45rem", fontWeight: 700, color: "white", marginBottom: "0.85rem" }}>
                  Let's Connect
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  <a
                    href="https://www.linkedin.com/in/shweta-behera/"
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      color: "#93c5fd",
                      textDecoration: "none",
                      fontSize: "0.86rem",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <FaLinkedin style={{ color: "#60a5fa", fontSize: "1.1rem", flexShrink: 0 }} />
                    <span style={{ fontWeight: 600 }}>shweta-behera</span>
                  </a>
                  <a
                    href="https://www.linkedin.com/in/ojasvidoye/"
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      color: "#93c5fd",
                      textDecoration: "none",
                      fontSize: "0.86rem",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <FaLinkedin style={{ color: "#60a5fa", fontSize: "1.1rem", flexShrink: 0 }} />
                    <span style={{ fontWeight: 600 }}>ojasvidoye</span>
                  </a>
                  <a
                    href="https://www.linkedin.com/in/maitridalvi13/"
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      color: "#93c5fd",
                      textDecoration: "none",
                      fontSize: "0.86rem",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <FaLinkedin style={{ color: "#60a5fa", fontSize: "1.1rem", flexShrink: 0 }} />
                    <span style={{ fontWeight: 600 }}>maitridalvi13</span>
                  </a>
                </div>
              </div>
            </MotionReveal>
          </div>

          {/* Deck Footer */}
          <footer
            style={{
              marginTop: "4rem",
              paddingTop: "1.75rem",
              borderTop: "1px solid rgba(255, 255, 255, 0.15)",
              width: "100%",
              maxWidth: "72rem",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontSize: "0.78rem",
              color: "rgba(255, 255, 255, 0.5)",
              flexWrap: "wrap",
              gap: "0.75rem",
              position: "relative",
              zIndex: 10,
              paddingLeft: "1.5rem",
              paddingRight: "1.5rem",
              boxSizing: "border-box",
            }}
          >
            <span>Kaizen · Autonomous Engineering Capital Layer &copy; 2026</span>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span style={{ width: "6px", height: "6px", backgroundColor: "#10b981" }} />
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.72rem" }}>System Status: All Systems Operational</span>
            </div>
          </footer>
        </section>
      </div>
    </LenisProvider>
  );
}
