import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  LiaBrainSolid as Brain,
  LiaClockSolid as Clock,
  LiaFileAltSolid as FileText,
  LiaChartBarSolid as BarChart3,
  LiaSitemapSolid as Network,
  LiaUsersSolid as Users,
  LiaSyncSolid as RefreshCw,
  LiaDownloadSolid as Download,
  LiaMicrophoneSolid as Mic,
  LiaBoltSolid as Zap,
  LiaCheckCircleSolid as CheckCircle2,
  LiaExclamationCircleSolid as AlertCircle,
  LiaTimesSolid as X,
  LiaMagicSolid as Sparkles,
  LiaExternalLinkAltSolid as ArrowUpRight,
  LiaShieldAltSolid as ShieldAlert,
  LiaChevronRightSolid as ChevronRight
} from "react-icons/lia"

export interface QuickActionItem {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  badge?: string
  badgeColor?: string
  action: () => void
}

interface QuickActionsPanelProps {
  onNavigate: (tab: string) => void
  variant?: 'sidebar' | 'drawer'
  isOpen?: boolean
  onClose?: () => void
  onTriggerVoice?: () => void
}

export function QuickActionsPanel({
  onNavigate,
  variant = 'sidebar',
  isOpen = false,
  onClose,
  onTriggerVoice,
}: QuickActionsPanelProps) {
  const [syncing, setSyncing] = useState(false)
  const [syncStatus, setSyncStatus] = useState<string | null>(null)
  const [exporting, setExporting] = useState(false)
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' } | null>(null)

  const showToast = (text: string, type: 'success' | 'info' = 'success') => {
    setToastMessage({ text, type })
    setTimeout(() => setToastMessage(null), 3500)
  }

  // Live Sync Telemetry Handler
  const handleSyncTelemetry = async () => {
    setSyncing(true)
    setSyncStatus("Ingesting telemetry from GitHub & Jira...")
    try {
      // Simulate real-time sync or call backend
      await new Promise((resolve) => setTimeout(resolve, 1200))
      setSyncStatus("Validating 248 engineer commits & sprints...")
      await new Promise((resolve) => setTimeout(resolve, 600))
      setSyncing(false)
      setSyncStatus(null)
      showToast("Telemetry synchronized: 248 engineers & 18 repos updated!", 'success')
    } catch {
      setSyncing(false)
      setSyncStatus(null)
      showToast("Sync completed with latest cache.", 'info')
    }
  }

  // Export Executive Audit Dossier
  const handleExportDossier = () => {
    setExporting(true)
    setTimeout(() => {
      const report = `# KAIZEN EXECUTIVE INTELLIGENCE BRIEFING
Generated: ${new Date().toISOString()}
Status: All Systems Operational

## Executive Summary
- Total Engineering Capacity: 248 Engineers
- Delivery Confidence: 94.2%
- Q3 Sprint Velocity: 4,120 Story Points / 18,400 Hours
- R&D Capitalization Rate (CapEx): 74.8% ($1.05M)
- Projected Cost Savings: $148,000 / quarter
- At-Risk Sprints: 1 (Multi-Region Vector DB v2 - 4.2d delay risk)

## Strategic Interventions Recommended
1. Reallocate 2 Senior Infrastructure Engineers to Vector DB v2 to recover 4.2d delay.
2. Terminate 14 idle preview cloud environments to save $14,200/mo.
3. Review PR waiting queue in Mobile Squad to decrease cycle time from 2.8d to 1.2d.

© ${new Date().getFullYear()} Kaizen Intelligence. All rights reserved.
`
      const blob = new Blob([report], { type: 'text/markdown' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `kaizen-executive-briefing-${new Date().toISOString().slice(0, 10)}.md`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      setExporting(false)
      showToast("Executive Briefing dossier downloaded successfully!", 'success')
    }, 600)
  }

  const quickActions: QuickActionItem[] = [
    {
      id: 'smart-allocate',
      title: 'Run AI Allocation',
      description: 'Optimize sprint capacity & task assignments',
      icon: <Brain className="w-4 h-4 text-emerald-500" />,
      badge: 'AI Gen',
      badgeColor: 'bg-emerald-500/10 text-emerald-600 border-emerald-300',
      action: () => {
        onNavigate('smart-allocate')
        if (onClose) onClose()
      },
    },
    {
      id: 'delay-prediction',
      title: 'Simulate Delay Risk',
      description: 'Monte Carlo timeline forecast & blockers',
      icon: <Clock className="w-4 h-4 text-amber-500" />,
      badge: 'Predictive',
      badgeColor: 'bg-amber-500/10 text-amber-600 border-amber-300',
      action: () => {
        onNavigate('delay-prediction')
        if (onClose) onClose()
      },
    },
    {
      id: 'meeting-transcript',
      title: 'Transcribe Standup',
      description: 'Convert meeting audio into assigned Jira tickets',
      icon: <FileText className="w-4 h-4 text-indigo-500" />,
      badge: 'Audio AI',
      badgeColor: 'bg-indigo-500/10 text-indigo-600 border-indigo-300',
      action: () => {
        onNavigate('meeting-transcript')
        if (onClose) onClose()
      },
    },
    {
      id: 'finance',
      title: 'CapEx & ROI Model',
      description: 'Measure R&D return & GAAP capitalization',
      icon: <BarChart3 className="w-4 h-4 text-sky-500" />,
      badge: 'FinOps',
      badgeColor: 'bg-sky-500/10 text-sky-600 border-sky-300',
      action: () => {
        onNavigate('finance')
        if (onClose) onClose()
      },
    },
    {
      id: 'graph',
      title: '3D Knowledge Graph',
      description: 'Explore code dependencies & contributor network',
      icon: <Network className="w-4 h-4 text-purple-500" />,
      badge: '3D Visual',
      badgeColor: 'bg-purple-500/10 text-purple-600 border-purple-300',
      action: () => {
        onNavigate('graph')
        if (onClose) onClose()
      },
    },
    {
      id: 'voice-assistant',
      title: 'Voice Copilot',
      description: 'Ask queries in natural language via voice',
      icon: <Mic className="w-4 h-4 text-pink-500" />,
      badge: 'Live Audio',
      badgeColor: 'bg-pink-500/10 text-pink-600 border-pink-300',
      action: () => {
        if (onTriggerVoice) {
          onTriggerVoice()
        } else {
          showToast("Click the Voice Chatbot microphone at bottom-right to speak!", 'info')
        }
        if (onClose) onClose()
      },
    },
  ]

  // Content block
  const content = (
    <div className="space-y-4">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`p-2.5 text-xs font-sans rounded-xl border flex items-center gap-2 shadow-sm ${
              toastMessage.type === 'success'
                ? 'bg-[#E6F4EA] border-[#34A853]/40 text-[#137333]'
                : 'bg-[#E8F0FE] border-[#4285F4]/40 text-[#1a73e8]'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
            <span>{toastMessage.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action Cards List */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-sans uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-[#FBBC05]" />
            Quick Workflows
          </span>
          <span className="text-[11px] font-sans text-muted-foreground">
            Instant Trigger
          </span>
        </div>

        <div className="space-y-1.5">
          {quickActions.map((item) => (
            <motion.button
              key={item.id}
              whileHover={{ x: 2 }}
              whileTap={{ scale: 0.99 }}
              onClick={item.action}
              className="w-full flex items-center justify-between p-3 text-left rounded-xl border border-border/80 hover:border-border/30 bg-card hover:bg-muted/40 transition-all group cursor-pointer shadow-[2px_2px_0px_0px_rgba(32,33,36,0.06)] hover:shadow-[3px_3px_0px_0px_rgba(32,33,36,0.1)] hover:-translate-y-0.5"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2 bg-muted/60 rounded-lg shrink-0 border border-border">
                  {item.icon}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold font-sans group-hover:text-foreground transition-colors truncate">
                      {item.title}
                    </span>
                    {item.badge && (
                      <span className={`text-[9px] font-sans font-bold px-2 py-0.5 rounded-full border ${item.badgeColor}`}>
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] font-sans text-muted-foreground truncate max-w-[190px] sm:max-w-[220px]">
                    {item.description}
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition-all shrink-0 ml-1" />
            </motion.button>
          ))}
        </div>
      </div>

      {/* System Actions Utility Box */}
      <div className="border-t border-border/80 pt-3 space-y-2">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-sans uppercase tracking-wider text-muted-foreground font-semibold">
            Data & Export
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {/* Sync Button */}
          <button
            onClick={handleSyncTelemetry}
            disabled={syncing}
            className={`flex items-center justify-center gap-1.5 p-2.5 text-xs font-sans rounded-lg border border-border/80 bg-card hover:bg-muted/70 font-semibold transition-all shadow-[2px_2px_0px_0px_rgba(32,33,36,0.06)] hover:-translate-y-0.5 cursor-pointer ${
              syncing ? 'opacity-70 cursor-wait' : ''
            }`}
          >
            <RefreshCw className={`w-3.5 h-3.5 rounded-full ${syncing ? 'animate-spin text-[#4285F4]' : ''}`} />
            <span>{syncing ? 'Syncing...' : 'Sync Data'}</span>
          </button>

          {/* Export Briefing Button */}
          <button
            onClick={handleExportDossier}
            disabled={exporting}
            className="flex items-center justify-center gap-1.5 p-2.5 text-xs font-sans rounded-lg bg-foreground text-background hover:bg-foreground/90 font-semibold transition-all shadow-[2px_2px_0px_0px_rgba(32,33,36,0.12)] hover:-translate-y-0.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{exporting ? 'Generating...' : 'Export Report'}</span>
          </button>
        </div>

        {syncStatus && (
          <p className="text-[11px] font-sans text-[#1a73e8] animate-pulse px-1">
            {syncStatus}
          </p>
        )}
      </div>
    </div>
  )

  // Variant: Sidebar
  if (variant === 'sidebar') {
    return (
      <div className="mt-4 pt-4 border-t border-border">
        {content}
      </div>
    )
  }

  // Variant: Drawer
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 cursor-pointer"
          />

          {/* Drawer Sheet */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="fixed top-0 right-0 h-full w-84 sm:w-96 bg-card border-l border-border/80 z-50 shadow-[-6px_0px_24px_rgba(32,33,36,0.12)] flex flex-col overflow-hidden"
          >
            {/* Drawer Header */}
            <div className="p-4 border-b border-border/80 bg-muted/40 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg border border-[#FBBC05]/40 bg-[#FEF7E0] text-[#8c6d00] flex items-center justify-center font-bold text-xs">
                  ⚡
                </div>
                <div>
                  <h3 className="font-serif font-bold text-base text-foreground">
                    Quick Actions
                  </h3>
                  <p className="text-[11px] font-sans text-muted-foreground">
                    Kaizen Operating Shortcuts
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg border border-border/80 bg-card hover:bg-muted/80 text-foreground transition-all cursor-pointer"
                aria-label="Close drawer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Drawer Body */}
            <div className="flex-1 overflow-y-auto p-4">
              {content}
            </div>

            {/* Drawer Footer */}
            <div className="p-3 border-t border-border bg-muted/20 text-center">
              <span className="text-[11px] font-sans text-muted-foreground">
                Kaizen Intelligence Platform
              </span>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
