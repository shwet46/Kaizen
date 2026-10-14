import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const API = import.meta.env.VITE_API_URL || "https://kaizen-backend-8x01.onrender.com/api";
import { Button } from "@/components/ui/button";
import {
  LiaArrowLeftSolid as ArrowLeft,
  LiaUploadSolid as Upload,
  LiaFileAltSolid as FileText,
  LiaMagicSolid as Sparkles,
  LiaCheckCircleSolid as CheckCircle,
  LiaExclamationCircleSolid as AlertCircle,
  LiaUsersSolid as Users,
  LiaClockSolid as Clock,
  LiaTagSolid as Tag,
  LiaArrowRightSolid as ArrowRight,
  LiaSpinnerSolid as Loader2,
} from "react-icons/lia";

interface ExtractedItem {
  id: string;
  type: "feature" | "task";
  title: string;
  description: string;
  assignee?: string;
  priority: "low" | "medium" | "high";
  estimatedHours?: number;
  requiredSkills: string[];
  confidence: number;
}

interface AnalysisResult {
  items: ExtractedItem[];
  summary: string;
  participants: string[];
  meetingType: string;
}

interface JiraSyncResult {
  task_id: string;
  jira_key?: string;
  assignee: string;
  assigneeRole?: string;
  title: string;
  description?: string;
  priority?: "low" | "medium" | "high";
  estimatedHours?: number;
  requiredSkills?: string[];
  status?: string;
  error?: string;
}

interface MeetingTranscriptProps {
  onBack: () => void;
  onNavigateToSmartAllocate: (featureData: {
    feature: string;
    description: string;
    techStack: string[];
  }) => void;
}

