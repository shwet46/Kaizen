import React, { useEffect, useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  LiaDollarSignSolid as DollarSign,
  LiaExclamationTriangleSolid as AlertTriangle,
  LiaCheckCircleSolid as CheckCircle2,
  LiaClockSolid as Clock,
  LiaBullseyeSolid as Target,
  LiaChartPieSolid as PieChart,
  LiaCalendarSolid as Calendar,
  LiaChevronDownSolid as ChevronDown,
  LiaChevronUpSolid as ChevronUp,
  LiaSyncSolid as RefreshCw,
  LiaShieldAltSolid as Shield,
  LiaFireSolid as Flame,
  LiaChartLineSolid as Activity,
  LiaFileDownloadSolid as Download,
  LiaCheckSolid as Check,
  LiaCoinsSolid as Coins,
  LiaSearchSolid as Search,
  LiaBoltSolid as Zap
} from "react-icons/lia"

const API = import.meta.env.VITE_API_URL || "https://kaizen-backend-8x01.onrender.com/api"

// ============================================
// TYPES & INTERFACES
// ============================================

export interface FinanceOverview {
  summary: {
    total_budgeted_cost: number
    actual_spent_cost: number
    remaining_budget: number
    market_rate_cost: number
    projected_savings: number
    roi_percentage: number
    avg_hourly_rate: number
    currency: string
    capex_eligible_amount?: number
    opex_maintenance_amount?: number
    capex_ratio_percentage?: number
    burn_rate_weekly?: number
    cost_per_story_point?: number
    rnd_tax_credit_estimate?: number
  }
  tasks: {
    total: number
    completed: number
    in_progress: number
    pending: number
    completion_rate: number
  }
  hours: {
    total_estimated: number
    completed: number
    remaining: number
  }
  allocation_history?: Array<{
    _id: string
    sprint_name: string
    created_at: string
    issues_created: number
  }>
}

export interface FeatureCost {
  id: string
  name: string
  budget: number
  actual: number
  variance: number
  storyPoints: number
  status: 'on_track' | 'over_budget' | 'at_risk' | 'completed'
  lead: string
  capexEligible: boolean
}

export interface DailyBreakdownItem {
  date: string
  day_name?: string
  completed: number
  started: number
  delayed: number
  on_track: number
  cost_incurred: number
  hours_logged: number
  cumulative_completed: number
  cumulative_cost: number
  cumulative_hours: number
  tag?: string
}

export interface DailyProgress {
  period: string
  daily_breakdown: DailyBreakdownItem[]
  totals: {
    total_completed: number
    total_cost: number
    total_hours: number
    avg_daily_completion: number
  }
}

export interface SprintItem {
  sprint_id: string
  name: string
  state: string
  start_date: string
  end_date: string
  goal: string
  metrics: {
    total_tasks: number
    completed_tasks: number
    delayed_tasks: number
    in_progress_tasks?: number
    completion_rate: number
    velocity: number
    committed_points?: number
  }
  financials: {
    planned_cost: number
    actual_cost: number
    delay_cost: number
    total_cost: number
    savings: number
    roi_percentage: number
  }
  disciplineCosts?: {
    engineering: number
    architecture: number
    qa_devops: number
  }
}

export interface SprintAnalysis {
  sprints: SprintItem[]
  overall: {
    total_planned_cost: number
    total_actual_cost: number
    total_savings: number
    average_roi: number
  }
}

export interface RiskItem {
  id: string
  type: string
  category: string
  severity: 'high' | 'medium' | 'low'
  count: number
  potential_cost_impact: number
  recoverable_impact: number
  description: string
  recommendation: string
  timeline: string
  mitigated?: boolean
}

export interface RiskAssessment {
  overall_risk_level: string
  total_risk_exposure: number
  risks: RiskItem[]
  summary: {
    high_risks: number
    medium_risks: number
    low_risks: number
  }
}

interface FinanceROIProps {
  onBack?: () => void
}

// ============================================
// COMPREHENSIVE LOGICAL MOCK DATA (FINOPS STANDARDS)
// ============================================

const MOCK_OVERVIEW: FinanceOverview = {
  summary: {
    total_budgeted_cost: 348000,
    actual_spent_cost: 214200,
    remaining_budget: 133800,
    market_rate_cost: 425630,
    projected_savings: 211430,
    roi_percentage: 98.7,
    avg_hourly_rate: 78,
    currency: "USD",
    capex_eligible_amount: 146510,
    opex_maintenance_amount: 67690,
    capex_ratio_percentage: 68.4,
    burn_rate_weekly: 24800,
    cost_per_story_point: 462,
    rnd_tax_credit_estimate: 29400
  },
  tasks: {
    total: 184,
    completed: 118,
    in_progress: 42,
    pending: 24,
    completion_rate: 64
  },
  hours: {
    total_estimated: 4460,
    completed: 2746,
    remaining: 1714
  },
  allocation_history: [
    {
      _id: "alloc_1",
      sprint_name: "Sprint 24 - Predictive Vector Indexing",
      created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
      issues_created: 44
    },
    {
      _id: "alloc_2",
      sprint_name: "Sprint 23 - Streaming Allocation & Graph Sync",
      created_at: new Date(Date.now() - 17 * 86400000).toISOString(),
      issues_created: 48
    },
    {
      _id: "alloc_3",
      sprint_name: "Sprint 22 - OAuth2 & Security Hardening",
      created_at: new Date(Date.now() - 31 * 86400000).toISOString(),
      issues_created: 42
    }
  ]
}

const MOCK_FEATURE_COSTS: FeatureCost[] = [
  {
    id: "EPIC-201",
    name: "Real-time Knowledge Graph Engine (Neo4j & Cypher)",
    budget: 68000,
    actual: 62400,
    variance: -8.2,
    storyPoints: 85,
    status: "on_track",
    lead: "Alex Chen (Staff Architect)",
    capexEligible: true
  },
  {
    id: "EPIC-202",
    name: "Multi-Agent Smart Task Allocator (Gemini 1.5)",
    budget: 84000,
    actual: 88200,
    variance: 5.0,
    storyPoints: 110,
    status: "over_budget",
    lead: "Sarah Jenkins (Lead ML)",
    capexEligible: true
  },
  {
    id: "EPIC-203",
    name: "Jira & GitHub Dual Sync Webhooks Pipeline",
    budget: 45000,
    actual: 39800,
    variance: -11.5,
    storyPoints: 55,
    status: "on_track",
    lead: "Marcus Vance (Sr. Backend)",
    capexEligible: true
  },
  {
    id: "EPIC-204",
    name: "FinOps Telemetry & CapEx Automated Reporting",
    budget: 52000,
    actual: 48600,
    variance: -6.5,
    storyPoints: 64,
    status: "on_track",
    lead: "Elena Rostova (Full Stack)",
    capexEligible: true
  },
  {
    id: "EPIC-205",
    name: "Legacy Monolith Refactor & CVE Remediation",
    budget: 35000,
    actual: 42100,
    variance: 20.3,
    storyPoints: 42,
    status: "at_risk",
    lead: "David Kim (DevOps / SRE)",
    capexEligible: false
  }
]

