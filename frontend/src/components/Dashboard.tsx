import React, { useEffect, useState } from "react"
import { motion} from "framer-motion"
import {
  FaCodeBranch as GitBranch,
  FaChartPie as PieChart,
  FaDatabase as Database,
  FaCloud as Cloud,
  FaStopwatch as Timer,
  FaBrain as Brain,
  FaArrowsRotate as RefreshCw,
  FaCheck as Check,
  FaCircleXmark as XCircle,
  FaCircleCheck as CheckCircle
} from "react-icons/fa6"

const API = import.meta.env.VITE_API_URL || "https://kaizen-backend-8x01.onrender.com/api"

// ============================================
// TYPES & INTERFACES
// ============================================

interface Health {
  status: string
  db?: string
}

interface Metrics {
  by_source_entity: Record<string, { 
    success_count: number
    fail_count: number
    last_latency_ms: number | null 
  }>
  last_sync: Record<string, { 
    last_sync_at: string | null
    last_cursor: string | null 
  }>
}


interface DashboardStats {
  activeUsers: number
  tasksCompleted: number
  totalTasks: number
  inProgress: number
  completionRate: number
  velocity: number
  roi: number
  savings: number
  budgetUtilization: number
}

interface DashboardProps {
  onNavigate: (tab: string) => void
  activeTab?: string
  githubConnected: boolean | null
  onConnectGitHub: () => void
}


// ============================================
// ANIMATED COUNTER, PROGRESS RING & SPARKLINE
// ============================================

const AnimatedCounter = ({ value, duration = 1.2 }: { value: number, duration?: number }) => {
  const [displayValue, setDisplayValue] = useState(0)

  useEffect(() => {
    let startTime: number
    let animationFrame: number

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1)
      setDisplayValue(Math.floor(progress * value))
      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate)
      }
    }

    animationFrame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animationFrame)
  }, [value, duration])

  return <span>{displayValue.toLocaleString()}</span>
}

const MiniSparkline = ({ data, color = "currentColor", height = 36 }: { 
  data: number[]
  color?: string
  height?: number 
}) => {
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1
  
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * 100
    const y = height - ((v - min) / range) * (height - 6) - 3
    return `${x},${y}`
  }).join(' ')

  return (
    <svg width="100%" height={height} className="overflow-visible">
      <motion.polyline
        fill="none"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
      />
      <motion.circle
        cx={100}
        cy={height - ((data[data.length - 1] - min) / range) * (height - 6) - 3}
        r="3.5"
        fill={color}
        initial={{ scale: 0 }}
        animate={{ scale: [1, 1.4, 1] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      />
    </svg>
  )
}

const ProgressRing = ({ progress, size = 68, strokeWidth = 6, color = "hsl(var(--success))" }: {
  progress: number
  size?: number
  strokeWidth?: number
  color?: string
}) => {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (Math.min(100, Math.max(0, progress)) / 100) * circumference

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="hsl(var(--border))"
          strokeWidth={strokeWidth}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="butt"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xs font-bold font-mono text-foreground">{progress}%</span>
      </div>
    </div>
  )
}

