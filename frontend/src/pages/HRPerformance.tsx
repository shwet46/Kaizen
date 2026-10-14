import { useEffect, useState, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  LiaArrowLeftSolid as ArrowLeft,
  LiaUserSolid as User,
  LiaArrowUpSolid as TrendingUp,
  LiaArrowDownSolid as TrendingDown,
  LiaCodeSolid as GitCommit,
  LiaCheckCircleSolid as CheckCircle2,
  LiaClockSolid as Clock,
  LiaExclamationTriangleSolid as AlertTriangle,
  LiaBoltSolid as Zap,
  LiaDollarSignSolid as DollarSign,
  LiaBrainSolid as Brain,
  LiaSyncSolid as RefreshCw,
  LiaChevronDownSolid as ChevronDown,
  LiaChevronRightSolid as ChevronRight,
  LiaFileAltSolid as FileText,
  LiaBullseyeSolid as Target,
  LiaChartLineSolid as Activity,
  LiaChartBarSolid as BarChart3,
  LiaSpinnerSolid as Loader2
} from "react-icons/lia"

const API = import.meta.env.VITE_API_URL || "https://kaizen-backend-8x01.onrender.com/api"

// ============================================
// TYPES
// ============================================

interface EmployeeMetrics {
  _id: string
  user_id: string
  employee_id?: string
  name: string
  email?: string
  role: string
  department?: string
  team?: string
  skills: string[]
  seniority_level: number
  hourly_rate: number
  years_of_experience: number
  availability?: string
  metrics: {
    commits: {
      total: number
      additions: number
      deletions: number
      avg_size: number
      last_commit: string | null
    }
    tasks: {
      total: number
      completed: number
      in_progress: number
      pending: number
      overdue: number
      completion_rate: number
    }
    hours: {
      total_estimated: number
      completed: number
    }
    performance: {
      workload_score: number
      stress_level: number
      efficiency: number
      productivity_score: number
    }
  }
}

interface LLMReport {
  summary: string
  strengths: string[]
  areas_for_improvement: string[]
  recommendations: string[]
  appraisal_score: number
  budget_impact: {
    current_cost: number
    projected_value: number
    roi_assessment: string
  }
  promotion_readiness: string
}

interface HRPerformanceProps {
  onBack: () => void
}

// ============================================
// HELPER FUNCTIONS
// ============================================
// COMPONENTS
// ============================================

const MetricCard = ({ label, value, icon, color = "text-foreground", subtitle }: {
  label: string
  value: string | number
  icon: React.ReactNode
  color?: string
  subtitle?: string
}) => (
  <div className="p-4 rounded-xl border border-border/80 bg-card shadow-[2px_2px_0px_0px_rgba(32,33,36,0.06)]">
    <div className="flex items-center gap-2 mb-2">
      <div className={`p-2 rounded-lg bg-muted/60 ${color}`}>{icon}</div>
      <span className="text-[10px] font-sans font-semibold uppercase tracking-widest text-muted-foreground">{label}</span>
    </div>
    <p className={`text-2xl sm:text-3xl font-serif font-bold ${color}`}>{value}</p>
    {subtitle && <p className="text-xs font-sans text-muted-foreground mt-1">{subtitle}</p>}
  </div>
)

const PerformanceGauge = ({ value, label }: { value: number, label: string }) => {
  const getColor = (v: number) => {
    if (v >= 80) return 'text-success'
    if (v >= 60) return 'text-warning'
    return 'text-destructive'
  }
  
  return (
    <div className="text-center">
      <div className="relative w-20 h-20 mx-auto">
        <svg className="w-20 h-20 -rotate-90">
          <circle
            cx="40"
            cy="40"
            r="35"
            fill="none"
            stroke="hsl(var(--border))"
            strokeWidth="6"
          />
          <motion.circle
            cx="40"
            cy="40"
            r="35"
            fill="none"
            stroke="currentColor"
            strokeWidth="6"
            strokeLinecap="round"
            className={getColor(value)}
            strokeDasharray={`${(value / 100) * 220} 220`}
            initial={{ strokeDasharray: "0 220" }}
            animate={{ strokeDasharray: `${(value / 100) * 220} 220` }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`text-lg font-serif font-bold ${getColor(value)}`}>{value}</span>
        </div>
      </div>
      <p className="text-xs font-sans text-muted-foreground mt-2 uppercase font-medium">{label}</p>
    </div>
  )
}