const MOCK_SPRINT_ANALYSIS: SprintAnalysis = {
  sprints: [
    {
      sprint_id: "sprint_24",
      name: "Sprint 24 - Predictive Vector Indexing",
      state: "active",
      start_date: "2026-10-06T00:00:00.000Z",
      end_date: "2026-10-20T00:00:00.000Z",
      goal: "Deploy low-latency embedding cache & multi-tenant isolation",
      metrics: {
        total_tasks: 44,
        completed_tasks: 31,
        delayed_tasks: 3,
        in_progress_tasks: 10,
        completion_rate: 71,
        velocity: 52,
        committed_points: 58
      },
      financials: {
        planned_cost: 48000,
        actual_cost: 44200,
        delay_cost: 3200,
        total_cost: 47400,
        savings: 14800,
        roi_percentage: 31.2
      },
      disciplineCosts: {
        engineering: 31200,
        architecture: 8400,
        qa_devops: 7800
      }
    },
    {
      sprint_id: "sprint_23",
      name: "Sprint 23 - Streaming Allocation & Graph Sync",
      state: "closed",
      start_date: "2026-09-22T00:00:00.000Z",
      end_date: "2026-10-05T00:00:00.000Z",
      goal: "Integrate Neo4j bi-directional sync and live transcript parser",
      metrics: {
        total_tasks: 48,
        completed_tasks: 46,
        delayed_tasks: 2,
        in_progress_tasks: 0,
        completion_rate: 96,
        velocity: 64,
        committed_points: 62
      },
      financials: {
        planned_cost: 52000,
        actual_cost: 49800,
        delay_cost: 1800,
        total_cost: 51600,
        savings: 18400,
        roi_percentage: 35.6
      },
      disciplineCosts: {
        engineering: 34500,
        architecture: 9600,
        qa_devops: 7500
      }
    },
    {
      sprint_id: "sprint_22",
      name: "Sprint 22 - OAuth2 & Security Hardening",
      state: "closed",
      start_date: "2026-09-08T00:00:00.000Z",
      end_date: "2026-09-21T00:00:00.000Z",
      goal: "Implement PKCE auth flow, SOC2 event auditing, and session revocation",
      metrics: {
        total_tasks: 42,
        completed_tasks: 40,
        delayed_tasks: 2,
        in_progress_tasks: 0,
        completion_rate: 95,
        velocity: 56,
        committed_points: 55
      },
      financials: {
        planned_cost: 46000,
        actual_cost: 44100,
        delay_cost: 2100,
        total_cost: 46200,
        savings: 16800,
        roi_percentage: 36.3
      },
      disciplineCosts: {
        engineering: 29800,
        architecture: 8200,
        qa_devops: 8200
      }
    },
    {
      sprint_id: "sprint_21",
      name: "Sprint 21 - Core Orchestrator & Fast Execution",
      state: "closed",
      start_date: "2026-08-25T00:00:00.000Z",
      end_date: "2026-09-07T00:00:00.000Z",
      goal: "Bootstrap asynchronous job workers and circuit breaker resiliency",
      metrics: {
        total_tasks: 50,
        completed_tasks: 47,
        delayed_tasks: 3,
        in_progress_tasks: 0,
        completion_rate: 94,
        velocity: 60,
        committed_points: 60
      },
      financials: {
        planned_cost: 49000,
        actual_cost: 44300,
        delay_cost: 2900,
        total_cost: 47200,
        savings: 17200,
        roi_percentage: 36.4
      },
      disciplineCosts: {
        engineering: 30400,
        architecture: 9100,
        qa_devops: 7700
      }
    }
  ],
  overall: {
    total_planned_cost: 195000,
    total_actual_cost: 182400,
    total_savings: 67200,
    average_roi: 34.9
  }
}

// Generate 30 days of mathematically coherent daily progress
const generateMockDailyProgress = (): DailyProgress => {
  const days: DailyBreakdownItem[] = []
  const today = new Date()
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  
  let cumCompleted = 0
  let cumHours = 0
  let cumCost = 0

  for (let i = 29; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const dateStr = d.toISOString().split('T')[0]
    const dayOfWeek = d.getDay()
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6

    const seed = (i * 13 + 7) % 100
    const completed = isWeekend ? (seed % 4 === 0 ? 1 : 0) : 3 + (seed % 5)
    const started = isWeekend ? 0 : 2 + (seed % 4)
    const delayed = isWeekend ? 0 : (seed % 7 === 0 ? 1 : 0)
    const hours = isWeekend ? (completed ? 8 : 2) : 48 + (seed % 35)
    const cost = hours * 78

    cumCompleted += completed
    cumHours += hours
    cumCost += cost

    let tag = 'Normal Delivery'
    if (isWeekend) tag = 'Weekend Standby'
    else if (completed >= 6) tag = 'Sprint Milestone'
    else if (hours >= 75) tag = 'High Velocity'

    days.push({
      date: dateStr,
      day_name: dayNames[dayOfWeek],
      completed,
      started,
      delayed,
      on_track: completed + started - delayed,
      cost_incurred: cost,
      hours_logged: hours,
      cumulative_completed: cumCompleted,
      cumulative_cost: cumCost,
      cumulative_hours: cumHours,
      tag
    })
  }

  return {
    period: "30 days",
    daily_breakdown: days,
    totals: {
      total_completed: cumCompleted,
      total_cost: cumCost,
      total_hours: cumHours,
      avg_daily_completion: Math.round((cumCompleted / 30) * 10) / 10
    }
  }
}

const MOCK_DAILY_PROGRESS: DailyProgress = generateMockDailyProgress()

const MOCK_RISK_ASSESSMENT: RiskAssessment = {
  overall_risk_level: "medium",
  total_risk_exposure: 38400,
  risks: [
    {
      id: "risk-1",
      type: "Vector Search Scope Expansion",
      category: "Scope Creep & Cloud Compute",
      severity: "high",
      count: 14,
      potential_cost_impact: 18500,
      recoverable_impact: 14200,
      timeline: "Q4 Sprint 25",
      description: "Unbounded multi-repo semantic embedding indexing expanding RAM footprint on Milvus/Neo4j cluster by 42%.",
      recommendation: "Enforce binary scalar quantization (SQ8) to shrink RAM footprint by 75% and freeze non-essential schema additions.",
      mitigated: false
    },
    {
      id: "risk-2",
      type: "Staff Architect Review Bottleneck",
      category: "Resource Concentration",
      severity: "medium",
      count: 3,
      potential_cost_impact: 9800,
      recoverable_impact: 7500,
      timeline: "Ongoing Sprint 24",
      description: "Core Auth PKCE, Smart Allocate, and Webhook worker PR reviews are concentrated on 1 senior architect, dragging cycle time from 1.2d to 4.1d.",
      recommendation: "Delegate PR approval matrix to 2 mid-level squad leads and decouple RBAC middleware API interfaces.",
      mitigated: false
    },
    {
      id: "risk-3",
      type: "Un-cached LLM API Token Spikes",
      category: "Vendor Unit Economics",
      severity: "medium",
      count: 8,
      potential_cost_impact: 6400,
      recoverable_impact: 5100,
      timeline: "Peak Sprint Planning",
      description: "Hierarchical task breakdown invokes repeated cold Gemini 1.5 queries during sprint planning sessions without caching layer.",
      recommendation: "Enable Redis semantic cache for frequent feature allocation prompts with 24h TTL.",
      mitigated: false
    },
    {
      id: "risk-4",
      type: "Stale Branch Merge Overhead",
      category: "Technical Debt",
      severity: "low",
      count: 12,
      potential_cost_impact: 3700,
      recoverable_impact: 3200,
      timeline: "Bi-weekly Cleanups",
      description: "12 feature branches untouched for >21 days across secondary service repos, risking expensive conflict resolution.",
      recommendation: "Trigger automated stale branch cleanup policy and synchronize Jira issue status.",
      mitigated: false
    }
  ],
  summary: {
    high_risks: 1,
    medium_risks: 2,
    low_risks: 1
  }
}

// ============================================
// ANIMATED VALUE & VISUAL HELPERS
// ============================================

const AnimatedValue = ({ value, prefix = "", suffix = "", duration = 1.2 }: { 
  value: number
  prefix?: string
  suffix?: string
  duration?: number 
}) => {
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

  return <span>{prefix}{displayValue.toLocaleString()}{suffix}</span>
}

// Enhanced Multi-Line SVG Chart
const EnhancedAreaChart = ({ 
  actualData, 
  budgetBaseline = 348000, 
  height = 140 
}: { 
  actualData: number[]
  budgetBaseline?: number
  height?: number 
}) => {
  if (actualData.length < 2) return null
  
  const max = Math.max(...actualData, budgetBaseline * 0.8)
  const min = Math.min(...actualData, 0)
  const range = max - min || 1
  
  const points = actualData.map((v, i) => {
    const x = (i / (actualData.length - 1)) * 100
    const y = height - ((v - min) / range) * (height - 18) - 10
    return `${x},${y}`
  }).join(' ')
  
  const areaPoints = `0,${height} ${points} 100,${height}`
  const baselineY = height - ((budgetBaseline * 0.65 - min) / range) * (height - 18) - 10

  return (
    <div className="relative w-full">
      <svg width="100%" height={height} className="overflow-visible" preserveAspectRatio="none" viewBox={`0 0 100 ${height}`}>
        <defs>
          <linearGradient id="area-spend-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#34A853" stopOpacity="0.32" />
            <stop offset="100%" stopColor="#34A853" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        <line x1="0" y1={height * 0.25} x2="100" y2={height * 0.25} stroke="currentColor" strokeOpacity="0.08" strokeDasharray="2,2" />
        <line x1="0" y1={height * 0.5} x2="100" y2={height * 0.5} stroke="currentColor" strokeOpacity="0.08" strokeDasharray="2,2" />
        <line x1="0" y1={height * 0.75} x2="100" y2={height * 0.75} stroke="currentColor" strokeOpacity="0.08" strokeDasharray="2,2" />

        {/* Budget Target Line */}
        <line 
          x1="0" 
          y1={Math.max(10, baselineY)} 
          x2="100" 
          y2={Math.max(10, baselineY)} 
          stroke="#FBBC05" 
          strokeWidth="1.2" 
          strokeDasharray="3,3" 
        />

        {/* Area fill */}
        <motion.polygon
          fill="url(#area-spend-gradient)"
          points={areaPoints}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        />

        {/* Spend polyline */}
        <motion.polyline
          fill="none"
          stroke="#34A853"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={points}
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        />
      </svg>
      <div className="flex items-center justify-between text-[10px] font-mono text-muted-foreground mt-2 px-1">
        <span>30 Days Ago</span>
        <span className="text-[#FBBC05] font-semibold">--- Planned Baseline ($226k Target)</span>
        <span className="text-[#34A853] font-semibold">● Actual Spend ($214.2k)</span>
        <span>Today</span>
      </div>
    </div>
  )
}

