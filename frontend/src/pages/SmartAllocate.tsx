import { useState, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import FeatureInput from "@/components/FeatureInput";
import TimelineGraph from "@/components/TimelineGraph";
import AnalyticsDashboard from "@/components/AnalyticsDashboard";
import type { LLMAllocationResponse } from "@/lib/types";

interface EmployeeInfo {
  id: string;
  name: string;
  hourlyRate: number;
  role: string;
  techStack?: string[];
  workload?: number;
}

interface Allocation {
  task: { id: string; title: string; estimatedHours: number; requiredSkills: string[] };
  employee: EmployeeInfo;
  employees?: EmployeeInfo[]; // Support multiple employees
}

type Priority = "low" | "medium" | "high";

interface FeatureData {
  feature: string;
  details: string;
  budget: number | null;
  techStack: string[];
  deadlineWeeks: number;
  autoGenerateTech: boolean;
  priority: Priority;
}

// Allocation data for delay prediction
interface AllocationData {
  tasks: {
    id: string;
    title: string;
    description: string;
    required_skills: string[];
    estimated_hours: number;
    assigned_employee_ids: string[];
    status: string;
  }[];
  employees: {
    id: string;
    name: string;
    role: string;
    tech_stack: string[];
    hourly_rate: number;
    workload: number;
  }[];
  deadline_weeks: number;
  budget: number;
  total_hours: number;
}

interface SmartAllocateProps {
  onNavigateToDelay?: (data: AllocationData) => void;
  onBack?: () => void;
}

const SmartAllocate = ({ onNavigateToDelay }: SmartAllocateProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [allocations, setAllocations] = useState<Allocation[]>([]);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [featureData, setFeatureData] = useState<FeatureData | null>(null);
  const [llmResponse, setLlmResponse] = useState<LLMAllocationResponse | null>(null);
  
  const timelineRef = useRef<HTMLDivElement>(null);

  const handleSubmit = (feature: string, details: string, budget: number | null, techStack: string[], deadlineWeeks: number, autoGenerateTech: boolean, priority: Priority) => {
    console.log("Processing:", feature, details, budget, techStack, deadlineWeeks, autoGenerateTech, priority);
    setIsProcessing(true);
    setShowAnalytics(false);
    setAllocations([]);
    setFeatureData({ feature, details, budget, techStack, deadlineWeeks, autoGenerateTech, priority });
    setLlmResponse(null);
    
    // Smooth scroll to timeline section after a brief delay
    setTimeout(() => {
      timelineRef.current?.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start'
      });
    }, 100);
  };

  const handleAllocationComplete = useCallback((newAllocations: Allocation[], response?: LLMAllocationResponse) => {
    setAllocations(newAllocations);
    if (response) {
      setLlmResponse(response);
    }
    setIsProcessing(false);
    setTimeout(() => setShowAnalytics(true), 500);
  }, []);

  return (
    <div className="w-full min-h-[calc(100vh-120px)] bg-background py-6 sm:py-8">
      {/* Main Content */}
      <main className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">
        {/* Feature Input Section */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-4"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-border/80 pb-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight text-foreground">
                Smart Resource <em className="text-[#4285F4] italic font-serif">Allocator</em>
              </h1>
              <p className="text-sm font-sans text-muted-foreground mt-0.5">
                Decompose complex feature specs into Jira tickets and optimize developer assignments via skill match heuristics.
              </p>
            </div>
          </div>
          <FeatureInput onSubmit={handleSubmit} isProcessing={isProcessing} />
        </motion.section>

        {/* Timeline Graph Section */}
        <motion.section
          ref={timelineRef}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="scroll-mt-6"
        >
          <TimelineGraph 
            isProcessing={isProcessing} 
            onAllocationComplete={handleAllocationComplete}
            featureData={featureData}
            onNavigateToDelay={onNavigateToDelay}
          />
        </motion.section>

        {/* Analytics Section */}
        <AnalyticsDashboard 
          allocations={allocations} 
          isVisible={showAnalytics}
          llmResponse={llmResponse}
        />
      </main>
    </div>
  );
};

export default SmartAllocate;
