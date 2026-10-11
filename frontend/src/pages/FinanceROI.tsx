import { useEffect, useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  LiaDollarSignSolid as DollarSign,
  LiaArrowUpSolid as TrendingUp,
  LiaArrowDownSolid as TrendingDown,
  LiaExclamationTriangleSolid as AlertTriangle,
  LiaCheckCircleSolid as CheckCircle2,
  LiaClockSolid as Clock,
  LiaBullseyeSolid as Target,
  LiaChartPieSolid as PieChart,
  LiaChartBarSolid as BarChart3,
  LiaCalendarSolid as Calendar,
  LiaUsersSolid as Users,
  LiaBoltSolid as Zap,
  LiaExternalLinkAltSolid as ArrowUpRight,
  LiaArrowDownSolid as ArrowDownRight,
  LiaChevronDownSolid as ChevronDown,
  LiaSyncSolid as RefreshCw,
  LiaArrowLeftSolid as ArrowLeft,
  LiaShieldAltSolid as Shield,
  LiaFireSolid as Flame,
  LiaChartLineSolid as Activity,
  LiaLayerGroupSolid as Layers
} from "react-icons/lia"

const API = import.meta.env.VITE_API_URL || "/api"

// ============================================
// TYPES
// ============================================

interface FinanceOverview {
  summary: {
    total_budgeted_cost: number
    actual_spent_cost: number
    remaining_budget: number
    market_rate_cost: number
    projected_savings: number
    roi_percentage: number
    avg_hourly_rate: number
    currency: string
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
  allocation_history: Array<{
    _id: string
    sprint_name: string
    created_at: string
    issues_created: number
  }>
}

interface DailyProgress {
  period: string
  daily_breakdown: Array<{
    date: string
    completed: number
    started: number
    delayed: number
    on_track: number
    cost_incurred: number
    hours_logged: number
    cumulative_completed: number
    cumulative_cost: number
    cumulative_hours: number
  }>
  totals: {
    total_completed: number
    total_cost: number
    total_hours: number
    avg_daily_completion: number
  }
}

interface SprintAnalysis {
  sprints: Array<{
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
      completion_rate: number
      velocity: number
    }
    financials: {
      planned_cost: number
      actual_cost: number
      delay_cost: number
      total_cost: number
      savings: number
      roi_percentage: number
    }
  }>
  overall: {
    total_planned_cost: number
    total_actual_cost: number
    total_savings: number
    average_roi: number
  }
}

