import { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LiaArrowLeftSolid as ArrowLeft,
  LiaExclamationTriangleSolid as AlertTriangle,
  LiaClockSolid as Clock,
  LiaDollarSignSolid as DollarSign,
  LiaUsersSolid as Users,
  LiaArrowUpSolid as TrendingUp,
  LiaCalendarSolid as Calendar,
  LiaShieldAltSolid as Shield,
  LiaFireSolid as Flame,
  LiaTimesSolid as X,
  LiaPlusSolid as Plus,
  LiaUndoAltSolid as RotateCcw,
  LiaBoltSolid as Zap,
  LiaBrainSolid as Brain
} from 'react-icons/lia';
import { 
  DelayPredictionEngine, 
  convertToEnhancedEmployee,
  convertToEnhancedTask
} from '../lib/delay-prediction-engine';
import type { 
  EnhancedEmployee, 
  EnhancedTask, 
  ProjectContext
} from '../lib/delay-prediction-engine';

// ============================================
// TYPES
// ============================================

interface SimpleEmployee {
  id: string;
  name: string;
  role: string;
  tech_stack: string[];
  hourly_rate: number;
  workload: number;
}

interface SimpleTask {
  id: string;
  title: string;
  required_skills: string[];
  estimated_hours: number;
  assigned_employee_ids: string[];
  status: string;
}

interface AllocationData {
  tasks: SimpleTask[];
  employees: SimpleEmployee[];
  deadline_weeks: number;
  budget: number;
  total_hours: number;
}

// ============================================
// COUNT UP ANIMATION (matches AnalyticsDashboard)
// ============================================

const CountUpNumber = ({ end, duration = 1500, prefix = "", suffix = "" }: { 
  end: number; 
  duration?: number; 
  prefix?: string; 
  suffix?: string 
}) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * end));
      
      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration]);

  return <span>{prefix}{count.toLocaleString()}{suffix}</span>;
};

// ============================================
// AI PREDICTION ENGINE WRAPPER
// ============================================

// ============================================
// ENHANCED PREDICTION RESULT TYPE (for UI)
// ============================================

interface UIDelayPrediction {
  delay_days: number;
  delay_range: { min: number; max: number; confidence: number };
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  delay_probability: number;
  confidence: number;
  factors: { 
    factor: string; 
    impact_days: number; 
    probability: number;
    category: string;
    severity: string;
  }[];
  recommendations: { 
    recommendation: string; 
    priority: string;
    expected_impact_days: number;
  }[];
  cost_impact: {
    additional_labor_cost: number;
    opportunity_cost: number;
    overtime_cost: number;
    total_impact: number;
  };
  burnout_employees: string[];
  employee_impact: {
    employee_id: string;
    employee_name: string;
    role: string;
    removal_impact: {
      delay_days: number;
      tasks_affected: number;
      replacement_difficulty: string;
    };
    burnout_risk: number;
    single_point_of_failure: boolean;
  }[];
  critical_path_tasks: string[];
  data_quality_score: number;
}

// ============================================
// AI PREDICTION ENGINE WRAPPER
// ============================================