// Half-Circle ROI Gauge with high contrast
const ROIGauge = ({ value, size = 150 }: { value: number, size?: number }) => {
  const radius = (size - 24) / 2
  const circumference = radius * Math.PI
  const clampedValue = Math.max(-50, Math.min(150, value))
  const normalizedValue = (clampedValue + 50) / 200
  const offset = circumference - normalizedValue * circumference

  return (
    <div className="relative flex flex-col items-center justify-center" style={{ width: size, height: size / 2 + 30 }}>
      <svg width={size} height={size / 2 + 16} className="overflow-visible">
        {/* Track arc */}
        <path
          d={`M 12 ${size / 2} A ${radius} ${radius} 0 0 1 ${size - 12} ${size / 2}`}
          fill="none"
          stroke="hsl(var(--border))"
          strokeWidth="12"
          strokeLinecap="round"
        />
        {/* Value arc */}
        <motion.path
          d={`M 12 ${size / 2} A ${radius} ${radius} 0 0 1 ${size - 12} ${size / 2}`}
          fill="none"
          stroke="#34A853"
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.4, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-end pb-1">
        <span className="text-3xl font-serif font-bold text-[#137333] tracking-tight">
          +{value}%
        </span>
        <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
          Net Capital ROI
        </span>
      </div>
    </div>
  )
}

