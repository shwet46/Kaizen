"use client";

import type { CSSProperties, ReactNode } from "react";
import { Link } from "react-router-dom";
import "../styles/kaizen-landing.css";
import { Navbar } from "@/components/Navbar";
import { BackgroundRippleEffect } from "@/components/ui/background-ripple-effect";
import {
  GooeyFilter,
  ScrambleText,
  TextHighlighter,
  TextRotate,
  Letter3DSwap,
  SimpleMarquee,
  StackingCards,
  StickyFooter,
  AnimatedSvgGradient,
} from "@/components/FancyComponents";
import { InteractiveDashboardPreview } from "@/components/InteractiveDashboardPreview";
import {
  Background as FlowBackground,
  BackgroundVariant,
  Controls as FlowControls,
  Handle,
  MarkerType,
  Position,
  ReactFlow,
  type Edge,
  type Node,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import {
  AnimateOnScroll,
  StaggerContainer,
  StaggerItem,
  TextReveal,
  TiltCard,
} from "@/components/Animations";
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
  LiaLayerGroupSolid as FaLayerGroup,
  LiaLockSolid as FaLock,
  LiaBoltSolid as FaBolt,
  LiaDatabaseSolid as FaDatabase,
} from "react-icons/lia";



/* ================================================================
   KAIZEN LANDING PAGE
   Enhanced with Fancy Components (fancycomponents.dev),
   React Icons / Font Awesome 6 (No emojis), and Lenis smooth scroll
   ================================================================ */

const DashboardLink = ({
  children,
  className,
  style,
  to = "/dashboard"
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  to?: string;
}) => (
  <Link
    to={to}
    className={className}
    style={style}
  >
    {children}
  </Link>
);

interface SystemArchNodeData {
  step: string;
  title: string;
  subtitle: string;
  tags: string[];
  icon: ReactNode;
  color: string;
  isInput?: boolean;
  isOutput?: boolean;
}

const ArchitectureNode = ({ data }: { data: SystemArchNodeData }) => {
  return (
    <div
      className="sys-arch-node"
      style={{
        ["--node-accent" as any]: data.color,
      }}
    >
      {!data.isInput && (
        <Handle
          type="target"
          position={Position.Left}
          className="sys-arch-handle"
          style={{ background: data.color }}
        />
      )}
      <div className="sys-arch-node-top">
        <div className="sys-arch-icon" style={{ color: data.color, background: `${data.color}18` }}>
          {data.icon}
        </div>
        <div className="sys-arch-meta">
          <span className="sys-arch-step" style={{ color: data.color }}>{data.step}</span>
          <span className="sys-arch-dot" style={{ background: data.color }} />
        </div>
      </div>
      <div className="sys-arch-node-body">
        <div className="sys-arch-title">{data.title}</div>
        <div className="sys-arch-subtitle">{data.subtitle}</div>
        <div className="sys-arch-pills">
          {data.tags.map((t: string, i: number) => (
            <span key={i} className="sys-arch-pill">{t}</span>
          ))}
        </div>
      </div>
      {!data.isOutput && (
        <Handle
          type="source"
          position={Position.Right}
          className="sys-arch-handle"
          style={{ background: data.color }}
        />
      )}
    </div>
  );
};

const nodeTypes = {
  archNode: ArchitectureNode,
};

const systemDesignNodes: Node[] = [
  {
    id: "sources",
    type: "archNode",
    position: { x: 30, y: 160 },
    data: {
      step: "01 · SOURCES",
      title: "Ecosystem Sources",
      subtitle: "GitHub · Jira · Slack",
      tags: ["Webhooks", "APIs"],
      icon: <FaGithub />,
      color: "#4285F4",
      isInput: true,
    },
  },
  {
    id: "ingestion",
    type: "archNode",
    position: { x: 350, y: 160 },
    data: {
      step: "02 · INGEST",
      title: "Signal Ingestion",
      subtitle: "Event Stream Broker",
      tags: ["Kafka", "Webhooks"],
      icon: <FaBolt />,
      color: "#EA4335",
    },
  },
  {
    id: "backend",
    type: "archNode",
    position: { x: 675, y: 45 },
    data: {
      step: "03A · API",
      title: "FastAPI Core",
      subtitle: "Metrics & Telemetry API",
      tags: ["FastAPI", "Python"],
      icon: <FaServer />,
      color: "#34A853",
    },
  },
  {
    id: "ai",
    type: "archNode",
    position: { x: 675, y: 275 },
    data: {
      step: "03B · AI",
      title: "Gemini",
      subtitle: "Vertex AI reasoning",
      tags: ["Gemini", "Vertex AI"],
      icon: <FaBolt />,
      color: "#7E57C2",
    },
  },
  {
    id: "data",
    type: "archNode",
    position: { x: 1000, y: 160 },
    data: {
      step: "04 · STORE",
      title: "Knowledge Store",
      subtitle: "MongoDB & Neo4j",
      tags: ["Graph", "Document"],
      icon: <FaDatabase />,
      color: "#FBBC05",
    },
  },
  {
    id: "workspace",
    type: "archNode",
    position: { x: 1320, y: 160 },
    data: {
      step: "05 · UI",
      title: "Executive Workspace",
      subtitle: "React Dashboard",
      tags: ["React", "Live View"],
      icon: <FaRocket />,
      color: "#4285F4",
      isOutput: true,
    },
  },
];

