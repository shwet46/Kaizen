"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import {
  LiaChartPieSolid as FaChartPie,
  LiaHeartbeatSolid as FaHeartPulse,
  LiaCoinsSolid as FaCoins,
  LiaUsersSolid as FaUsers,
  LiaTachometerAltSolid as FaGaugeHigh,
  LiaExclamationTriangleSolid as FaTriangleExclamation,
  LiaArrowRightSolid as FaArrowRight,
  LiaCheckSolid as FaCheck,
  LiaCheckCircleSolid as FaCircleCheck,
  LiaArrowUpSolid as FaArrowTrendUp,
  LiaArrowDownSolid as FaArrowTrendDown,
  LiaCodeBranchSolid as FaCodeBranch,
  LiaServerSolid as FaServer,
  LiaShieldAltSolid as FaShieldHalved,
} from "react-icons/lia";

type PreviewTab = "delivery" | "cost" | "workforce" | "dora";

const colors = {
  bg: "#F3F4F6",
  card: "#FAFAFA",
  border: "rgba(95, 99, 104, 0.35)",
  borderLight: "rgba(95, 99, 104, 0.15)",
  textPrimary: "#202124",
  textSecondary: "#5F6368",
  textMuted: "#80868B",
  success: "#34A853",
  destructive: "#EA4335",
  warning: "#FBBC05",
  shadow: "2px 2px 0px 0px rgba(95, 99, 104, 0.12)"
};