const EmployeeCard = ({ employee, onSelect, isSelected }: {
  employee: EmployeeMetrics
  onSelect: () => void
  isSelected: boolean
}) => (
  <motion.button
    onClick={onSelect}
    whileHover={{ y: -2 }}
    className={`w-full text-left p-4 rounded-xl border transition-all cursor-pointer ${
      isSelected 
        ? 'border-border bg-foreground/[0.03] shadow-[3px_3px_0px_0px_rgba(32,33,36,0.12)]' 
        : 'border-border/80 bg-card hover:border-border/40 shadow-[2px_2px_0px_0px_rgba(32,33,36,0.06)] hover:shadow-[3px_3px_0px_0px_rgba(32,33,36,0.1)]'
    }`}
  >
    <div className="flex items-start justify-between">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#E6F4EA] to-[#CEEAD6] text-[#137333] flex items-center justify-center font-bold text-sm border border-[#34A853]/30 shrink-0">
          {employee.name?.charAt(0) || '?'}
        </div>
        <div>
          <h3 className="font-serif font-bold text-base text-foreground">{employee.name}</h3>
          <p className="text-xs font-sans text-muted-foreground">{employee.role} • {employee.team || employee.department || 'No Team'}</p>
        </div>
      </div>
      <div className="text-right">
        <div className={`text-xl font-serif font-bold ${
          employee.metrics.performance.efficiency >= 70 ? 'text-success' : 
          employee.metrics.performance.efficiency >= 50 ? 'text-warning' : 'text-destructive'
        }`}>
          {employee.metrics.performance.efficiency}%
        </div>
        <p className="text-[10px] font-sans font-medium text-muted-foreground uppercase">Efficiency</p>
      </div>
    </div>
    
    <div className="grid grid-cols-4 gap-2 mt-3 pt-3 border-t border-border text-center">
      <div>
        <p className="text-sm font-serif font-bold text-foreground">{employee.metrics.commits.total}</p>
        <p className="text-[10px] font-sans text-muted-foreground">Commits</p>
      </div>
      <div>
        <p className="text-sm font-serif font-bold text-foreground">{employee.metrics.tasks.completed}</p>
        <p className="text-[10px] font-sans text-muted-foreground">Done</p>
      </div>
      <div>
        <p className="text-sm font-serif font-bold text-foreground">{employee.metrics.tasks.in_progress}</p>
        <p className="text-[10px] font-sans text-muted-foreground">Active</p>
      </div>
      <div>
        <p className={`text-sm font-serif font-bold ${employee.metrics.tasks.overdue > 0 ? 'text-destructive' : 'text-foreground'}`}>
          {employee.metrics.tasks.overdue}
        </p>
        <p className="text-[10px] font-sans text-muted-foreground">Overdue</p>
      </div>
    </div>
  </motion.button>
)

// ============================================
// MAIN COMPONENT
// ============================================

