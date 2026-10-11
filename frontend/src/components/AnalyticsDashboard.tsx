import { motion } from "framer-motion";
import {
  LiaArrowDownSolid as TrendingDown,
  LiaDollarSignSolid as DollarSign,
  LiaClockSolid as Clock,
  LiaUsersSolid as Users,
  LiaBoltSolid as Zap,
  LiaShieldAltSolid as Shield,
  LiaChartBarSolid as BarChart3
} from "react-icons/lia";
import { useEffect, useState } from "react";
import type { LLMAllocationResponse } from "@/lib/types";

interface Allocation {
  task: { title: string; estimatedHours: number };
  employee: { name: string; hourlyRate: number };
}

interface AnalyticsDashboardProps {
  allocations: Allocation[];
  isVisible: boolean;
  llmResponse?: LLMAllocationResponse | null;
}

const CountUpNumber = ({ end, duration = 2000, prefix = "", suffix = "" }: { 
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

const AnalyticsDashboard = ({ allocations, isVisible, llmResponse }: AnalyticsDashboardProps) => {
  // Use LLM response data if available, otherwise calculate from allocations
  const analytics = llmResponse?.business_analytics;
  
  const totalHours = allocations.reduce((sum, a) => sum + a.task.estimatedHours, 0);
  const totalCost = analytics?.total_estimated_cost || 
    allocations.reduce((sum, a) => sum + (a.task.estimatedHours * a.employee.hourlyRate), 0);
  
  // Use LLM analytics or calculate mock comparison
  const savings = analytics?.projected_savings || Math.round(totalCost * 0.35);
  const savingsPercentage = analytics?.savings_percentage || 26;
  const timeSaved = analytics?.time_efficiency_gain || Math.round(totalHours * 0.25);
  const manualCost = totalCost + savings;
  const riskAssessment = analytics?.risk_assessment || "Standard risk profile";
  const roiEstimate = analytics?.roi_estimate || 2.5;

  const stats = [
    {
      label: "Projected Cost",
      value: totalCost,
      prefix: "$",
      icon: DollarSign,
      color: "text-foreground",
      bgColor: "bg-muted",
    },
    {
      label: "Cost Savings",
      value: Math.round(savings),
      prefix: "$",
      suffix: "",
      icon: TrendingDown,
      color: "text-success",
      bgColor: "bg-success/10",
      highlight: true,
    },
    {
      label: "Hours Allocated",
      value: totalHours,
      suffix: "h",
      icon: Clock,
      color: "text-foreground",
      bgColor: "bg-muted",
    },
    {
      label: "Time Efficiency",
      value: Math.round(timeSaved),
      suffix: "%",
      icon: Zap,
      color: "text-accent",
      bgColor: "bg-accent/10",
      highlight: true,
    },
    {
      label: "Resources Assigned",
      value: allocations.length,
      icon: Users,
      color: "text-foreground",
      bgColor: "bg-muted",
    },
    {
      label: "ROI Estimate",
      value: roiEstimate,
      suffix: "x",
      icon: BarChart3,
      color: "text-foreground",
      bgColor: "bg-muted",
    },
  ];

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mt-8"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-serif font-bold tracking-tight text-foreground">Business Analytics</h2>
          <p className="text-sm font-sans text-muted-foreground mt-0.5">AI-optimized resource allocation results</p>
        </div>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: "spring" }}
          className="px-3.5 py-1 rounded-full bg-[#E6F4EA] text-[#137333] border border-[#34A853]/40 font-sans text-xs font-semibold uppercase tracking-wider shadow-sm"
        >
          {savingsPercentage}% Optimized
        </motion.div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {stats.map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * idx }}
            className="p-4 rounded-xl border border-border/80 bg-card shadow-[2px_2px_0px_0px_rgba(32,33,36,0.06)] hover:shadow-[3px_3px_0px_0px_rgba(32,33,36,0.1)] hover:-translate-y-0.5 transition-all"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 rounded-lg bg-muted/60">
                <stat.icon className={`w-3.5 h-3.5 ${stat.color}`} />
              </div>
              <span className="text-[10px] font-sans font-semibold uppercase tracking-widest text-muted-foreground">
                {stat.label}
              </span>
            </div>
            <div className={`text-2xl sm:text-3xl font-serif font-bold ${stat.color}`}>
              <CountUpNumber 
                end={stat.value} 
                prefix={stat.prefix} 
                suffix={stat.suffix} 
              />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Allocation Summary */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="mt-6 p-6 rounded-none border-2 border-border bg-card shadow-[2px_2px_0px_0px_rgba(0,0,0,0.08)]"
      >
        <h3 className="text-base font-serif font-bold text-foreground mb-4">
          Allocation Summary
        </h3>
        <div className="space-y-3">
          {allocations.map((allocation, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.9 + idx * 0.1 }}
              className="flex items-center justify-between py-2.5 border-b border-border last:border-0"
            >
              <div className="flex items-center gap-4">
                <span className="font-mono text-xs text-muted-foreground">{String(idx + 1).padStart(2, '0')}</span>
                <div>
                  <p className="font-serif font-bold text-base text-foreground">{allocation.task.title}</p>
                  <p className="text-xs font-sans text-muted-foreground">{allocation.employee.name}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-serif font-bold text-base text-foreground">${allocation.task.estimatedHours * allocation.employee.hourlyRate}</p>
                <p className="text-xs font-sans text-muted-foreground">{allocation.task.estimatedHours}h × ${allocation.employee.hourlyRate}/hr</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Comparison Bar */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="mt-6 p-6 rounded-none border-2 border-border bg-card shadow-[2px_2px_0px_0px_rgba(0,0,0,0.08)]"
      >
        <h3 className="text-[10px] font-sans font-semibold uppercase tracking-widest text-muted-foreground mb-4">
          AI vs Manual Allocation
        </h3>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm font-sans mb-1.5">
              <span className="font-medium text-foreground">AI-Optimized</span>
              <span className="font-serif font-bold text-foreground">${totalCost.toLocaleString()}</span>
            </div>
            <div className="h-2.5 rounded-full bg-muted/80 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ duration: 1, delay: 1.3 }}
                className="h-full rounded-full bg-success"
              />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-sm font-sans mb-1.5">
              <span className="text-muted-foreground">Manual Process</span>
              <span className="font-serif font-bold text-muted-foreground">${Math.round(manualCost).toLocaleString()}</span>
            </div>
            <div className="h-2.5 rounded-full bg-muted/80 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ duration: 1, delay: 1.4 }}
                className="h-full rounded-full bg-muted-foreground/30"
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Timeline Section */}
      {llmResponse?.timeline && llmResponse.timeline.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="mt-6 p-6 rounded-none border-2 border-border bg-card shadow-[2px_2px_0px_0px_rgba(0,0,0,0.08)]"
        >
          <h3 className="text-[10px] font-sans font-semibold uppercase tracking-widest text-muted-foreground mb-4">
            Project Timeline
          </h3>
          <div className="flex gap-4 overflow-x-auto pb-2 [scrollbar-width:thin]">
            {llmResponse.timeline
              .filter(week => week.milestones && week.milestones.length > 0)
              .map((week, idx) => (
              <motion.div
                key={week.week}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.6 + idx * 0.1 }}
                className="flex-shrink-0 w-52 p-4 rounded-xl border border-border/80 bg-background/50 shadow-[2px_2px_0px_0px_rgba(32,33,36,0.06)]"
              >
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-[#E8F0FE] text-[#1a73e8] border border-[#4285F4]/30 flex items-center justify-center font-serif font-bold text-sm">
                    W{week.week}
                  </div>
                  <span className="text-xs font-sans font-semibold text-muted-foreground uppercase">Week {week.week}</span>
                </div>
                <div className="space-y-2">
                  {week.milestones.map((milestone, mIdx) => (
                    <div key={mIdx} className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-success rounded-full mt-1.5 flex-shrink-0" />
                      <span className="text-xs font-sans text-foreground/90">{milestone}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Risk Assessment */}
      {riskAssessment && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.8 }}
          className="mt-6 p-4 rounded-xl border border-border/80 bg-card shadow-[2px_2px_0px_0px_rgba(32,33,36,0.06)] flex items-center gap-3.5"
        >
          <div className="p-2 rounded-lg bg-[#FEF7E0] text-[#B06000] border border-[#FBBC05]/30">
            <Shield className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] font-sans font-semibold uppercase tracking-widest text-muted-foreground">Risk Assessment: </span>
            <span className="text-sm font-sans text-foreground font-medium">{riskAssessment}</span>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default AnalyticsDashboard;
