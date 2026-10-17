"use client";

import { useState } from "react";
import { Link } from "react-router-dom";
import "../styles/kaizen-landing.css";
import "../styles/kaizen-pitch.css";
import { LenisProvider } from "@/components/LenisProvider";
import {
  AnimatedSvgGradient,
  GooeyFilter,
  ScrambleText,
  TextHighlighter,
  TextRotate,
  Letter3DSwap,
  SimpleMarquee,
} from "@/components/FancyComponents";
import { BackgroundRippleEffect } from "@/components/ui/background-ripple-effect";
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
  LiaRocketSolid as FaRocket,
  LiaShieldAltSolid as FaShieldHalved,
  LiaCoinsSolid as FaCoins,
  LiaUsersSolid as FaUsers,
  LiaChartLineSolid as FaChartLine,
  LiaCodeBranchSolid as FaCodeBranch,
  LiaArrowRightSolid as FaArrowRight,
  LiaCheckSolid as FaCheck,
  LiaServerSolid as FaServer,
  LiaGithub as FaGithub,
  LiaSlack as FaSlack,
  LiaJira as FaJira,
  LiaCheckCircle as FaRegCircleCheck,
  LiaTachometerAltSolid as FaGaugeHigh,
  LiaHeartbeatSolid as FaHeartPulse,
  LiaBoltSolid as FaBolt,
  LiaDatabaseSolid as FaDatabase,
  LiaSlidersHSolid as FaSliders,
  LiaExclamationTriangleSolid as FaExclamationTriangle,
  LiaTimesSolid as FaTimes,
  LiaLayerGroupSolid as FaLayerGroup,
} from "react-icons/lia";

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
  const hoursSavedValue = Math.round((hoursSavedPerYear * (calcSalary / 2000)));
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
        <GooeyFilter />
        <AnimatedSvgGradient />

        {/* Minimal Bottom Quick Dock for Smooth Anchor Navigation */}
        <nav className="pitch-quick-dock" aria-label="Quick Jump">
          <a href="#hero">Overview</a>
          <a href="#problem">Problem</a>
          <a href="#solution">Engines</a>
          <a href="#market">Market</a>
          <a href="#graph-arch">Graph & Moat</a>
          <a href="#financials">FinOps</a>
          <a href="#roi">ROI Simulator</a>
          <a href="#model">Flywheel</a>
          <a href="#roadmap">Roadmap</a>
          <a href="#ask">The Ask</a>
        </nav>

        {/* ================================================================
            1. HERO SECTION: BRAND & LOGO IN FIRST SECTION (NO NAVBAR)
            ================================================================ */}
        <section className="pitch-hero" id="hero">
          <BackgroundRippleEffect />
          <div className="pitch-hero-container relative z-10">
            {/* Top Brand & Live App Launch Action */}
            <div className="pitch-hero-topbar">
              <Link to="/" className="pitch-hero-brand">
                <img src="/icon.svg" alt="Kaizen Icon" />
                <span className="pitch-hero-brand-name">Kaizen</span>
                <span className="pitch-hero-badge">
                  ✦ Series Seed · Pitch Briefing 2026
                </span>
              </Link>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Link to="/dashboard" className="btn btn-primary btn-sm">
                  <span>Launch Live Workspace</span>
                  <FaArrowRight style={{ fontSize: '0.75rem', marginLeft: '0.25rem' }} />
                </Link>
              </div>
            </div>

            {/* Main Headline */}
            <div style={{ textAlign: 'center', maxWidth: '1080px', margin: '0 auto' }}>
              <div className="inline-flex items-center gap-2 mb-4">
                <span className="pitch-section-eyebrow" style={{ color: "#4285F4", borderColor: "#4285F4" }}>
                  AUTONOMOUS ENGINEERING CAPITAL LAYER
                </span>
                <span className="pitch-section-eyebrow" style={{ color: "#34A853", borderColor: "#34A853" }}>
                  ENTERPRISE AI
                </span>
              </div>

              <h1 className="pitch-hero-title">
                Turn raw engineering signals into{" "}
                <TextHighlighter color="var(--accent-mint-light)" strokeColor="var(--accent-mint)">
                  boardroom certainty
                </TextHighlighter>
                .
              </h1>

              <p className="pitch-hero-subtitle">
                The enterprise operating layer that transforms Git, Jira, CI/CD, and Cloud telemetry into{" "}
                <strong style={{ color: '#202124', fontWeight: 600 }}>
                  <TextRotate
                    words={[
                      "statistical release forecasting",
                      "automated ASC 350-40 software capitalization",
                      "zero-surveillance workforce resilience",
                      "boardroom-ready delivery certainty",
                    ]}
                    interval={2800}
                  />
                </strong>
                .
              </p>

              {/* CTAs */}
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: '1rem', marginBottom: '2rem' }}>
                <Link to="/dashboard" className="btn btn-primary btn-lg">
                  <Letter3DSwap text="Launch Live Intelligence Workspace" />
                  <FaArrowRight style={{ marginLeft: '0.5rem' }} />
                </Link>
                <Link to="/dashboard/graph" className="btn btn-secondary btn-lg">
                  <span>Explore 3D Knowledge Graph</span>
                </Link>
                <a href="#roi" className="btn btn-secondary btn-lg">
                  <span>Calculate Enterprise ROI</span>
                </a>
              </div>

              {/* Live Telemetry Pill */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/85 backdrop-blur-md border border-gray-200 text-xs text-gray-600 shadow-xs mb-10">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Active Enterprise Telemetry: </span>
                <strong className="text-gray-900 font-mono">
                  <ScrambleText text="248 Engineers · 34 Repositories · 14.6 Deploys/Day" scrambleSpeed={30} />
                </strong>
              </div>

              {/* 3 Bold Metric Highlight Cards */}
              <div className="pitch-grid-3 text-left">
                <div className="pitch-card" style={{ borderLeft: "4px solid #4285F4" }}>
                  <span className="pitch-card-metric-label">Delivery Certainty</span>
                  <div className="pitch-card-metric-val" style={{ color: "#4285F4" }}>85%+</div>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    Monte Carlo probabilistic release date forecasting versus subjective 40% sprint guesswork.
                  </p>
                </div>

                <div className="pitch-card" style={{ borderLeft: "4px solid #FBBC05" }}>
                  <span className="pitch-card-metric-label">Automated CapEx Ledger</span>
                  <div className="pitch-card-metric-val" style={{ color: "#D97706" }}>$1.05M+</div>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    Monthly software R&D capital eligible for tax write-offs under ASC 350-40 GAAP with zero manual timesheets.
                  </p>
                </div>

                <div className="pitch-card" style={{ borderLeft: "4px solid #34A853" }}>
                  <span className="pitch-card-metric-label">Retention & Bus Factor</span>
                  <div className="pitch-card-metric-val" style={{ color: "#16A34A" }}>94.6%</div>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    Passive early detection of developer burnout and single-point-of-failure knowledge bottlenecks.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================================================================
            2. THE PROBLEM: The $2.4M Engineering Blindspot
            ================================================================ */}
        <section className="pitch-section" id="problem">
          <div className="pitch-container-inner">
            <div className="pitch-section-header">
              <span className="pitch-section-eyebrow" style={{ color: "#EA4335", borderColor: "#EA4335" }}>
                01 · THE ENTERPRISE PROBLEM
              </span>
              <h2 className="pitch-section-title">
                Engineering is the largest, most expensive{" "}
                <TextHighlighter color="var(--accent-peach-light)" strokeColor="var(--accent-peach)">
                  black box
                </TextHighlighter>{" "}
                in the modern enterprise.
              </h2>
              <p className="pitch-section-subtitle">
                C-suite executives and VP Engineering leaders fly blind at 100mph. Millions in R&D payroll bleed into delayed releases, uncaptured tax credits, and quiet engineer burnout.
              </p>
            </div>

            {/* 4 Problem Stat Cards */}
            <div className="pitch-grid-4 mb-8">
              <div className="pitch-card" style={{ background: "#FFF8F7", borderColor: "rgba(234,67,53,0.25)" }}>
                <div className="text-red-500 text-2xl mb-1"><FaExclamationTriangle /></div>
                <div className="pitch-card-metric-val text-red-600">42%</div>
                <span className="pitch-card-metric-label">Sprint Spillover</span>
                <p className="text-xs text-gray-600">Of engineering roadmaps miss committed release quarters.</p>
              </div>

              <div className="pitch-card" style={{ background: "#FFFDF5", borderColor: "rgba(251,188,5,0.3)" }}>
                <div className="text-amber-500 text-2xl mb-1"><FaCoins /></div>
                <div className="pitch-card-metric-val text-amber-600">$2.4M</div>
                <span className="pitch-card-metric-label">Lost CapEx Yield</span>
                <p className="text-xs text-gray-600">Per 100 devs in missed IRS Sec 41 and GAAP software capitalization.</p>
              </div>

              <div className="pitch-card" style={{ background: "#F8F6FF", borderColor: "rgba(126,87,194,0.25)" }}>
                <div className="text-purple-500 text-2xl mb-1"><FaUsers /></div>
                <div className="pitch-card-metric-val text-purple-600">18.4%</div>
                <span className="pitch-card-metric-label">Silent Attrition</span>
                <p className="text-xs text-gray-600">Senior engineers burning out undetected from review queue stalls.</p>
              </div>

              <div className="pitch-card" style={{ background: "#F0F7FF", borderColor: "rgba(66,133,244,0.25)" }}>
                <div className="text-blue-500 text-2xl mb-1"><FaServer /></div>
                <div className="pitch-card-metric-val text-blue-600">3.4 Days</div>
                <span className="pitch-card-metric-label">PR Latency Drag</span>
                <p className="text-xs text-gray-600">Average pull request sits idle before first meaningful review.</p>
              </div>
            </div>

            {/* Before vs With Kaizen Comparison Matrix */}
            <div className="pitch-matrix-wrap pitch-card p-0 mb-8">
              <table className="pitch-matrix">
                <thead>
                  <tr>
                    <th style={{ width: "25%" }}>Operational Dimension</th>
                    <th style={{ width: "37.5%", color: "#EA4335" }}>Traditional Status Quo</th>
                    <th style={{ width: "37.5%", color: "#16A34A" }}>With Kaizen Autonomous Layer</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="font-semibold text-gray-900">Sprint Delivery Forecasting</td>
                    <td className="text-red-700 bg-red-50/30">
                      <div className="flex items-center gap-2"><FaTimes className="text-red-500" /> Story point guessing; delays discovered during retrospectives</div>
                    </td>
                    <td className="text-emerald-800 bg-emerald-50/40 font-medium">
                      <div className="flex items-center gap-2"><FaCheck className="text-emerald-600" /> Monte Carlo statistical confidence intervals updated every commit</div>
                    </td>
                  </tr>
                  <tr>
                    <td className="font-semibold text-gray-900">Software CapEx (ASC 350-40)</td>
                    <td className="text-red-700 bg-red-50/30">
                      <div className="flex items-center gap-2"><FaTimes className="text-red-500" /> Engineers forced to log weekly timesheets nobody believes</div>
                    </td>
                    <td className="text-emerald-800 bg-emerald-50/40 font-medium">
                      <div className="flex items-center gap-2"><FaCheck className="text-emerald-600" /> 100% automated SHA commit & epic mapping directly to GAAP vouchers</div>
                    </td>
                  </tr>
                  <tr>
                    <td className="font-semibold text-gray-900">Talent Retention & Burnout</td>
                    <td className="text-red-700 bg-red-50/30">
                      <div className="flex items-center gap-2"><FaTimes className="text-red-500" /> Discovered when senior developer submits their 2-week notice</div>
                    </td>
                    <td className="text-emerald-800 bg-emerald-50/40 font-medium">
                      <div className="flex items-center gap-2"><FaCheck className="text-emerald-600" /> Passive detection of after-hours review spikes without surveillance</div>
                    </td>
                  </tr>
                  <tr>
                    <td className="font-semibold text-gray-900">PR Review Balancing</td>
                    <td className="text-red-700 bg-red-50/30">
                      <div className="flex items-center gap-2"><FaTimes className="text-red-500" /> Squad A overloaded with 40 PRs while Squad B has excess capacity</div>
                    </td>
                    <td className="text-emerald-800 bg-emerald-50/40 font-medium">
                      <div className="flex items-center gap-2"><FaCheck className="text-emerald-600" /> Closed-loop smart allocation rebalances reviewers across squads</div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* 4 Fatal Breakdowns Grid */}
            <div className="pitch-grid-2">
              <div className="pitch-card flex gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-xl flex-shrink-0">
                  <FaCodeBranch />
                </div>
                <div>
                  <h3 className="font-bold text-base text-gray-900 mb-1">01. PR Stagnation & Stalled Queues</h3>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    Code sits blocked in queues without cross-squad load balancing. Squad A is overloaded with 45 PRs while Squad B has excess review bandwidth, dragging cycle time by 35%.
                  </p>
                </div>
              </div>

              <div className="pitch-card flex gap-4">
                <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center text-xl flex-shrink-0">
                  <FaCoins />
                </div>
                <div>
                  <h3 className="font-bold text-base text-gray-900 mb-1">02. Manual ASC 350-40 CapEx Hell</h3>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    Finance forces engineers to fill subjective weekly timesheets. R&D capital is miscategorized, forfeiting enterprise tax credits and cloud unit cost attribution.
                  </p>
                </div>
              </div>

              <div className="pitch-card flex gap-4">
                <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center text-xl flex-shrink-0">
                  <FaUsers />
                </div>
                <div>
                  <h3 className="font-bold text-base text-gray-900 mb-1">03. Silent Burnout & Knowledge Silos</h3>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    Critical microservices rely on a single engineer who handles 80% of reviews (bus factor of 1). When they leave, core product delivery grinds to an absolute halt.
                  </p>
                </div>
              </div>

              <div className="pitch-card flex gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl flex-shrink-0">
                  <FaChartLine />
                </div>
                <div>
                  <h3 className="font-bold text-base text-gray-900 mb-1">04. Subjective Sprint Point Fiction</h3>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    Story points are arbitrary guesses. Traditional tooling cannot calculate probabilistic completion distributions across code churn complexity or dependency graphs.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================================================================
            3. THE SOLUTION: 4 Core Intelligence Engines
            ================================================================ */}
        <section className="pitch-section" id="solution">
          <div className="pitch-container-inner">
            <div className="pitch-section-header">
              <span className="pitch-section-eyebrow" style={{ color: "#4285F4", borderColor: "#4285F4" }}>
                02 · THE KAIZEN SOLUTION
              </span>
              <h2 className="pitch-section-title">
                Four autonomous engines. One unified operating plane.
              </h2>
              <p className="pitch-section-subtitle">
                Kaizen turns raw technical telemetry from Git, Jira, CI/CD, and cloud infrastructure into precision metrics for every leadership stakeholder.
              </p>
            </div>

            {/* Interactive Engine Tabs */}
            <div className="flex flex-wrap gap-2 mb-6">
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

            {/* Active Engine Card */}
            <div className="pitch-card p-6 bg-gradient-to-br from-blue-50/30 via-white to-gray-50 border-2 border-blue-500/30">
              {activeEngineTab === 0 && (
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <span className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center text-xl">
                      <FaHeartPulse />
                    </span>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">Predictive Release Forecasting & Monte Carlo Simulation</h3>
                      <p className="text-xs text-gray-500 font-mono">Probabilistic delivery confidence over Git PR queues</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 my-4 leading-relaxed max-w-3xl">
                    Replaces static release dates with statistical probability distributions. Detects PR latency stagnation 4 days before sprint reviews notice, auto-recommending reviewer reassignment.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
                    <div className="p-3 rounded-xl bg-white border border-gray-200 shadow-xs">
                      <div className="text-xs text-gray-500 uppercase font-mono">Cycle Time Reduction</div>
                      <div className="text-xl font-bold text-blue-600 font-mono mt-1">↓ 18.2% MoM</div>
                      <p className="text-[11px] text-gray-500 mt-1">Shaved 1.2 days off average PR cycle</p>
                    </div>
                    <div className="p-3 rounded-xl bg-white border border-gray-200 shadow-xs">
                      <div className="text-xs text-gray-500 uppercase font-mono">Forecast Confidence</div>
                      <div className="text-xl font-bold text-emerald-600 font-mono mt-1">85.4%</div>
                      <p className="text-[11px] text-gray-500 mt-1">Probabilistic adherence to quarter deadlines</p>
                    </div>
                    <div className="p-3 rounded-xl bg-white border border-gray-200 shadow-xs">
                      <div className="text-xs text-gray-500 uppercase font-mono">Early Warning Lead</div>
                      <div className="text-xl font-bold text-purple-600 font-mono mt-1">4 Days Ahead</div>
                      <p className="text-[11px] text-gray-500 mt-1">Bottlenecks flagged before retrospectives</p>
                    </div>
                  </div>
                </div>
              )}

              {activeEngineTab === 1 && (
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <span className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center text-xl">
                      <FaCoins />
                    </span>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">Automated Software Capitalization (ASC 350-40 GAAP)</h3>
                      <p className="text-xs text-gray-500 font-mono">Algorithmic commit SHA mapping directly to GAAP CapEx schedules</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 my-4 leading-relaxed max-w-3xl">
                    Zero manual timesheets. Kaizen traces Git commit messages, Jira epics, and pull requests directly into capitalized R&D vs maintenance operating expenses, producing audit-ready schedules for Big 4 accounting firms.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
                    <div className="p-3 rounded-xl bg-white border border-gray-200 shadow-xs">
                      <div className="text-xs text-gray-500 uppercase font-mono">CapEx Mapped</div>
                      <div className="text-xl font-bold text-amber-600 font-mono mt-1">$1.05M / mo</div>
                      <p className="text-[11px] text-gray-500 mt-1">Eligible R&D software payroll</p>
                    </div>
                    <div className="p-3 rounded-xl bg-white border border-gray-200 shadow-xs">
                      <div className="text-xs text-gray-500 uppercase font-mono">IRS Sec 41 Credit</div>
                      <div className="text-xl font-bold text-emerald-600 font-mono mt-1">$412k Found</div>
                      <p className="text-[11px] text-gray-500 mt-1">Direct enterprise tax recovery</p>
                    </div>
                    <div className="p-3 rounded-xl bg-white border border-gray-200 shadow-xs">
                      <div className="text-xs text-gray-500 uppercase font-mono">Timesheet Overhead</div>
                      <div className="text-xl font-bold text-blue-600 font-mono mt-1">0 Hours / Month</div>
                      <p className="text-[11px] text-gray-500 mt-1">100% automated metadata extraction</p>
                    </div>
                  </div>
                </div>
              )}

              {activeEngineTab === 2 && (
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <span className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center text-xl">
                      <FaUsers />
                    </span>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">Passive Burnout & Bus Factor Protection</h3>
                      <p className="text-xs text-gray-500 font-mono">Non-invasive metadata analysis without keystroke spying</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 my-4 leading-relaxed max-w-3xl">
                    Identifies after-hours commit spikes, code review pressure, and single-point-of-failure microservices where critical knowledge lives in only one engineer's head, enabling proactive support before resignation.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
                    <div className="p-3 rounded-xl bg-white border border-gray-200 shadow-xs">
                      <div className="text-xs text-gray-500 uppercase font-mono">Retention Rate</div>
                      <div className="text-xl font-bold text-purple-600 font-mono mt-1">94.6%</div>
                      <p className="text-[11px] text-gray-500 mt-1">Top-decile engineering retention</p>
                    </div>
                    <div className="p-3 rounded-xl bg-white border border-gray-200 shadow-xs">
                      <div className="text-xs text-gray-500 uppercase font-mono">Bus Factors Resolved</div>
                      <div className="text-xl font-bold text-emerald-600 font-mono mt-1">14 Squads</div>
                      <p className="text-[11px] text-gray-500 mt-1">Knowledge distribution rebalanced</p>
                    </div>
                    <div className="p-3 rounded-xl bg-white border border-gray-200 shadow-xs">
                      <div className="text-xs text-gray-500 uppercase font-mono">Privacy Trust</div>
                      <div className="text-xl font-bold text-blue-600 font-mono mt-1">100% Non-Invasive</div>
                      <p className="text-[11px] text-gray-500 mt-1">Zero surveillance, zero keylogging</p>
                    </div>
                  </div>
                </div>
              )}

              {activeEngineTab === 3 && (
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <span className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-xl">
                      <FaGaugeHigh />
                    </span>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">Elite DORA Telemetry & AI Assistant ROI</h3>
                      <p className="text-xs text-gray-500 font-mono">Quantifying the true business yield of modern AI assistants</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 my-4 leading-relaxed max-w-3xl">
                    Measures deployment frequency, lead time to changes, and MTTR while attributing capacity gains from tools like GitHub Copilot and Cursor directly to feature delivery velocity.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
                    <div className="p-3 rounded-xl bg-white border border-gray-200 shadow-xs">
                      <div className="text-xs text-gray-500 uppercase font-mono">Deploy Frequency</div>
                      <div className="text-xl font-bold text-emerald-600 font-mono mt-1">14.6 / Day</div>
                      <p className="text-[11px] text-gray-500 mt-1">DORA Elite Performance Tier</p>
                    </div>
                    <div className="p-3 rounded-xl bg-white border border-gray-200 shadow-xs">
                      <div className="text-xs text-gray-500 uppercase font-mono">AI Adoption Yield</div>
                      <div className="text-xl font-bold text-blue-600 font-mono mt-1">9.8x Net ROI</div>
                      <p className="text-[11px] text-gray-500 mt-1">Direct engineering output attribution</p>
                    </div>
                    <div className="p-3 rounded-xl bg-white border border-gray-200 shadow-xs">
                      <div className="text-xs text-gray-500 uppercase font-mono">Capacity Won</div>
                      <div className="text-xl font-bold text-purple-600 font-mono mt-1">410 hrs / mo</div>
                      <p className="text-[11px] text-gray-500 mt-1">Across 208 active developers</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-6 pt-3 border-t border-gray-200 flex justify-between items-center text-xs">
                <span className="text-gray-500">Connected to GitHub, Jira, CI/CD, Datadog & Cloud Billing APIs</span>
                <Link to="/dashboard" className="text-blue-600 font-bold hover:underline flex items-center gap-1">
                  Open Interactive Workspace <FaArrowRight />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ================================================================
            4. MARKET SIZE & TAM: Recharts Graph
            ================================================================ */}
        <section className="pitch-section" id="market">
          <div className="pitch-container-inner">
            <div className="pitch-section-header">
              <span className="pitch-section-eyebrow" style={{ color: "#34A853", borderColor: "#34A853" }}>
                03 · MARKET OPPORTUNITY
              </span>
              <h2 className="pitch-section-title">
                A massive <span style={{ color: "#16A34A" }}>$62B</span> convergence of Value Stream, FinOps, and AI Ops.
              </h2>
              <p className="pitch-section-subtitle">
                As AI assistants accelerate code generation, engineering leadership urgently needs an automated capital & delivery intelligence layer.
              </p>
            </div>

            <div className="pitch-grid-3 mb-6">
              <div className="pitch-card" style={{ borderTop: "4px solid #4285F4" }}>
                <span className="pitch-card-metric-label">TAM (Total Addressable)</span>
                <div className="pitch-card-metric-val" style={{ color: "#4285F4" }}>$62B</div>
                <p className="text-sm font-semibold text-gray-800">
                  Global DevSecOps, VSM & Engineering Management
                </p>
                <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                  Spans 30M+ global professional software developers and 280k software enterprises.
                </p>
              </div>

              <div className="pitch-card" style={{ borderTop: "4px solid #FBBC05" }}>
                <span className="pitch-card-metric-label">SAM (Serviceable Addressable)</span>
                <div className="pitch-card-metric-val" style={{ color: "#D97706" }}>$18B</div>
                <p className="text-sm font-semibold text-gray-800">
                  Mid-to-Large Orgs (50–5,000+ Engineers)
                </p>
                <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                  Organizations running GitHub/GitLab + Jira with strict board governance & CapEx requirements.
                </p>
              </div>

              <div className="pitch-card" style={{ borderTop: "4px solid #34A853" }}>
                <span className="pitch-card-metric-label">SOM (Serviceable Obtainable)</span>
                <div className="pitch-card-metric-val" style={{ color: "#16A34A" }}>$3.8B</div>
                <p className="text-sm font-semibold text-gray-800">
                  AI-Native FinOps & Telemetry Layer
                </p>
                <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                  Initial wedge targeting tech-forward enterprises seeking immediate CapEx write-offs & DORA ROI.
                </p>
              </div>
            </div>

            {/* Recharts Bar Chart Card */}
            <div className="pitch-card">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <span className="text-xs font-mono font-bold text-gray-700 uppercase tracking-wider block">
                    Market Growth & Enterprise Telemetry Expansion ($B)
                  </span>
                  <span className="text-xs text-gray-500">Global Value Stream & Engineering FinOps Adoption</span>
                </div>
                <span className="text-xs font-mono text-emerald-600 font-bold bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                  28.4% 5-Year CAGR
                </span>
              </div>
              <div style={{ width: "100%", height: 210 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={marketData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis dataKey="year" tick={{ fontSize: 12, fontFamily: "monospace" }} />
                    <YAxis tick={{ fontSize: 12, fontFamily: "monospace" }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#202124",
                        borderRadius: "8px",
                        border: "none",
                        color: "#fff",
                        fontSize: "12px",
                      }}
                    />
                    <Bar dataKey="market" name="Market Size ($B)" fill="#4285F4" radius={[6, 6, 0, 0]}>
                      {marketData.map((_, i) => (
                        <Cell key={`cell-${i}`} fill={i === 2 ? "#34A853" : "#4285F4"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </section>

        {/* ================================================================
            5. KNOWLEDGE GRAPH TOPOLOGY & ARCHITECTURE MOAT
            ================================================================ */}
        <section className="pitch-section" id="graph-arch">
          <div className="pitch-container-inner">
            <div className="pitch-section-header">
              <span className="pitch-section-eyebrow" style={{ color: "#FBBC05", borderColor: "#FBBC05" }}>
                04 · KNOWLEDGE GRAPH & ARCHITECTURE MOAT
              </span>
              <h2 className="pitch-section-title">
                Multi-dimensional graph intelligence with zero surveillance.
              </h2>
              <p className="pitch-section-subtitle">
                Our unfair advantage: Neo4j knowledge graphs link code churn and PR dependencies directly to financial CapEx ledgers, powered by Gemini LLM reasoning on Google Vertex AI.
              </p>
            </div>

            {/* Interactive Graph Pipeline Topology */}
            <div className="pitch-topology-container mb-8">
              <div className="flex justify-between items-center mb-4">
                <span className="text-xs font-mono font-bold text-gray-700 uppercase tracking-wider">
                  Live Multi-Model Knowledge Graph Architecture
                </span>
                <span className="text-xs font-mono text-blue-600 font-semibold bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200">
                  Sub-second WebSocket Telemetry
                </span>
              </div>

              <div className="pitch-topology-grid">
                <div className="pitch-topology-node">
                  <span className="pitch-topology-badge text-blue-600">01 · REPOSITORIES</span>
                  <div className="font-bold text-sm text-gray-900 flex items-center gap-2">
                    <FaGithub /> GitHub & GitLab
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Webhook events, commit SHAs, line diffs & PR metadata</p>
                </div>

                <div className="pitch-topology-node">
                  <span className="pitch-topology-badge text-purple-600">02 · WORKFORCE</span>
                  <div className="font-bold text-sm text-gray-900 flex items-center gap-2">
                    <FaUsers /> Squads & Devs
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Review latency, after-hours burnout cues & bus factor</p>
                </div>

                <div className="pitch-topology-node">
                  <span className="pitch-topology-badge text-amber-600">03 · EPICS & TASKS</span>
                  <div className="font-bold text-sm text-gray-900 flex items-center gap-2">
                    <FaJira /> Jira & Linear
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Story dependencies, epic milestones & velocity blockers</p>
                </div>

                <div className="pitch-topology-node">
                  <span className="pitch-topology-badge text-red-600">04 · CLOUD INFRA</span>
                  <div className="font-bold text-sm text-gray-900 flex items-center gap-2">
                    <FaServer /> AWS & GCP
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Kubernetes clusters, serverless unit cost & idle compute</p>
                </div>

                <div className="pitch-topology-node">
                  <span className="pitch-topology-badge text-emerald-600">05 · FINANCIAL LEDGER</span>
                  <div className="font-bold text-sm text-gray-900 flex items-center gap-2">
                    <FaCoins /> GAAP CapEx
                  </div>
                  <p className="text-xs text-gray-500 mt-2">ASC 350-40 vouchers & IRS Sec 41 tax schedules</p>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-gray-200 flex flex-wrap justify-between items-center text-xs text-gray-500 gap-2">
                <span className="flex items-center gap-2">
                  <FaDatabase className="text-amber-500" />
                  <strong>Database Stack:</strong> Neo4j Graph DB + MongoDB Atlas Multi-Model Store
                </span>
                <span className="flex items-center gap-2">
                  <FaBolt className="text-purple-600" />
                  <strong>Reasoning Core:</strong> Gemini 1.5 Pro / 2.0 Flash via Google Vertex AI
                </span>
              </div>
            </div>

            {/* Delivery Velocity & Cycle Time Graph */}
            <div className="pitch-grid-2">
              <div className="pitch-card">
                <div className="flex justify-between items-center mb-3">
                  <div>
                    <span className="text-xs font-mono font-bold text-gray-700 uppercase tracking-wider block">
                      PR Review Latency Drop (Days)
                    </span>
                    <span className="text-xs text-gray-500">From 5.4 days to 2.1 days via smart squad rebalancing</span>
                  </div>
                  <span className="text-xs font-mono text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded">
                    -61% Latency
                  </span>
                </div>
                <div style={{ width: "100%", height: 170 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={cycleTimeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="latencyGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#4285F4" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#4285F4" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                      <XAxis dataKey="week" tick={{ fontSize: 10, fontFamily: "monospace" }} />
                      <YAxis tick={{ fontSize: 10, fontFamily: "monospace" }} />
                      <Tooltip contentStyle={{ backgroundColor: "#202124", borderRadius: "8px", color: "#fff", fontSize: "12px" }} />
                      <Area type="monotone" dataKey="latencyDays" stroke="#4285F4" strokeWidth={2.5} fillOpacity={1} fill="url(#latencyGradient)" name="PR Latency (Days)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="pitch-card">
                <div className="flex justify-between items-center mb-3">
                  <div>
                    <span className="text-xs font-mono font-bold text-gray-700 uppercase tracking-wider block">
                      Sprint Milestone Adherence (%)
                    </span>
                    <span className="text-xs text-gray-500">Monte Carlo probabilistic forecasting adherence</span>
                  </div>
                  <span className="text-xs font-mono text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded">
                    96% High Confidence
                  </span>
                </div>
                <div style={{ width: "100%", height: 170 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={cycleTimeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="adherenceGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#34A853" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#34A853" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                      <XAxis dataKey="week" tick={{ fontSize: 10, fontFamily: "monospace" }} />
                      <YAxis tick={{ fontSize: 10, fontFamily: "monospace" }} />
                      <Tooltip contentStyle={{ backgroundColor: "#202124", borderRadius: "8px", color: "#fff", fontSize: "12px" }} />
                      <Area type="monotone" dataKey="adherence" stroke="#34A853" strokeWidth={2.5} fillOpacity={1} fill="url(#adherenceGradient)" name="Adherence (%)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================================================================
            6. FINANCIAL R&D CAPITALIZATION & FINOPS
            ================================================================ */}
        <section className="pitch-section" id="financials">
          <div className="pitch-container-inner">
            <div className="pitch-section-header">
              <span className="pitch-section-eyebrow" style={{ color: "#FBBC05", borderColor: "#FBBC05" }}>
                05 · FINOPS & ASC 350-40 GAAP CAPITALIZATION
              </span>
              <h2 className="pitch-section-title">
                Turning engineering code commits into millions in capitalizable assets.
              </h2>
              <p className="pitch-section-subtitle">
                Software R&D represents up to 70% of an enterprise tech company's spend. Kaizen replaces inaccurate manual timesheets with automated, immutable commit-to-CapEx attribution.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              {/* Financial CapEx Chart */}
              <div className="lg:col-span-7 pitch-card">
                <div className="flex justify-between items-center mb-3">
                  <div>
                    <span className="text-xs font-mono font-bold text-gray-700 uppercase tracking-wider block">
                      Quarterly Software R&D Capitalization ($k)
                    </span>
                    <span className="text-xs text-gray-500">Automated ASC 350-40 GAAP Journal Entries</span>
                  </div>
                  <span className="text-xs font-mono text-amber-700 font-bold bg-amber-100 px-2.5 py-1 rounded">
                    Audit-Ready (PwC/EY/KPMG)
                  </span>
                </div>
                <div style={{ width: "100%", height: 210 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={financialCapExData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                      <XAxis dataKey="quarter" tick={{ fontSize: 11, fontFamily: "monospace" }} />
                      <YAxis tick={{ fontSize: 11, fontFamily: "monospace" }} />
                      <Tooltip contentStyle={{ backgroundColor: "#202124", borderRadius: "8px", color: "#fff", fontSize: "12px" }} />
                      <Bar dataKey="capex" name="CapEx Capitalized ($k)" fill="#FBBC05" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="taxCredits" name="IRS Sec 41 Credit ($k)" fill="#34A853" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Financial Value Cards */}
              <div className="lg:col-span-5 flex flex-col gap-3">
                <div className="pitch-card bg-amber-50/50 border-amber-200">
                  <span className="pitch-card-metric-label text-amber-800">GAAP Compliance With 0 Timesheets</span>
                  <div className="pitch-card-metric-val text-amber-700">$1.24M / qtr</div>
                  <p className="text-xs text-gray-600 mt-1">
                    Every commit SHA is mathematically classified into capitalizable feature R&D vs maintenance OPEX.
                  </p>
                </div>

                <div className="pitch-card bg-emerald-50/50 border-emerald-200">
                  <span className="pitch-card-metric-label text-emerald-800">IRS Section 41 R&D Tax Recovery</span>
                  <div className="pitch-card-metric-val text-emerald-700">$412k Found</div>
                  <p className="text-xs text-gray-600 mt-1">
                    Direct cash flow savings captured from qualified engineering wage research expenses.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================================================================
            7. INTERACTIVE ROI SIMULATOR
            ================================================================ */}
        <section className="pitch-section" id="roi">
          <div className="pitch-container-inner">
            <div className="pitch-section-header">
              <span className="pitch-section-eyebrow" style={{ color: "#34A853", borderColor: "#34A853" }}>
                06 · INTERACTIVE ROI SIMULATOR
              </span>
              <h2 className="pitch-section-title">
                Quantifiable enterprise yield that pays for itself in{" "}
                <TextHighlighter color="var(--accent-mint-light)" strokeColor="var(--accent-mint)">
                  {paybackDays} days
                </TextHighlighter>
                .
              </h2>
              <p className="pitch-section-subtitle">
                Slide engineering headcount and compensation below to simulate total annual economic value creation.
              </p>
            </div>

            <div className="pitch-roi-box">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                {/* Sliders Input Column */}
                <div className="lg:col-span-5 bg-gray-50/80 p-6 rounded-2xl border border-gray-200">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold text-gray-500 uppercase mb-5">
                    <FaSliders className="text-blue-500" /> Organization Parameters
                  </div>

                  <div className="mb-6">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-semibold text-gray-800">Engineering Headcount</span>
                      <span className="font-mono text-base font-bold text-blue-600">{calcDevs} Engineers</span>
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
                    <div className="flex justify-between text-[11px] text-gray-400 font-mono mt-1">
                      <span>25 Devs</span>
                      <span>300 Devs</span>
                      <span>600+ Devs</span>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-semibold text-gray-800">Avg Fully-Loaded Developer Salary</span>
                      <span className="font-mono text-base font-bold text-emerald-600">
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
                    <div className="flex justify-between text-[11px] text-gray-400 font-mono mt-1">
                      <span>$90k</span>
                      <span>$160k</span>
                      <span>$240k</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-gray-200 text-xs text-gray-500">
                    Total Annual Engineering Payroll: <strong className="text-gray-900 font-mono">${(annualPayroll / 1000000).toFixed(2)}M</strong>
                  </div>
                </div>

                {/* Calculated Outputs Column */}
                <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="pitch-card bg-amber-50/40 border-amber-200">
                    <span className="pitch-card-metric-label text-amber-800">CapEx Tax Recovery</span>
                    <div className="pitch-card-metric-val text-amber-600">
                      +${(capExRecovered / 1000).toFixed(0)}k / yr
                    </div>
                    <p className="text-xs text-gray-600 mt-1">
                      Software R&D capitalized under ASC 350-40 and IRS Section 41.
                    </p>
                  </div>

                  <div className="pitch-card bg-blue-50/40 border-blue-200">
                    <span className="pitch-card-metric-label text-blue-800">Cycle Time Hours Won</span>
                    <div className="pitch-card-metric-val text-blue-600">
                      +{hoursSavedPerYear.toLocaleString()} hrs
                    </div>
                    <p className="text-xs text-gray-600 mt-1">
                      Worth ~${(hoursSavedValue / 1000).toFixed(0)}k in engineering velocity & zero timesheet overhead.
                    </p>
                  </div>

                  <div className="pitch-card bg-purple-50/40 border-purple-200">
                    <span className="pitch-card-metric-label text-purple-800">Turnover Cost Avoided</span>
                    <div className="pitch-card-metric-val text-purple-600">
                      +${(turnoverCostAvoided / 1000).toFixed(0)}k / yr
                    </div>
                    <p className="text-xs text-gray-600 mt-1">
                      {seniorReplacementsAvoided} senior departures mitigated via early burnout triage.
                    </p>
                  </div>

                  <div className="pitch-card bg-emerald-50/60 border-2 border-emerald-500">
                    <span className="pitch-card-metric-label text-emerald-900">Net Annual Value Creation</span>
                    <div className="pitch-card-metric-val text-emerald-700">
                      ${(totalAnnualYield / 1000000).toFixed(2)}M
                    </div>
                    <div className="text-xs font-bold text-emerald-800 mt-1">
                      {netRoiRatio}x Net ROI · Payback Period: {paybackDays} Days
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 rounded-xl bg-gray-50 border border-gray-200 flex flex-col sm:flex-row justify-between items-center text-xs gap-2">
                <span className="text-gray-600">
                  Kaizen Enterprise Investment: <strong className="text-gray-900 font-mono">${(kaizenAnnualCost / 1000).toFixed(1)}k / yr</strong> ($49/developer/month)
                </span>
                <span className="font-mono text-emerald-700 font-bold bg-emerald-100 px-3 py-1 rounded-full">
                  Guaranteed 10x ROI in Enterprise Pilot
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ================================================================
            8. BUSINESS MODEL & FLYWHEEL
            ================================================================ */}
        <section className="pitch-section" id="model">
          <div className="pitch-container-inner">
            <div className="pitch-section-header">
              <span className="pitch-section-eyebrow" style={{ color: "#7E57C2", borderColor: "#7E57C2" }}>
                07 · BUSINESS MODEL & FLYWHEEL
              </span>
              <h2 className="pitch-section-title">
                Bottom-up squad adoption meets top-down CFO expansion.
              </h2>
              <p className="pitch-section-subtitle">
                A frictionless self-serve entry point creates viral squad usage, which triggers enterprise-wide rollout when finance sees CapEx ROI.
              </p>
            </div>

            <div className="pitch-grid-3 mb-6">
              <div className="pitch-card flex flex-col justify-between">
                <div>
                  <span className="text-xs font-mono text-gray-500 uppercase font-semibold">Squad Pilot</span>
                  <div className="text-3xl font-bold font-mono text-gray-900 mt-2 mb-4">
                    $29 <span className="text-sm text-gray-500 font-normal">/ dev / mo</span>
                  </div>
                  <ul className="text-xs text-gray-600 space-y-2">
                    <li className="flex items-center gap-2"><FaCheck className="text-emerald-500" /> Git & Jira Telemetry Ingestion</li>
                    <li className="flex items-center gap-2"><FaCheck className="text-emerald-500" /> PR Queue Stagnation Alerts</li>
                    <li className="flex items-center gap-2"><FaCheck className="text-emerald-500" /> Basic DORA Velocity Metrics</li>
                  </ul>
                </div>
                <div className="text-xs text-gray-400 mt-6 pt-3 border-t border-gray-100 font-mono">
                  Self-Serve Setup (5 mins)
                </div>
              </div>

              <div className="pitch-card border-2 border-blue-500 bg-blue-50/20 shadow-md flex flex-col justify-between relative">
                <span className="absolute -top-3 right-6 bg-blue-600 text-white text-[11px] font-mono px-3 py-0.5 rounded-full uppercase tracking-wider font-bold">
                  Flagship
                </span>
                <div>
                  <span className="text-xs font-mono text-blue-600 uppercase font-bold">Enterprise Scale</span>
                  <div className="text-3xl font-bold font-mono text-gray-900 mt-2 mb-4">
                    $49 <span className="text-sm text-gray-500 font-normal">/ dev / mo</span>
                  </div>
                  <ul className="text-xs text-gray-700 space-y-2">
                    <li className="flex items-center gap-2"><FaCheck className="text-blue-600" /> Monte Carlo Delay Forecasting</li>
                    <li className="flex items-center gap-2"><FaCheck className="text-blue-600" /> Automated ASC 350-40 CapEx Ledger</li>
                    <li className="flex items-center gap-2"><FaCheck className="text-blue-600" /> Neo4j 3D Knowledge Graph</li>
                    <li className="flex items-center gap-2"><FaCheck className="text-blue-600" /> Retention Risk & Bus Factor Engine</li>
                  </ul>
                </div>
                <div className="text-xs text-blue-600 font-bold mt-6 pt-3 border-t border-blue-100 font-mono">
                  ACV: $58k - $145k / year
                </div>
              </div>

              <div className="pitch-card flex flex-col justify-between">
                <div>
                  <span className="text-xs font-mono text-purple-600 uppercase font-bold">Global Strategic</span>
                  <div className="text-3xl font-bold font-mono text-gray-900 mt-2 mb-4">
                    Custom <span className="text-sm text-gray-500 font-normal">/ enterprise</span>
                  </div>
                  <ul className="text-xs text-gray-600 space-y-2">
                    <li className="flex items-center gap-2"><FaCheck className="text-purple-600" /> Dedicated Vertex AI Instance</li>
                    <li className="flex items-center gap-2"><FaCheck className="text-purple-600" /> SAP & Workday ERP Auto-Sync</li>
                    <li className="flex items-center gap-2"><FaCheck className="text-purple-600" /> Sarvam Voice Executive Briefings</li>
                    <li className="flex items-center gap-2"><FaCheck className="text-purple-600" /> Bespoke 99.99% Enterprise SLA</li>
                  </ul>
                </div>
                <div className="text-xs text-purple-600 font-bold mt-6 pt-3 border-t border-gray-100 font-mono">
                  ACV: $180k - $450k+
                </div>
              </div>
            </div>

            {/* Flywheel Progression */}
            <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 text-xs">
              <span className="font-mono text-gray-500 uppercase block mb-1">GTM Expansion Flywheel:</span>
              <div className="flex flex-wrap items-center gap-3 font-semibold text-gray-800">
                <span>1. Dev Lead Installs GitHub App</span>
                <span className="text-gray-400">→</span>
                <span>2. Squad PR Queue Unblocked</span>
                <span className="text-gray-400">→</span>
                <span>3. VP Eng Standardizes Sprint Forecasting</span>
                <span className="text-gray-400">→</span>
                <span>4. CFO Mandates ASC 350-40 CapEx Ledger</span>
              </div>
            </div>
          </div>
        </section>

        {/* ================================================================
            9. ROADMAP & EXECUTION
            ================================================================ */}
        <section className="pitch-section" id="roadmap">
          <div className="pitch-container-inner">
            <div className="pitch-section-header">
              <span className="pitch-section-eyebrow" style={{ color: "#4285F4", borderColor: "#4285F4" }}>
                08 · ROADMAP & EXECUTION
              </span>
              <h2 className="pitch-section-title">
                From engineering observability to autonomous execution.
              </h2>
              <p className="pitch-section-subtitle">
                We've proven core telemetry ingestion and 3D graph modeling. Our next milestone delivers autonomous closed-loop squad orchestration.
              </p>
            </div>

            <div className="pitch-grid-4 mb-6">
              <div className="pitch-card border-emerald-300 bg-emerald-50/30">
                <span className="text-[10px] font-mono font-bold text-emerald-700 uppercase bg-emerald-100 px-2 py-0.5 rounded">
                  Q4 2025 · SHIPPED
                </span>
                <h4 className="font-bold text-sm text-gray-900 mt-3 mb-1">Graph & Forecasting Core</h4>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Multi-repo Git ingestion, Neo4j 3D graph, Monte Carlo delay prediction, meeting transcript AI feature extractor.
                </p>
              </div>

              <div className="pitch-card border-blue-400 bg-blue-50/40">
                <span className="text-[10px] font-mono font-bold text-blue-700 uppercase bg-blue-100 px-2 py-0.5 rounded">
                  Q1-Q2 2026 · ACTIVE
                </span>
                <h4 className="font-bold text-sm text-gray-900 mt-3 mb-1">FinOps & Voice Briefings</h4>
                <p className="text-xs text-gray-600 leading-relaxed">
                  ASC 350-40 automated journal vouchers, Sarvam AI voice briefings, real-time PR rebalancing engine.
                </p>
              </div>

              <div className="pitch-card">
                <span className="text-[10px] font-mono font-bold text-purple-700 uppercase bg-purple-100 px-2 py-0.5 rounded">
                  Q3 2026 · IN FLIGHT
                </span>
                <h4 className="font-bold text-sm text-gray-900 mt-3 mb-1">Cloud Unit Attribution</h4>
                <p className="text-xs text-gray-600 leading-relaxed">
                  AWS CUR and GCP BigQuery billing telemetry mapped directly to individual software features & customer ARR.
                </p>
              </div>

              <div className="pitch-card">
                <span className="text-[10px] font-mono font-bold text-amber-700 uppercase bg-amber-100 px-2 py-0.5 rounded">
                  2027 · VISION
                </span>
                <h4 className="font-bold text-sm text-gray-900 mt-3 mb-1">Autonomous Agentic SDLC</h4>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Autonomous squad capacity matching where AI agents assist in unblocking code workflows and review queues.
                </p>
              </div>
            </div>

            <div className="pitch-card flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <span className="text-xs text-gray-500 uppercase font-mono block">Design Partner Traction</span>
                <div className="text-base font-bold text-gray-900 mt-1">
                  3 Enterprise Design Partners · 248 Monitored Engineers · 99.9% Uptime
                </div>
              </div>
              <span className="text-xs font-mono font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                SOC2 Type II Audit Ready
              </span>
            </div>
          </div>
        </section>

        {/* ================================================================
            10. THE ASK & NEXT STEPS
            ================================================================ */}
        <section className="pitch-section" id="ask">
          <div className="pitch-container-inner">
            <div className="pitch-section-header">
              <span className="pitch-section-eyebrow" style={{ color: "#34A853", borderColor: "#34A853" }}>
                09 · THE ASK & NEXT STEPS
              </span>
              <h2 className="pitch-section-title">
                Join us in building the{" "}
                <TextHighlighter color="var(--accent-lavender-light)" strokeColor="var(--accent-lavender)">
                  operating layer for software capital
                </TextHighlighter>
                .
              </h2>
              <p className="pitch-section-subtitle">
                We are raising our Seed round to accelerate enterprise integrations, deepen our Gemini-powered reasoning core on Vertex AI, and expand commercial pilots.
              </p>
            </div>

            <div className="pitch-grid-3 mb-8">
              <div className="pitch-card">
                <span className="text-xs font-mono text-blue-600 font-semibold uppercase">The Round</span>
                <div className="text-4xl font-extrabold font-mono text-gray-900 mt-2 mb-2">$3.5M</div>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Seed round with participation from leading dev tools & enterprise AI investors.
                </p>
              </div>

              <div className="pitch-card">
                <span className="text-xs font-mono text-emerald-600 font-semibold uppercase">Use of Funds</span>
                <div className="text-xs text-gray-700 font-mono space-y-2 mt-3">
                  <div className="flex justify-between"><span>Core AI & Graph Eng</span><strong>50%</strong></div>
                  <div className="flex justify-between"><span>Enterprise GTM & Pilots</span><strong>30%</strong></div>
                  <div className="flex justify-between"><span>Security & Compliance</span><strong>20%</strong></div>
                </div>
              </div>

              <div className="pitch-card">
                <span className="text-xs font-mono text-purple-600 font-semibold uppercase">18-Month Milestones</span>
                <div className="text-xs text-gray-700 space-y-2 mt-3">
                  <div className="flex items-center gap-1.5"><FaCheck className="text-emerald-500" /> 25 Enterprise Pilots ($1.2M ARR)</div>
                  <div className="flex items-center gap-1.5"><FaCheck className="text-emerald-500" /> Deep SAP & Jira Cloud integrations</div>
                  <div className="flex items-center gap-1.5"><FaCheck className="text-emerald-500" /> SOC2 Type II Certification</div>
                </div>
              </div>
            </div>

            {/* High-Converting Final Banner */}
            <div className="p-8 rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
              <div>
                <span className="text-xs font-mono uppercase tracking-widest text-blue-200 font-bold block mb-1">
                  KAIZEN ENTERPRISE PLATFORM
                </span>
                <h3 className="font-serif text-3xl font-medium text-white mb-2">
                  Experience the live intelligence engine right now.
                </h3>
                <p className="text-sm text-blue-100 max-w-xl">
                  Explore the interactive dashboard, simulate Monte Carlo delivery delays, and test our 3D knowledge graph with live telemetry.
                </p>
              </div>
              <div className="flex items-center gap-4 flex-shrink-0">
                <Link
                  to="/dashboard"
                  className="px-6 py-3 rounded-xl bg-white text-gray-900 font-bold text-sm shadow-lg hover:bg-gray-100 transition flex items-center gap-2"
                >
                  <span>Launch Live Workspace</span>
                  <FaArrowRight />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ================================================================
            INFINITE MARQUEE FOOTER
            ================================================================ */}
        <footer className="border-t border-gray-200 bg-white py-4 relative z-10">
          <SimpleMarquee speed={36} pauseOnHover={true}>
            {[
              "14.6 Deploys / Day (DORA Elite Tier)",
              "$1.05M / Month ASC 350-40 GAAP CapEx R&D Mapped",
              "18.2% Cycle Time Reduction within 30 days",
              "Neo4j Knowledge Graph + Vertex AI Gemini Reasoning",
              "Zero Keystroke Surveillance: 100% Privacy Trusted",
              "248 Developers Monitored across 34 Active Repositories",
              "Sarvam AI Multi-Lingual Executive Voice Briefings",
            ].map((text, i) => (
              <div key={i} className="flex items-center gap-2 text-xs font-mono text-gray-600 px-4">
                <FaRegCircleCheck className="text-emerald-500" />
                <span>{text}</span>
                <span className="text-gray-300 ml-3">✦</span>
              </div>
            ))}
          </SimpleMarquee>
        </footer>
      </div>
    </LenisProvider>
  );
}