const systemDesignEdges: Edge[] = [
  {
    id: "sources-ingestion",
    source: "sources",
    target: "ingestion",
    animated: true,
    type: "smoothstep",
    label: "Webhooks & APIs",
    style: { stroke: "#4285F4", strokeWidth: 2.5 },
    labelStyle: { fill: "#0f172a", fontWeight: 700, fontSize: 12, fontFamily: "'JetBrains Mono', monospace" },
    labelBgStyle: { fill: "#ffffff", fillOpacity: 1, rx: 6, ry: 6, stroke: "#64748b", strokeWidth: 1.5 },
    labelBgPadding: [10, 6],
    markerEnd: { type: MarkerType.ArrowClosed, color: "#4285F4", width: 16, height: 16 },
  },
  {
    id: "ingestion-backend",
    source: "ingestion",
    target: "backend",
    animated: true,
    type: "smoothstep",
    label: "Event Stream",
    style: { stroke: "#34A853", strokeWidth: 2.5 },
    labelStyle: { fill: "#0f172a", fontWeight: 700, fontSize: 12, fontFamily: "'JetBrains Mono', monospace" },
    labelBgStyle: { fill: "#ffffff", fillOpacity: 1, rx: 6, ry: 6, stroke: "#64748b", strokeWidth: 1.5 },
    labelBgPadding: [10, 6],
    markerEnd: { type: MarkerType.ArrowClosed, color: "#34A853", width: 16, height: 16 },
  },
  {
    id: "ingestion-ai",
    source: "ingestion",
    target: "ai",
    animated: true,
    type: "smoothstep",
    label: "Context Prompts",
    style: { stroke: "#7E57C2", strokeWidth: 2.5 },
    labelStyle: { fill: "#0f172a", fontWeight: 700, fontSize: 12, fontFamily: "'JetBrains Mono', monospace" },
    labelBgStyle: { fill: "#ffffff", fillOpacity: 1, rx: 6, ry: 6, stroke: "#64748b", strokeWidth: 1.5 },
    labelBgPadding: [10, 6],
    markerEnd: { type: MarkerType.ArrowClosed, color: "#7E57C2", width: 16, height: 16 },
  },
  {
    id: "backend-data",
    source: "backend",
    target: "data",
    animated: true,
    type: "smoothstep",
    label: "Calculated Metrics",
    style: { stroke: "#34A853", strokeWidth: 2.5 },
    labelStyle: { fill: "#0f172a", fontWeight: 700, fontSize: 12, fontFamily: "'JetBrains Mono', monospace" },
    labelBgStyle: { fill: "#ffffff", fillOpacity: 1, rx: 6, ry: 6, stroke: "#64748b", strokeWidth: 1.5 },
    labelBgPadding: [10, 6],
    markerEnd: { type: MarkerType.ArrowClosed, color: "#34A853", width: 16, height: 16 },
  },
  {
    id: "ai-data",
    source: "ai",
    target: "data",
    animated: true,
    type: "smoothstep",
    label: "Graph & Vectors",
    style: { stroke: "#7E57C2", strokeWidth: 2.5 },
    labelStyle: { fill: "#0f172a", fontWeight: 700, fontSize: 12, fontFamily: "'JetBrains Mono', monospace" },
    labelBgStyle: { fill: "#ffffff", fillOpacity: 1, rx: 6, ry: 6, stroke: "#64748b", strokeWidth: 1.5 },
    labelBgPadding: [10, 6],
    markerEnd: { type: MarkerType.ArrowClosed, color: "#7E57C2", width: 16, height: 16 },
  },
  {
    id: "data-workspace",
    source: "data",
    target: "workspace",
    animated: true,
    type: "smoothstep",
    label: "Live WebSockets",
    style: { stroke: "#FBBC05", strokeWidth: 2.5 },
    labelStyle: { fill: "#0f172a", fontWeight: 700, fontSize: 12, fontFamily: "'JetBrains Mono', monospace" },
    labelBgStyle: { fill: "#ffffff", fillOpacity: 1, rx: 6, ry: 6, stroke: "#64748b", strokeWidth: 1.5 },
    labelBgPadding: [10, 6],
    markerEnd: { type: MarkerType.ArrowClosed, color: "#FBBC05", width: 16, height: 16 },
  },
];