export default function HRPerformance({ onBack }: HRPerformanceProps) {
  const [employees, setEmployees] = useState<EmployeeMetrics[]>([])
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [generatingReport, setGeneratingReport] = useState(false)
  const [report, setReport] = useState<LLMReport | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showApiKeyInput, setShowApiKeyInput] = useState(false)
  const [apiKeyInput, setApiKeyInput] = useState('')

  // Fetch employees
  useEffect(() => {
    setLoading(true)
    fetch(`${API}/hr/employees`)
      .then(r => r.ok ? r.json() : [])
      .then(data => {
        setEmployees(data)
        setLoading(false)
      })
      .catch(() => {
        setError('Failed to load employee data')
        setLoading(false)
      })
  }, [])

  // Generate LLM report for selected employee
  const generateReport = useCallback(async () => {
    if (!selectedEmployee) return
    
    // Use server-side proxy instead of direct call to avoid CORS/Auth issues
    setGeneratingReport(true)
    setReport(null)
    setError(null)
    
    try {
      const response = await fetch(`${API}/hr/generate-report`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          employee: selectedEmployee,
          metrics: selectedEmployee.metrics
        })
      })

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `Server error: ${response.status}`);
      }

      const data = await response.json()
      setReport(data)
    } catch (err) {
      console.error('LLM Error:', err)
      setError(err instanceof Error ? err.message : 'Failed to generate report')
    } finally {
      setGeneratingReport(false)
    }
  }, [selectedEmployee])

  /* 
  // Legacy client-side implementation removed/commented out
  // The server-side proxy handles the API key securely.
  */
  
  const saveApiKey = () => {
    // No longer needed for server-side proxy, but keeping empty function to prevent breakages if referenced
    setShowApiKeyInput(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <RefreshCw className="w-8 h-8" />
        </motion.div>
      </div>
    )
  }

  return (
    <div className="w-full min-h-[calc(100vh-120px)] bg-background py-6 sm:py-8">
      <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-border/80 pb-4">
          <div>

            <h1 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight text-foreground">
              Performance <em className="text-[#34A853] italic font-serif">Intelligence</em>
            </h1>
            <p className="text-sm font-sans text-muted-foreground mt-0.5">
              Track developer throughput, commit velocity, and generate automated performance reviews.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Employee List */}
          <div className="lg:col-span-1 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-sans font-bold uppercase tracking-wider text-muted-foreground">
                Engineers ({employees.length})
              </h2>
            </div>
            
            <div className="space-y-3 max-h-[calc(100vh-220px)] overflow-y-auto pr-1.5 [scrollbar-width:thin]">
              {employees.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground rounded-xl border border-dashed border-border/80 p-6">
                  <User className="w-10 h-10 mx-auto mb-3 opacity-50" />
                  <p className="font-serif font-bold text-base text-foreground">No employees found in database</p>
                  <p className="text-xs font-sans mt-1">Add employee telemetry data to see metrics</p>
                </div>
              ) : (
                employees.map(emp => (
                  <EmployeeCard
                    key={emp._id}
                    employee={emp}
                    onSelect={() => {
                      setSelectedEmployee(emp)
                      setReport(null)
                    }}
                    isSelected={selectedEmployee?._id === emp._id}
                  />
                ))
              )}
            </div>
          </div>

          {/* Employee Details & Report */}
          <div className="lg:col-span-2 space-y-6">
            {selectedEmployee ? (
              <>
                {/* Employee Header */}
                <div className="rounded-2xl border border-border/80 p-6 bg-card shadow-[4px_4px_0px_0px_rgba(32,33,36,0.08)]">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#E6F4EA] to-[#CEEAD6] text-[#137333] flex items-center justify-center text-2xl font-serif font-bold border-2 border-[#34A853]/30 shadow-sm shrink-0">
                        {selectedEmployee.name?.charAt(0) || '?'}
                      </div>
                      <div>
                        <h2 className="text-2xl font-serif font-bold text-foreground">{selectedEmployee.name}</h2>
                        <p className="text-sm font-sans text-muted-foreground">{selectedEmployee.role}</p>
                        <p className="text-xs text-muted-foreground font-mono mt-1">
                          {selectedEmployee.team || selectedEmployee.department || 'No Team'} • 
                          Level {selectedEmployee.seniority_level}/5 • 
                          ${selectedEmployee.hourly_rate}/hr
                        </p>
                      </div>
                    </div>
                    <motion.button
                      onClick={generateReport}
                      disabled={generatingReport}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-foreground text-background font-sans text-xs font-semibold shadow-[2px_2px_0px_0px_rgba(32,33,36,0.12)] hover:bg-foreground/90 transition-all cursor-pointer hover:-translate-y-0.5 disabled:opacity-50"
                    >
                      {generatingReport ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Generating...</span>
                        </>
                      ) : (
                        <>
                          <Brain className="w-4 h-4 text-[#34A853]" />
                          <span>Generate AI Report</span>
                        </>
                      )}
                    </motion.button>
                  </div>

                  {/* Metrics Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                    <MetricCard
                      label="Commits"
                      value={selectedEmployee.metrics.commits.total}
                      icon={<GitCommit className="w-4 h-4" />}
                      subtitle={`+${selectedEmployee.metrics.commits.additions} / -${selectedEmployee.metrics.commits.deletions}`}
                    />
                    <MetricCard
                      label="Tasks Done"
                      value={selectedEmployee.metrics.tasks.completed}
                      icon={<CheckCircle2 className="w-4 h-4" />}
                      color="text-success"
                      subtitle={`of ${selectedEmployee.metrics.tasks.total} total`}
                    />
                    <MetricCard
                      label="Hours"
                      value={selectedEmployee.metrics.hours.completed}
                      icon={<Clock className="w-4 h-4" />}
                      subtitle={`of ${selectedEmployee.metrics.hours.total_estimated} est.`}
                    />
                    <MetricCard
                      label="Overdue"
                      value={selectedEmployee.metrics.tasks.overdue}
                      icon={<AlertTriangle className="w-4 h-4" />}
                      color={selectedEmployee.metrics.tasks.overdue > 0 ? "text-destructive" : "text-muted-foreground"}
                    />
                  </div>

                  {/* Performance Gauges */}
                  <div className="flex justify-around mt-6 pt-6 border-t border-border/80">
                    <PerformanceGauge value={selectedEmployee.metrics.performance.efficiency} label="Efficiency" />
                    <PerformanceGauge value={selectedEmployee.metrics.performance.productivity_score} label="Productivity" />
                    <PerformanceGauge value={100 - selectedEmployee.metrics.performance.stress_level} label="Wellbeing" />
                    <PerformanceGauge value={selectedEmployee.metrics.tasks.completion_rate} label="Completion" />
                  </div>
                </div>

                {/* AI Report */}
                {error && (
                  <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-4">
                    <p className="text-destructive font-mono text-sm">{error}</p>
                  </div>
                )}

                {showApiKeyInput && (
                  <div className="rounded-2xl border border-border/80 p-6 bg-card shadow-[4px_4px_0px_0px_rgba(32,33,36,0.08)]">
                    <h3 className="font-serif font-bold text-lg mb-2">AI API Key Required</h3>
                    <p className="text-sm font-sans text-muted-foreground mb-4">
                      Enter your API key to generate AI-powered reports
                    </p>
                    <div className="flex gap-2">
                      <input
                        type="password"
                        value={apiKeyInput}
                        onChange={(e) => setApiKeyInput(e.target.value)}
                        placeholder="Enter API key..."
                        className="flex-1 px-3 py-2 rounded-lg border border-border/80 bg-background font-mono text-sm"
                      />
                      <button
                        onClick={saveApiKey}
                        className="px-4 py-2 rounded-lg bg-foreground text-background font-sans text-xs font-semibold"
                      >
                        Save & Generate
                      </button>
                    </div>
                  </div>
                )}

                {report && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-2xl border border-border/80 p-6 bg-card space-y-6 shadow-[4px_4px_0px_0px_rgba(32,33,36,0.08)]"
                  >
                    <div className="flex items-center justify-between border-b border-border/80 pb-4">
                      <h3 className="text-lg font-serif font-bold flex items-center gap-2 text-foreground">
                        <FileText className="w-5 h-5 text-[#34A853]" />
                        <span>AI Performance Report</span>
                      </h3>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-sans text-muted-foreground">Appraisal Score</span>
                        <span className={`text-2xl sm:text-3xl font-serif font-bold ${
                          report.appraisal_score >= 80 ? 'text-success' :
                          report.appraisal_score >= 60 ? 'text-warning' : 'text-destructive'
                        }`}>
                          {report.appraisal_score}/100
                        </span>
                      </div>
                    </div>

                    {/* Summary */}
                    <div>
                      <h4 className="text-[10px] font-sans font-semibold uppercase tracking-widest text-muted-foreground mb-2">Executive Summary</h4>
                      <p className="text-sm font-sans text-foreground/90 leading-relaxed">{report.summary}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Strengths */}
                      <div>
                        <h4 className="text-[10px] font-sans font-semibold uppercase tracking-widest text-muted-foreground mb-2 flex items-center gap-2">
                          <TrendingUp className="w-3.5 h-3.5 text-success" /> Strengths
                        </h4>
                        <ul className="space-y-1.5">
                          {report.strengths.map((s, i) => (
                            <li key={i} className="text-sm font-sans flex items-start gap-2">
                              <CheckCircle2 className="w-4 h-4 text-success mt-0.5 shrink-0" />
                              <span>{s}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Areas for Improvement */}
                      <div>
                        <h4 className="text-[10px] font-sans font-semibold uppercase tracking-widest text-muted-foreground mb-2 flex items-center gap-2">
                          <Target className="w-3.5 h-3.5 text-warning" /> Areas for Improvement
                        </h4>
                        <ul className="space-y-1.5">
                          {report.areas_for_improvement.map((a, i) => (
                            <li key={i} className="text-sm font-sans flex items-start gap-2">
                              <AlertTriangle className="w-4 h-4 text-warning mt-0.5 shrink-0" />
                              <span>{a}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Recommendations */}
                    <div>
                      <h4 className="text-[10px] font-sans font-semibold uppercase tracking-widest text-muted-foreground mb-2 flex items-center gap-2">
                        <Zap className="w-3.5 h-3.5 text-[#FBBC05]" /> Recommendations
                      </h4>
                      <ul className="space-y-2">
                        {report.recommendations.map((r, i) => (
                          <li key={i} className="text-sm font-sans flex items-start gap-2 p-2.5 rounded-lg bg-muted/40 border border-border">
                            <ChevronRight className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                            <span>{r}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Budget Impact */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-border/80">
                      <div>
                        <h4 className="text-[10px] font-sans font-semibold uppercase tracking-widest text-muted-foreground mb-1">Monthly Cost</h4>
                        <p className="text-xl sm:text-2xl font-serif font-bold text-foreground">${report.budget_impact.current_cost.toLocaleString()}</p>
                      </div>
                      <div>
                        <h4 className="text-[10px] font-sans font-semibold uppercase tracking-widest text-muted-foreground mb-1">Projected Value</h4>
                        <p className="text-xl sm:text-2xl font-serif font-bold text-success">${report.budget_impact.projected_value.toLocaleString()}</p>
                      </div>
                      <div>
                        <h4 className="text-[10px] font-sans font-semibold uppercase tracking-widest text-muted-foreground mb-1">ROI Assessment</h4>
                        <p className="text-sm font-sans text-muted-foreground">{report.budget_impact.roi_assessment}</p>
                      </div>
                    </div>

                    {/* Promotion Readiness */}
                    <div className="p-4 rounded-xl bg-muted/40 border border-border">
                      <h4 className="text-[10px] font-sans font-semibold uppercase tracking-widest text-muted-foreground mb-1">Promotion Readiness</h4>
                      <p className="text-sm font-sans text-foreground/90">{report.promotion_readiness}</p>
                    </div>
                  </motion.div>
                )}
              </>
            ) : (
              <div className="rounded-2xl border border-dashed border-border/80 p-12 text-center bg-card/50">
                <User className="w-16 h-16 mx-auto mb-4 text-muted-foreground/40" />
                <h3 className="text-lg font-serif font-bold mb-2 text-foreground">Select an Engineer</h3>
                <p className="text-muted-foreground font-sans text-sm max-w-md mx-auto">
                  Choose an engineer from the list to view their throughput metrics, commit velocity, and generate AI performance reviews.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
