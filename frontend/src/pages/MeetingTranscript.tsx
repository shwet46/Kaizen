import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, UploadCloud, FileAudio, Check, Square, RotateCcw } from "lucide-react";
import { useVoiceDictation } from "@/hooks/useVoiceDictation";
import { transcribeAudioBlob } from "@/lib/voice-service";

const API = import.meta.env.VITE_API_URL || (
  window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
    ? "http://localhost:8000/api"
    : "https://kaizen-backend-8x01.onrender.com/api"
);
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
  const [audioUploading, setAudioUploading] = useState(false);
  const [audioUploadSuccess, setAudioUploadSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    isRecording,
    recordingMode,
    interimTranscript,
    isTranscribing: isDictationTranscribing,
    errorMessage: dictationError,
    toggle: toggleDictation,
    stop: stopDictation,
    clearError: clearDictationError,
  } = useVoiceDictation({
    language: 'en-IN',
    onTranscriptUpdate: (fullText) => {
      setTranscript(fullText);
      setError(null);
    },
    onError: (err) => {
      setError(err);
    },
  });

  const handleAudioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAudioUploading(true);
    setError(null);
    setAudioUploadSuccess(null);

    try {
      const transcribedText = await transcribeAudioBlob(file, 'en-IN');
      if (transcribedText) {
        setTranscript((prev) => (prev ? `${prev.trim()}\n\n${transcribedText}` : transcribedText));
        setAudioUploadSuccess(`Transcribed "${file.name}" (${(file.size / 1024).toFixed(1)} KB) via Google Cloud STT!`);
        setTimeout(() => setAudioUploadSuccess(null), 4000);
      } else {
        setError('No speech was detected in the uploaded audio file.');
      }
    } catch (err: any) {
      console.error('Audio file transcription failed:', err);
      setError('Failed to transcribe audio file. Please check backend audio service.');
    } finally {
      setAudioUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleLoadSample = () => {
    const sample = `Sprint 24 Standup & Feature Planning Meeting:
Shweta (AWS Solutions Architect):
- Completed the architecture review for multi-tenant data isolation.
- Today working on the high-level design specification for the real-time telemetry pipeline. Estimated 16 hours. High priority.
- Blocker: Need Neo4j cluster access from DevOps.

Maitri (AWS Backend Developer):
- Finished the user authentication REST endpoints and JWT refresh tokens.
- Next task: Build Jira webhook synchronization handler and background workers. Estimated 14 hours. Medium priority.
- Will also write comprehensive pytest suites for database transaction rollbacks. Estimated 8 hours.

Ojasvi (AWS DevOps Engineer):
- Fixed the Kubernetes Helm chart deployment on staging environment.
- Provisioning the Neo4j Graph database cluster on AWS ECS today. Estimated 10 hours. High priority.
- Setting up GitHub Actions CI/CD matrix for automated linting and security vulnerability scanning. Estimated 12 hours.

Riya (AWS Cloud Engineer):
- Finished the AWS CloudWatch alarm thresholds for memory and latency spikes.
- Today implementing Terraform configuration for the SQS queue and dead-letter queue. Estimated 8 hours. Medium priority.
- Will run load testing benchmarks using Locust on the staging cluster. Estimated 6 hours.`;
    setTranscript(sample);
    setError(null);
  };

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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-border/80">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#4285F4]" />
                <h2 className="font-serif font-bold text-lg text-foreground">
                  Meeting Audio & Transcript Ingestion
                </h2>
              </div>

              {/* Action Toolbar: Live Voice Dictate, Upload Audio, Sample Standup */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Voice Dictate Button */}
                <button
                  type="button"
                  onClick={() => toggleDictation('transcript', transcript)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-sans font-semibold transition-all cursor-pointer shadow-xs ${
                    isRecording
                      ? 'bg-[#EA4335] text-white animate-pulse'
                      : 'border border-border/80 bg-background hover:bg-muted text-foreground'
                  }`}
                  title={isRecording ? 'Stop voice recording' : 'Dictate meeting notes live'}
                >
                  {isRecording ? (
                    <>
                      <MicOff className="w-3.5 h-3.5" />
                      <span>Recording Live ({recordingMode === 'browser' ? 'Browser STT' : 'GCP STT'})</span>
                    </>
                  ) : (
                    <>
                      <Mic className="w-3.5 h-3.5 text-[#1A73E8]" />
                      <span>Live Voice Dictate</span>
                    </>
                  )}
                </button>

                {isRecording && (
                  <button
                    type="button"
                    onClick={stopDictation}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-sans font-semibold bg-[#137333] text-white hover:bg-[#0f5c29] cursor-pointer transition-all shadow-xs"
                    title="Done speaking"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Done</span>
                  </button>
                )}

                {/* Upload Audio File */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleAudioUpload}
                  accept="audio/*,.webm,.wav,.mp3,.m4a,.ogg"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={audioUploading || isRecording}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-sans font-semibold border border-border/80 bg-background hover:bg-muted text-foreground transition-all cursor-pointer shadow-xs disabled:opacity-50"
                  title="Upload meeting recording (.wav, .mp3, .m4a, .webm)"
                >
                  {audioUploading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 rounded-full animate-spin text-[#4285F4]" />
                      <span>Transcribing Audio...</span>
                    </>
                  ) : (
                    <>
                      <UploadCloud className="w-3.5 h-3.5 text-[#34A853]" />
                      <span>Upload Audio File</span>
                    </>
                  )}
                </button>

                {/* Load Sample Standup */}
                <button
                  type="button"
                  onClick={handleLoadSample}
                  disabled={audioUploading || isRecording}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-sans font-semibold border border-border/80 bg-background hover:bg-muted text-muted-foreground hover:text-foreground transition-all cursor-pointer shadow-xs"
                  title="Load realistic sample standup meeting transcript"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#FBBC05]" />
                  <span>Load Standup Sample</span>
                </button>

                {/* Clear Button */}
                {transcript && (
                  <button
                    type="button"
                    onClick={() => {
                      setTranscript('');
                      setAnalysisResult(null);
                      setSyncResults(null);
                    }}
                    className="p-1.5 rounded-lg border border-border/80 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                    title="Clear transcript"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Audio Upload Success Alert */}
            {audioUploadSuccess && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-3 p-2.5 rounded-xl bg-[#E6F4EA] border border-[#34A853]/40 text-[#137333] text-xs font-sans flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 shrink-0" />
                  <span>{audioUploadSuccess}</span>
                </div>
                <button onClick={() => setAudioUploadSuccess(null)} className="text-xs hover:opacity-70">
                  Dismiss
                </button>
              </motion.div>
            )}

            {/* Live Dictation Waveform & Interim Preview */}
            {isRecording && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-3 px-4 py-2.5 rounded-xl bg-[#FCE8E6] border border-[#EA4335]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-2xs"
              >
                <div className="flex items-center gap-3">
                  <div className="flex gap-0.5 items-center">
                    <motion.div animate={{ scaleY: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 0.5 }} className="w-0.5 h-4 bg-[#EA4335] rounded-full" />
                    <motion.div animate={{ scaleY: [0.6, 1, 0.6] }} transition={{ repeat: Infinity, duration: 0.5, delay: 0.1 }} className="w-0.5 h-4 bg-[#EA4335] rounded-full" />
                    <motion.div animate={{ scaleY: [0.2, 0.9, 0.2] }} transition={{ repeat: Infinity, duration: 0.5, delay: 0.2 }} className="w-0.5 h-4 bg-[#EA4335] rounded-full" />
                    <motion.div animate={{ scaleY: [0.7, 1, 0.7] }} transition={{ repeat: Infinity, duration: 0.5, delay: 0.3 }} className="w-0.5 h-4 bg-[#EA4335] rounded-full" />
                  </div>
                  <span className="text-xs font-sans font-medium text-[#C5221F]">
                    {interimTranscript
                      ? `Heard live: "${interimTranscript}"`
                      : 'Listening to standup discussion... Speak clearly into your mic.'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={stopDictation}
                  className="px-3 py-1 rounded-md bg-[#137333] text-white text-xs font-sans font-medium hover:bg-[#0f5c29] cursor-pointer shrink-0"
                >
                  Done Speaking
                </button>
              </motion.div>
            )}

            {/* GCP Transcription Loader */}
            {isDictationTranscribing && (
              <div className="mb-3 p-2.5 rounded-xl bg-[#FEF7E0] border border-[#FBBC05]/40 text-[#B06000] text-xs font-sans flex items-center gap-2">
                <Loader2 className="w-4 h-4 rounded-full animate-spin text-[#FBBC05]" />
                <span>Processing speech audio via Google Cloud Speech-to-Text...</span>
              </div>
            )}

            <textarea
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              placeholder={`Paste your meeting transcript, click "Live Voice Dictate" to speak, or click "Upload Audio File"...

Example Standup:
"In today's standup, Shweta will complete the architecture review for multi-tenant isolation, estimated 16 hours.
Maitri will handle the Jira webhook synchronization endpoints, estimated 14 hours.
Ojasvi will provision the Neo4j cluster and update CI/CD pipelines, about 10 hours.
Riya is working on the SQS queue Terraform configuration and load testing benchmarks..."`}
              className="w-full h-52 p-4 bg-background rounded-xl border border-border/80 focus:border-[#4285F4] focus:ring-2 focus:ring-[#4285F4]/30 transition-all resize-y font-sans text-sm shadow-sm"
            />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-4">
              <p className="text-xs font-sans text-muted-foreground flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#4285F4]" />
                <span>
                  AI analyzes speech transcripts, extracts assignees & skills, and creates synchronized Jira tickets.
                </span>
              </p>
              <Button
                onClick={handleAnalyze}
                disabled={isAnalyzing || !transcript.trim()}
                className="gap-2 rounded-lg bg-foreground text-background font-sans text-xs font-semibold shadow-[2px_2px_0px_0px_rgba(32,33,36,0.12)] hover:bg-foreground/90 transition-all cursor-pointer hover:-translate-y-0.5"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 rounded-full animate-spin text-[#4285F4]" />
                    <span>Analyzing Transcript...</span>
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
                            <Loader2 className="w-4 h-4 rounded-full animate-spin" />
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