export default function MeetingTranscript({
  onBack,
  onNavigateToSmartAllocate,
}: MeetingTranscriptProps) {
  const [transcript, setTranscript] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncResults, setSyncResults] = useState<JiraSyncResult[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Analyze transcript
  const handleAnalyze = async () => {
    if (!transcript.trim()) {
      setError("Please enter a meeting transcript or summary");
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setAnalysisResult(null);
    setSyncResults(null);

    try {
      const response = await fetch(`${API}/transcript/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to analyze transcript");
      }

      setAnalysisResult(data);
      // Auto-select all items
      setSelectedItems(new Set(data.items.map((item: ExtractedItem) => item.id)));
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Toggle item selection
  const toggleItem = (id: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedItems(newSelected);
  };

  // Handle feature - redirect to Smart Allocate
  const handleFeatureAction = (item: ExtractedItem) => {
    onNavigateToSmartAllocate({
      feature: item.title,
      description: item.description,
      techStack: item.requiredSkills,
    });
  };

  // Create Jira tickets for tasks
  const handleCreateJiraTickets = async () => {
    if (!analysisResult) return;

    const tasksToSync = analysisResult.items.filter(
      (item) => item.type === "task" && selectedItems.has(item.id)
    );

    if (tasksToSync.length === 0) {
      setError("No tasks selected for Jira sync");
      return;
    }

    setIsSyncing(true);
    setError(null);

    try {
      const response = await fetch(`${API}/transcript/create-jira-tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tasks: tasksToSync }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create Jira tickets");
      }

      setSyncResults(data.results);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsSyncing(false);
    }
  };

  const selectedTasks = analysisResult?.items.filter(
    (item) => item.type === "task" && selectedItems.has(item.id)
  );
  const selectedFeatures = analysisResult?.items.filter(
    (item) => item.type === "feature" && selectedItems.has(item.id)
  );

  return (
    <div className="w-full min-h-[calc(100vh-120px)] bg-background py-6 sm:py-8">
      <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/80 pb-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight text-foreground">
              Meeting Transcript <em className="text-[#EA4335] italic font-serif">Analyzer</em>
            </h1>
            <p className="text-sm font-sans text-muted-foreground mt-0.5">
              Convert raw standup recordings, transcript notes, and sprint retro audio into actionable Jira tickets.
            </p>
          </div>

          {analysisResult && (
            <div className="flex items-center gap-2 text-xs font-sans">
              <span className="px-3 py-1 bg-[#E8F0FE] text-[#1a73e8] rounded-full font-semibold border border-[#4285F4]/30 shadow-sm">
                {analysisResult.items.filter((i) => i.type === "feature").length} Features Identified
              </span>
              <span className="px-3 py-1 bg-[#E6F4EA] text-[#137333] rounded-full font-semibold border border-[#34A853]/30 shadow-sm">
                {analysisResult.items.filter((i) => i.type === "task").length} Tasks Extracted
              </span>
            </div>
          )}
        </div>

        {/* Input Section */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="rounded-2xl border border-border/80 bg-card p-6 sm:p-8 shadow-[4px_4px_0px_0px_rgba(32,33,36,0.08)]">
            <div className="flex items-center gap-2 mb-3">
              <Upload className="w-5 h-5 text-[#4285F4]" />
              <h2 className="font-serif font-bold text-lg text-foreground">Paste Meeting Transcript or Summary</h2>
            </div>
            <textarea
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              placeholder={`Paste your meeting transcript or summary here...

Example:
"In today's sprint planning, we discussed the new authentication feature. 
John will handle the backend API integration, estimated 16 hours.
Sarah will work on the React login components, about 12 hours.
We also need to set up CI/CD pipeline - David to handle this.
The payment gateway integration is a larger feature that needs full planning..."`}
              className="w-full h-48 p-4 bg-background rounded-xl border border-border/80 focus:border-[#4285F4] focus:ring-2 focus:ring-[#4285F4]/30 transition-all resize-none font-sans text-sm shadow-sm"
            />
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-4">
              <p className="text-xs font-sans text-muted-foreground">
                AI will extract actionable items, identify assignees, and categorize as features or tasks
              </p>
              <Button
                onClick={handleAnalyze}
                disabled={isAnalyzing || !transcript.trim()}
                className="gap-2 rounded-lg bg-foreground text-background font-sans text-xs font-semibold shadow-[2px_2px_0px_0px_rgba(32,33,36,0.12)] hover:bg-foreground/90 transition-all cursor-pointer hover:-translate-y-0.5"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-[#4285F4]" />
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Analyze Transcript</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Error Display */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 p-4 border-2 border-destructive bg-destructive/10 flex items-center gap-3"
            >
              <AlertCircle className="w-5 h-5 text-destructive" />
              <span className="text-sm">{error}</span>
              <button
                onClick={() => setError(null)}
                className="ml-auto text-destructive hover:underline text-sm"
              >
                Dismiss
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Analysis Results */}
        <AnimatePresence>
          {analysisResult && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Meeting Summary */}
              <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-[3px_3px_0px_0px_rgba(32,33,36,0.08)]">
                <h3 className="font-serif font-bold text-base text-foreground mb-3 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#4285F4]" />
                  <span>Meeting Summary</span>
                </h3>
                <p className="text-sm font-sans text-muted-foreground mb-4 leading-relaxed">
                  {analysisResult.summary}
                </p>
                <div className="flex flex-wrap gap-4 text-xs font-sans">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <span>Participants: {analysisResult.participants.join(", ") || "Not identified"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4 text-muted-foreground" />
                    <span>Type: {analysisResult.meetingType}</span>
                  </div>
                </div>
              </div>

              {/* Extracted Items */}
              <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-[4px_4px_0px_0px_rgba(32,33,36,0.08)]">
                <div className="flex items-center justify-between mb-6 border-b border-border/80 pb-3">
                  <h3 className="font-serif font-bold text-lg text-foreground flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#FBBC05]" />
                    <span>Extracted Action Items</span>
                  </h3>
                  <div className="flex items-center gap-2 font-sans text-xs">
                    <button
                      onClick={() => setSelectedItems(new Set(analysisResult.items.map((i) => i.id)))}
                      className="text-muted-foreground hover:text-foreground font-medium cursor-pointer"
                    >
                      Select All
                    </button>
                    <span className="text-border">|</span>
                    <button
                      onClick={() => setSelectedItems(new Set())}
                      className="text-muted-foreground hover:text-foreground font-medium cursor-pointer"
                    >
                      Deselect All
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  {analysisResult.items.map((item, idx) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className={`rounded-xl border p-4 transition-all cursor-pointer shadow-[2px_2px_0px_0px_rgba(32,33,36,0.06)] hover:shadow-[3px_3px_0px_0px_rgba(32,33,36,0.1)] hover:-translate-y-0.5 ${
                        selectedItems.has(item.id)
                          ? item.type === "feature"
                            ? "border-[#4285F4] bg-[#E8F0FE]/50"
                            : "border-[#34A853] bg-[#E6F4EA]/50"
                          : "border-border/80 bg-card hover:border-border/30"
                      }`}
                      onClick={() => toggleItem(item.id)}
                    >
                      <div className="flex items-start gap-4">
                        {/* Checkbox */}
                        <div
                          className={`w-5 h-5 rounded-md border flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${
                            selectedItems.has(item.id)
                              ? item.type === "feature"
                                ? "border-[#4285F4] bg-[#4285F4] text-white shadow-sm"
                                : "border-[#34A853] bg-[#34A853] text-white shadow-sm"
                              : "border-border/80 bg-background"
                          }`}
                        >
                          {selectedItems.has(item.id) && (
                            <CheckCircle className="w-3.5 h-3.5" />
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-sans font-semibold uppercase ${
                                item.type === "feature"
                                  ? "bg-[#E8F0FE] text-[#1a73e8] border border-[#4285F4]/30"
                                  : "bg-[#E6F4EA] text-[#137333] border border-[#34A853]/30"
                              }`}
                            >
                              {item.type}
                            </span>
                            <span
                              className={`px-2 py-0.5 text-[10px] font-mono uppercase ${
                                item.priority === "high"
                                  ? "bg-red-500/20 text-red-500"
                                  : item.priority === "medium"
                                  ? "bg-yellow-500/20 text-yellow-500"
                                  : "bg-gray-500/20 text-gray-500"
                              }`}
                            >
                              {item.priority}
                            </span>
                            <span className="text-[10px] text-muted-foreground">
                              {Math.round(item.confidence * 100)}% confidence
                            </span>
                          </div>

                          <h4 className="font-semibold mb-1">{item.title}</h4>
                          <p className="text-sm text-muted-foreground mb-3">
                            {item.description}
                          </p>

                          <div className="flex flex-wrap items-center gap-4 text-xs">
                            {item.assignee && (
                              <div className="flex items-center gap-1">
                                <Users className="w-3 h-3 text-muted-foreground" />
                                <span>{item.assignee}</span>
                              </div>
                            )}
                            {item.estimatedHours && (
                              <div className="flex items-center gap-1">
                                <Clock className="w-3 h-3 text-muted-foreground" />
                                <span>{item.estimatedHours}h estimated</span>
                              </div>
                            )}
                            {item.requiredSkills.length > 0 && (
                              <div className="flex items-center gap-1 flex-wrap">
                                <Tag className="w-3 h-3 text-muted-foreground" />
                                {item.requiredSkills.map((skill) => (
                                  <span
                                    key={skill}
                                    className="px-1.5 py-0.5 bg-muted text-muted-foreground text-[10px]"
                                  >
                                    {skill}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Action Button */}
                        {item.type === "feature" && selectedItems.has(item.id) && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleFeatureAction(item);
                            }}
                            className="gap-1 flex-shrink-0"
                          >
                            Plan Feature
                            <ArrowRight className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-[3px_3px_0px_0px_rgba(32,33,36,0.08)]">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="font-serif font-bold text-base text-foreground mb-1">Ready to Process</h3>
                    <p className="text-sm font-sans text-muted-foreground">
                      {selectedTasks?.length || 0} tasks selected for Jira •{" "}
                      {selectedFeatures?.length || 0} features for planning
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {selectedFeatures && selectedFeatures.length === 1 && (
                      <Button
                        variant="outline"
                        onClick={() => handleFeatureAction(selectedFeatures[0])}
                        className="gap-2 rounded-lg border border-border/80 font-sans text-xs font-semibold shadow-sm hover:-translate-y-0.5 transition-all"
                      >
                        <Sparkles className="w-4 h-4 text-[#FBBC05]" />
                        <span>Plan Feature in Smart Allocate</span>
                      </Button>
                    )}
                    {selectedTasks && selectedTasks.length > 0 && (
                      <Button
                        onClick={handleCreateJiraTickets}
                        disabled={isSyncing}
                        className="gap-2 rounded-lg bg-[#34A853] hover:bg-[#2d9249] text-white font-sans text-xs font-semibold shadow-[2px_2px_0px_0px_rgba(52,168,83,0.3)] hover:-translate-y-0.5 transition-all"
                      >
                        {isSyncing ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Creating Tickets...</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-4 h-4" />
                            <span>Create {selectedTasks.length} Jira Tickets</span>
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              {/* Sync Results - JIRA Tickets Created */}
              <AnimatePresence>
                {syncResults && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-2xl border border-border/80 bg-card p-6 shadow-[4px_4px_0px_0px_rgba(32,33,36,0.08)]"
                  >
                    <div className="flex items-center justify-between mb-4 border-b border-border/80 pb-3">
                      <h3 className="font-serif font-bold text-base text-foreground flex items-center gap-2">
                        <span className="text-lg">🎫</span>
                        <span>JIRA Tickets Created</span>
                      </h3>
                      <p className="text-xs font-sans text-muted-foreground">
                        {syncResults.filter(r => !r.error).length} tickets synced to Jira
                      </p>
                    </div>
                    <div className="space-y-4 max-h-[500px] overflow-y-auto">
                      {syncResults.map((result, idx) => (
                        <motion.div
                          key={result.task_id}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.1 }}
                          className={`rounded-lg border overflow-hidden ${
                            result.error
                              ? "bg-red-50 border-red-200"
                              : "bg-white border-gray-200 shadow-sm"
                          }`}
                        >
                          {/* Ticket Header */}
                          <div className="px-3 py-2 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                            <span className={`text-xs font-mono font-bold ${
                              result.error ? "text-red-600" : "text-blue-600"
                            }`}>
                              {result.jira_key || "FAILED"}
                            </span>
                            <div className="flex items-center gap-2">
                              {result.estimatedHours && (
                                <span className="text-[10px] px-2 py-0.5 bg-gray-200 rounded text-gray-600">
                                  ⏱ {result.estimatedHours}h
                                </span>
                              )}
                              {result.priority && (
                                <span
                                  className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                                    result.priority === "high"
                                      ? "bg-red-100 text-red-700"
                                      : result.priority === "medium"
                                        ? "bg-yellow-100 text-yellow-700"
                                        : "bg-green-100 text-green-700"
                                  }`}
                                >
                                  {result.priority}
                                </span>
                              )}
                            </div>
                          </div>
                          
                          {/* Ticket Content */}
                          <div className="p-3">
                            <p className="text-sm font-semibold text-gray-800 leading-snug mb-2">
                              {result.title}
                            </p>
                            
                            {/* Task Description / Work Breakdown */}
                            {result.description && (
                              <div className="mb-3 p-2 bg-blue-50 rounded-lg border border-blue-100">
                                <div className="text-[10px] font-bold text-blue-600 uppercase tracking-wider mb-1">
                                  📋 Work Description
                                </div>
                                <p className="text-xs text-gray-700 leading-relaxed">
                                  {result.description}
                                </p>
                              </div>
                            )}
                            
                            {/* Required Skills */}
                            {result.requiredSkills && result.requiredSkills.length > 0 && (
                              <div className="mb-3">
                                <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                                  🔧 Required Skills
                                </div>
                                <div className="flex flex-wrap gap-1">
                                  {result.requiredSkills.map((skill, i) => (
                                    <span
                                      key={i}
                                      className="text-[10px] px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded border border-indigo-100"
                                    >
                                      {skill}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            {/* Assignee */}
                            <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-[10px] font-bold text-white">
                                {result.assignee
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </div>
                              <div className="flex-1">
                                <span className="text-xs font-medium text-gray-700 block">
                                  {result.assignee}
                                </span>
                                {result.assigneeRole && (
                                  <span className="text-[10px] text-gray-500">
                                    {result.assigneeRole}
                                  </span>
                                )}
                              </div>
                              <span className={`text-[10px] px-2 py-0.5 rounded font-medium ${
                                result.error
                                  ? "bg-red-100 text-red-600"
                                  : "bg-blue-100 text-blue-600"
                              }`}>
                                {result.error ? "failed" : "todo"}
                              </span>
                            </div>
                            
                            {/* Error message */}
                            {result.error && (
                              <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded">
                                <p className="text-xs text-red-600">
                                  <AlertCircle className="w-3 h-3 inline mr-1" />
                                  {result.error}
                                </p>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Empty State */}
        {!analysisResult && !isAnalyzing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl border border-dashed border-border/80 bg-card/50 flex items-center justify-center">
              <FileText className="w-8 h-8 text-muted-foreground/50" />
            </div>
            <h3 className="text-lg font-serif font-bold mb-2 text-foreground">No Transcript Analyzed</h3>
            <p className="text-muted-foreground font-sans text-sm max-w-md mx-auto">
              Paste your meeting transcript or summary above and click "Analyze Transcript" 
              to extract tasks and features automatically.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