export default function LandingPage() {

  const stackingFeatureCards = [
    {
      id: "feature-1",
      badge: "Delivery Health",
      title: "Predictable Delivery with Monte Carlo Simulations",
      subtitle: "Stop guessing release dates. Forecast with 85% statistical confidence.",
      description:
        "Transforms pull requests, commit patterns, and code review queues into probabilistic release forecasting. Pinpoint hidden cycle time bottlenecks in specific squads days before sprint reviews notice.",
      accentColor: "#34A853",
      bgColor: "#FFFFFF",
      icon: <FaHeartPulse />,
      stats: [
        { label: "Cycle Time", value: "2.4d", trend: "↓ 18% MoM" },
        { label: "Adherence", value: "96.1%", trend: "High Confidence" },
        { label: "PR Latency", value: "-1.2d", trend: "Optimized" },
      ],
    },
    {
      id: "feature-2",
      badge: "FinOps & CapEx",
      title: "Automated Software Capitalization & Cloud Unit Economics",
      subtitle: "ASC 350-40 GAAP compliance with zero manual timesheets.",
      description:
        "Algorithmically maps Git SHA commits and Jira epics directly into capitalizable R&D vs maintenance operating expenses. Traces AWS and GCP infrastructure spend directly to user-facing features and customer revenue.",
      accentColor: "#FBBC05",
      bgColor: "#FFFFFF",
      icon: <FaCoins />,
      stats: [
        { label: "CapEx Rate", value: "71.4%", trend: "$1.05M/mo" },
        { label: "Cloud Waste", value: "-$28.4k", trend: "Autonomous" },
        { label: "IRS Sec 41", value: "$412k", trend: "Tax Credit" },
      ],
    },
    {
      id: "feature-3",
      badge: "Workforce Intelligence",
      title: "Passive Burnout Early Warning & Bus Factor Resilience",
      subtitle: "Safeguard high-performing engineers without surveillance.",
      description:
        "Detects sustained after-hours commit spikes, code review pressure, and excessive multi-repo context switching. Identifies single points of failure where critical subsystems depend on a single engineer.",
      accentColor: "#7E57C2",
      bgColor: "#FFFFFF",
      icon: <FaUsers />,
      stats: [
        { label: "Capacity Band", value: "88.4%", trend: "Optimal" },
        { label: "Burnout Alerts", value: "7/248", trend: "Triage Active" },
        { label: "Retention Rate", value: "94.6%", trend: "Top 5%" },
      ],
    },
    {
      id: "feature-4",
      badge: "Productivity & DORA",
      title: "Elite Engineering Telemetry & AI Assistant ROI",
      subtitle: "Measure the true business yield of modern AI coding assistants.",
      description:
        "Tracks DORA performance across deployment frequency, lead time, change fail rate, and MTTR. Quantifies engineering hours saved from AI assistants like GitHub Copilot with security audit compliance.",
      accentColor: "#4285F4",
      bgColor: "#FFFFFF",
      icon: <FaGaugeHigh />,
      stats: [
        { label: "Deploy Rate", value: "14.6/d", trend: "Elite Tier" },
        { label: "AI Adoption", value: "83.8%", trend: "208 Devs" },
        { label: "Capacity Won", value: "410h/mo", trend: "9.8x ROI" },
      ],
    },
  ];

  const integrationLogos = [
    { name: "GitHub", icon: <FaGithub /> },
    { name: "Google Cloud", icon: <FaServer /> },
    { name: "Jira Software", icon: <FaJira /> },
    { name: "Slack", icon: <FaSlack /> },
    { name: "Kubernetes", icon: <FaServer /> },
    { name: "GitLab", icon: <FaCodeBranch /> },
    { name: "Datadog", icon: <FaChartLine /> },
    { name: "Terraform", icon: <FaLayerGroup /> },
  ];

  const liveTickerMetrics = [
    "94.2% Delivery Health Score across 248 engineers",
    "14.6 production deploys per day (DORA Elite Tier)",
    "$1.05M/mo ASC 350-40 GAAP Capitalized Software R&D",
    "410 engineering hours saved monthly via AI pair programming",
    "Cycle time decreased by 18.2% to 2.4 days",
    "Autonomous FinOps idle compute savings: $28,400/mo",
    "Zero-trust SOC2 Type II compliance audit ready",
  ];

  const techStack = [
    {
      category: "UI",
      title: "React",
      tags: ["React", "TypeScript", "Tailwind CSS"],
      icon: <FaCodeBranch />,
      color: "#4285F4",
    },
    {
      category: "API",
      title: "FastAPI",
      tags: ["FastAPI", "Python", "Redis Queue"],
      icon: <FaServer />,
      color: "#34A853",
    },
    {
      category: "Data Layer",
      title: "MongoDB · Neo4j",
      tags: ["MongoDB Atlas", "Neo4j Graph"],
      icon: <FaDatabase />,
      color: "#FBBC05",
    },
    {
      category: "AI Intelligence",
      title: "Gemini LLM intelligence via Vertex AI",
      tags: ["Gemini LLM", "Vertex AI", "Reasoning"],
      icon: <FaBolt />,
      color: "#7E57C2",
    },
    {
      category: "Ecosystem",
      title: "GitHub · Jira · Slack",
      tags: ["GitHub", "Jira", "Slack"],
      icon: <FaGithub />,
      color: "#EA4335",
    },
    {
      category: "Infrastructure",
      title: "Google Cloud & Kubernetes",
      tags: ["GCP", "Kubernetes (GKE)", "Docker"],
      icon: <FaShieldHalved />,
      color: "#1A73E8",
    },
  ];

  return (
    <div className="kaizen-landing">
      <Navbar />
      <GooeyFilter />
      <main className="landing-main">

        {/* ================================================================
          1. HERO SECTION with a dim interactive ripple grid
          ================================================================ */}
        <section className="hero" id="hero">
          <BackgroundRippleEffect />
          <div className="container hero-content">
            {/* Headline with Text Rotate and Text Highlighter */}
            <AnimateOnScroll delay={0.25}>
              <h1 className="hero-title" style={{ fontSize: "clamp(2.5rem, 6.5vw, 5.2rem)", lineHeight: 1.15, marginBottom: "1.5rem" }}>
                Turn engineering{" "}
                <TextHighlighter color="var(--accent-blue-light)" strokeColor="var(--accent-blue)">
                  signals
                </TextHighlighter>
                <br />
                into business{" "}
                <em style={{ fontStyle: "italic", fontFamily: "'Instrument Serif', serif" }}>
                  <TextRotate
                    words={["clarity", "predictability", "capital efficiency", "executive velocity"]}
                    interval={2600}
                  />
                </em>
              </h1>
            </AnimateOnScroll>

            {/* Subtitle */}
            <AnimateOnScroll delay={0.4}>
              <p className="hero-subtitle" style={{ maxWidth: 680, margin: "0 auto 2.5rem auto", fontSize: "1.1rem", lineHeight: 1.65 }}>
                Kaizen connects raw technical telemetry from Git, Jira, CI/CD, and cloud infrastructure into
                boardroom-ready metrics: delivery health, software capitalization, and workforce utilization.
              </p>
            </AnimateOnScroll>

            {/* Hero Actions */}
            <AnimateOnScroll delay={0.55}>
              <div className="hero-actions" style={{ display: "flex", justifyContent: "center", gap: 16, flexWrap: "wrap" }}>
                <DashboardLink className="btn btn-primary btn-lg" style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
                  <Letter3DSwap text="Launch Intelligence Dashboard" />
                </DashboardLink>

                <a href="#interactive-preview" className="btn btn-secondary btn-lg" style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                  <span>Explore Live Preview</span>
                </a>
              </div>
            </AnimateOnScroll>

            {/* Live Telemetry Pill */}
            <AnimateOnScroll delay={0.7}>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 12,
                  marginTop: "3rem",
                  padding: "8px 18px",
                  borderRadius: 30,
                  background: "rgba(255, 255, 255, 0.75)",
                  backdropFilter: "blur(12px)",
                  border: "1px solid rgba(26,26,26,0.1)",
                  fontSize: "0.8rem",
                  color: "var(--text-secondary)",
                }}
              >
                <span>Active Telemetry: </span>
                <strong style={{ color: "var(--text-primary)" }}>
                  <ScrambleText text="248 Engineers · 34 Repositories · 14.6 Deploys/Day" scrambleSpeed={28} />
                </strong>
              </div>
            </AnimateOnScroll>
          </div>
        </section>

        {/* ================================================================
          2. SIMPLE MARQUEE (Enterprise Integrations & Metrics)
          ================================================================ */}
        <section style={{ borderTop: "var(--border-comic)", borderBottom: "var(--border-comic)", background: "var(--bg-secondary)", padding: "16px 0" }}>
          <SimpleMarquee speed={32} pauseOnHover={true}>
            {integrationLogos.map((item, idx) => (
              <div
                key={idx}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "8px 20px",
                  background: "var(--bg-card)",
                  borderRadius: 24,
                  border: "var(--border-light)",
                  boxShadow: "var(--shadow-comic-sm)",
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  color: "var(--text-primary)",
                }}
              >
                <span style={{ fontSize: "1.1rem", display: "flex", alignItems: "center" }}>{item.icon}</span>
                <span>{item.name}</span>
              </div>
            ))}
          </SimpleMarquee>

          <div style={{ height: 1, background: "rgba(26,26,26,0.06)", margin: "12px 0" }} />

          <SimpleMarquee speed={48} direction="right" pauseOnHover={true}>
            {liveTickerMetrics.map((ticker, idx) => (
              <div
                key={idx}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  color: "var(--text-secondary)",
                  paddingRight: "2rem",
                }}
              >
                <FaRegCircleCheck style={{ color: "var(--accent-mint)" }} />
                <span>{ticker}</span>
                <span style={{ color: "rgba(26,26,26,0.2)", marginLeft: 8 }}>✦</span>
              </div>
            ))}
          </SimpleMarquee>
        </section>

        {/* ================================================================
          3. INTERACTIVE DASHBOARD PREVIEW
          (Significantly improved live dashboard experience on landing page)
          ================================================================ */}
        <section className="section" id="interactive-preview">
          <div className="container">
            <AnimateOnScroll>
              <div style={{ textAlign: "center", marginBottom: "3rem" }}>
                <span className="section-label">
                  Executive Command Center
                </span>
                <h2 className="section-title">
                  One unified lens for{" "}
                  <TextHighlighter color="var(--accent-mint-light)" strokeColor="var(--accent-mint)">
                    delivery, cost, and talent
                  </TextHighlighter>
                </h2>
                <p className="section-subtitle">
                  Interact with the live intelligence view below. Switch between delivery, FinOps, workforce resilience, and DORA productivity signals.
                </p>
              </div>
            </AnimateOnScroll>

            <AnimateOnScroll delay={0.2}>
              <InteractiveDashboardPreview />
            </AnimateOnScroll>

            <AnimateOnScroll delay={0.3}>
              <div style={{ textAlign: "center", marginTop: "2.5rem" }}>
                <DashboardLink className="btn btn-primary btn-lg" style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
                  <span>Open Full Interactive Workspace</span>
                  <FaArrowRight />
                </DashboardLink>
              </div>
            </AnimateOnScroll>
          </div>
        </section>

        {/* ================================================================
          3. SIGNAL BOARD (Fancy animated background + live operating cues)
          ================================================================ */}
        <section className="signal-board-section" id="signal-board">
          <AnimatedSvgGradient />
          <div className="container" style={{ position: "relative", zIndex: 1 }}>
            <div className="signal-board-heading">
              <AnimateOnScroll>
                <span className="section-label">The signal board</span>
                <h2 className="section-title">
                  See the shape of work <em>before</em> it becomes a surprise.
                </h2>
                <p className="section-subtitle">
                  A calm operating view for the questions that usually arrive too late: what is slowing down, where cost is moving, and who needs support.
                </p>
              </AnimateOnScroll>
            </div>

            <StaggerContainer className="signal-board-grid" staggerDelay={0.1}>
              {[
                { eyebrow: "Delivery", value: "96.1%", label: "release confidence", detail: "Cycle time is down 18% this month.", color: "var(--accent-mint)" },
                { eyebrow: "Capital", value: "$1.05M", label: "R&D mapped", detail: "Every eligible commit has a business context.", color: "var(--accent-yellow)" },
                { eyebrow: "Workforce", value: "7 / 248", label: "signals to review", detail: "Early support beats late-stage intervention.", color: "var(--accent-lavender)" },
                { eyebrow: "AI leverage", value: "9.8x", label: "return on adoption", detail: "Make productivity visible without surveillance.", color: "var(--accent-blue)" },
              ].map((signal) => (
                <StaggerItem key={signal.eyebrow}>
                  <div className="signal-board-card">
                    <div className="signal-board-card-top">
                      <span className="signal-board-eyebrow">{signal.eyebrow}</span>
                      <span className="signal-board-mark" style={{ background: signal.color }} />
                    </div>
                    <strong>{signal.value}</strong>
                    <span className="signal-board-label">{signal.label}</span>
                    <p>{signal.detail}</p>
                  </div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </section>

        {/* ================================================================
          4. STACKING CARDS (Core Enterprise Capabilities)
          Cards stick and stack smoothly on scroll (Fancy Components)
          ================================================================ */}
        <section className="section" id="features" style={{ background: "var(--bg-secondary)", borderTop: "var(--border-comic)" }}>
          <div className="container">
            <AnimateOnScroll>
              <div style={{ textAlign: "center", marginBottom: "4rem" }}>
                <span className="section-label">
                  Platform Capabilities
                </span>
                <h2 className="section-title">
                  Built to scale across{" "}
                  <TextHighlighter color="var(--accent-lavender-light)" strokeColor="var(--accent-lavender)">
                    complex enterprise orgs
                  </TextHighlighter>
                </h2>
                <p className="section-subtitle">
                  Scroll down to see our four core intelligence engines stack into an integrated executive system.
                </p>
              </div>
            </AnimateOnScroll>

            {/* Stacking Cards Container */}
            <StackingCards cards={stackingFeatureCards} />
          </div>
        </section>

        {/* ================================================================
          5. ROLE-SPECIFIC PERSONAS (Executive, Eng, CFO, HR, Product)
          ================================================================ */}
        <section className="section" id="personas">
          <div className="container">
            <AnimateOnScroll>
              <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
                <span className="section-label">
                  Tailored Perspectives
                </span>
                <h2 className="section-title">
                  Designed for every{" "}
                  <TextHighlighter color="var(--accent-peach-light)" strokeColor="var(--accent-peach)">
                    leadership stakeholder
                  </TextHighlighter>
                </h2>
                <p className="section-subtitle">
                  Every leader gets precision metrics aligned directly with their organizational responsibilities.
                </p>
              </div>
            </AnimateOnScroll>

            <div className="personas-grid">
              {[
                {
                  role: "Chief Executive & Board",
                  icon: <FaShieldHalved />,
                  color: "#1E6B4A",
                  bg: "var(--bg-secondary)",
                  lens: "Delivery Predictability & Enterprise ROI",
                  desc: "High-level visibility into strategic initiatives, revenue at risk, and total engineering capital efficiency.",
                },
                {
                  role: "VP of Engineering & CTO",
                  icon: <FaCodeBranch />,
                  color: "#4A3B72",
                  bg: "var(--bg-secondary)",
                  lens: "Cycle Time & Squad Velocity",
                  desc: "Proactive bottleneck detection, PR queue stagnation alerts, and automated cross-team rebalance recommendations.",
                },
                {
                  role: "CFO & Finance Leadership",
                  icon: <FaCoins />,
                  color: "#8B4513",
                  bg: "var(--bg-secondary)",
                  lens: "ASC 350-40 GAAP CapEx R&D",
                  desc: "Autonomous software capitalization documentation, IRS Sec 41 tax credits, and feature-level cloud unit economics.",
                },
                {
                  role: "People Ops & HR Leaders",
                  icon: <FaUsers />,
                  color: "#1C4E80",
                  bg: "var(--bg-secondary)",
                  lens: "Burnout Signals & Bus Factor",
                  desc: "Passive work-life balance telemetry, after-hours commit spikes, and knowledge single-point-of-failure elimination.",
                },
                {
                  role: "Head of Product Management",
                  icon: <FaRocket />,
                  color: "#942E43",
                  bg: "var(--bg-secondary)",
                  lens: "Roadmap Time-to-Market",
                  desc: "Milestone completion confidence intervals, feature delivery velocity, and direct linkage to customer ARR.",
                },
                {
                  role: "Cloud Infrastructure & SRE",
                  icon: <FaServer />,
                  color: "#6E3510",
                  bg: "var(--bg-secondary)",
                  lens: "DORA Elite Tier & FinOps",
                  desc: "Deployment frequency, lead time, MTTR, and automated cleanup of idle preview environments.",
                },
              ].map((p, i) => (
                <AnimateOnScroll key={i} delay={i * 0.08}>
                  <TiltCard className="persona-card" style={{ height: "100%" }}>
                    <div className="stakeholder-card">
                      <div className="stakeholder-header">
                        <div className="stakeholder-icon" style={{ background: p.bg, color: p.color }}>
                          {p.icon}
                        </div>
                        <div className="stakeholder-heading">
                          <div className="stakeholder-role">{p.role}</div>
                          <div className="stakeholder-lens">{p.lens}</div>
                        </div>
                      </div>
                      <p className="stakeholder-description">{p.desc}</p>
                      <div className="stakeholder-footer">
                        <DashboardLink
                          className="stakeholder-link"
                        >
                          Explore {p.role.split(" ")[0]} View <FaArrowRight style={{ fontSize: "0.7rem" }} />
                        </DashboardLink>
                      </div>
                    </div>
                  </TiltCard>
                </AnimateOnScroll>
              ))}
            </div>
          </div>
        </section>

        {/* ================================================================
          6. OPERATING SYSTEM WORKFLOW
          A clear path from raw signals to executive action.
          ================================================================ */}
        <section className="section workflow-section" id="how-it-works">
          <div className="container">
            <div className="workflow-heading">
              <AnimateOnScroll>
                <span className="section-label">
                  From signal to decision
                </span>
                <h2 className="section-title">The operating system for a calmer engineering org.</h2>
              </AnimateOnScroll>
              <AnimateOnScroll delay={0.15} variant="slideRight">
                <TextReveal
                  className="workflow-intro"
                  text="Kaizen turns scattered activity into a shared operating rhythm. Leaders see what changed, why it matters, and where to act next without waiting for another status meeting."
                />
              </AnimateOnScroll>
            </div>

            <StaggerContainer className="workflow-grid" staggerDelay={0.12}>
              {[
                {
                  number: "01",
                  title: "Connect the signals",
                  description: "Read-only integrations pull delivery, cost, quality, and collaboration telemetry into one governed model.",
                  icon: <FaDatabase />,
                  color: "var(--accent-blue)",
                },
                {
                  number: "02",
                  title: "Find the pattern",
                  description: "AI-assisted analysis turns raw events into confidence bands, risk signals, and the few constraints worth discussing.",
                  icon: <FaBolt />,
                  color: "var(--accent-yellow)",
                },
                {
                  number: "03",
                  title: "Move with confidence",
                  description: "Share a living view with every stakeholder, then measure whether the decision improved the system over time.",
                  icon: <FaChartLine />,
                  color: "var(--accent-mint)",
                },
              ].map((step) => (
                <StaggerItem key={step.number}>
                  <div className="workflow-step">
                    <div className="workflow-step-top">
                      <span className="workflow-number">{step.number}</span>
                      <span className="workflow-icon" style={{ color: step.color }}>{step.icon}</span>
                    </div>
                    <h3>{step.title}</h3>
                    <p>{step.description}</p>
                    <div className="workflow-line" style={{ background: step.color }} />
                  </div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </section>

        {/* ================================================================
          7. TECHNOLOGY STACK
          The foundation behind the intelligence layer.
          ================================================================ */}
        <section className="section tech-stack-section" id="tech-stack">
          <div className="container container-lg">
            <div className="tech-stack-heading">
              <AnimateOnScroll>
                <span className="section-label">Built for the real world</span>
                <h2 className="section-title">
                  A modern stack for{" "}
                  <TextHighlighter color="var(--accent-blue-light)" strokeColor="var(--accent-blue)">
                    dependable intelligence
                  </TextHighlighter>
                </h2>
              </AnimateOnScroll>
            </div>

            <div className="tech-stack-grid">
              {techStack.map((item) => (
                <div key={item.category} className="tech-stack-col">
                  <div className="tech-stack-card-small" style={{ ["--card-accent" as any]: item.color }}>
                    <div className="tech-small-header">
                      <div className="tech-small-icon" style={{ color: item.color, background: `${item.color}15` }}>
                        {item.icon}
                      </div>
                      <span className="tech-small-category">{item.category}</span>
                    </div>

                    <h3 className="tech-small-title">{item.title}</h3>

                    <div className="tech-small-tags">
                      {item.tags.map((tag) => (
                        <span key={tag} className="tech-small-tag">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Unboxed, Open System Design Canvas */}
            <AnimateOnScroll delay={0.15}>
              <div className="system-design-section-wrapper">
                <div className="system-design-header">
                  <div className="system-design-header-left">
                    <span className="section-label">Architecture Pipeline</span>
                    <h3 className="system-design-title">
                      Live Signal Ingestion & Intelligence Flow
                    </h3>
                    <p className="system-design-desc">
                      Trace how events travel from raw developer touchpoints through real-time streaming, parallel AI reasoning, and bi-temporal graph storage into boardroom dashboards.
                    </p>
                  </div>
                  <div className="system-design-header-right">
                    <div className="system-design-meta-pills">
                      <span className="meta-pill">
                        <span className="meta-dot live" />
                        Live Event Streaming
                      </span>
                      <span className="meta-pill">
                        <FaServer style={{ fontSize: "0.85rem", color: "var(--accent-mint)" }} />
                        Deployed on GCP
                      </span>
                      <span className="meta-pill">
                        <FaLock style={{ fontSize: "0.85rem", color: "var(--accent-lavender)" }} />
                        SOC2 Type II Ready
                      </span>
                    </div>
                  </div>
                </div>

                <div className="system-design-canvas-wrapper">
                  <div className="system-design-flow-canvas">
                    <ReactFlow
                      nodes={systemDesignNodes}
                      edges={systemDesignEdges}
                      nodeTypes={nodeTypes}
                      fitView
                      fitViewOptions={{ padding: 0.08 }}
                      minZoom={0.2}
                      maxZoom={1.5}
                      nodesDraggable={true}
                      nodesConnectable={false}
                      zoomOnScroll={false}
                      panOnScroll={false}
                      preventScrolling={false}
                      proOptions={{ hideAttribution: true }}
                    >
                      <FlowBackground variant={BackgroundVariant.Dots} gap={24} size={1.2} color="#cbd5e1" />
                      <FlowControls showInteractive={false} className="system-design-controls" />
                    </ReactFlow>
                  </div>

                  <div className="system-design-legend">
                    <div className="legend-item">
                      <span className="legend-step">01</span>
                      <span className="legend-label">Ecosystem Sources</span>
                    </div>
                    <span className="legend-arrow">→</span>
                    <div className="legend-item">
                      <span className="legend-step">02</span>
                      <span className="legend-label">Stream Broker</span>
                    </div>
                    <span className="legend-arrow">→</span>
                    <div className="legend-item">
                      <span className="legend-step">03</span>
                      <span className="legend-label">FastAPI & Gemini</span>
                    </div>
                    <span className="legend-arrow">→</span>
                    <div className="legend-item">
                      <span className="legend-step">04</span>
                      <span className="legend-label">Knowledge Store</span>
                    </div>
                    <span className="legend-arrow">→</span>
                    <div className="legend-item">
                      <span className="legend-step">05</span>
                      <span className="legend-label">React Workspace</span>
                    </div>
                  </div>
                </div>
              </div>
            </AnimateOnScroll>
          </div>
        </section>

        {/* ================================================================
          8. PRICING
          Transparent entry points for teams at different stages.
          ================================================================ */}
        <section className="section pricing-section" id="pricing">
          <div className="container">
            <AnimateOnScroll>
              <div className="pricing-heading">
                <span className="section-label">
                  Pricing that scales with clarity
                </span>
                <h2 className="section-title">Start with the questions your team asks every week.</h2>
                <p className="section-subtitle">Every plan includes read-only integrations, secure telemetry, and a live workspace. Upgrade when your operating rhythm grows.</p>
              </div>
            </AnimateOnScroll>

            <div className="pricing-grid">
              {[
                {
                  name: "Signal",
                  eyebrow: "For focused teams",
                  price: "$0",
                  cadence: "for 14 days",
                  description: "See the baseline before you commit to a new operating model.",
                  features: ["3 data sources", "Delivery health snapshot", "Guided workspace tour"],
                  color: "var(--accent-blue)",
                  cta: "Start the trial",
                },
                {
                  name: "Command",
                  eyebrow: "For scaling orgs",
                  price: "$2,400",
                  cadence: "per month / up to 250 engineers",
                  description: "A shared intelligence layer for engineering, finance, and people leaders.",
                  features: ["Unlimited data sources", "All intelligence engines", "Role-based workspaces", "Slack + email alerts"],
                  color: "var(--accent-mint)",
                  cta: "Choose Command",
                  featured: true,
                },
                {
                  name: "Enterprise",
                  eyebrow: "For complex environments",
                  price: "Let's talk",
                  cadence: "annual partnership",
                  description: "Governance, deployment, and support shaped around your operating constraints.",
                  features: ["Private cloud or VPC", "Custom data retention", "Executive reviews", "Priority support"],
                  color: "var(--accent-yellow)",
                  cta: "Talk to an expert",
                },
              ].map((plan, index) => (
                <AnimateOnScroll key={plan.name} delay={index * 0.1} variant="scaleIn">
                  <TiltCard className={`pricing-card ${plan.featured ? "pricing-card-featured" : ""}`}>
                    {plan.featured && <span className="pricing-badge">Most popular</span>}
                    <div className="pricing-card-accent" style={{ background: plan.color }} />
                    <div className="pricing-eyebrow">{plan.eyebrow}</div>
                    <h3>{plan.name}</h3>
                    <p className="pricing-description">{plan.description}</p>
                    <div className="pricing-price">{plan.price}</div>
                    <div className="pricing-cadence">{plan.cadence}</div>
                    <div className="pricing-features">
                      {plan.features.map((feature) => (
                        <div key={feature}><FaCheck style={{ color: plan.color }} /> {feature}</div>
                      ))}
                    </div>
                    <DashboardLink className={`btn ${plan.featured ? "btn-primary" : "btn-secondary"} pricing-cta`}>
                      {plan.cta} <FaArrowRight />
                    </DashboardLink>
                  </TiltCard>
                </AnimateOnScroll>
              ))}
            </div>
          </div>
        </section>

        {/* ================================================================
          9. ENTERPRISE COMPLIANCE & SECURITY BANNER
          ================================================================ */}
        <section style={{ background: "var(--bg-secondary)", padding: "4rem 0", borderTop: "var(--border-comic)" }}>
          <div className="container" style={{ textAlign: "center" }}>
            <AnimateOnScroll>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                <FaLock style={{ color: "var(--accent-mint)" }} />
                <span style={{ fontSize: "0.85rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Enterprise Grade Architecture
                </span>
              </div>
              <h3 style={{ fontFamily: "'Instrument Serif', serif", fontSize: "2.2rem", marginBottom: "1rem" }}>
                Zero-Trust Security & Multi-Tenant Isolation
              </h3>
              <p style={{ maxWidth: 640, margin: "0 auto 2rem auto", fontSize: "0.95rem", color: "var(--text-secondary)" }}>
                Data never trains public AI models. Read-only metadata ingestion with end-to-end KMS encryption,
                SOC2 Type II certified infrastructure, and automated GDPR compliance.
              </p>

              <div style={{ display: "flex", justifyContent: "center", gap: 24, flexWrap: "wrap", fontSize: "0.85rem", fontWeight: 600 }}>
                <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <FaCheck style={{ color: "var(--accent-mint)" }} /> SOC2 Type II Certified
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <FaCheck style={{ color: "var(--accent-mint)" }} /> ISO 27001 Audited
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <FaCheck style={{ color: "var(--accent-mint)" }} /> Read-Only Git Telemetry
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <FaCheck style={{ color: "var(--accent-mint)" }} /> Self-Hosted VPC Option
                </span>
              </div>
            </AnimateOnScroll>
          </div>
        </section>

      </main>

      {/* ================================================================
          7. STICKY PARALLAX FOOTER (Fancy Components)
          Reveals itself from behind as content scrolls up
          ================================================================ */}
      <StickyFooter>
        <div className="footer-shell container">
          <div className="footer-grid footer-grid-dark">
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                <img className="navbar-logo-icon" src="/icon.svg" alt="" style={{ width: 32, height: 32 }} />
                <span style={{ fontFamily: "'Instrument Serif', serif", fontSize: "1.5rem" }}>Kaizen</span>
              </div>
              <p style={{ fontSize: "0.9rem", color: "rgba(32,33,36,0.68)", lineHeight: 1.6, maxWidth: 360 }}>
                AI-driven enterprise delivery & workforce intelligence. Converting raw engineering signals into predictable business clarity.
              </p>
            </div>
          </div>

          <div className="footer-bottom footer-bottom-dark">
            <div>© {new Date().getFullYear()} Kaizen Intelligence Inc. All rights reserved.</div>
            <div style={{ display: "flex", gap: 20 }}>
              <DashboardLink>Launch Dashboard</DashboardLink>
              <a href="#">Documentation</a>
              <a href="#">Privacy Policy</a>
              <a href="#">Terms of Service</a>
            </div>
          </div>
          <div className="footer-wordmark" aria-hidden="true">KAIZEN</div>
        </div>
      </StickyFooter>
    </div>
  );
}