export function InteractiveDashboardPreview() {
  const [activeTab, setActiveTab] = useState<PreviewTab>("delivery");

  useEffect(() => {
    const tabs: PreviewTab[] = ["delivery", "cost", "workforce", "dora"];
    const interval = setInterval(() => {
      setActiveTab((current) => {
        const nextIndex = (tabs.indexOf(current) + 1) % tabs.length;
        return tabs[nextIndex];
      });
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{
      width: "100%",
      backgroundColor: colors.bg,
      border: `1px solid ${colors.border}`,
      borderRadius: "12px",
      boxShadow: colors.shadow,
      overflow: "hidden",
      position: "relative",
      fontFamily: "'Instrument Sans', sans-serif",
      color: colors.textPrimary,
      textAlign: "left"
    }}>
      {/* Mock Browser Top Chrome Header */}
      <div style={{
        backgroundColor: colors.card,
        borderBottom: `1px solid ${colors.border}`,
        padding: "12px 16px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: "12px"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: "#FF5F56" }} />
          <span style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: "#FFBD2E" }} />
          <span style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: "#27C93F" }} />
          <span style={{
            marginLeft: "12px",
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: "12px",
            backgroundColor: colors.card,
            padding: "4px 12px",
            borderRadius: "9999px",
            border: `1px solid ${colors.border}`,
            color: colors.textMuted,
            display: "flex",
            alignItems: "center",
            gap: "6px"
          }}>
            <span style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: colors.success }} />
            kaizen.app/dashboard
          </span>
        </div>

        {/* Live sync badge */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ fontSize: "12px", color: colors.textMuted, display: "flex", alignItems: "center", gap: "6px" }}>
            <FaCircleCheck style={{ color: colors.success }} />
            248 Engineers Synced
          </span>
          <Link
            to="/dashboard"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "6px 12px",
              backgroundColor: colors.textPrimary,
              color: "#fff",
              fontSize: "12px",
              fontFamily: "'JetBrains Mono', monospace",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              borderRadius: "8px",
              textDecoration: "none"
            }}
          >
            Launch Full App <FaArrowRight style={{ width: "12px", height: "12px" }} />
          </Link>
        </div>
      </div>

      {/* Mini App Toolbar */}
      <div style={{
        padding: "16px 24px",
        borderBottom: `1px solid ${colors.border}`,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "12px",
        backgroundColor: colors.card
      }}>
        {/* Module Switcher Tabs */}
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          {[
            { id: "delivery", label: "Delivery", icon: <FaHeartPulse /> },
            { id: "cost", label: "FinOps", icon: <FaCoins /> },
            { id: "workforce", label: "Workforce", icon: <FaUsers /> },
            { id: "dora", label: "DORA", icon: <FaGaugeHigh /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as PreviewTab)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "8px 14px",
                borderRadius: "8px",
                fontSize: "14px",
                fontWeight: 500,
                fontFamily: "'Instrument Sans', sans-serif",
                cursor: "pointer",
                transition: "all 0.2s",
                border: activeTab === tab.id ? "1px solid transparent" : `1px solid transparent`,
                backgroundColor: activeTab === tab.id ? colors.textPrimary : "transparent",
                color: activeTab === tab.id ? "#fff" : colors.textMuted,
                boxShadow: activeTab === tab.id ? "0 1px 2px rgba(0,0,0,0.1)" : "none"
              }}
            >
              <span style={{ fontSize: "14px" }}>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        <div style={{ fontSize: "12px", color: colors.textMuted, fontFamily: "'JetBrains Mono', monospace", textTransform: "uppercase", letterSpacing: "0.05em" }}>
          Live Intelligence Preview
        </div>
      </div>

      {/* Main Preview Content Canvas */}
      <div style={{ padding: "24px", backgroundColor: colors.bg, minHeight: "400px" }}>
        <AnimatePresence mode="wait">
          {/* TAB 1: DELIVERY HEALTH */}
          {activeTab === "delivery" && (
            <motion.div
              key="delivery"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              style={{ display: "flex", flexDirection: "column", gap: "24px" }}
            >
              {/* Top Mini KPIs */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
                {[
                  { label: "Team Members", val: "248", up: "18 repos synced" },
                  { label: "Tasks Completed", val: "42 / 58", up: "72% complete" },
                  { label: "Realized ROI", val: "$48,500", up: "+34% ROI" },
                  { label: "Predicted Delay", val: "14 days", up: "High Risk", isAlert: true }
                ].map((kpi, i) => (
                  <div key={i} style={{ padding: "16px", border: `1px solid ${colors.border}`, borderRadius: "12px", backgroundColor: colors.card, boxShadow: colors.shadow }}>
                    <div style={{ fontSize: "10px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: colors.textMuted, marginBottom: "8px" }}>{kpi.label}</div>
                    <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: "30px", fontWeight: 700, color: kpi.isAlert ? colors.destructive : colors.textPrimary }}>{kpi.val}</div>
                    <div style={{ fontSize: "12px", fontWeight: 600, color: kpi.isAlert ? colors.destructive : colors.success, marginTop: "4px", display: "flex", alignItems: "center", gap: "4px" }}>
                      {!kpi.isAlert && <FaArrowTrendUp />} {kpi.up}
                    </div>
                  </div>
                ))}
              </div>

              {/* Visual Simulated Chart & Initiatives */}
              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "16px" }}>
                <div style={{ padding: "20px", border: `1px solid ${colors.border}`, borderRadius: "12px", backgroundColor: colors.card, boxShadow: colors.shadow }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                    <span style={{ fontWeight: 700, fontSize: "14px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Sprint Throughput vs Target</span>
                    <span style={{ fontSize: "12px", color: colors.textMuted }}>Last 5 Sprints</span>
                  </div>
                  <div style={{ height: "128px", display: "flex", alignItems: "flex-end", gap: "12px" }}>
                    {[
                      { s: "S40", h: 70, c: colors.bg },
                      { s: "S41", h: 78, c: colors.bg },
                      { s: "S42", h: 86, c: colors.bg },
                      { s: "S43", h: 82, c: colors.bg },
                      { s: "S44", h: 96, c: colors.textPrimary },
                    ].map((b, i) => (
                      <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", height: "100%", justifyContent: "flex-end" }}>
                        <div style={{ width: "100%", height: `${b.h}%`, backgroundColor: b.c, borderRadius: "2px 2px 0 0" }} />
                        <span style={{ fontSize: "10px", fontFamily: "'JetBrains Mono', monospace", marginTop: "8px", color: colors.textMuted }}>{b.s}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ padding: "20px", border: `1px solid ${colors.border}`, borderRadius: "12px", backgroundColor: colors.card, boxShadow: colors.shadow }}>
                  <div style={{ fontWeight: 700, fontSize: "14px", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "16px" }}>Active Streams</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {[
                      { name: "Zero-Trust Mesh", pct: 94, status: "On Track", color: colors.success },
                      { name: "Vector DB Engine", pct: 78, status: "Review Lag", color: colors.warning },
                      { name: "Global Checkout", pct: 46, status: "Bottlenecked", color: colors.destructive },
                    ].map((st, i) => (
                      <div key={i} style={{ padding: "10px", backgroundColor: colors.bg, borderRadius: "8px", border: `1px solid ${colors.borderLight}` }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                          <span style={{ fontSize: "12px", fontWeight: 600 }}>{st.name}</span>
                          <span style={{ fontSize: "12px", fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, color: st.color }}>{st.pct}%</span>
                        </div>
                        <div style={{ height: "6px", width: "100%", backgroundColor: colors.borderLight, borderRadius: "99px", overflow: "hidden" }}>
                          <div style={{ height: "100%", width: `${st.pct}%`, backgroundColor: st.color, borderRadius: "99px" }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 2: COST INTELLIGENCE */}
          {activeTab === "cost" && (
            <motion.div
              key="cost"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              style={{ display: "flex", flexDirection: "column", gap: "24px" }}
            >
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
                <div style={{ padding: "20px", border: `1px solid ${colors.border}`, borderRadius: "12px", backgroundColor: colors.card, boxShadow: colors.shadow }}>
                  <div style={{ fontSize: "10px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: colors.textMuted, marginBottom: "8px" }}>ASC 350-40 Capitalized R&D</div>
                  <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: "30px", fontWeight: 700 }}>$1.05M / mo</div>
                  <div style={{ fontSize: "12px", fontWeight: 600, color: colors.success, marginTop: "4px" }}>71.4% CapEx eligibility</div>
                </div>
                <div style={{ padding: "20px", border: `1px solid ${colors.border}`, borderRadius: "12px", backgroundColor: colors.card, boxShadow: colors.shadow }}>
                  <div style={{ fontSize: "10px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: colors.textMuted, marginBottom: "8px" }}>Cost per Shipped Epic</div>
                  <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: "30px", fontWeight: 700 }}>$42,800</div>
                  <div style={{ fontSize: "12px", fontWeight: 600, color: colors.success, marginTop: "4px" }}>-12.4% efficiency uplift</div>
                </div>
                <div style={{ padding: "20px", border: `1px solid ${colors.border}`, borderRadius: "12px", backgroundColor: colors.card, boxShadow: colors.shadow }}>
                  <div style={{ fontSize: "10px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: colors.textMuted, marginBottom: "8px" }}>Autonomous FinOps Savings</div>
                  <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: "30px", fontWeight: 700, color: colors.success }}>$28,400/mo</div>
                  <div style={{ fontSize: "12px", fontWeight: 600, color: colors.success, marginTop: "4px" }}>3 Actions Ready</div>
                </div>
              </div>

              <div style={{ padding: "20px", border: `1px solid ${colors.border}`, borderRadius: "12px", backgroundColor: colors.card, boxShadow: colors.shadow }}>
                <div style={{ fontWeight: 700, fontSize: "14px", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "16px" }}>Cloud Infrastructure Attribution by Feature</div>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "12px", borderBottom: `1px solid ${colors.borderLight}` }}>
                    <span style={{ fontSize: "14px" }}><strong style={{ fontWeight: 600 }}>AI Vector Search v2</strong> (OpenSearch + Bedrock)</span>
                    <span style={{ fontSize: "14px", fontFamily: "'JetBrains Mono', monospace", fontWeight: 700 }}>$14,200/mo <span style={{ color: colors.success, marginLeft: "8px" }}>5.8x ARR ROI</span></span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "12px" }}>
                    <span style={{ fontSize: "14px" }}><strong style={{ fontWeight: 600 }}>Zero-Trust SSO</strong> (Cognito + KMS)</span>
                    <span style={{ fontSize: "14px", fontFamily: "'JetBrains Mono', monospace", fontWeight: 700 }}>$4,600/mo <span style={{ color: colors.success, marginLeft: "8px" }}>20.2x ARR ROI</span></span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 3: WORKFORCE & TALENT */}
          {activeTab === "workforce" && (
            <motion.div
              key="workforce"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              style={{ display: "flex", flexDirection: "column", gap: "24px" }}
            >
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
                <div style={{ padding: "20px", border: `1px solid ${colors.border}`, borderRadius: "12px", backgroundColor: colors.card, boxShadow: colors.shadow }}>
                  <div style={{ fontSize: "10px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: colors.textMuted, marginBottom: "8px" }}>Capacity Utilization</div>
                  <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: "30px", fontWeight: 700 }}>88.4%</div>
                  <div style={{ fontSize: "12px", fontWeight: 600, color: colors.success, marginTop: "4px" }}>Healthy 80-90% Band</div>
                </div>
                <div style={{ padding: "20px", border: `1px solid ${colors.border}`, borderRadius: "12px", backgroundColor: "rgba(234, 67, 53, 0.05)", boxShadow: colors.shadow }}>
                  <div style={{ fontSize: "10px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: colors.destructive, marginBottom: "8px" }}>Burnout Risk Radar</div>
                  <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: "30px", fontWeight: 700, color: colors.destructive }}>7 Engineers</div>
                  <div style={{ fontSize: "12px", fontWeight: 600, color: colors.destructive, marginTop: "4px" }}>After-hours commit spike</div>
                </div>
                <div style={{ padding: "20px", border: `1px solid ${colors.border}`, borderRadius: "12px", backgroundColor: colors.card, boxShadow: colors.shadow }}>
                  <div style={{ fontSize: "10px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: colors.textMuted, marginBottom: "8px" }}>Bus Factor = 1 Risk</div>
                  <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: "30px", fontWeight: 700, color: colors.warning }}>1 Microservice</div>
                  <div style={{ fontSize: "12px", fontWeight: 600, color: colors.warning, marginTop: "4px" }}>Legacy Billing Schema</div>
                </div>
              </div>

              <div style={{ padding: "20px", border: `1px solid rgba(66, 133, 244, 0.2)`, borderRadius: "12px", backgroundColor: "rgba(66, 133, 244, 0.05)" }}>
                <p style={{ fontSize: "14px", lineHeight: 1.6 }}>
                  <strong style={{ color: colors.textPrimary, textTransform: "uppercase", letterSpacing: "0.05em", fontSize: "10px", display: "block", marginBottom: "4px" }}>Dynamic Reallocation Recommendation</strong>
                  Shifting 2 SREs to the Payments Squad eliminates the PR queue bottleneck and advances Q3 release by <strong style={{ fontWeight: 700 }}>18 calendar days</strong>.
                </p>
              </div>
            </motion.div>
          )}

          {/* TAB 4: DORA & DEVEX */}
          {activeTab === "dora" && (
            <motion.div
              key="dora"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              style={{ display: "flex", flexDirection: "column", gap: "24px" }}
            >
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px" }}>
                {[
                  { label: "Deploy Frequency", val: "14.6 / d" },
                  { label: "Lead Time", val: "26.4 hrs" },
                  { label: "Change Failure Rate", val: "1.8%" },
                  { label: "MTTR", val: "24 min" }
                ].map((kpi, i) => (
                  <div key={i} style={{ padding: "16px", border: `1px solid ${colors.border}`, borderRadius: "12px", backgroundColor: colors.card, boxShadow: colors.shadow }}>
                    <div style={{ fontSize: "10px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: colors.textMuted, marginBottom: "8px" }}>{kpi.label}</div>
                    <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: "30px", fontWeight: 700 }}>{kpi.val}</div>
                    <div style={{ fontSize: "12px", fontWeight: 600, color: colors.success, marginTop: "4px" }}>ELITE TIER</div>
                  </div>
                ))}
              </div>

              <div style={{ padding: "20px", border: `1px solid ${colors.border}`, borderRadius: "12px", backgroundColor: colors.card, boxShadow: colors.shadow, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: "14px", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "4px" }}>AI Copilot Adoption Rate</div>
                  <div style={{ fontSize: "12px", color: colors.textMuted }}>83.8% of engineering org actively coding with AI assistance (410 hours/mo saved)</div>
                </div>
                <span style={{ backgroundColor: "rgba(52, 168, 83, 0.1)", color: colors.success, padding: "8px 16px", borderRadius: "999px", fontSize: "12px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  9.8x Tooling ROI
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