// Risk Indicator Badge
const RiskBadge = ({ level }: { level: string }) => {
  const config = {
    high: { color: "bg-[#FCE8E6] text-[#c5221f] border-[#EA4335]/40", text: "HIGH RISK", icon: <Flame className="w-3 h-3" /> },
    medium: { color: "bg-[#FEF7E0] text-[#8c6d00] border-[#FBBC05]/40", text: "MEDIUM RISK", icon: <AlertTriangle className="w-3 h-3" /> },
    low: { color: "bg-[#E6F4EA] text-[#137333] border-[#34A853]/40", text: "LOW RISK", icon: <Shield className="w-3 h-3" /> }
  }
  const c = config[level as keyof typeof config] || config.medium
  
  return (
    <div className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-none border ${c.color} font-mono text-[10px] font-bold uppercase tracking-wider`}>
      {c.icon}
      <span>{c.text}</span>
    </div>
  )
}

// ============================================
// MAIN COMPONENT
// ============================================

export function FinanceROI({ onBack }: FinanceROIProps) {
  // Primary state backed by rich logical mock defaults
  const [overview, setOverview] = useState<FinanceOverview>(MOCK_OVERVIEW)
  const [dailyProgress, setDailyProgress] = useState<DailyProgress>(MOCK_DAILY_PROGRESS)
  const [sprintAnalysis, setSprintAnalysis] = useState<SprintAnalysis>(MOCK_SPRINT_ANALYSIS)
  const [riskAssessment, setRiskAssessment] = useState<RiskAssessment>(MOCK_RISK_ASSESSMENT)
  const [featureCosts] = useState<FeatureCost[]>(MOCK_FEATURE_COSTS)

  // UI state
  const [activeTab, setActiveTab] = useState<'overview' | 'sprints' | 'daily' | 'risks'>('overview')
  const [sprintFilter, setSprintFilter] = useState<'all' | 'active' | 'closed'>('all')
  const [dailyFilterDays, setDailyFilterDays] = useState<number>(30)
  const [dailySearchQuery, setDailySearchQuery] = useState('')
  const [expandedSprintId, setExpandedSprintId] = useState<string | null>('sprint_24')
  const [refreshing, setRefreshing] = useState(false)
  const [mitigatedRisks, setMitigatedRisks] = useState<Record<string, boolean>>({})

  // Fetch real data from backend, fallback seamlessly to mock data
  const fetchData = async () => {
    setRefreshing(true)
    try {
      const [overviewRes, dailyRes, sprintRes, riskRes] = await Promise.all([
        fetch(`${API}/finance/overview`).then(r => r.ok ? r.json() : null).catch(() => null),
        fetch(`${API}/finance/daily-progress?days=${dailyFilterDays}`).then(r => r.ok ? r.json() : null).catch(() => null),
        fetch(`${API}/finance/sprint-analysis`).then(r => r.ok ? r.json() : null).catch(() => null),
        fetch(`${API}/finance/risk-assessment`).then(r => r.ok ? r.json() : null).catch(() => null)
      ])
      
      if (overviewRes && overviewRes.summary && overviewRes.summary.total_budgeted_cost > 0) {
        setOverview(prev => ({ ...prev, ...overviewRes }))
      }
      if (dailyRes && dailyRes.daily_breakdown && dailyRes.daily_breakdown.length > 0) {
        setDailyProgress(dailyRes)
      }
      if (sprintRes && sprintRes.sprints && sprintRes.sprints.length > 0) {
        setSprintAnalysis(sprintRes)
      }
      if (riskRes && riskRes.risks && riskRes.risks.length > 0) {
        setRiskAssessment(riskRes)
      }
    } catch {
      // Retain standard mock data
    } finally {
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [dailyFilterDays])

  // Extract chart data from daily progress
  const chartCosts = useMemo(() => {
    return dailyProgress.daily_breakdown.map(d => d.cumulative_cost)
  }, [dailyProgress])

  // Filter sprints
  const filteredSprints = useMemo(() => {
    if (sprintFilter === 'all') return sprintAnalysis.sprints
    return sprintAnalysis.sprints.filter(s => s.state === sprintFilter)
  }, [sprintAnalysis, sprintFilter])

  // Filter daily progress
  const filteredDailyBreakdown = useMemo(() => {
    let list = dailyProgress.daily_breakdown.slice(-dailyFilterDays)
    if (dailySearchQuery.trim()) {
      const q = dailySearchQuery.toLowerCase()
      list = list.filter(d => 
        d.date.toLowerCase().includes(q) || 
        (d.day_name && d.day_name.toLowerCase().includes(q)) ||
        (d.tag && d.tag.toLowerCase().includes(q))
      )
    }
    return list
  }, [dailyProgress, dailyFilterDays, dailySearchQuery])

  // Toggle risk mitigation simulation
  const toggleMitigateRisk = (riskId: string) => {
    setMitigatedRisks(prev => ({
      ...prev,
      [riskId]: !prev[riskId]
    }))
  }

  // Calculate live dynamic risk exposure accounting for simulated mitigations
  const liveRiskExposure = useMemo(() => {
    let total = riskAssessment.total_risk_exposure
    riskAssessment.risks.forEach(r => {
      if (mitigatedRisks[r.id]) {
        total -= (r.recoverable_impact || r.potential_cost_impact)
      }
    })
    return Math.max(0, total)
  }, [riskAssessment, mitigatedRisks])

  const totalRecoveredSavings = useMemo(() => {
    let total = 0
    riskAssessment.risks.forEach(r => {
      if (mitigatedRisks[r.id]) {
        total += (r.recoverable_impact || r.potential_cost_impact)
      }
    })
    return total
  }, [riskAssessment, mitigatedRisks])

  // Export CSV Audit Data
  const handleExportCSV = () => {
    const rows = [
      ["Date", "Hours Logged", "Daily Spend (USD)", "Completed Tasks", "Cumulative Spend (USD)"],
      ...dailyProgress.daily_breakdown.map(d => [
        d.date,
        d.hours_logged,
        d.cost_incurred,
        d.completed,
        d.cumulative_cost
      ])
    ]
    const csvContent = "data:text/csv;charset=utf-8," + rows.map(e => e.join(",")).join("\n")
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `kaizen_finops_audit_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="w-full min-h-screen bg-background py-6 sm:py-8">
      <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">
        
        {/* ========================================================= */}
        {/* 1. HEADER & EXECUTIVE TELEMETRY BAR                       */}
        {/* ========================================================= */}
        <header className="space-y-4 border-b-2 border-border/70 pb-5">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight text-foreground">
                FinOps & <em className="text-[#FBBC05] italic font-serif">R&D Software Capitalization</em>
              </h1>
              <p className="text-xs sm:text-sm font-sans text-muted-foreground mt-0.5 max-w-3xl">
                Continuous software capitalization telemetry, feature-level unit economics, and sprint ROI tracking across 18 repositories.
              </p>
            </div>

            <div className="flex items-center gap-2.5 flex-wrap">
              <button
                onClick={handleExportCSV}
                className="flex items-center gap-1.5 px-3 py-2 rounded-none border-2 border-border bg-card text-foreground font-sans text-xs font-semibold hover:bg-muted transition-all cursor-pointer shadow-[2px_2px_0px_0px_rgba(0,0,0,0.08)]"
                title="Download FinOps CapEx Audit Log CSV"
              >
                <Download className="w-3.5 h-3.5 text-[#4285F4]" />
                <span>Export Audit CSV</span>
              </button>

              <button
                onClick={fetchData}
                disabled={refreshing}
                className="flex items-center gap-1.5 px-3 py-2 rounded-none border-2 border-border bg-card text-foreground font-sans text-xs font-semibold hover:bg-muted transition-all cursor-pointer shadow-[2px_2px_0px_0px_rgba(0,0,0,0.08)]"
              >
                <RefreshCw className={`w-3.5 h-3.5 rounded-full ${refreshing ? 'animate-spin text-[#34A853]' : ''}`} />
                <span>Refresh</span>
              </button>
            </div>
          </div>

          {/* Tab Navigation */}
          <nav className="flex items-center gap-2 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden pt-2">
            {[
              { id: 'overview', label: 'Financial Overview', count: 'Executive', icon: <PieChart className="w-4 h-4" /> },
              { id: 'sprints', label: 'Sprint Analysis', count: `${sprintAnalysis.sprints.length} Sprints`, icon: <Target className="w-4 h-4" /> },
              { id: 'daily', label: 'Daily Burn & Velocity', count: `${dailyProgress.period}`, icon: <Calendar className="w-4 h-4" /> },
              { id: 'risks', label: 'Cost Risk Exposure', count: `$${(liveRiskExposure / 1000).toFixed(1)}k at Risk`, icon: <AlertTriangle className="w-4 h-4" /> }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center gap-2 px-3.5 py-2 font-sans text-xs sm:text-sm font-semibold rounded-none transition-all cursor-pointer border-2 ${
                  activeTab === tab.id 
                    ? 'border-border bg-foreground text-background shadow-[2px_2px_0px_0px_rgba(0,0,0,0.12)]' 
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/60'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
                <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-none ${
                  activeTab === tab.id ? 'bg-background/20 text-background' : 'bg-muted text-muted-foreground'
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </nav>
        </header>

        {/* ========================================================= */}
        {/* 2. TAB CONTENTS                                           */}
        {/* ========================================================= */}
        <main className="w-full space-y-6">
          <AnimatePresence mode="wait">
            
            {/* ------------------------------------------------------- */}
            {/* TAB 1: OVERVIEW                                         */}
            {/* ------------------------------------------------------- */}
            {activeTab === 'overview' && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-6"
              >
                {/* Executive Strip */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="rounded-none border-2 border-border bg-card p-4 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.08)]">
                    <p className="text-[10px] font-mono uppercase font-bold text-muted-foreground">Total Budget Allocated</p>
                    <p className="text-2xl sm:text-3xl font-serif font-bold text-foreground mt-0.5">
                      ${overview.summary.total_budgeted_cost.toLocaleString()}
                    </p>
                    <div className="flex items-center justify-between text-[11px] font-sans text-muted-foreground mt-2">
                      <span>4,460 Total Hours</span>
                      <span className="font-mono text-foreground font-semibold">61.5% Spent</span>
                    </div>
                  </div>

                  <div className="rounded-none border-2 border-border bg-card p-4 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.08)]">
                    <p className="text-[10px] font-mono uppercase font-bold text-muted-foreground">Market Benchmark Value</p>
                    <p className="text-2xl sm:text-3xl font-serif font-bold text-[#1a73e8] mt-0.5">
                      ${overview.summary.market_rate_cost.toLocaleString()}
                    </p>
                    <div className="flex items-center justify-between text-[11px] font-sans text-muted-foreground mt-2">
                      <span>Agency Equiv @ $155/hr</span>
                      <span className="font-mono text-[#1a73e8] font-semibold">+1.99x Multiplier</span>
                    </div>
                  </div>

                  <div className="rounded-none border-2 border-border bg-card p-4 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.08)]">
                    <p className="text-[10px] font-mono uppercase font-bold text-muted-foreground">Net Realized Savings</p>
                    <p className="text-2xl sm:text-3xl font-serif font-bold text-[#137333] mt-0.5">
                      ${overview.summary.projected_savings.toLocaleString()}
                    </p>
                    <div className="flex items-center justify-between text-[11px] font-sans text-muted-foreground mt-2">
                      <span>Retained Capital</span>
                      <span className="font-mono text-[#137333] font-semibold">+{overview.summary.roi_percentage}% ROI</span>
                    </div>
                  </div>

                  <div className="rounded-none border-2 border-border bg-card p-4 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.08)]">
                    <p className="text-[10px] font-mono uppercase font-bold text-muted-foreground">Weekly Burn & Runway</p>
                    <p className="text-2xl sm:text-3xl font-serif font-bold text-foreground mt-0.5">
                      ${(overview.summary.burn_rate_weekly || 24800).toLocaleString()}<span className="text-sm font-sans font-normal text-muted-foreground">/wk</span>
                    </p>
                    <div className="flex items-center justify-between text-[11px] font-sans text-muted-foreground mt-2">
                      <span>${overview.summary.remaining_budget.toLocaleString()} left</span>
                      <span className="font-mono text-[#1a73e8] font-semibold">5.4 Weeks Runway</span>
                    </div>
                  </div>
                </div>

                {/* Hero 2-Column: ROI Gauge Card & Unit Economics */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* ROI Engine Card */}
                  <div className="lg:col-span-1 rounded-none border-2 border-border bg-card p-6 flex flex-col justify-between shadow-[2px_2px_0px_0px_rgba(0,0,0,0.08)]">
                    <div>
                      <div className="flex items-center justify-between border-b-2 border-border/10 pb-3 mb-4">
                        <span className="text-xs font-sans font-bold uppercase tracking-wider text-muted-foreground">Capital Efficiency Gauge</span>
                        <span className="px-2 py-0.5 text-[9px] font-mono font-bold bg-[#E6F4EA] text-[#137333] border border-[#34A853]/30">High Yield</span>
                      </div>

                      <div className="py-2 flex justify-center">
                        <ROIGauge value={overview.summary.roi_percentage} size={170} />
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t-2 border-border/10 space-y-2 text-xs font-sans">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Internal Blended Rate</span>
                        <span className="font-mono font-bold">${overview.summary.avg_hourly_rate}/hr</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">External Market Baseline</span>
                        <span className="font-mono font-bold text-muted-foreground">$155/hr</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Cost per Story Point</span>
                        <span className="font-mono font-bold text-[#1a73e8]">${overview.summary.cost_per_story_point || 462} / pt</span>
                      </div>
                    </div>
                  </div>

                  {/* 4 Core Financial Metrics */}
                  <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="rounded-none border-2 border-border bg-card p-5 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.08)]">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-mono uppercase font-bold text-muted-foreground">Spent to Date</span>
                        <span className="text-xs font-mono font-bold text-[#FBBC05] bg-[#FEF7E0] px-2 py-0.5 border border-[#FBBC05]/30">
                          61.5%
                        </span>
                      </div>
                      <p className="text-2xl sm:text-3xl font-serif font-bold text-foreground">
                        <AnimatedValue value={overview.summary.actual_spent_cost} prefix="$" />
                      </p>
                      <div className="h-2 rounded-none bg-muted mt-3 overflow-hidden border border-border/40">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: "61.5%" }}
                          transition={{ duration: 1 }}
                          className="h-full bg-[#FBBC05]"
                        />
                      </div>
                      <p className="text-[11px] font-sans text-muted-foreground mt-2">
                        2,746 engineering hours consumed across 6 squads
                      </p>
                    </div>

                    <div className="rounded-none border-2 border-border bg-card p-5 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.08)]">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-mono uppercase font-bold text-muted-foreground">Remaining Runway</span>
                        <span className="text-xs font-mono font-bold text-[#137333] bg-[#E6F4EA] px-2 py-0.5 border border-[#34A853]/30">
                          Healthy
                        </span>
                      </div>
                      <p className="text-2xl sm:text-3xl font-serif font-bold text-[#137333]">
                        <AnimatedValue value={overview.summary.remaining_budget} prefix="$" />
                      </p>
                      <div className="h-2 rounded-none bg-muted mt-3 overflow-hidden border border-border/40">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: "38.5%" }}
                          transition={{ duration: 1 }}
                          className="h-full bg-[#34A853]"
                        />
                      </div>
                      <p className="text-[11px] font-sans text-muted-foreground mt-2">
                        1,714 hours of planned engineering capacity available
                      </p>
                    </div>

                    <div className="rounded-none border-2 border-border bg-card p-5 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.08)]">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-mono uppercase font-bold text-muted-foreground">Sprint Task Completion</span>
                        <span className="text-xs font-mono font-bold text-[#137333] bg-[#E6F4EA] px-2 py-0.5 border border-[#34A853]/30">
                          {overview.tasks.completion_rate}% Done
                        </span>
                      </div>
                      <p className="text-2xl sm:text-3xl font-serif font-bold text-foreground">
                        {overview.tasks.completed} <span className="text-lg font-sans font-normal text-muted-foreground">/ {overview.tasks.total}</span>
                      </p>
                      <div className="flex gap-2 text-xs font-sans text-muted-foreground mt-2">
                        <span>{overview.tasks.in_progress} In Progress</span>
                        <span>•</span>
                        <span>{overview.tasks.pending} Backlog</span>
                      </div>
                    </div>

                    <div className="rounded-none border-2 border-border bg-card p-5 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.08)]">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-mono uppercase font-bold text-muted-foreground">R&D Tax Credit Estimate</span>
                        <span className="text-xs font-mono font-bold text-[#1a73e8] bg-[#E8F0FE] px-2 py-0.5 border border-[#4285F4]/30">
                          IRS Sec 41
                        </span>
                      </div>
                      <p className="text-2xl sm:text-3xl font-serif font-bold text-[#1a73e8]">
                        ${(overview.summary.rnd_tax_credit_estimate || 29400).toLocaleString()}
                      </p>
                      <p className="text-[11px] font-sans text-muted-foreground mt-2">
                        Automated deduction tracking based on qualified software developer wages
                      </p>
                    </div>
                  </div>
                </div>

                {/* ASC 350-40 GAAP Capitalization Visualizer */}
                <div className="rounded-none border-2 border-border bg-card p-5 sm:p-6 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.08)]">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b-2 border-border/10 pb-4 mb-4">
                    <div>
                      <h3 className="font-serif font-bold text-base sm:text-lg flex items-center gap-2">
                        <Coins className="w-4 h-4 text-[#FBBC05]" />
                        ASC 350-40 Software Capitalization Split (CapEx vs OpEx)
                      </h3>
                      <p className="text-xs font-sans text-muted-foreground mt-0.5">
                        Automated classification of Git commit telemetry into balance-sheet CapEx assets vs maintenance OpEx.
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 text-xs font-mono font-bold bg-[#E8F0FE] text-[#1a73e8] border border-[#4285F4]/30">
                        CapEx Rate: {overview.summary.capex_ratio_percentage || 68.4}%
                      </span>
                    </div>
                  </div>

                  {/* Dual Segmented Bar */}
                  <div className="space-y-3">
                    <div className="h-6 rounded-none bg-muted flex overflow-hidden border border-border">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${overview.summary.capex_ratio_percentage || 68.4}%` }}
                        transition={{ duration: 1 }}
                        className="bg-[#1a73e8] flex items-center justify-center text-white text-[10px] font-mono font-bold"
                        title="CapEx: Qualifying Feature Dev ($146,510)"
                      >
                        CapEx {overview.summary.capex_ratio_percentage || 68.4}%
                      </motion.div>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${100 - (overview.summary.capex_ratio_percentage || 68.4)}%` }}
                        transition={{ duration: 1 }}
                        className="bg-muted-foreground/30 flex items-center justify-center text-foreground text-[10px] font-mono font-bold"
                        title="OpEx: Maintenance & Bugfixes ($67,690)"
                      >
                        OpEx {(100 - (overview.summary.capex_ratio_percentage || 68.4)).toFixed(1)}%
                      </motion.div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                      <div className="p-3 border border-[#4285F4]/30 bg-[#E8F0FE]/30 rounded-none">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-bold text-[#1a73e8]">Capitalizable R&D (CapEx)</span>
                          <span className="font-mono font-bold text-foreground">
                            ${(overview.summary.capex_eligible_amount || 146510).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-[11px] font-sans text-muted-foreground mt-1">
                          Qualifies for multi-year balance sheet amortization. Includes Vector Search, Knowledge Graph & Webhook Sync.
                        </p>
                      </div>

                      <div className="p-3 border border-border bg-muted/30 rounded-none">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-bold text-muted-foreground">Maintenance & CVE Debt (OpEx)</span>
                          <span className="font-mono font-bold text-foreground">
                            ${(overview.summary.opex_maintenance_amount || 67690).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-[11px] font-sans text-muted-foreground mt-1">
                          Expensed immediately in current fiscal quarter. Includes bugfixes, patch management, and telemetry maintenance.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Cost Accumulation Trend */}
                <div className="rounded-none border-2 border-border bg-card p-5 sm:p-6 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.08)]">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
                    <div>
                      <h3 className="font-serif font-bold text-base sm:text-lg">Cumulative Engineering Spend Curve</h3>
                      <p className="text-xs font-sans text-muted-foreground">Actual cost progression compared against planned baseline target</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="px-2 py-0.5 text-[10px] font-mono bg-[#E6F4EA] text-[#137333] border border-[#34A853]/30">
                        Variance: -$11,800 Under Target
                      </span>
                    </div>
                  </div>
                  <EnhancedAreaChart actualData={chartCosts} budgetBaseline={overview.summary.total_budgeted_cost} height={130} />
                </div>

                {/* Top Epics / Features Financial Performance */}
                <div className="rounded-none border-2 border-border bg-card p-5 sm:p-6 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.08)]">
                  <div className="flex items-center justify-between border-b-2 border-border/10 pb-3 mb-4">
                    <div>
                      <h3 className="font-serif font-bold text-base sm:text-lg">Epic & Feature Cost Performance</h3>
                      <p className="text-xs font-sans text-muted-foreground">Direct financial attribution from Git SHAs to product epics</p>
                    </div>
                    <span className="text-[10px] font-mono text-muted-foreground">5 Core Epics Tracked</span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs font-sans">
                      <thead>
                        <tr className="border-b-2 border-border/40 text-[10px] font-mono uppercase text-muted-foreground">
                          <th className="py-2 px-2">Epic & Architecture Domain</th>
                          <th className="py-2 px-2 text-right">Budget</th>
                          <th className="py-2 px-2 text-right">Actual Cost</th>
                          <th className="py-2 px-2 text-right">Story Points</th>
                          <th className="py-2 px-2 text-center">Variance</th>
                          <th className="py-2 px-2 text-center">Tax / CapEx</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/20 font-sans">
                        {featureCosts.map(feat => (
                          <tr key={feat.id} className="hover:bg-muted/40 transition-colors">
                            <td className="py-3 px-2">
                              <p className="font-semibold text-foreground">{feat.name}</p>
                              <p className="text-[10px] font-mono text-muted-foreground">{feat.id} • {feat.lead}</p>
                            </td>
                            <td className="py-3 px-2 text-right font-mono font-semibold">${feat.budget.toLocaleString()}</td>
                            <td className="py-3 px-2 text-right font-mono font-bold">${feat.actual.toLocaleString()}</td>
                            <td className="py-3 px-2 text-right font-mono">{feat.storyPoints} pts</td>
                            <td className="py-3 px-2 text-center">
                              <span className={`px-2 py-0.5 text-[10px] font-mono font-bold rounded-none ${
                                feat.variance <= 0 
                                  ? 'bg-[#E6F4EA] text-[#137333] border border-[#34A853]/30' 
                                  : 'bg-[#FCE8E6] text-[#c5221f] border-[#EA4335]/30'
                              }`}>
                                {feat.variance > 0 ? '+' : ''}{feat.variance}%
                              </span>
                            </td>
                            <td className="py-3 px-2 text-center">
                              <span className={`px-2 py-0.5 text-[9px] font-mono font-semibold ${
                                feat.capexEligible 
                                  ? 'bg-[#E8F0FE] text-[#1a73e8] border border-[#4285F4]/30' 
                                  : 'bg-muted text-muted-foreground border border-border'
                              }`}>
                                {feat.capexEligible ? 'CapEx' : 'OpEx'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

              </motion.div>
            )}

            {/* ------------------------------------------------------- */}
            {/* TAB 2: SPRINT ANALYSIS                                  */}
            {/* ------------------------------------------------------- */}
            {activeTab === 'sprints' && (
              <motion.div
                key="sprints"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-6"
              >
                {/* Sprint Overview KPIs */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="rounded-none border-2 border-border bg-card p-4 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.08)]">
                    <p className="text-[10px] font-mono uppercase font-bold text-muted-foreground">Total Planned Cost</p>
                    <p className="text-2xl sm:text-3xl font-serif font-bold text-foreground mt-0.5">
                      ${sprintAnalysis.overall.total_planned_cost.toLocaleString()}
                    </p>
                    <p className="text-[11px] font-sans text-muted-foreground mt-1">4 Sprint cycles evaluated</p>
                  </div>

                  <div className="rounded-none border-2 border-border bg-card p-4 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.08)]">
                    <p className="text-[10px] font-mono uppercase font-bold text-muted-foreground">Actual Executed Spend</p>
                    <p className="text-2xl sm:text-3xl font-serif font-bold text-foreground mt-0.5">
                      ${sprintAnalysis.overall.total_actual_cost.toLocaleString()}
                    </p>
                    <p className="text-[11px] font-sans text-[#137333] font-semibold mt-1">
                      -${(sprintAnalysis.overall.total_planned_cost - sprintAnalysis.overall.total_actual_cost).toLocaleString()} favorable variance
                    </p>
                  </div>

                  <div className="rounded-none border-2 border-border bg-card p-4 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.08)]">
                    <p className="text-[10px] font-mono uppercase font-bold text-muted-foreground">Total Capital Savings</p>
                    <p className="text-2xl sm:text-3xl font-serif font-bold text-[#137333] mt-0.5">
                      ${sprintAnalysis.overall.total_savings.toLocaleString()}
                    </p>
                    <p className="text-[11px] font-sans text-muted-foreground mt-1">vs contract developer benchmarks</p>
                  </div>

                  <div className="rounded-none border-2 border-border bg-card p-4 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.08)]">
                    <p className="text-[10px] font-mono uppercase font-bold text-muted-foreground">Average Sprint ROI</p>
                    <p className="text-2xl sm:text-3xl font-serif font-bold text-[#1a73e8] mt-0.5">
                      +{sprintAnalysis.overall.average_roi}%
                    </p>
                    <p className="text-[11px] font-sans text-muted-foreground mt-1">Consistent margin realization</p>
                  </div>
                </div>

                {/* Filter Toolbar */}
                <div className="flex items-center justify-between gap-3 border-b-2 border-border/20 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-sans font-bold uppercase tracking-wider text-muted-foreground mr-1">Filter:</span>
                    {(['all', 'active', 'closed'] as const).map(f => (
                      <button
                        key={f}
                        onClick={() => setSprintFilter(f)}
                        className={`px-3 py-1 text-xs font-mono font-semibold uppercase rounded-none border transition-colors ${
                          sprintFilter === f 
                            ? 'bg-foreground text-background border-foreground' 
                            : 'bg-card text-muted-foreground border-border hover:bg-muted'
                        }`}
                      >
                        {f} ({f === 'all' ? sprintAnalysis.sprints.length : sprintAnalysis.sprints.filter(s => s.state === f).length})
                      </button>
                    ))}
                  </div>
                  <span className="text-xs font-mono text-muted-foreground hidden sm:inline">
                    Sorted by most recent sprint
                  </span>
                </div>

                {/* Sprint Cards Grid */}
                <div className="space-y-4">
                  {filteredSprints.map((sprint, i) => {
                    const isExpanded = expandedSprintId === sprint.sprint_id
                    return (
                      <motion.div
                        key={sprint.sprint_id}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="rounded-none border-2 border-border bg-card p-5 sm:p-6 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.08)] space-y-4"
                      >
                        {/* Header */}
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2.5 flex-wrap">
                              <h3 className="font-serif font-bold text-lg text-foreground">{sprint.name}</h3>
                              <span className={`px-2 py-0.5 text-[10px] font-mono font-bold uppercase rounded-none border ${
                                sprint.state === 'active' 
                                  ? 'bg-[#E6F4EA] text-[#137333] border-[#34A853]/40 animate-pulse' 
                                  : 'bg-muted text-muted-foreground border-border'
                              }`}>
                                {sprint.state}
                              </span>
                              <span className="text-xs font-mono text-muted-foreground">
                                {new Date(sprint.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – {new Date(sprint.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                              </span>
                            </div>
                            <p className="text-xs font-sans text-muted-foreground mt-1">
                              <strong>Goal:</strong> {sprint.goal}
                            </p>
                          </div>

                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <p className="text-2xl font-serif font-bold text-[#137333]">
                                +{sprint.financials.roi_percentage}%
                              </p>
                              <p className="text-[9px] font-mono uppercase text-muted-foreground">Realized ROI</p>
                            </div>
                            <button
                              onClick={() => setExpandedSprintId(isExpanded ? null : sprint.sprint_id)}
                              className="p-1.5 border border-border hover:bg-muted text-muted-foreground rounded-none cursor-pointer"
                              title="Toggle sprint details"
                            >
                              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>

                        {/* Metric Columns */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-3 bg-muted/30 border border-border/50 text-xs font-sans">
                          <div>
                            <p className="text-[10px] font-mono uppercase text-muted-foreground font-semibold">Story Points</p>
                            <p className="font-mono text-base font-bold text-foreground">
                              {sprint.metrics.velocity} <span className="text-xs text-muted-foreground font-normal">/ {sprint.metrics.committed_points || 60} pts</span>
                            </p>
                          </div>

                          <div>
                            <p className="text-[10px] font-mono uppercase text-muted-foreground font-semibold">Task Throughput</p>
                            <p className="font-mono text-base font-bold text-[#137333]">
                              {sprint.metrics.completed_tasks} <span className="text-xs text-muted-foreground font-normal">/ {sprint.metrics.total_tasks} closed</span>
                            </p>
                          </div>

                          <div>
                            <p className="text-[10px] font-mono uppercase text-muted-foreground font-semibold">Planned vs Actual Cost</p>
                            <p className="font-mono text-base font-bold text-foreground">
                              ${sprint.financials.actual_cost.toLocaleString()} <span className="text-xs text-muted-foreground font-normal">(${sprint.financials.planned_cost.toLocaleString()})</span>
                            </p>
                          </div>

                          <div>
                            <p className="text-[10px] font-mono uppercase text-muted-foreground font-semibold">Delay Slippage Cost</p>
                            <p className={`font-mono text-base font-bold ${sprint.financials.delay_cost > 2500 ? 'text-[#c5221f]' : 'text-[#8c6d00]'}`}>
                              ${sprint.financials.delay_cost.toLocaleString()}
                            </p>
                          </div>
                        </div>

                        {/* Multi-Segment Completion Bar */}
                        <div className="space-y-1.5">
                          <div className="flex justify-between text-[11px] font-mono text-muted-foreground">
                            <span>Delivery Progress: {sprint.metrics.completion_rate}%</span>
                            <span>{sprint.metrics.delayed_tasks} delayed tasks</span>
                          </div>
                          <div className="h-2 rounded-none bg-muted overflow-hidden flex border border-border/30">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${sprint.metrics.completion_rate}%` }}
                              transition={{ duration: 0.8 }}
                              className="bg-[#34A853]"
                              title={`Completed: ${sprint.metrics.completion_rate}%`}
                            />
                            {sprint.metrics.delayed_tasks > 0 && (
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${(sprint.metrics.delayed_tasks / sprint.metrics.total_tasks) * 100}%` }}
                                transition={{ duration: 0.8 }}
                                className="bg-[#EA4335]"
                                title={`Delayed: ${sprint.metrics.delayed_tasks} tasks`}
                              />
                            )}
                          </div>
                        </div>

                        {/* Expandable Discipline Breakdown */}
                        {isExpanded && sprint.disciplineCosts && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="pt-3 border-t border-border/40 grid grid-cols-1 sm:grid-cols-3 gap-3"
                          >
                            <div className="p-2.5 border border-border bg-card rounded-none">
                              <span className="text-[10px] font-mono uppercase text-muted-foreground font-bold">Core Engineering</span>
                              <p className="text-base font-mono font-bold text-foreground mt-0.5">
                                ${sprint.disciplineCosts.engineering.toLocaleString()}
                              </p>
                              <span className="text-[10px] font-sans text-muted-foreground">Feature development & code reviews</span>
                            </div>

                            <div className="p-2.5 border border-border bg-card rounded-none">
                              <span className="text-[10px] font-mono uppercase text-muted-foreground font-bold">Architecture & Design</span>
                              <p className="text-base font-mono font-bold text-foreground mt-0.5">
                                ${sprint.disciplineCosts.architecture.toLocaleString()}
                              </p>
                              <span className="text-[10px] font-sans text-muted-foreground">System topology & data contracts</span>
                            </div>

                            <div className="p-2.5 border border-border bg-card rounded-none">
                              <span className="text-[10px] font-mono uppercase text-muted-foreground font-bold">QA & Cloud DevOps</span>
                              <p className="text-base font-mono font-bold text-foreground mt-0.5">
                                ${sprint.disciplineCosts.qa_devops.toLocaleString()}
                              </p>
                              <span className="text-[10px] font-sans text-muted-foreground">CI/CD pipelines & test harnesses</span>
                            </div>
                          </motion.div>
                        )}
                      </motion.div>
                    )
                  })}
                </div>
              </motion.div>
            )}

            {/* ------------------------------------------------------- */}
            {/* TAB 3: DAILY PROGRESS & VELOCITY                        */}
            {/* ------------------------------------------------------- */}
            {activeTab === 'daily' && (
              <motion.div
                key="daily"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-6"
              >
                {/* Daily Summary Ribbon */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="rounded-none border-2 border-border bg-card p-4 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.08)]">
                    <div className="flex items-center gap-2 mb-1">
                      <CheckCircle2 className="w-4 h-4 text-[#34A853]" />
                      <span className="text-[10px] font-mono uppercase font-bold text-muted-foreground">Tasks Closed</span>
                    </div>
                    <p className="text-2xl sm:text-3xl font-serif font-bold text-foreground">
                      {dailyProgress.totals.total_completed}
                    </p>
                    <p className="text-[11px] font-sans text-muted-foreground mt-1">Across {dailyProgress.period}</p>
                  </div>

                  <div className="rounded-none border-2 border-border bg-card p-4 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.08)]">
                    <div className="flex items-center gap-2 mb-1">
                      <Clock className="w-4 h-4 text-[#4285F4]" />
                      <span className="text-[10px] font-mono uppercase font-bold text-muted-foreground">Hours Logged</span>
                    </div>
                    <p className="text-2xl sm:text-3xl font-serif font-bold text-foreground">
                      {dailyProgress.totals.total_hours.toLocaleString()}h
                    </p>
                    <p className="text-[11px] font-sans text-muted-foreground mt-1">~91.5 hrs / day median</p>
                  </div>

                  <div className="rounded-none border-2 border-border bg-card p-4 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.08)]">
                    <div className="flex items-center gap-2 mb-1">
                      <DollarSign className="w-4 h-4 text-[#FBBC05]" />
                      <span className="text-[10px] font-mono uppercase font-bold text-muted-foreground">Cumulative Spend</span>
                    </div>
                    <p className="text-2xl sm:text-3xl font-serif font-bold text-foreground">
                      ${dailyProgress.totals.total_cost.toLocaleString()}
                    </p>
                    <p className="text-[11px] font-sans text-muted-foreground mt-1">At $78/hr blended rate</p>
                  </div>

                  <div className="rounded-none border-2 border-border bg-card p-4 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.08)]">
                    <div className="flex items-center gap-2 mb-1">
                      <Activity className="w-4 h-4 text-[#EA4335]" />
                      <span className="text-[10px] font-mono uppercase font-bold text-muted-foreground">Avg Velocity</span>
                    </div>
                    <p className="text-2xl sm:text-3xl font-serif font-bold text-[#137333]">
                      {dailyProgress.totals.avg_daily_completion} <span className="text-sm font-sans font-normal text-muted-foreground">tasks/day</span>
                    </p>
                    <p className="text-[11px] font-sans text-muted-foreground mt-1">Unit cost: ~$1,815 / task</p>
                  </div>
                </div>

                {/* Daily Cost & Hours Visualizer Bar */}
                <div className="rounded-none border-2 border-border bg-card p-5 sm:p-6 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.08)]">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                    <div>
                      <h3 className="font-serif font-bold text-base sm:text-lg">Daily Engineering Burn & Throughput</h3>
                      <p className="text-xs font-sans text-muted-foreground">Hover bars to inspect daily cost and task velocity</p>
                    </div>

                    <div className="flex items-center gap-2">
                      {[7, 14, 30].map(days => (
                        <button
                          key={days}
                          onClick={() => setDailyFilterDays(days)}
                          className={`px-2.5 py-1 text-xs font-mono font-semibold rounded-none border cursor-pointer ${
                            dailyFilterDays === days 
                              ? 'bg-foreground text-background border-foreground' 
                              : 'bg-card text-muted-foreground border-border hover:bg-muted'
                          }`}
                        >
                          {days} Days
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Bar Visualizer */}
                  <div className="h-32 flex items-end gap-1.5 pt-4 pb-1 overflow-x-auto">
                    {filteredDailyBreakdown.map((day) => {
                      const maxSpend = 6500
                      const barHeight = Math.max(12, Math.min(100, (day.cost_incurred / maxSpend) * 100))
                      const isHigh = day.completed >= 6
                      return (
                        <div
                          key={day.date}
                          className="flex-1 min-w-[14px] flex flex-col items-center gap-1 group relative cursor-pointer"
                        >
                          {/* Tooltip on hover */}
                          <div className="absolute -top-14 opacity-0 group-hover:opacity-100 transition-opacity bg-foreground text-background px-2 py-1 text-[9px] font-mono rounded-none pointer-events-none z-20 whitespace-nowrap shadow-md">
                            <p className="font-bold">{day.date} ({day.day_name})</p>
                            <p>${day.cost_incurred.toLocaleString()} • {day.completed} closed</p>
                          </div>

                          <div
                            style={{ height: `${barHeight}%` }}
                            className={`w-full rounded-none transition-all ${
                              day.day_name === 'Sat' || day.day_name === 'Sun'
                                ? 'bg-muted-foreground/30'
                                : isHigh
                                ? 'bg-[#34A853]'
                                : 'bg-[#4285F4]'
                            } group-hover:brightness-110`}
                          />
                        </div>
                      )
                    })}
                  </div>
                  <div className="flex items-center justify-between text-[10px] font-mono text-muted-foreground mt-2 border-t border-border/20 pt-2">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 bg-[#4285F4]" /> Weekday Sprint Delivery
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 bg-[#34A853]" /> Peak Output (&gt;5 Tasks)
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 bg-muted-foreground/30" /> Weekend Low Activity
                    </span>
                  </div>
                </div>

                {/* Daily Breakdown Table */}
                <div className="rounded-none border-2 border-border bg-card shadow-[2px_2px_0px_0px_rgba(0,0,0,0.08)] overflow-hidden">
                  <div className="p-4 border-b-2 border-border/10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                      <h3 className="font-serif font-bold text-base sm:text-lg">Telemetry Daily Ledger</h3>
                      <p className="text-xs font-sans text-muted-foreground">Showing last {dailyFilterDays} calendar days</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-2.5 top-2.5" />
                        <input
                          type="text"
                          value={dailySearchQuery}
                          onChange={e => setDailySearchQuery(e.target.value)}
                          placeholder="Search date or tag..."
                          className="pl-8 pr-3 py-1.5 text-xs font-sans bg-muted/40 border border-border rounded-none focus:outline-none focus:border-foreground"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="overflow-x-auto max-h-[480px] overflow-y-auto">
                    <table className="w-full text-xs font-sans text-left">
                      <thead className="bg-muted/70 sticky top-0 border-b-2 border-border/30 text-[10px] font-mono uppercase text-muted-foreground z-10">
                        <tr>
                          <th className="py-2.5 px-3">Date</th>
                          <th className="py-2.5 px-3">Day</th>
                          <th className="py-2.5 px-3 text-right">Tasks Closed</th>
                          <th className="py-2.5 px-3 text-right">Started</th>
                          <th className="py-2.5 px-3 text-right">Delayed</th>
                          <th className="py-2.5 px-3 text-right">Hours Logged</th>
                          <th className="py-2.5 px-3 text-right">Daily Cost</th>
                          <th className="py-2.5 px-3 text-right">Cumulative Cost</th>
                          <th className="py-2.5 px-3 text-center">Operational Note</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/20">
                        {filteredDailyBreakdown.slice().reverse().map(day => (
                          <tr key={day.date} className="hover:bg-muted/40 transition-colors">
                            <td className="py-2.5 px-3 font-mono font-semibold">{day.date}</td>
                            <td className="py-2.5 px-3 font-mono text-muted-foreground">{day.day_name || 'Day'}</td>
                            <td className="py-2.5 px-3 text-right font-mono font-bold">
                              <span className={day.completed > 0 ? 'text-[#137333]' : 'text-muted-foreground'}>
                                {day.completed}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono text-muted-foreground">{day.started}</td>
                            <td className="py-2.5 px-3 text-right font-mono">
                              <span className={day.delayed > 0 ? 'text-[#c5221f] font-bold' : 'text-muted-foreground'}>
                                {day.delayed}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono">{day.hours_logged}h</td>
                            <td className="py-2.5 px-3 text-right font-mono font-semibold">
                              ${day.cost_incurred.toLocaleString()}
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono font-bold text-foreground">
                              ${day.cumulative_cost.toLocaleString()}
                            </td>
                            <td className="py-2.5 px-3 text-center">
                              <span className={`px-2 py-0.5 text-[9px] font-mono rounded-none ${
                                day.tag === 'Sprint Milestone'
                                  ? 'bg-[#E6F4EA] text-[#137333] border border-[#34A853]/30 font-bold'
                                  : day.tag === 'Weekend Standby'
                                  ? 'bg-muted text-muted-foreground'
                                  : 'bg-[#E8F0FE] text-[#1a73e8] border border-[#4285F4]/30'
                              }`}>
                                {day.tag || 'Standard'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ------------------------------------------------------- */}
            {/* TAB 4: RISK ASSESSMENT & MITIGATION SIMULATOR          */}
            {/* ------------------------------------------------------- */}
            {activeTab === 'risks' && (
              <motion.div
                key="risks"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-6"
              >
                {/* Risk Exposure Hero Strip */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="rounded-none border-2 border-border bg-card p-5 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.08)] flex flex-col justify-center">
                    <span className="text-[10px] font-mono uppercase font-bold text-muted-foreground mb-1">Overall Exposure Level</span>
                    <div className="flex items-center gap-2">
                      <RiskBadge level={liveRiskExposure > 25000 ? 'medium' : 'low'} />
                    </div>
                    <p className="text-2xl sm:text-3xl font-serif font-bold text-[#c5221f] mt-2">
                      ${liveRiskExposure.toLocaleString()}
                    </p>
                    <p className="text-[11px] font-sans text-muted-foreground mt-1">
                      Active financial slippage exposure
                    </p>
                  </div>

                  <div className="rounded-none border-2 border-border bg-card p-5 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.08)] flex flex-col justify-center">
                    <span className="text-[10px] font-mono uppercase font-bold text-muted-foreground mb-1">Recovered by Mitigations</span>
                    <p className="text-2xl sm:text-3xl font-serif font-bold text-[#137333] mt-2">
                      ${totalRecoveredSavings.toLocaleString()}
                    </p>
                    <p className="text-[11px] font-sans text-muted-foreground mt-1">
                      Simulated capital saved via AI actions
                    </p>
                  </div>

                  <div className="rounded-none border-2 border-border bg-card p-5 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.08)] flex flex-col justify-center">
                    <span className="text-[10px] font-mono uppercase font-bold text-muted-foreground mb-1">Critical Risks</span>
                    <p className="text-2xl sm:text-3xl font-serif font-bold text-[#c5221f] mt-2">
                      {riskAssessment.summary.high_risks} High
                    </p>
                    <p className="text-[11px] font-sans text-muted-foreground mt-1">
                      Immediate schedule & budget impact
                    </p>
                  </div>

                  <div className="rounded-none border-2 border-border bg-card p-5 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.08)] flex flex-col justify-center">
                    <span className="text-[10px] font-mono uppercase font-bold text-muted-foreground mb-1">Monitored Items</span>
                    <p className="text-2xl sm:text-3xl font-serif font-bold text-foreground mt-2">
                      {riskAssessment.summary.medium_risks + riskAssessment.summary.low_risks} Mod/Low
                    </p>
                    <p className="text-[11px] font-sans text-muted-foreground mt-1">
                      PR queues & token consumption rate
                    </p>
                  </div>
                </div>

                {/* Interactive Mitigation Simulator Notice */}
                <div className="rounded-none border-2 border-[#34A853]/40 bg-[#E6F4EA]/40 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <Zap className="w-5 h-5 text-[#137333] shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-sans font-bold text-[#137333]">Interactive FinOps Mitigation Simulator Active</p>
                      <p className="text-[11px] font-sans text-[#137333]/90 mt-0.5">
                        Click "Simulate Mitigation" on any risk card below to test the direct dollar-for-dollar reduction in organizational risk exposure.
                      </p>
                    </div>
                  </div>
                  {totalRecoveredSavings > 0 && (
                    <span className="px-3 py-1 bg-[#137333] text-white text-xs font-mono font-bold rounded-none shrink-0">
                      +${totalRecoveredSavings.toLocaleString()} Capital Protected
                    </span>
                  )}
                </div>

                {/* Risk Cards */}
                <div className="space-y-4">
                  {riskAssessment.risks.map((risk, i) => {
                    const isMitigated = Boolean(mitigatedRisks[risk.id])
                    return (
                      <motion.div
                        key={risk.id || risk.type}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.08 }}
                        className={`rounded-none border-2 p-5 sm:p-6 transition-all ${
                          isMitigated 
                            ? 'border-[#34A853]/40 bg-[#E6F4EA]/20' 
                            : risk.severity === 'high' 
                            ? 'border-[#EA4335]/40 bg-card' 
                            : 'border-border bg-card'
                        } shadow-[2px_2px_0px_0px_rgba(0,0,0,0.08)] space-y-3`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <RiskBadge level={isMitigated ? 'low' : risk.severity} />
                              <span className="text-xs font-mono font-bold uppercase text-foreground">{risk.type}</span>
                              <span className="text-[10px] font-mono text-muted-foreground">• {risk.category}</span>
                            </div>
                            <p className="text-xs font-sans text-muted-foreground">
                              <strong>Root Cause:</strong> {risk.description}
                            </p>
                          </div>

                          <div className="text-right shrink-0">
                            <p className={`text-xl sm:text-2xl font-serif font-bold ${
                              isMitigated ? 'line-through text-muted-foreground' : 'text-[#c5221f]'
                            }`}>
                              ${risk.potential_cost_impact.toLocaleString()}
                            </p>
                            <p className="text-[9px] font-mono uppercase text-muted-foreground">
                              {isMitigated ? 'Mitigated Exposure' : 'Potential Impact'}
                            </p>
                          </div>
                        </div>

                        {/* AI Recommendation Box & Action Button */}
                        <div className="p-3.5 bg-muted/40 border border-border flex flex-col md:flex-row md:items-center md:justify-between gap-3 rounded-none">
                          <div className="flex items-start gap-2.5">
                            <Zap className="w-4 h-4 text-[#FBBC05] shrink-0 mt-0.5" />
                            <div className="text-xs font-sans">
                              <span className="font-bold text-foreground">AI Remediation Plan: </span>
                              <span className="text-muted-foreground">{risk.recommendation}</span>
                            </div>
                          </div>

                          <button
                            onClick={() => toggleMitigateRisk(risk.id)}
                            className={`px-3 py-1.5 text-xs font-mono font-bold uppercase rounded-none border transition-all cursor-pointer shrink-0 ${
                              isMitigated
                                ? 'bg-[#34A853] text-white border-[#34A853]'
                                : 'bg-card text-foreground border-border hover:bg-muted'
                            }`}
                          >
                            {isMitigated ? (
                              <span className="flex items-center gap-1">
                                <Check className="w-3.5 h-3.5" /> Mitigated (+${risk.recoverable_impact.toLocaleString()})
                              </span>
                            ) : (
                              <span>Simulate Mitigation</span>
                            )}
                          </button>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </main>

      </div>
    </div>
  )
}

export default FinanceROI