const calculatePrediction = (
  tasks: SimpleTask[],
  activeEmployees: SimpleEmployee[],
  removedEmployees: SimpleEmployee[],
  budgetPercent: number,
  deadlineWeeks: number,
  originalBudget: number,
  totalHours: number
): UIDelayPrediction => {
  // Convert to enhanced types
  const enhancedEmployees: EnhancedEmployee[] = [...activeEmployees, ...removedEmployees]
    .map(e => convertToEnhancedEmployee(e));
  
  const enhancedTasks: EnhancedTask[] = tasks.map(t => convertToEnhancedTask(t));
  
  // Create project context
  const projectContext: ProjectContext = {
    project_id: 'current-project',
    name: 'Current Allocation',
    deadline_weeks: deadlineWeeks,
    budget: originalBudget,
    total_estimated_hours: totalHours || tasks.reduce((sum, t) => sum + t.estimated_hours, 0),
    team_velocity: 20, // Story points per sprint (estimated)
    sprint_completion_rate: 0.85,
    historical_overrun_rate: 0.15, // 15% average overrun
    technical_debt_score: 0.3,
    external_dependencies: 2,
    requirement_stability: 0.8
  };
  
  // Create prediction engine
  const engine = new DelayPredictionEngine(
    enhancedEmployees,
    enhancedTasks,
    projectContext
  );
  
  // Build scenario
  const scenario = {
    employee_removals: removedEmployees.map(e => e.id),
    budget_adjustment: budgetPercent,
    deadline_adjustment: 0, // No deadline change in current UI
    scope_change: 100, // No scope change
    external_delay_days: 0
  };
  
  // Run prediction
  const result = engine.predict(scenario);
  
  // Convert to UI format
  return {
    delay_days: result.predicted_delay_days,
    delay_range: result.delay_range,
    risk_level: result.risk_level,
    delay_probability: result.delay_probability,
    confidence: result.confidence_score,
    factors: result.factors.map(f => ({
      factor: f.factor,
      impact_days: f.impact_days,
      probability: f.probability,
      category: f.category,
      severity: f.severity
    })),
    recommendations: result.recommendations.map(r => ({
      recommendation: r.recommendation,
      priority: r.priority,
      expected_impact_days: r.expected_impact_days
    })),
    cost_impact: result.cost_impact,
    burnout_employees: result.employee_impact
      .filter(e => e.burnout_risk > 0.6)
      .map(e => e.employee_name),
    employee_impact: result.employee_impact.map(e => ({
      employee_id: e.employee_id,
      employee_name: e.employee_name,
      role: e.role,
      removal_impact: {
        delay_days: e.removal_impact.delay_days,
        tasks_affected: e.removal_impact.tasks_affected,
        replacement_difficulty: e.removal_impact.replacement_difficulty
      },
      burnout_risk: e.burnout_risk,
      single_point_of_failure: e.single_point_of_failure
    })),
    critical_path_tasks: result.critical_path_tasks,
    data_quality_score: result.data_quality_score
  };
};

// ============================================
// MAIN COMPONENT
// ============================================

interface DelayPredictionProps {
  onBack?: () => void;
  allocationDataProp?: AllocationData | null;
}