interface RiskAssessment {
  overall_risk_level: string
  total_risk_exposure: number
  risks: Array<{
    type: string
    severity: string
    count: number
    potential_cost_impact: number
    description: string
    recommendation: string
  }>
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
// ANIMATED COMPONENTS
// ============================================

const AnimatedValue = ({ value, prefix = "", suffix = "", duration = 1.5 }: { 
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

// Mini chart component
const MiniAreaChart = ({ data, color = "#22c55e", height = 60 }: { 
  data: number[]
  color?: string
  height?: number 
}) => {
  if (data.length < 2) return null
  
  const max = Math.max(...data, 1)
  const min = Math.min(...data, 0)
  const range = max - min || 1
  
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * 100
    const y = height - ((v - min) / range) * (height - 10)
    return `${x},${y}`
  }).join(' ')
  
  const areaPoints = `0,${height} ${points} 100,${height}`

  return (
    <svg width="100%" height={height} className="overflow-visible">
      <defs>
        <linearGradient id={`area-gradient-${color.replace('#', '')}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <motion.polygon
        fill={`url(#area-gradient-${color.replace('#', '')})`}
        points={areaPoints}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      />
      <motion.polyline
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
      />
    </svg>
  )
}

// ROI Gauge
const ROIGauge = ({ value, size = 140 }: { value: number, size?: number }) => {
  const radius = (size - 20) / 2
  const circumference = radius * Math.PI // Half circle
  const clampedValue = Math.max(-100, Math.min(200, value))
  const normalizedValue = (clampedValue + 100) / 300 // -100 to 200 range
  const offset = circumference - normalizedValue * circumference
  
  const getColor = () => {
    if (value >= 50) return "hsl(142, 76%, 36%)" // success green
    if (value >= 20) return "hsl(38, 92%, 50%)" // warning yellow
    if (value >= 0) return "hsl(25, 95%, 53%)" // orange
    return "hsl(0, 84%, 60%)" // destructive red
  }

  return (
    <div className="relative" style={{ width: size, height: size / 2 + 20 }}>
      <svg width={size} height={size / 2 + 20} className="overflow-visible">
        {/* Background arc */}
        <path
          d={`M 10 ${size / 2} A ${radius} ${radius} 0 0 1 ${size - 10} ${size / 2}`}
          fill="none"
          stroke="hsl(var(--border))"
          strokeWidth="12"
          strokeLinecap="round"
        />
        {/* Value arc */}
        <motion.path
          d={`M 10 ${size / 2} A ${radius} ${radius} 0 0 1 ${size - 10} ${size / 2}`}
          fill="none"
          stroke={getColor()}
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-end pb-2">
        <span className="text-3xl font-bold font-mono" style={{ color: getColor() }}>
          {value >= 0 ? '+' : ''}{value}%
        </span>
        <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">ROI</span>
      </div>
    </div>
  )
}

// Risk Indicator
const RiskIndicator = ({ level }: { level: string }) => {
  const config = {
    high: { color: "bg-[#EA4335] text-white shadow-[2px_2px_0px_0px_rgba(234,67,53,0.2)]", text: "HIGH", icon: <Flame className="w-3.5 h-3.5" /> },
    medium: { color: "bg-[#FBBC05] text-[#202124] shadow-[2px_2px_0px_0px_rgba(251,188,5,0.2)]", text: "MEDIUM", icon: <AlertTriangle className="w-3.5 h-3.5" /> },
    low: { color: "bg-[#34A853] text-white shadow-[2px_2px_0px_0px_rgba(52,168,83,0.2)]", text: "LOW", icon: <Shield className="w-3.5 h-3.5" /> }
  }
  const c = config[level as keyof typeof config] || config.medium
  
  return (
    <motion.div 
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full ${c.color} font-sans text-xs font-semibold uppercase tracking-wider`}
    >
      {c.icon}
      <span>{c.text} RISK</span>
    </motion.div>
  )
}

// ============================================
// MAIN COMPONENT
// ============================================

export function FinanceROI({ onBack }: FinanceROIProps) {
  const [overview, setOverview] = useState<FinanceOverview | null>(null)
  const [dailyProgress, setDailyProgress] = useState<DailyProgress | null>(null)
  const [sprintAnalysis, setSprintAnalysis] = useState<SprintAnalysis | null>(null)
  const [riskAssessment, setRiskAssessment] = useState<RiskAssessment | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'sprints' | 'daily' | 'risks'>('overview')
  const [refreshing, setRefreshing] = useState(false)

  // Fetch all data
  const fetchData = async () => {
    setRefreshing(true)
    try {
      const [overviewRes, dailyRes, sprintRes, riskRes] = await Promise.all([
        fetch(`${API}/finance/overview`).then(r => r.ok ? r.json() : null),
        fetch(`${API}/finance/daily-progress?days=30`).then(r => r.ok ? r.json() : null),
        fetch(`${API}/finance/sprint-analysis`).then(r => r.ok ? r.json() : null),
        fetch(`${API}/finance/risk-assessment`).then(r => r.ok ? r.json() : null)
      ])
      
      setOverview(overviewRes)
      setDailyProgress(dailyRes)
      setSprintAnalysis(sprintRes)
      setRiskAssessment(riskRes)
    } catch (err) {
      console.error("Failed to fetch finance data:", err)
    }
    setLoading(false)
    setRefreshing(false)
  }

  useEffect(() => {
    fetchData()
  }, [])

  // Extract chart data from daily progress
  const chartData = useMemo(() => {
    if (!dailyProgress?.daily_breakdown) return { costs: [], completed: [] }
    return {
      costs: dailyProgress.daily_breakdown.map(d => d.cumulative_cost),
      completed: dailyProgress.daily_breakdown.map(d => d.cumulative_completed)
    }
  }, [dailyProgress])

  if (loading) {
    return (
      <div className="w-full h-screen bg-background flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-border border-t-foreground mx-auto mb-6"
          />
          <p className="text-muted-foreground font-mono text-sm uppercase tracking-widest">
            Loading Financial Data...
          </p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="w-full min-h-[calc(100vh-120px)] bg-background py-6 sm:py-8">
      <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">
        {/* Page Header & Sub-nav Bar */}
        <div className="space-y-4 border-b border-border/80 pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h1 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight text-foreground">
                FinOps & <em className="text-[#FBBC05] italic font-serif">CapEx Management</em>
              </h1>
              <p className="text-sm font-sans text-muted-foreground mt-0.5">
                Automated R&D software capitalization, engineering unit economics, and cloud ROI tracking.
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              {riskAssessment && (
                <RiskIndicator level={riskAssessment.overall_risk_level} />
              )}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={fetchData}
                disabled={refreshing}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-border/80 bg-card text-foreground font-sans text-xs font-semibold hover:bg-muted/70 transition-all cursor-pointer shadow-[2px_2px_0px_0px_rgba(32,33,36,0.06)] hover:-translate-y-0.5"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </motion.button>
            </div>
          </div>

          {/* Tab Navigation */}
          <nav className="flex items-center gap-2 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden pt-1 pb-2.5 px-0.5">
            {[
              { id: 'overview', label: 'Overview', icon: <PieChart className="w-4 h-4" /> },
              { id: 'sprints', label: 'Sprint Analysis', icon: <Target className="w-4 h-4" /> },
              { id: 'daily', label: 'Daily Progress', icon: <Calendar className="w-4 h-4" /> },
              { id: 'risks', label: 'Risk Assessment', icon: <AlertTriangle className="w-4 h-4" /> }
            ].map(tab => (
              <motion.button
                key={tab.id}
                whileHover={{ y: -1 }}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center gap-2 px-3.5 py-2 font-sans text-xs sm:text-sm font-medium rounded-lg transition-all cursor-pointer ${
                  activeTab === tab.id 
                    ? 'border border-border/80 bg-foreground text-background font-semibold shadow-[2px_2px_0px_0px_rgba(32,33,36,0.12)]' 
                    : 'border border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/70'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </motion.button>
            ))}
          </nav>
        </div>

        {/* Main Content */}
        <main className="w-full space-y-6">
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && overview && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* ROI Hero Section */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* ROI Gauge Card */}
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 }}
                  className="lg:col-span-1 rounded-xl border border-border/80 bg-card p-6 flex flex-col items-center justify-center shadow-[3px_3px_0px_0px_rgba(32,33,36,0.08)]"
                >
                  <ROIGauge value={overview.summary.roi_percentage} size={160} />
                  <div className="mt-4 text-center">
                    <p className="text-2xl sm:text-3xl font-serif font-bold text-success">
                      <AnimatedValue value={overview.summary.projected_savings} prefix="$" />
                    </p>
                    <p className="text-[10px] font-sans font-medium uppercase tracking-wider text-muted-foreground mt-1">
                      Projected Savings vs Market Rate
                    </p>
                  </div>
                </motion.div>

                {/* Key Metrics */}
                <div className="lg:col-span-2 grid grid-cols-2 gap-4">
                  {[
                    { 
                      label: "Total Budget", 
                      value: overview.summary.total_budgeted_cost, 
                      prefix: "$",
                      icon: <DollarSign className="w-5 h-5" />,
                      color: "text-foreground"
                    },
                    { 
                      label: "Spent to Date", 
                      value: overview.summary.actual_spent_cost, 
                      prefix: "$",
                      icon: <TrendingDown className="w-5 h-5" />,
                      color: "text-warning",
                      subtitle: `${Math.round((overview.summary.actual_spent_cost / overview.summary.total_budgeted_cost) * 100)}% utilized`
                    },
                    { 
                      label: "Remaining", 
                      value: overview.summary.remaining_budget, 
                      prefix: "$",
                      icon: <TrendingUp className="w-5 h-5" />,
                      color: overview.summary.remaining_budget > 0 ? "text-success" : "text-destructive"
                    },
                    { 
                      label: "Avg Hourly Rate", 
                      value: overview.summary.avg_hourly_rate, 
                      prefix: "$",
                      suffix: "/hr",
                      icon: <Users className="w-5 h-5" />,
                      color: "text-foreground"
                    }
                  ].map((metric, i) => (
                    <motion.div
                      key={metric.label}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.15 + i * 0.05 }}
                      className="rounded-xl border border-border/80 bg-card p-5 hover:border-border/30 shadow-[2px_2px_0px_0px_rgba(32,33,36,0.06)] hover:shadow-[3px_3px_0px_0px_rgba(32,33,36,0.1)] hover:-translate-y-0.5 transition-all"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="p-2 rounded-lg bg-muted/60">
                          {metric.icon}
                        </div>
                      </div>
                      <p className="text-[10px] font-sans font-semibold uppercase tracking-widest text-muted-foreground">
                        {metric.label}
                      </p>
                      <p className={`text-2xl sm:text-3xl font-serif font-bold ${metric.color}`}>
                        <AnimatedValue value={metric.value} prefix={metric.prefix} suffix={metric.suffix} />
                      </p>
                      {metric.subtitle && (
                        <p className="text-xs font-sans text-muted-foreground mt-1">{metric.subtitle}</p>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Cost Trend Chart */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="rounded-xl border border-border/80 bg-card p-6 shadow-[3px_3px_0px_0px_rgba(32,33,36,0.08)]"
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-serif font-bold text-lg">Cost Accumulation</h3>
                    <p className="text-xs font-sans text-muted-foreground">Last 30 days cumulative spend</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 bg-success rounded-full" />
                      <span className="text-xs font-mono">Cost</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 bg-accent rounded-full" />
                      <span className="text-xs font-mono">Tasks</span>
                    </div>
                  </div>
                </div>
                <div className="h-32">
                  <MiniAreaChart data={chartData.costs} color="#22c55e" height={120} />
                </div>
              </motion.div>

              {/* Task Progress */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { label: "Completed", value: overview.tasks.completed, total: overview.tasks.total, color: "bg-success" },
                  { label: "In Progress", value: overview.tasks.in_progress, total: overview.tasks.total, color: "bg-warning" },
                  { label: "Pending", value: overview.tasks.pending, total: overview.tasks.total, color: "bg-muted-foreground" }
                ].map((status, i) => (
                  <motion.div
                    key={status.label}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + i * 0.1 }}
                    className="rounded-xl border border-border/80 bg-card p-4 shadow-[2px_2px_0px_0px_rgba(32,33,36,0.06)]"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-sans font-semibold uppercase tracking-widest text-muted-foreground">
                        {status.label}
                      </span>
                      <span className="font-mono font-bold text-sm">
                        {status.value}/{status.total}
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-muted/80 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${status.total > 0 ? (status.value / status.total) * 100 : 0}%` }}
                        transition={{ duration: 0.8, delay: 0.5 + i * 0.1 }}
                        className={`h-full rounded-full ${status.color}`}
                      />
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Hours Summary */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="rounded-xl border border-border/80 bg-card p-6 shadow-[3px_3px_0px_0px_rgba(32,33,36,0.08)]"
              >
                <h3 className="text-[10px] font-sans font-semibold uppercase tracking-widest text-muted-foreground mb-4">
                  Hours Breakdown
                </h3>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-3xl font-serif font-bold text-foreground">{overview.hours.total_estimated}</p>
                    <p className="text-xs font-sans text-muted-foreground">Total Estimated</p>
                  </div>
                  <div>
                    <p className="text-3xl font-serif font-bold text-success">{overview.hours.completed}</p>
                    <p className="text-xs font-sans text-muted-foreground">Completed</p>
                  </div>
                  <div>
                    <p className="text-3xl font-serif font-bold text-warning">{overview.hours.remaining}</p>
                    <p className="text-xs font-sans text-muted-foreground">Remaining</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}

          {activeTab === 'sprints' && sprintAnalysis && (
            <motion.div
              key="sprints"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Overall Sprint Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: "Total Planned", value: sprintAnalysis.overall.total_planned_cost, prefix: "$" },
                  { label: "Actual Cost", value: sprintAnalysis.overall.total_actual_cost, prefix: "$" },
                  { label: "Total Savings", value: sprintAnalysis.overall.total_savings, prefix: "$", color: "text-success" },
                  { label: "Average ROI", value: sprintAnalysis.overall.average_roi, suffix: "%", color: "text-accent" }
                ].map((metric, i) => (
                  <motion.div
                    key={metric.label}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.1 }}
                    className="rounded-xl border border-border/80 bg-card p-4 text-center shadow-[2px_2px_0px_0px_rgba(32,33,36,0.06)]"
                  >
                    <p className="text-[10px] font-sans font-semibold uppercase tracking-widest text-muted-foreground">
                      {metric.label}
                    </p>
                    <p className={`text-2xl sm:text-3xl font-serif font-bold ${metric.color || ''}`}>
                      {metric.prefix}{metric.value.toLocaleString()}{metric.suffix}
                    </p>
                  </motion.div>
                ))}
              </div>

              {/* Sprint Cards */}
              <div className="space-y-4">
                {sprintAnalysis.sprints.map((sprint, i) => (
                  <motion.div
                    key={sprint.sprint_id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + i * 0.1 }}
                    className="rounded-xl border border-border/80 bg-card p-5 shadow-[3px_3px_0px_0px_rgba(32,33,36,0.08)]"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-3">
                          <h3 className="font-serif font-bold text-base sm:text-lg">{sprint.name}</h3>
                          <span className={`px-2.5 py-0.5 text-[10px] font-sans font-semibold rounded-full uppercase ${
                            sprint.state === 'active' ? 'bg-[#E6F4EA] text-[#137333] border border-[#34A853]/30' :
                            sprint.state === 'closed' ? 'bg-muted text-muted-foreground border border-border' :
                            'bg-[#FEF7E0] text-[#B06000] border border-[#FBBC05]/40'
                          }`}>
                            {sprint.state}
                          </span>
                        </div>
                        {sprint.goal && (
                          <p className="text-sm font-sans text-muted-foreground mt-1">{sprint.goal}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className={`text-xl sm:text-2xl font-serif font-bold ${
                          sprint.financials.roi_percentage >= 20 ? 'text-success' : 
                          sprint.financials.roi_percentage >= 0 ? 'text-warning' : 'text-destructive'
                        }`}>
                          {sprint.financials.roi_percentage >= 0 ? '+' : ''}{sprint.financials.roi_percentage}%
                        </p>
                        <p className="text-[10px] font-sans font-medium text-muted-foreground uppercase">ROI</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-[10px] font-sans font-semibold uppercase text-muted-foreground">Tasks</p>
                        <p className="font-mono text-sm">
                          <span className="text-success font-bold">{sprint.metrics.completed_tasks}</span>
                          <span className="text-muted-foreground">/{sprint.metrics.total_tasks}</span>
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] font-sans font-semibold uppercase text-muted-foreground">Delayed</p>
                        <p className={`font-mono text-sm font-bold ${sprint.metrics.delayed_tasks > 0 ? 'text-destructive' : 'text-success'}`}>
                          {sprint.metrics.delayed_tasks}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] font-sans font-semibold uppercase text-muted-foreground">Planned Cost</p>
                        <p className="font-mono text-sm font-bold">${sprint.financials.planned_cost.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-sans font-semibold uppercase text-muted-foreground">Actual Cost</p>
                        <p className={`font-mono text-sm font-bold ${
                          sprint.financials.total_cost > sprint.financials.planned_cost ? 'text-destructive' : 'text-success'
                        }`}>
                          ${sprint.financials.total_cost.toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="mt-4">
                      <div className="h-2 rounded-full bg-muted/80 overflow-hidden flex">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${sprint.metrics.completion_rate}%` }}
                          transition={{ duration: 0.8, delay: 0.3 + i * 0.1 }}
                          className="bg-success rounded-l-full"
                        />
                        {sprint.metrics.delayed_tasks > 0 && (
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${(sprint.metrics.delayed_tasks / sprint.metrics.total_tasks) * 100}%` }}
                            transition={{ duration: 0.8, delay: 0.4 + i * 0.1 }}
                            className="bg-destructive rounded-r-full"
                          />
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'daily' && dailyProgress && (
            <motion.div
              key="daily"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Summary Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: "Tasks Completed", value: dailyProgress.totals.total_completed, icon: <CheckCircle2 className="w-5 h-5 text-[#34A853]" /> },
                  { label: "Total Cost", value: dailyProgress.totals.total_cost, prefix: "$", icon: <DollarSign className="w-5 h-5 text-[#FBBC05]" /> },
                  { label: "Hours Logged", value: dailyProgress.totals.total_hours, icon: <Clock className="w-5 h-5 text-[#4285F4]" /> },
                  { label: "Avg Daily", value: dailyProgress.totals.avg_daily_completion, icon: <Activity className="w-5 h-5 text-[#EA4335]" /> }
                ].map((metric, i) => (
                  <motion.div
                    key={metric.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="rounded-xl border border-border/80 bg-card p-4 shadow-[2px_2px_0px_0px_rgba(32,33,36,0.06)]"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className="p-1.5 rounded-lg bg-muted/60">{metric.icon}</div>
                    </div>
                    <p className="text-[10px] font-sans font-semibold uppercase tracking-widest text-muted-foreground">
                      {metric.label}
                    </p>
                    <p className="text-xl sm:text-2xl font-serif font-bold text-foreground">
                      {metric.prefix}{metric.value.toLocaleString()}
                    </p>
                  </motion.div>
                ))}
              </div>

              {/* Daily Breakdown Table */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="rounded-xl border border-border/80 bg-card overflow-hidden shadow-[3px_3px_0px_0px_rgba(32,33,36,0.08)]"
              >
                <div className="p-4 border-b border-border/80">
                  <h3 className="font-serif font-bold text-base sm:text-lg">Daily Breakdown</h3>
                  <p className="text-xs font-sans text-muted-foreground">Last {dailyProgress.period}</p>
                </div>
                <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
                  <table className="w-full">
                    <thead className="bg-muted/60 sticky top-0 border-b border-border/80">
                      <tr>
                        <th className="px-4 py-3 text-left text-[10px] font-sans font-bold uppercase tracking-widest text-muted-foreground">Date</th>
                        <th className="px-4 py-3 text-right text-[10px] font-sans font-bold uppercase tracking-widest text-muted-foreground">Completed</th>
                        <th className="px-4 py-3 text-right text-[10px] font-sans font-bold uppercase tracking-widest text-muted-foreground">Started</th>
                        <th className="px-4 py-3 text-right text-[10px] font-sans font-bold uppercase tracking-widest text-muted-foreground">Delayed</th>
                        <th className="px-4 py-3 text-right text-[10px] font-sans font-bold uppercase tracking-widest text-muted-foreground">Hours</th>
                        <th className="px-4 py-3 text-right text-[10px] font-sans font-bold uppercase tracking-widest text-muted-foreground">Cost</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dailyProgress.daily_breakdown.slice().reverse().map((day, i) => (
                        <motion.tr
                          key={day.date}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.4 + i * 0.02 }}
                          className="border-b border-border hover:bg-muted/40 transition-colors"
                        >
                          <td className="px-4 py-3 font-mono text-sm">{day.date}</td>
                          <td className="px-4 py-3 text-right">
                            <span className={`font-mono text-sm font-semibold ${day.completed > 0 ? 'text-success' : 'text-muted-foreground'}`}>
                              {day.completed}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right font-mono text-sm">{day.started}</td>
                          <td className="px-4 py-3 text-right">
                            <span className={`font-mono text-sm font-semibold ${day.delayed > 0 ? 'text-destructive' : 'text-muted-foreground'}`}>
                              {day.delayed}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right font-mono text-sm">{day.hours_logged}h</td>
                          <td className="px-4 py-3 text-right font-mono text-sm font-semibold">${day.cumulative_cost.toLocaleString()}</td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            </motion.div>
          )}

          {activeTab === 'risks' && riskAssessment && (
            <motion.div
              key="risks"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Risk Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="md:col-span-1 rounded-xl border border-border/80 bg-card p-6 flex flex-col items-center justify-center shadow-[3px_3px_0px_0px_rgba(32,33,36,0.08)]"
                >
                  <RiskIndicator level={riskAssessment.overall_risk_level} />
                  <p className="text-3xl sm:text-4xl font-serif font-bold text-destructive mt-4">
                    ${riskAssessment.total_risk_exposure.toLocaleString()}
                  </p>
                  <p className="text-[10px] font-sans font-medium uppercase tracking-wider text-muted-foreground mt-1">
                    Total Risk Exposure
                  </p>
                </motion.div>

                <div className="md:col-span-2 grid grid-cols-3 gap-4">
                  {[
                    { label: "High Risk", value: riskAssessment.summary.high_risks, color: "text-[#EA4335]", bg: "bg-[#FCE8E6]/60 border-[#EA4335]/30" },
                    { label: "Medium Risk", value: riskAssessment.summary.medium_risks, color: "text-[#B06000]", bg: "bg-[#FEF7E0]/60 border-[#FBBC05]/30" },
                    { label: "Low Risk", value: riskAssessment.summary.low_risks, color: "text-[#137333]", bg: "bg-[#E6F4EA]/60 border-[#34A853]/30" }
                  ].map((item, i) => (
                    <motion.div
                      key={item.label}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 + i * 0.1 }}
                      className={`rounded-xl border p-4 text-center shadow-[2px_2px_0px_0px_rgba(32,33,36,0.06)] ${item.bg}`}
                    >
                      <p className={`text-3xl sm:text-4xl font-serif font-bold ${item.color}`}>{item.value}</p>
                      <p className="text-[10px] font-sans font-semibold uppercase tracking-widest text-muted-foreground mt-1">
                        {item.label}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Risk Cards */}
              <div className="space-y-4">
                {riskAssessment.risks.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="rounded-xl border border-border/80 bg-card p-8 text-center shadow-[3px_3px_0px_0px_rgba(32,33,36,0.08)]"
                  >
                    <Shield className="w-12 h-12 text-success mx-auto mb-4" />
                    <p className="font-serif font-bold text-lg text-success">No Active Risks Detected</p>
                    <p className="text-sm font-sans text-muted-foreground mt-1">Your project is currently on track</p>
                  </motion.div>
                ) : (
                  riskAssessment.risks.map((risk, i) => (
                    <motion.div
                      key={risk.type}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 + i * 0.1 }}
                      className={`rounded-xl border p-5 shadow-[2px_2px_0px_0px_rgba(32,33,36,0.06)] bg-card ${
                        risk.severity === 'high' ? 'border-[#EA4335]/40' :
                        risk.severity === 'medium' ? 'border-[#FBBC05]/40' :
                        'border-border/80'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${
                            risk.severity === 'high' ? 'bg-[#FCE8E6] text-[#EA4335]' :
                            risk.severity === 'medium' ? 'bg-[#FEF7E0] text-[#B06000]' :
                            'bg-muted/80 text-muted-foreground'
                          }`}>
                            <AlertTriangle className="w-5 h-5" />
                          </div>
                          <div>
                            <h3 className="font-serif font-bold text-base capitalize">{risk.type.replace('_', ' ')}</h3>
                            <span className={`text-[10px] font-sans font-semibold uppercase ${
                              risk.severity === 'high' ? 'text-[#EA4335]' :
                              risk.severity === 'medium' ? 'text-[#B06000]' :
                              'text-muted-foreground'
                            }`}>
                              {risk.severity} severity • {risk.count} items
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg sm:text-xl font-serif font-bold text-destructive">
                            ${risk.potential_cost_impact.toLocaleString()}
                          </p>
                          <p className="text-[10px] font-sans font-medium text-muted-foreground uppercase">Impact</p>
                        </div>
                      </div>
                      
                      <p className="text-sm font-sans text-muted-foreground mb-3">{risk.description}</p>
                      
                      <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/40 border border-border">
                        <Zap className="w-4 h-4 text-[#FBBC05] mt-0.5 shrink-0" />
                        <p className="text-sm font-sans">{risk.recommendation}</p>
                      </div>
                    </motion.div>
                  ))
                )}
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