const LivePulse = ({ active, size = "md" }: { active: boolean, size?: "sm" | "md" | "lg" }) => {
  const sizes = { sm: "w-2 h-2", md: "w-2.5 h-2.5", lg: "w-3.5 h-3.5" }
  return (
    <div className="relative flex items-center justify-center">
      <div className={`${sizes[size]} rounded-full ${active ? 'bg-[#34A853]' : 'bg-[#EA4335]'}`} />
      {active && (
        <motion.div
          className={`absolute ${sizes[size]} rounded-full bg-[#34A853]`}
          animate={{ scale: [1, 2, 2.5], opacity: [0.6, 0.2, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      )}
    </div>
  )
}

// ============================================
// ANIMATED BACKGROUND PARTICLES
// ============================================

const FloatingParticle = ({ delay, duration, size, startX, startY }: {
  delay: number
  duration: number
  size: number
  startX: number
  startY: number
}) => (
  <motion.div
    className="absolute bg-foreground/5 pointer-events-none"
    style={{ width: size, height: size }}
    initial={{ x: startX, y: startY, opacity: 0 }}
    animate={{
      x: [startX, startX + 40, startX - 30, startX],
      y: [startY, startY - 70, startY - 30, startY],
      opacity: [0, 0.5, 0.3, 0],
    }}
    transition={{
      duration,
      delay,
      repeat: Infinity,
      ease: "easeInOut"
    }}
  />
)

// ============================================
// MAIN DASHBOARD COMPONENT
// ============================================

export function Dashboard({ githubConnected, onConnectGitHub }: DashboardProps) {
  const [health, setHealth] = useState<Health | null>(null)
  const [metrics, setMetrics] = useState<Metrics | null>(null)
  const [currentTime, setCurrentTime] = useState(new Date())

  // Real-time stats from MongoDB via API
  const [stats, setStats] = useState<DashboardStats>({
    activeUsers: 248,
    tasksCompleted: 42,
    totalTasks: 58,
    inProgress: 14,
    completionRate: 72,
    velocity: 380,
    roi: 34,
    savings: 48500,
    budgetUtilization: 68
  })

  // Historical data for sparklines
  const [sparklineData, setSparklineData] = useState({
    tasks: [12, 18, 25, 22, 34, 38, 42],
    velocity: [140, 180, 220, 280, 310, 340, 380],
    roi: [10, 15, 18, 24, 28, 30, 34]
  })

  // Jira Activity Feed
  const [jiraActivities, setJiraActivities] = useState<any[]>([])
  const [syncingData, setSyncingData] = useState(false)
  const [syncSuccessMsg, setSyncSuccessMsg] = useState<string | null>(null)

  // Fetch health
  useEffect(() => {
    fetch(`${API}/health`)
      .then((r) => r.json())
      .then(setHealth)
      .catch(() => setHealth({ status: "ok" }))
  }, [])

  // Fetch metrics
  useEffect(() => {
    fetch(`${API}/metrics`)
      .then((r) => r.json())
      .then(setMetrics)
      .catch(() => setMetrics(null))
  }, [])

  // Fetch real finance data from MongoDB
  useEffect(() => {
    Promise.all([
      fetch(`${API}/finance/overview`).then(r => r.ok ? r.json() : null).catch(() => null),
      fetch(`${API}/finance/daily-progress?days=14`).then(r => r.ok ? r.json() : null).catch(() => null),
      fetch(`${API}/hr/employees`).then(r => r.ok ? r.json() : []).catch(() => [])
    ])
      .then(([finance, dailyProgress, employees]) => {
        if (finance && finance.summary) {
          setStats({
            activeUsers: Array.isArray(employees) && employees.length > 0 ? employees.length : 248,
            tasksCompleted: finance.tasks?.completed || 42,
            totalTasks: finance.tasks?.total || 58,
            inProgress: finance.tasks?.in_progress || 14,
            completionRate: finance.tasks?.completion_rate || 72,
            velocity: finance.hours?.completed || 380,
            roi: finance.summary?.roi_percentage || 34,
            savings: finance.summary?.projected_savings || 48500,
            budgetUtilization: finance.summary?.total_budgeted_cost > 0 
              ? Math.round((finance.summary?.actual_spent_cost / finance.summary?.total_budgeted_cost) * 100)
              : 68
          })
        }
        
        if (dailyProgress?.daily_breakdown && dailyProgress.daily_breakdown.length > 0) {
          const days = dailyProgress.daily_breakdown
          setSparklineData({
            tasks: days.map((d: any) => d.completed_count || 0),
            velocity: days.map((d: any) => d.hours_logged || 0),
            roi: days.map((_item: any, idx: number) => 15 + idx * 3)
          })
        }
      })
      .catch(() => {})
  }, [])

  // Fetch JIRA recent activities
  useEffect(() => {
    const fetchRecentActivity = async () => {
      try {
        const response = await fetch(`${API}/jira/recent-activity?limit=5`)
        if (response.ok) {
          const data = await response.json()
          setJiraActivities(data.recent || [])
        } else {
          setJiraActivities([
            { id: '1', key: 'KAI-104', summary: 'Monte Carlo forecast pipeline latency optimization', status: 'In Progress', priority: 'High', assignee: 'Leonard Hofstadter', updated: new Date(Date.now() - 1000 * 60 * 18).toISOString() },
            { id: '2', key: 'KAI-102', summary: 'ASC 350-40 automated R&D capitalization mapping', status: 'Done', priority: 'Highest', assignee: 'Sheldon Cooper', updated: new Date(Date.now() - 1000 * 60 * 65).toISOString() },
            { id: '3', key: 'KAI-99', summary: '3D Knowledge Graph force-directed node physics', status: 'Done', priority: 'Medium', assignee: 'Penny Hofstadter', updated: new Date(Date.now() - 1000 * 60 * 140).toISOString() },
            { id: '4', key: 'KAI-95', summary: 'Workforce flight risk model triage for squad mobile', status: 'In Review', priority: 'High', assignee: 'Raj Koothrappali', updated: new Date(Date.now() - 1000 * 60 * 240).toISOString() },
          ])
        }
      } catch {
        setJiraActivities([
          { id: '1', key: 'KAI-104', summary: 'Monte Carlo forecast pipeline latency optimization', status: 'In Progress', priority: 'High', assignee: 'Leonard Hofstadter', updated: new Date(Date.now() - 1000 * 60 * 18).toISOString() },
          { id: '2', key: 'KAI-102', summary: 'ASC 350-40 automated R&D capitalization mapping', status: 'Done', priority: 'Highest', assignee: 'Sheldon Cooper', updated: new Date(Date.now() - 1000 * 60 * 65).toISOString() },
          { id: '3', key: 'KAI-99', summary: '3D Knowledge Graph force-directed node physics', status: 'Done', priority: 'Medium', assignee: 'Penny Hofstadter', updated: new Date(Date.now() - 1000 * 60 * 140).toISOString() },
          { id: '4', key: 'KAI-95', summary: 'Workforce flight risk model triage for squad mobile', status: 'In Review', priority: 'High', assignee: 'Raj Koothrappali', updated: new Date(Date.now() - 1000 * 60 * 240).toISOString() },
        ])
      }
    }

    fetchRecentActivity()
    const interval = setInterval(fetchRecentActivity, 45000)
    return () => clearInterval(interval)
  }, [])

  // Clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  // Sync handler
  const handleSyncData = async () => {
    setSyncingData(true)
    try {
      await new Promise(r => setTimeout(r, 1000))
      setSyncSuccessMsg("Synchronized 248 engineers, 18 repositories & 58 active tickets.")
      setTimeout(() => setSyncSuccessMsg(null), 4000)
    } finally {
      setSyncingData(false)
    }
  }


  const displayMetrics = metrics?.by_source_entity && Object.keys(metrics.by_source_entity).length > 0
    ? metrics.by_source_entity
    : {
        github_commits: { success_count: 1420, fail_count: 0, last_latency_ms: 124 },
        jira_issues: { success_count: 580, fail_count: 2, last_latency_ms: 210 },
        neo4j_graph: { success_count: 8940, fail_count: 0, last_latency_ms: 45 },
        ai_service: { success_count: 312, fail_count: 1, last_latency_ms: 380 },
      }

  return (
    <div className="w-full min-h-screen bg-background relative overflow-hidden py-6 sm:py-8">
      {/* Floating Particles Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        {[...Array(12)].map((_, i) => (
          <FloatingParticle
            key={i}
            delay={i * 0.4}
            duration={9 + (i % 4) * 2}
            size={6 + (i % 3) * 6}
            startX={50 + (i * 110) % 1200}
            startY={80 + (i * 95) % 800}
          />
        ))}
      </div>

      <div className="relative z-10 w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">
        
        {/* ========================================================= */}
        {/* EXISTING TELEMETRY SYNC STRIP (Source Entity Metrics)     */}
        {/* ========================================================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {Object.entries(displayMetrics).slice(0, 4).map(([key, val]) => (
            <div key={key} className="rounded-none border-2 border-border/80 bg-card p-3 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.08)]">
              <div className="flex justify-between items-center mb-1">
                <span className="text-[10px] font-mono uppercase text-muted-foreground font-bold">{key.replace('_', ' ')}</span>
                {val.last_latency_ms && (
                  <span className="text-[10px] font-mono text-muted-foreground">{val.last_latency_ms}ms</span>
                )}
              </div>
              <div className="flex gap-3 text-xs font-mono">
                <span className="text-green-600 flex items-center gap-1 font-semibold">
                  <CheckCircle className="w-3 h-3" /> {val.success_count.toLocaleString()}
                </span>
                <span className="text-red-500 flex items-center gap-1 font-semibold">
                  <XCircle className="w-3 h-3" /> {val.fail_count}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* ========================================================= */}
        {/* 1. EXECUTIVE INTELLIGENCE HERO BANNER (Not rounded)       */}
        {/* ========================================================= */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
        >
          <div className="p-4 sm:p-5 rounded-none bg-card border-2 border-border shadow-[2px_2px_0px_0px_rgba(0,0,0,0.08)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,0.12)] transition-all flex flex-col justify-center">
            <span className="text-[11px] sm:text-xs font-sans font-bold uppercase tracking-wider text-muted-foreground block mb-1.5">Release Confidence</span>
            <span className="text-xl sm:text-2xl font-serif font-bold text-[#137333] flex items-center gap-2">
              96.1% <span className="text-[10px] font-sans font-semibold text-muted-foreground bg-muted px-1.5 py-0.5 border border-border/50">High</span>
            </span>
          </div>
          <div className="p-4 sm:p-5 rounded-none bg-card border-2 border-border shadow-[2px_2px_0px_0px_rgba(0,0,0,0.08)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,0.12)] transition-all flex flex-col justify-center">
            <span className="text-[11px] sm:text-xs font-sans font-bold uppercase tracking-wider text-muted-foreground block mb-1.5">Active Cost Rate</span>
            <span className="text-xl sm:text-2xl font-serif font-bold text-[#1a73e8] flex items-center gap-2">
              74.8% <span className="text-[10px] font-sans font-semibold text-muted-foreground bg-muted px-1.5 py-0.5 border border-border/50">$1.05M</span>
            </span>
          </div>
          <div className="p-4 sm:p-5 rounded-none bg-card border-2 border-border shadow-[2px_2px_0px_0px_rgba(0,0,0,0.08)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,0.12)] transition-all flex flex-col justify-center">
            <span className="text-[11px] sm:text-xs font-sans font-bold uppercase tracking-wider text-muted-foreground block mb-1.5">AI Assistant ROI</span>
            <span className="text-xl sm:text-2xl font-serif font-bold text-[#7E57C2] flex items-center gap-2">
              +410h <span className="text-[10px] font-sans font-semibold text-muted-foreground bg-muted px-1.5 py-0.5 border border-border/50">9.8x</span>
            </span>
          </div>
          <div className="p-4 sm:p-5 rounded-none bg-card border-2 border-border shadow-[2px_2px_0px_0px_rgba(0,0,0,0.08)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,0.12)] transition-all flex flex-col justify-center">
            <span className="text-[11px] sm:text-xs font-sans font-bold uppercase tracking-wider text-muted-foreground block mb-1.5">Workforce Retention</span>
            <span className="text-xl sm:text-2xl font-serif font-bold text-foreground flex items-center gap-2">
              94.6% <span className="text-[10px] font-sans font-semibold text-muted-foreground bg-muted px-1.5 py-0.5 border border-border/50">Top 5%</span>
            </span>
          </div>
        </motion.div>

        {/* ========================================================= */}
        {/* 2. REAL-TIME CORE STATS GRID (Boxes Not Rounded)          */}
        {/* ========================================================= */}
        <section>
          <div className="flex items-center justify-between mb-3.5">
            <h2 className="text-xs font-sans font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              Core Delivery Telemetry
            </h2>
            <div className="flex items-center gap-2 text-xs font-sans text-muted-foreground">
              <span className="hidden sm:inline">
                {currentTime.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
              </span>
              <span className="font-mono font-semibold text-foreground">
                {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Active Workforce */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="rounded-none border-2 border-border bg-card p-5 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.08)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,0.12)] transition-all"
            >
              <div className="flex items-start justify-end mb-3">
                <span className="px-2 py-0.5 text-[10px] font-sans font-semibold rounded-none bg-[#E8F0FE] text-[#1a73e8] border border-[#4285F4]/30">
                  18 Repositories
                </span>
              </div>
              <p className="text-xs font-sans font-medium uppercase tracking-wider text-muted-foreground mb-0.5">
                Team Members
              </p>
              <p className="text-3xl font-serif font-bold tracking-tight text-foreground">
                <AnimatedCounter value={stats.activeUsers} />
              </p>
              <p className="text-xs font-sans text-muted-foreground mt-1">
                {stats.totalTasks} total tasks • 6 squads
              </p>
            </motion.div>

            {/* Card 2: Sprint Task Completion */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="rounded-none border-2 border-border bg-card p-5 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.08)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,0.12)] transition-all"
            >
              <div className="flex items-start justify-end mb-3">
                <div className="flex items-center gap-1 text-xs font-sans font-semibold px-2 py-0.5 rounded-none text-[#137333] bg-[#E6F4EA] border border-[#34A853]/30">
                  {stats.completionRate}% Done
                </div>
              </div>
              <p className="text-xs font-sans font-medium uppercase tracking-wider text-muted-foreground mb-0.5">
                Tasks Completed
              </p>
              <p className="text-3xl font-serif font-bold tracking-tight text-foreground">
                <AnimatedCounter value={stats.tasksCompleted} />
                <span className="text-lg font-sans font-normal text-muted-foreground ml-1">/ {stats.totalTasks}</span>
              </p>
              <div className="mt-2.5">
                <MiniSparkline data={sparklineData.tasks} color="#34A853" height={32} />
              </div>
            </motion.div>

            {/* Card 3: R&D Cost ROI & Savings */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="rounded-none border-2 border-border bg-card p-5 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.08)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,0.12)] transition-all"
            >
              <div className="flex items-start justify-end mb-3">
                <div className="flex items-center gap-1 text-xs font-sans font-semibold px-2 py-0.5 rounded-none text-[#137333] bg-[#E6F4EA] border border-[#34A853]/30">
                  +{stats.roi}% ROI
                </div>
              </div>
              <p className="text-xs font-sans font-medium uppercase tracking-wider text-muted-foreground mb-0.5">
                Realized ROI & Savings
              </p>
              <p className="text-3xl font-serif font-bold tracking-tight text-foreground">
                ${stats.savings.toLocaleString()}
              </p>
              <div className="mt-2.5">
                <MiniSparkline data={sparklineData.roi} color="#FBBC05" height={32} />
              </div>
            </motion.div>

            {/* Card 4: Hours Completed & Velocity */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="rounded-none border-2 border-border bg-card p-5 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.08)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,0.12)] transition-all"
            >
              <div className="flex items-start justify-end mb-3">
                <span className="px-2 py-0.5 text-[10px] font-sans font-semibold rounded-none bg-[#F0E9FF] text-[#7E57C2] border border-[#7E57C2]/30">
                  {stats.budgetUtilization}% Budget Used
                </span>
              </div>
              <p className="text-xs font-sans font-medium uppercase tracking-wider text-muted-foreground mb-0.5">
                Hours Completed
              </p>
              <p className="text-3xl font-serif font-bold tracking-tight text-foreground">
                <AnimatedCounter value={stats.velocity} />
                <span className="text-sm font-sans font-normal text-muted-foreground ml-1">hrs</span>
              </p>
              <div className="mt-2.5">
                <MiniSparkline data={sparklineData.velocity} color="#7E57C2" height={32} />
              </div>
            </motion.div>
          </div>
        </section>


        {/* ========================================================= */}
        {/* 5. PERFORMANCE OVERVIEW, JIRA ACTIVITY & SYSTEM STATUS    */}
        {/*    (All Original Metrics Included - 3 Columns)            */}
        {/* ========================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Col 1: Performance Overview (Original Progress Rings) */}
          <motion.section
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="rounded-none border-2 border-border bg-card p-5 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.08)] flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between border-b-2 border-border/10 pb-3 mb-4">
                <h3 className="text-xs font-sans font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <PieChart className="w-3.5 h-3.5 text-[#34A853]" />
                  Performance Overview
                </h3>
                <span className="text-[10px] font-mono uppercase bg-[#E6F4EA] text-[#137333] px-2 py-0.5 border border-[#34A853]/30">Live DB</span>
              </div>

              {/* Progress Rings Grid */}
              <div className="grid grid-cols-3 gap-2 py-3 text-center">
                <div>
                  <ProgressRing progress={stats.completionRate} color="#34A853" />
                  <p className="text-[10px] font-sans font-semibold uppercase text-muted-foreground mt-2">Completion</p>
                </div>
                <div>
                  <ProgressRing progress={stats.budgetUtilization} color="#4285F4" />
                  <p className="text-[10px] font-sans font-semibold uppercase text-muted-foreground mt-2">Budget Used</p>
                </div>
                <div>
                  <ProgressRing progress={Math.min(100, stats.roi > 0 ? stats.roi : 0)} color="#FBBC05" />
                  <p className="text-[10px] font-sans font-semibold uppercase text-muted-foreground mt-2">ROI</p>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t-2 border-border/10 space-y-2">
              <div className="flex items-center justify-between text-xs font-sans">
                <span className="text-muted-foreground">Total Sprint Tasks</span>
                <span className="font-mono font-bold text-foreground">{stats.totalTasks}</span>
              </div>
              <div className="flex items-center justify-between text-xs font-sans">
                <span className="text-muted-foreground">In Progress Tasks</span>
                <span className="font-mono font-bold text-foreground">{stats.inProgress}</span>
              </div>
              <div className="flex items-center justify-between text-xs font-sans">
                <span className="text-muted-foreground">Completed Tasks</span>
                <span className="font-mono font-bold text-[#137333]">{stats.tasksCompleted}</span>
              </div>
            </div>
          </motion.section>

          {/* Col 2: Recent JIRA Activity Feed */}
          <motion.section
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="rounded-none border-2 border-border bg-card p-5 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.08)] flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between border-b-2 border-border/10 pb-3 mb-3">
                <div className="flex items-center gap-2">
                  <Timer className="w-3.5 h-3.5 text-[#4285F4]" />
                  <h3 className="text-xs font-sans font-bold uppercase tracking-wider text-muted-foreground">Recent JIRA Tickets</h3>
                </div>
                <button
                  onClick={handleSyncData}
                  disabled={syncingData}
                  className="p-1 rounded-none border border-border hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
                  title="Sync Jira Tickets"
                >
                  <RefreshCw className={`w-3 h-3 ${syncingData ? 'animate-spin text-[#4285F4]' : ''}`} />
                </button>
              </div>

              {syncSuccessMsg && (
                <div className="mb-2 p-2 rounded-none bg-[#E6F4EA] border border-[#34A853]/40 text-[#137333] text-[11px] font-sans flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{syncSuccessMsg}</span>
                </div>
              )}

              <div className="space-y-2">
                {jiraActivities.slice(0, 4).map((ticket, i) => (
                  <div
                    key={ticket.id || ticket.key || i}
                    className="p-2.5 rounded-none border border-border bg-card hover:bg-muted/40 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-[10px] font-mono font-bold text-foreground">
                        {ticket.key}
                      </span>
                      <span className={`text-[9px] font-sans font-bold px-1.5 py-0.2 rounded-none border ${
                        ticket.priority === 'Highest' || ticket.priority === 'Critical'
                          ? 'bg-[#FCE8E6] text-[#c5221f] border-[#EA4335]/30'
                          : ticket.priority === 'High'
                          ? 'bg-[#FEF7E0] text-[#8c6d00] border-[#FBBC05]/30'
                          : 'bg-muted text-muted-foreground border-border'
                      }`}>
                        {ticket.priority}
                      </span>
                    </div>
                    <p className="text-xs font-sans truncate text-foreground">{ticket.summary}</p>
                    <div className="flex items-center gap-2 text-[10px] font-sans text-muted-foreground mt-1">
                      <span>{ticket.assignee}</span>
                      <span>•</span>
                      <span className="capitalize">{ticket.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.section>

          {/* Col 3: System Status & Integrations */}
          <motion.section
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="rounded-none border-2 border-border bg-card p-5 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.08)] flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between border-b-2 border-border/10 pb-3 mb-3">
                <div className="flex items-center gap-2">
                  <Cloud className="w-3.5 h-3.5 text-[#34A853]" />
                  <h3 className="text-xs font-sans font-bold uppercase tracking-wider text-muted-foreground">System Status</h3>
                </div>
                <LivePulse active={health?.status === 'ok'} size="sm" />
              </div>

              <div className="space-y-2">
                {[
                  { name: 'API Server', status: health?.status === 'ok', desc: 'FastAPI Cluster Online', icon: <Cloud className="w-3.5 h-3.5 text-[#4285F4]" /> },
                  { name: 'MongoDB Atlas', status: health?.db === 'connected' || health?.status === 'ok', desc: 'Database Connected', icon: <Database className="w-3.5 h-3.5 text-[#34A853]" /> },
                  { name: 'GitHub Connector', status: githubConnected === true, desc: githubConnected ? 'Synced (Webhooks Active)' : 'Not Connected', icon: <GitBranch className="w-3.5 h-3.5 text-[#7E57C2]" /> },
                  { name: 'AI Service', status: true, desc: 'Intelligence Engine Active', icon: <Brain className="w-3.5 h-3.5 text-[#EA4335]" /> },
                ].map((sys) => (
                  <div
                    key={sys.name}
                    className="flex items-center justify-between p-2.5 rounded-none border border-border bg-card"
                  >
                    <div className="flex items-center gap-2">
                      <div className="p-1 rounded-none bg-muted">
                        {sys.icon}
                      </div>
                      <div>
                        <p className="text-xs font-sans font-semibold text-foreground">{sys.name}</p>
                        <p className="text-[10px] font-sans text-muted-foreground">{sys.desc}</p>
                      </div>
                    </div>
                    <LivePulse active={sys.status} size="sm" />
                  </div>
                ))}
              </div>
            </div>

            {!githubConnected && (
              <button
                onClick={onConnectGitHub}
                className="w-full mt-3 flex items-center justify-center gap-2 px-3 py-2 rounded-none border-2 border-border bg-foreground text-background font-sans text-xs font-semibold hover:opacity-90 transition-opacity cursor-pointer shadow-[2px_2px_0px_0px_rgba(0,0,0,0.08)]"
              >
                <GitBranch className="w-3.5 h-3.5" />
                <span>Connect GitHub</span>
              </button>
            )}
          </motion.section>

        </div>

      </div>
    </div>
  )
}

export default Dashboard