const DelayPrediction = ({ onBack, allocationDataProp }: DelayPredictionProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const [originalData, setOriginalData] = useState<AllocationData | null>(null);
  const [activeEmployees, setActiveEmployees] = useState<SimpleEmployee[]>([]);
  const [removedEmployees, setRemovedEmployees] = useState<SimpleEmployee[]>([]);
  const [budgetPercent, setBudgetPercent] = useState(100);
  const [deadlineWeeks, setDeadlineWeeks] = useState(4);
  const [prediction, setPrediction] = useState<UIDelayPrediction | null>(null);
  
  useEffect(() => {
    // First check prop, then location state
    const allocationData = allocationDataProp || (location.state as { allocation: AllocationData } | null)?.allocation;
    if (allocationData) {
      setOriginalData(allocationData);
      setActiveEmployees([...allocationData.employees]);
      setRemovedEmployees([]);
      setBudgetPercent(100);
      setDeadlineWeeks(allocationData.deadline_weeks);
    }
  }, [location.state, allocationDataProp]);
  
  useEffect(() => {
    if (originalData) {
      const newPrediction = calculatePrediction(
        originalData.tasks,
        activeEmployees,
        removedEmployees,
        budgetPercent,
        deadlineWeeks,
        originalData.budget,
        originalData.total_hours
      );
      setPrediction(newPrediction);
    }
  }, [originalData, activeEmployees, removedEmployees, budgetPercent, deadlineWeeks]);
  
  const removeEmployee = useCallback((employee: SimpleEmployee) => {
    setActiveEmployees(prev => prev.filter(e => e.id !== employee.id));
    setRemovedEmployees(prev => [...prev, employee]);
  }, []);
  
  const restoreEmployee = useCallback((employee: SimpleEmployee) => {
    setRemovedEmployees(prev => prev.filter(e => e.id !== employee.id));
    setActiveEmployees(prev => [...prev, employee]);
  }, []);
  
  const resetAll = useCallback(() => {
    if (originalData) {
      setActiveEmployees([...originalData.employees]);
      setRemovedEmployees([]);
      setBudgetPercent(100);
      setDeadlineWeeks(originalData.deadline_weeks);
    }
  }, [originalData]);
  
  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-success';
      case 'medium': return 'text-yellow-500';
      case 'high': return 'text-orange-500';
      case 'critical': return 'text-destructive';
      default: return 'text-muted-foreground';
    }
  };
  
  const getRiskBg = (risk: string) => {
    switch (risk) {
      case 'low': return 'bg-success';
      case 'medium': return 'bg-yellow-500';
      case 'high': return 'bg-orange-500';
      case 'critical': return 'bg-destructive';
      default: return 'bg-muted';
    }
  };

  if (!originalData) {
    return (
      <div className="w-full bg-background py-12">
        <div className="max-w-4xl mx-auto text-center px-6">
          <AlertTriangle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-4">No Allocation Data</h1>
          <p className="text-muted-foreground mb-8">
            Run an allocation simulation first to use the delay prediction feature.
          </p>
          <button 
            onClick={() => onBack ? onBack() : navigate('/')} 
            className="flex items-center gap-2 px-4 py-2 border-2 border-border bg-foreground text-background font-mono text-xs uppercase tracking-wider hover:opacity-90 transition-opacity"
          >
            <ArrowLeft className="w-4 h-4" />
            Dashboard
          </button>
        </div>
      </div>
    );
  }

  const currentBudget = originalData.budget * (budgetPercent / 100);

  return (
    <div className="w-full min-h-[calc(100vh-120px)] bg-background py-6 sm:py-8">
      <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">
        {/* Header & Actions Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/80 pb-4">
          <div>

            <h1 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight text-foreground">
              Delay Prediction <em className="text-[#FBBC05] italic font-serif">Engine</em>
            </h1>
            <p className="text-sm font-sans text-muted-foreground mt-0.5">
              Simulate scope, deadline, and headcount adjustments with 10,000 Monte Carlo schedule iterations.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={resetAll}
              className="flex items-center gap-1.5 px-3.5 py-2 border border-border/80 bg-card text-xs sm:text-sm font-sans font-medium hover:bg-muted/70 transition-all rounded-lg cursor-pointer shadow-[2px_2px_0px_0px_rgba(32,33,36,0.06)]"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Scenario</span>
            </button>
            <motion.div
              key={prediction?.risk_level}
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className={`px-3.5 py-2 rounded-lg ${getRiskBg(prediction?.risk_level || 'low')} text-white font-sans text-xs font-semibold uppercase tracking-wider shadow-[2px_2px_0px_0px_rgba(32,33,36,0.1)]`}
            >
              {prediction?.risk_level || 'low'} risk
            </motion.div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 md:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-4 mb-4 sm:mb-6">
          {[
            {
              label: "Predicted Delay",
              value: prediction?.delay_days || 0,
              suffix: " days",
              icon: Clock,
              color: prediction?.delay_days && prediction.delay_days > 7 ? "text-destructive" : prediction?.delay_days && prediction.delay_days > 2 ? "text-yellow-500" : "text-success",
              bgColor: "bg-muted",
              highlight: true,
            },
            {
              label: "Active Team",
              value: activeEmployees.length,
              icon: Users,
              color: "text-foreground",
              bgColor: "bg-muted",
            },
            {
              label: "Budget",
              value: Math.round(currentBudget),
              prefix: "$",
              icon: DollarSign,
              color: budgetPercent < 100 ? "text-destructive" : budgetPercent > 100 ? "text-success" : "text-foreground",
              bgColor: budgetPercent !== 100 ? "bg-accent/10" : "bg-muted",
              highlight: budgetPercent !== 100,
            },
            {
              label: "Deadline",
              value: deadlineWeeks,
              suffix: " wks",
              icon: Calendar,
              color: "text-foreground",
              bgColor: "bg-muted",
            },
            {
              label: "Delay Probability",
              value: Math.round((prediction?.delay_probability || 0) * 100),
              suffix: "%",
              icon: TrendingUp,
              color: "text-accent",
              bgColor: "bg-accent/10",
            },
            {
              label: "Burnout Risk",
              value: prediction?.burnout_employees.length || 0,
              icon: Flame,
              color: prediction?.burnout_employees.length ? "text-destructive" : "text-success",
              bgColor: prediction?.burnout_employees.length ? "bg-destructive/10" : "bg-success/10",
              highlight: (prediction?.burnout_employees.length || 0) > 0,
            },
          ].map((stat, idx) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * idx }}
              className="p-3 sm:p-4 border border-border/80 rounded-xl bg-card shadow-[2px_2px_0px_0px_rgba(32,33,36,0.06)]"
            >
              <div className="flex items-center gap-1 sm:gap-2 mb-1 sm:mb-2">
                <stat.icon className={`w-3 h-3 sm:w-4 sm:h-4 ${stat.color}`} />
                <span className="text-[9px] sm:text-[10px] font-sans font-semibold uppercase tracking-wider text-muted-foreground truncate">
                  {stat.label}
                </span>
              </div>
              <div className={`text-xl sm:text-3xl font-bold font-serif ${stat.color}`}>
                <CountUpNumber 
                  end={stat.value} 
                  prefix={stat.prefix} 
                  suffix={stat.suffix} 
                />
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Left Column - Controls */}
          <div className="space-y-6">
            {/* Budget Slider */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="p-4 sm:p-6 border border-border/80 rounded-xl bg-card shadow-[3px_3px_0px_0px_rgba(32,33,36,0.08)]"
            >
              <h3 className="text-xs sm:text-sm font-sans font-bold uppercase tracking-wider text-muted-foreground mb-3 sm:mb-4 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-[#FBBC05]" />
                Budget Adjustment
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between text-sm font-mono">
                  <span>Current: {budgetPercent}%</span>
                  <span className={budgetPercent < 100 ? 'text-destructive font-bold' : budgetPercent > 100 ? 'text-success font-bold' : ''}>
                    ${Math.round(currentBudget).toLocaleString()}
                  </span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="150"
                  value={budgetPercent}
                  onChange={(e) => setBudgetPercent(Number(e.target.value))}
                  className="w-full h-2 bg-muted rounded-full appearance-none cursor-pointer accent-foreground"
                />
                <div className="flex justify-between text-xs text-muted-foreground font-mono">
                  <span>-50%</span>
                  <span>Original</span>
                  <span>+50%</span>
                </div>
              </div>
            </motion.div>

            {/* Deadline Slider */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="p-4 sm:p-6 border border-border/80 rounded-xl bg-card shadow-[3px_3px_0px_0px_rgba(32,33,36,0.08)]"
            >
              <h3 className="text-xs sm:text-sm font-sans font-bold uppercase tracking-wider text-muted-foreground mb-3 sm:mb-4 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#4285F4]" />
                Deadline Adjustment
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between text-sm font-mono">
                  <span>{deadlineWeeks} weeks</span>
                  <span className={deadlineWeeks < originalData.deadline_weeks ? 'text-destructive font-bold' : deadlineWeeks > originalData.deadline_weeks ? 'text-success font-bold' : ''}>
                    {deadlineWeeks < originalData.deadline_weeks ? `${originalData.deadline_weeks - deadlineWeeks}w shorter` : 
                     deadlineWeeks > originalData.deadline_weeks ? `${deadlineWeeks - originalData.deadline_weeks}w longer` : 'Original'}
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max={Math.max(12, originalData.deadline_weeks + 4)}
                  value={deadlineWeeks}
                  onChange={(e) => setDeadlineWeeks(Number(e.target.value))}
                  className="w-full h-2 bg-muted rounded-full appearance-none cursor-pointer accent-foreground"
                />
                <div className="flex justify-between text-xs text-muted-foreground font-mono">
                  <span>1 week</span>
                  <span>{Math.max(12, originalData.deadline_weeks + 4)} weeks</span>
                </div>
              </div>
            </motion.div>

            {/* Risk Factors */}
            {prediction && prediction.factors.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="p-4 sm:p-6 border border-border/80 rounded-xl bg-card shadow-[3px_3px_0px_0px_rgba(32,33,36,0.08)]"
              >
                <h3 className="text-xs sm:text-sm font-sans font-bold uppercase tracking-wider text-muted-foreground mb-3 sm:mb-4 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-[#EA4335]" />
                  Risk Factors
                </h3>
                <div className="space-y-3">
                  {prediction.factors.map((factor, idx) => (
                    <div key={idx} className="flex items-start justify-between gap-2 py-2 border-b border-border last:border-0">
                      <span className="text-sm font-sans">{factor.factor}</span>
                      <span className={`font-mono text-sm whitespace-nowrap font-semibold ${factor.impact_days > 0 ? 'text-destructive' : 'text-success'}`}>
                        {factor.impact_days > 0 ? '+' : ''}{factor.impact_days}d
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* Middle Column - Team Management */}
          <div className="space-y-6">
            {/* Active Team */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="p-4 sm:p-6 border border-border/80 bg-card text-foreground rounded-xl shadow-[3px_3px_0px_0px_rgba(32,33,36,0.08)]"
            >
              <h3 className="text-xs sm:text-sm font-sans font-bold uppercase tracking-wider mb-2 text-foreground flex items-center gap-2">
                <Users className="w-4 h-4 text-[#7E57C2]" />
                Active Team ({activeEmployees.length})
              </h3>
              <p className="text-xs text-muted-foreground mb-3 sm:mb-4">Click × to simulate removing an employee</p>
              <div className="space-y-2 max-h-[250px] sm:max-h-[400px] overflow-y-auto">
                <AnimatePresence>
                  {activeEmployees.map((emp) => (
                    <motion.div
                      key={emp.id}
                      layout
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="flex items-center justify-between p-3 bg-muted/40 hover:bg-muted transition-colors group rounded-xl border border-border"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[#E8F0FE] text-[#1a73e8] flex items-center justify-center font-mono font-bold text-xs">
                          {emp.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <p className="font-semibold text-sm font-sans">{emp.name}</p>
                          <p className="text-xs text-muted-foreground font-sans">{emp.role}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-mono font-semibold text-muted-foreground">${emp.hourly_rate}/hr</span>
                        <button
                          onClick={() => removeEmployee(emp)}
                          className="p-1 opacity-0 group-hover:opacity-100 hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-all rounded"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {activeEmployees.length === 0 && (
                  <div className="text-center py-8 opacity-50">
                    <Users className="w-8 h-8 mx-auto mb-2" />
                    <p className="text-sm">No active employees</p>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Removed Employees */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="p-4 sm:p-6 border-2 border-destructive/50 bg-destructive/5 rounded-lg"
            >
              <h3 className="text-xs sm:text-sm font-mono uppercase tracking-widest text-destructive mb-3 sm:mb-4 flex items-center gap-2">
                <X className="w-4 h-4" />
                Removed ({removedEmployees.length})
              </h3>
              <p className="text-xs text-muted-foreground mb-4">Click + to restore an employee</p>
              <div className="space-y-2 max-h-[200px] overflow-y-auto">
                <AnimatePresence>
                  {removedEmployees.map((emp) => (
                    <motion.div
                      key={emp.id}
                      layout
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="flex items-center justify-between p-3 bg-muted/50 hover:bg-muted transition-colors group rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-muted-foreground/20 text-muted-foreground flex items-center justify-center font-mono font-bold text-xs">
                          {emp.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <p className="font-semibold text-sm text-muted-foreground line-through">{emp.name}</p>
                          <p className="text-xs text-muted-foreground">{emp.role}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => restoreEmployee(emp)}
                        className="p-1 opacity-0 group-hover:opacity-100 hover:bg-success/20 transition-all"
                      >
                        <Plus className="w-4 h-4 text-success" />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {removedEmployees.length === 0 && (
                  <div className="text-center py-4 text-muted-foreground opacity-50">
                    <p className="text-sm">No employees removed</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Right Column - Results */}
          <div className="space-y-6">
            {/* Main Prediction */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="p-4 sm:p-6 border border-border/80 rounded-xl bg-card shadow-[4px_4px_0px_0px_rgba(32,33,36,0.08)]"
            >
              <h3 className="text-xs sm:text-sm font-sans font-bold uppercase tracking-wider text-muted-foreground mb-3 sm:mb-4">
                Prediction Summary
              </h3>
              <div className="text-center py-4 sm:py-6">
                <motion.div 
                  key={prediction?.delay_days}
                  initial={{ scale: 0.5 }}
                  animate={{ scale: 1 }}
                  className={`text-5xl sm:text-7xl font-bold font-serif ${getRiskColor(prediction?.risk_level || 'low')}`}
                >
                  {prediction?.delay_days || 0}
                </motion.div>
                <div className="text-xs text-muted-foreground mt-2 font-sans font-semibold uppercase tracking-wider">
                  Days Delayed
                </div>
                <motion.div 
                  key={prediction?.risk_level}
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  className={`mt-4 inline-block px-4 py-1.5 rounded-full ${getRiskBg(prediction?.risk_level || 'low')} text-white text-xs font-sans font-semibold uppercase tracking-wider shadow-[2px_2px_0px_rgba(32,33,36,0.1)]`}
                >
                  {prediction?.risk_level || 'low'} Risk
                </motion.div>
              </div>
              <div className="mt-4 pt-4 border-t border-border/80">
                <div className="flex justify-between text-xs font-sans">
                  <span className="text-muted-foreground">Confidence</span>
                  <span className="font-mono font-semibold">{Math.round((prediction?.confidence || 0) * 100)}%</span>
                </div>
                <div className="h-2 bg-muted mt-2 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(prediction?.confidence || 0) * 100}%` }}
                    className="h-full bg-foreground rounded-full"
                  />
                </div>
              </div>
            </motion.div>

            {/* Recommendations */}
            {prediction && prediction.recommendations.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9 }}
                className="p-4 sm:p-6 border border-border/80 rounded-xl bg-card shadow-[3px_3px_0px_0px_rgba(32,33,36,0.08)]"
              >
                <h3 className="text-xs sm:text-sm font-sans font-bold uppercase tracking-wider text-muted-foreground mb-3 sm:mb-4 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-[#FBBC05]" />
                  AI Recommendations
                </h3>
                <div className="space-y-2">
                  {prediction.recommendations.map((rec, idx) => (
                    <div key={idx} className="flex items-start gap-2 p-3 bg-muted/40 rounded-lg border border-border">
                      <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                        rec.priority === 'critical' ? 'bg-[#EA4335]' :
                        rec.priority === 'high' ? 'bg-[#FBBC05]' :
                        rec.priority === 'medium' ? 'bg-[#4285F4]' : 'bg-[#34A853]'
                      }`} />
                      <div className="flex-1">
                        <span className="text-sm font-sans">{rec.recommendation}</span>
                        {rec.expected_impact_days !== 0 && (
                          <span className={`text-xs ml-2 font-mono font-semibold ${rec.expected_impact_days < 0 ? 'text-[#137333]' : 'text-muted-foreground'}`}>
                            ({rec.expected_impact_days > 0 ? '+' : ''}{rec.expected_impact_days}d)
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Burnout Warning */}
            {prediction && prediction.burnout_employees.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="p-4 border-2 border-destructive bg-destructive/10 flex items-start gap-4 rounded-lg"
              >
                <Flame className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                <div>
                  <span className="text-xs font-mono uppercase tracking-widest text-destructive">Burnout Warning</span>
                  <p className="text-sm mt-1">
                    {prediction.burnout_employees.join(', ')} at risk of burnout.
                  </p>
                </div>
              </motion.div>
            )}

            {/* Enhanced Cost Impact */}
            {prediction && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.1 }}
                className="p-4 border-2 border-border bg-muted/50 rounded-lg"
              >
                <div className="flex items-center gap-2 mb-3">
                  <Shield className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                  <span className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Financial Impact Analysis</span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Additional Labor:</span>
                    <span className="ml-2 font-mono text-destructive">
                      +${prediction.cost_impact.additional_labor_cost.toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Overtime:</span>
                    <span className="ml-2 font-mono text-destructive">
                      +${prediction.cost_impact.overtime_cost.toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Opportunity Cost:</span>
                    <span className="ml-2 font-mono text-warning">
                      ~${prediction.cost_impact.opportunity_cost.toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground font-semibold">Total Impact:</span>
                    <span className={`ml-2 font-mono font-bold ${prediction.cost_impact.total_impact > 0 ? 'text-destructive' : 'text-success'}`}>
                      ${prediction.cost_impact.total_impact.toLocaleString()}
                    </span>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Data Quality Indicator */}
            {prediction && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2 }}
                className="p-4 border border-border/50 bg-background/50 flex items-center justify-between rounded-lg"
              >
                <div className="flex items-center gap-2">
                  <Brain className="w-4 h-4 text-accent" />
                  <span className="text-xs font-mono uppercase tracking-widest text-muted-foreground">AI Confidence</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-24 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-accent rounded-full transition-all"
                      style={{ width: `${prediction.confidence * 100}%` }}
                    />
                  </div>
                  <span className="text-xs font-mono">{Math.round(prediction.confidence * 100)}%</span>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DelayPrediction;
