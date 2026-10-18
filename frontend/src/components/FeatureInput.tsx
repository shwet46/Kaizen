import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, Check, Square } from "lucide-react";
import { useVoiceDictation } from "@/hooks/useVoiceDictation";
import {
  LiaPaperPlaneSolid as Send,
  LiaSpinnerSolid as Loader2,
  LiaTimesSolid as X,
  LiaPlusSolid as Plus,
  LiaMagicSolid as Sparkles,
  LiaDollarSignSolid as DollarSign,
  LiaExclamationTriangleSolid as AlertTriangle,
  LiaExclamationCircleSolid as AlertCircle,
  LiaInfoCircleSolid as Info
} from "react-icons/lia";

type Priority = "low" | "medium" | "high";

interface FeatureInputProps {
  onSubmit: (feature: string, details: string, budget: number | null, techStack: string[], deadlineWeeks: number, autoGenerateTech: boolean, priority: Priority) => void;
  isProcessing: boolean;
}

// Comprehensive list of technologies
const TECH_OPTIONS = [
  // Frontend
  "React", "Vue", "Angular", "Svelte", "Next.js", "Nuxt.js", "Remix", "Astro",
  "TypeScript", "JavaScript", "HTML5", "CSS3", "Tailwind CSS", "SASS/SCSS",
  "Bootstrap", "Material UI", "Chakra UI", "Styled Components", "Framer Motion",
  "Redux", "Zustand", "MobX", "Recoil", "React Query", "SWR",
  
  // Backend
  "Node.js", "Express.js", "Fastify", "NestJS", "Python", "Django", "Flask", "FastAPI",
  "Go", "Gin", "Rust", "Actix", "Java", "Spring Boot", "Kotlin", "Scala",
  "Ruby", "Ruby on Rails", "PHP", "Laravel", "C#", ".NET", "Elixir", "Phoenix",
  
  // Databases
  "PostgreSQL", "MySQL", "MariaDB", "SQLite", "MongoDB", "Redis", "Cassandra",
  "DynamoDB", "Firebase", "Supabase", "PlanetScale", "CockroachDB", "Neo4j",
  "Elasticsearch", "InfluxDB", "TimescaleDB",
  
  // Cloud & DevOps
  "AWS", "Azure", "Google Cloud", "Vercel", "Netlify", "Heroku", "DigitalOcean",
  "Docker", "Kubernetes", "Terraform", "Ansible", "Jenkins", "GitHub Actions",
  "GitLab CI", "CircleCI", "ArgoCD", "Prometheus", "Grafana", "DataDog",
  
  // APIs & Communication
  "REST API", "GraphQL", "gRPC", "WebSockets", "Socket.io", "Apache Kafka",
  "RabbitMQ", "Redis Pub/Sub", "AWS SQS", "tRPC",
  
  // Mobile
  "React Native", "Flutter", "Swift", "SwiftUI", "Kotlin Android", "Ionic",
  "Capacitor", "Expo", "iOS", "Android",
  
  // AI/ML
  "Machine Learning", "TensorFlow", "PyTorch", "Scikit-learn", "Keras",
  "OpenAI API", "LangChain", "Hugging Face", "Computer Vision", "NLP",
  "Deep Learning", "MLOps", "Data Science",
  
  // Security
  "Security", "OAuth 2.0", "JWT", "SAML", "Penetration Testing", "OWASP",
  "SSL/TLS", "Encryption", "IAM", "Vault",
  
  // Testing
  "Testing", "Jest", "Vitest", "Cypress", "Playwright", "Selenium",
  "React Testing Library", "Mocha", "Pytest", "JUnit", "Load Testing",
  
  // Other
  "CI/CD", "DevOps", "Microservices", "Serverless", "Edge Computing",
  "WebAssembly", "Blockchain", "Web3", "Solidity", "IPFS",
  "Real-time", "Caching", "CDN", "SEO", "Analytics", "Monitoring",
  "Logging", "Error Tracking", "Feature Flags", "A/B Testing"
];

const FeatureInput = ({ onSubmit, isProcessing }: FeatureInputProps) => {
  const [feature, setFeature] = useState("");
  const [details, setDetails] = useState("");
  const [budget, setBudget] = useState<number | null>(10000);
  const [hasBudget, setHasBudget] = useState(true);
  const [techStack, setTechStack] = useState<string[]>([]);
  const [deadlineWeeks, setDeadlineWeeks] = useState(4);
  const [showTechDropdown, setShowTechDropdown] = useState(false);
  const [techSearch, setTechSearch] = useState("");
  const [autoGenerateTech, setAutoGenerateTech] = useState(false);
  const [priority, setPriority] = useState<Priority>("medium");
  const [inputError, setInputError] = useState<string | null>(null);

  const {
    isRecording,
    recordingMode,
    activeField: isRecordingField,
    interimTranscript,
    isTranscribing,
    errorMessage: dictationError,
    toggle: toggleVoiceDictate,
    stop: stopVoiceDictate,
    cancel: cancelVoiceDictate,
    clearError: clearDictationError,
  } = useVoiceDictation({
    language: 'en-IN',
    onTranscriptUpdate: (fullText) => {
      if (isRecordingField === 'feature') {
        setFeature(fullText);
        setInputError(null);
      } else if (isRecordingField === 'details') {
        setDetails(fullText);
      }
    },
    onError: (err) => {
      setInputError(err);
    },
  });

  const handleToggleVoice = (field: 'feature' | 'details') => {
    setInputError(null);
    clearDictationError();
    const currentText = field === 'feature' ? feature : details;
    toggleVoiceDictate(field, currentText);
  };

  // Check if input looks like junk/gibberish
  const isJunkInput = (text: string): boolean => {
    const trimmed = text.trim().toLowerCase();
    
    // Too short (under 3 characters)
    if (trimmed.length < 3) return true;
    
    // Single word that's very short or looks like gibberish
    const words = trimmed.split(/\s+/);
    if (words.length === 1 && trimmed.length < 5) {
      // Check if it's just random letters (no vowels pattern or keyboard mash)
      const vowels = trimmed.match(/[aeiou]/gi)?.length || 0;
      const consonants = trimmed.length - vowels;
      if (vowels === 0 || consonants / Math.max(vowels, 1) > 5) return true;
    }
    
    // Common junk patterns
    const junkPatterns = [
      /^[a-z]{1,4}$/,  // Single short word like "xyz", "abc", "test"
      /^[a-z]+\d+$/,   // Letters followed by numbers like "test123"
      /^(\w)\1+$/,     // Repeated characters like "aaa", "xxx"
      /^(asdf|qwer|zxcv|test|hello|hi|hey|ok|okay|lol|idk|hmm)/i,  // Common junk
    ];
    
    for (const pattern of junkPatterns) {
      if (pattern.test(trimmed)) return true;
    }
    
    return false;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setInputError(null);
    
    if (!feature.trim()) return;
    if (isProcessing) return;
    
    // Check for junk input
    if (isJunkInput(feature)) {
      setInputError("Please enter a valid feature description (e.g., 'User authentication system' or 'Dashboard with real-time charts')");
      return;
    }
    
    onSubmit(feature, details, hasBudget ? budget : null, autoGenerateTech ? [] : techStack, deadlineWeeks, autoGenerateTech, priority);
  };

  const addTech = (tech: string) => {
    if (!techStack.includes(tech)) {
      setTechStack([...techStack, tech]);
    }
    setTechSearch("");
    setShowTechDropdown(false);
  };

  const removeTech = (tech: string) => {
    setTechStack(techStack.filter(t => t !== tech));
  };

  const filteredTech = TECH_OPTIONS.filter(
    tech => tech.toLowerCase().includes(techSearch.toLowerCase()) && !techStack.includes(tech)
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-4xl mx-auto rounded-none border-2 border-border bg-card p-6 sm:p-8 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.08)]"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Feature Name */}
        <div className="relative">
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-[10px] font-sans font-semibold uppercase tracking-widest text-muted-foreground">
              Feature / Sprint Name
            </label>
            <div className="flex items-center gap-1.5">
              {isRecordingField === 'feature' && (
                <button
                  type="button"
                  onClick={stopVoiceDictate}
                  className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-sans font-semibold bg-[#137333] text-white hover:bg-[#0f5c29] cursor-pointer transition-all shadow-xs"
                  title="Done & apply transcribed feature name"
                >
                  <Check className="w-3 h-3" />
                  <span>Done</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => handleToggleVoice('feature')}
                className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-sans font-semibold transition-all cursor-pointer ${
                  isRecordingField === 'feature'
                    ? 'bg-[#EA4335] text-white animate-pulse shadow-sm'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted border border-border/80'
                }`}
                title={isRecordingField === 'feature' ? 'Stop voice recording' : 'Dictate feature name with Speech-to-Text'}
              >
                {isRecordingField === 'feature' ? (
                  <>
                    <MicOff className="w-3 h-3" />
                    <span>Listening ({recordingMode === 'browser' ? 'Browser STT' : 'GCP STT'})</span>
                  </>
                ) : (
                  <>
                    <Mic className="w-3 h-3 text-[#1A73E8]" />
                    <span>Voice Dictate</span>
                  </>
                )}
              </button>
            </div>
          </div>
          <div className="relative">
            <input
              type="text"
              value={feature}
              onChange={(e) => {
                setFeature(e.target.value);
                setInputError(null);
              }}
              placeholder={
                isRecordingField === 'feature'
                  ? interimTranscript
                    ? `Heard: "${interimTranscript}"...`
                    : 'Listening... Speak your feature name'
                  : 'e.g., Implement user authentication system'
              }
              className={`w-full pl-3.5 pr-20 py-3 rounded-xl bg-background border text-foreground placeholder:text-muted-foreground font-sans text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-[#4285F4]/30 focus:border-[#4285F4] transition-all shadow-sm ${
                inputError
                  ? 'border-destructive'
                  : isRecordingField === 'feature'
                  ? 'border-[#EA4335] ring-2 ring-[#EA4335]/20 bg-[#FCE8E6]/20'
                  : 'border-border/80'
              }`}
              disabled={isProcessing}
            />

            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
              {isRecordingField === 'feature' && (
                <div className="flex items-center gap-0.5 px-1 py-0.5 mr-1">
                  <motion.div animate={{ scaleY: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 0.5 }} className="w-0.5 h-3.5 bg-[#EA4335] rounded-full" />
                  <motion.div animate={{ scaleY: [0.7, 1, 0.7] }} transition={{ repeat: Infinity, duration: 0.5, delay: 0.15 }} className="w-0.5 h-3.5 bg-[#EA4335] rounded-full" />
                  <motion.div animate={{ scaleY: [0.4, 0.9, 0.4] }} transition={{ repeat: Infinity, duration: 0.5, delay: 0.3 }} className="w-0.5 h-3.5 bg-[#EA4335] rounded-full" />
                </div>
              )}
              <button
                type="button"
                onClick={() => handleToggleVoice('feature')}
                disabled={isProcessing}
                className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                  isRecordingField === 'feature'
                    ? 'bg-[#EA4335] text-white'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
                title={isRecordingField === 'feature' ? 'Stop voice recording' : 'Dictate with Speech-to-Text'}
              >
                {isRecordingField === 'feature' ? <Square className="w-3.5 h-3.5 fill-current" /> : <Mic className="w-4 h-4 text-[#1A73E8]" />}
              </button>
            </div>
          </div>

          {/* Real-time Interim Speech Bubble Preview */}
          {isRecordingField === 'feature' && (
            <div className="mt-1.5 px-3 py-1.5 rounded-lg bg-[#E8F0FE] border border-[#4285F4]/30 text-xs font-sans text-[#1A73E8] flex items-center justify-between">
              <span className="flex items-center gap-1.5 truncate">
                <span className="w-2 h-2 rounded-full bg-[#EA4335] animate-pulse" />
                {interimTranscript ? (
                  <span className="truncate">Live: "{interimTranscript}"</span>
                ) : (
                  <span>Listening... Speak into microphone</span>
                )}
              </span>
              <button
                type="button"
                onClick={stopVoiceDictate}
                className="text-[11px] font-semibold text-[#137333] hover:underline cursor-pointer ml-2 shrink-0"
              >
                Done
              </button>
            </div>
          )}

          {/* Transcribing Indicator */}
          {isTranscribing && isRecordingField === 'feature' && (
            <div className="mt-1.5 px-3 py-1 rounded-lg bg-[#FEF7E0] border border-[#FBBC05]/40 text-xs font-sans text-[#B06000] flex items-center gap-2">
              <Loader2 className="w-3.5 h-3.5 rounded-full animate-spin text-[#FBBC05]" />
              <span>Transcribing via Google Cloud STT...</span>
            </div>
          )}

          {/* Error Message */}
          {inputError && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-2 p-2.5 rounded-lg bg-destructive/10 border border-destructive/40 text-destructive text-xs font-sans flex items-center justify-between gap-2"
            >
              <div className="flex items-center gap-2">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                <span>{inputError}</span>
              </div>
              <button
                type="button"
                onClick={() => setInputError(null)}
                className="hover:opacity-70 text-xs cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </motion.div>
          )}
        </div>

        {/* Budget and Deadline Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Budget Slider */}
          <div className="relative">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[10px] font-sans font-semibold uppercase tracking-widest text-muted-foreground">
                Budget Limit
              </label>
              <button
                type="button"
                onClick={() => setHasBudget(!hasBudget)}
                className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-sans font-semibold uppercase transition-all cursor-pointer ${
                  hasBudget 
                    ? 'bg-foreground text-background shadow-[1px_1px_0px_0px_rgba(32,33,36,0.12)]' 
                    : 'bg-muted text-muted-foreground border border-border hover:bg-muted/80'
                }`}
                disabled={isProcessing}
              >
                <DollarSign className="w-3 h-3" />
                <span>{hasBudget ? 'Enabled' : 'No Budget'}</span>
              </button>
            </div>
            <div className={`p-4 rounded-xl border border-border/80 bg-background/50 transition-opacity ${!hasBudget ? 'opacity-50' : ''}`}>
              {hasBudget ? (
                <>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xl sm:text-2xl font-serif font-bold text-foreground">${(budget || 10000).toLocaleString()}</span>
                    <span className="text-xs font-sans text-muted-foreground font-medium">USD</span>
                  </div>
                  <input
                    type="range"
                    min="1000"
                    max="100000"
                    step="1000"
                    value={budget || 10000}
                    onChange={(e) => setBudget(Number(e.target.value))}
                    className="w-full h-2 bg-muted rounded-full appearance-none cursor-pointer accent-[#4285F4]"
                    disabled={isProcessing}
                  />
                  <div className="flex justify-between text-xs font-mono text-muted-foreground mt-1.5">
                    <span>$1K</span>
                    <span>$100K</span>
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center h-[60px]">
                  <span className="text-muted-foreground font-sans text-sm">No budget constraint</span>
                </div>
              )}
            </div>
          </div>

          {/* Deadline Selector */}
          <div className="relative">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[10px] font-sans font-semibold uppercase tracking-widest text-muted-foreground">
                Deadline
              </label>
              <span className="px-2.5 py-0.5 text-[10px] font-sans font-semibold uppercase text-muted-foreground">
                Timeline
              </span>
            </div>
            <div className="p-4 rounded-xl border border-border/80 bg-background/50">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xl sm:text-2xl font-serif font-bold text-foreground">{deadlineWeeks}</span>
                <span className="text-xs font-sans text-muted-foreground font-medium">WEEKS</span>
              </div>
              <input
                type="range"
                min="1"
                max="16"
                step="1"
                value={deadlineWeeks}
                onChange={(e) => setDeadlineWeeks(Number(e.target.value))}
                className="w-full h-2 bg-muted rounded-full appearance-none cursor-pointer accent-[#4285F4]"
                disabled={isProcessing}
              />
              <div className="flex justify-between text-xs font-mono text-muted-foreground mt-1.5">
                <span>1 wk</span>
                <span>16 wks</span>
              </div>
            </div>
          </div>
        </div>

        {/* Priority Selector */}
        <div className="relative">
          <label className="block text-[10px] font-sans font-semibold uppercase tracking-widest text-muted-foreground mb-1.5">
            Priority Level
          </label>
          <div className="grid grid-cols-3 gap-3">
            {/* Low Priority */}
            <motion.button
              type="button"
              onClick={() => setPriority("low")}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className={`p-2.5 rounded-xl border transition-all cursor-pointer shadow-[2px_2px_0px_0px_rgba(32,33,36,0.06)] ${
                priority === "low"
                  ? "border-[#34A853] bg-[#E6F4EA] text-[#137333]"
                  : "border-border/80 bg-background text-muted-foreground hover:border-[#34A853]/50 hover:bg-[#E6F4EA]/30"
              }`}
              disabled={isProcessing}
            >
              <div className="flex items-center justify-center gap-2">
                <Info className={`w-3.5 h-3.5 ${priority === "low" ? "text-[#137333]" : ""}`} />
                <span className="text-xs font-sans font-semibold uppercase">Low</span>
              </div>
            </motion.button>

            {/* Medium Priority */}
            <motion.button
              type="button"
              onClick={() => setPriority("medium")}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className={`p-2.5 rounded-xl border transition-all cursor-pointer shadow-[2px_2px_0px_0px_rgba(32,33,36,0.06)] ${
                priority === "medium"
                  ? "border-[#FBBC05] bg-[#FEF7E0] text-[#B06000]"
                  : "border-border/80 bg-background text-muted-foreground hover:border-[#FBBC05]/50 hover:bg-[#FEF7E0]/30"
              }`}
              disabled={isProcessing}
            >
              <div className="flex items-center justify-center gap-2">
                <AlertCircle className={`w-3.5 h-3.5 ${priority === "medium" ? "text-[#B06000]" : ""}`} />
                <span className="text-xs font-sans font-semibold uppercase">Medium</span>
              </div>
            </motion.button>

            {/* High Priority */}
            <motion.button
              type="button"
              onClick={() => setPriority("high")}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className={`p-2.5 rounded-xl border transition-all cursor-pointer shadow-[2px_2px_0px_0px_rgba(32,33,36,0.06)] ${
                priority === "high"
                  ? "border-[#EA4335] bg-[#FCE8E6] text-[#EA4335]"
                  : "border-border/80 bg-background text-muted-foreground hover:border-[#EA4335]/50 hover:bg-[#FCE8E6]/30"
              }`}
              disabled={isProcessing}
            >
              <div className="flex items-center justify-center gap-2">
                <AlertTriangle className={`w-3.5 h-3.5 ${priority === "high" ? "text-[#EA4335]" : ""}`} />
                <span className="text-xs font-sans font-semibold uppercase">High</span>
              </div>
            </motion.button>
          </div>
        </div>

        {/* Tech Stack Selector */}
        <div className="relative">
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-[10px] font-sans font-semibold uppercase tracking-widest text-muted-foreground">
              Required Tech Stack
            </label>
            <button
              type="button"
              onClick={() => {
                setAutoGenerateTech(!autoGenerateTech);
                if (!autoGenerateTech) {
                  setTechStack([]);
                }
              }}
              className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-sans font-semibold uppercase transition-all cursor-pointer ${
                autoGenerateTech 
                  ? 'bg-[#E8F0FE] text-[#1a73e8] border border-[#4285F4]/40 shadow-sm' 
                  : 'bg-muted text-muted-foreground border border-border hover:bg-muted/80'
              }`}
              disabled={isProcessing}
            >
              <Sparkles className="w-3 h-3" />
              <span>{autoGenerateTech ? 'Auto-Generate' : 'Manual'}</span>
            </button>
          </div>
          
          {autoGenerateTech ? (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="p-4 rounded-xl border border-[#4285F4]/30 bg-[#E8F0FE]/50"
            >
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-4 h-4 text-[#4285F4] flex-shrink-0" />
                <p className="text-xs font-sans text-muted-foreground">
                  Kaizen AI will auto-determine the optimal technology stack based on feature requirements and engineer skill heuristics.
                </p>
              </div>
            </motion.div>
          ) : (
            <div className="p-4 rounded-xl border border-border/80 bg-background/50">
              {/* Selected Tech Tags */}
              <div className="flex flex-wrap gap-1.5 mb-2.5 min-h-[28px]">
                <AnimatePresence mode="popLayout">
                  {techStack.map((tech) => (
                    <motion.span
                      key={tech}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-foreground text-background text-xs font-sans font-medium"
                    >
                      <span>{tech}</span>
                      <button
                        type="button"
                        onClick={() => removeTech(tech)}
                        className="ml-0.5 hover:text-destructive transition-colors cursor-pointer"
                        disabled={isProcessing}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </motion.span>
                  ))}
                </AnimatePresence>
                {techStack.length === 0 && (
                  <span className="text-muted-foreground text-xs font-sans">No technologies selected yet</span>
                )}
              </div>
              
              {/* Tech Search Input */}
              <div className="relative">
                <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-border bg-background">
                  <Plus className="w-3.5 h-3.5 text-muted-foreground" />
                  <input
                    type="text"
                    value={techSearch}
                    onChange={(e) => {
                      setTechSearch(e.target.value);
                      setShowTechDropdown(true);
                    }}
                    onFocus={() => setShowTechDropdown(true)}
                    placeholder="Search and add technologies..."
                    className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground font-sans text-xs focus:outline-none"
                    disabled={isProcessing}
                  />
                </div>
                
                {/* Dropdown */}
                <AnimatePresence>
                {showTechDropdown && filteredTech.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute left-0 right-0 top-full mt-1.5 bg-card border border-border/80 rounded-xl shadow-xl max-h-48 overflow-y-auto z-50 p-1"
                  >
                    {filteredTech.slice(0, 6).map((tech) => (
                      <button
                        key={tech}
                        type="button"
                        onClick={() => addTech(tech)}
                        className="w-full px-3 py-2 rounded-lg text-left text-xs font-sans hover:bg-muted/80 transition-colors cursor-pointer"
                      >
                        {tech}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
              </div>
            </div>
          )}
        </div>

        {/* Additional Details */}
        <div className="relative">
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-[10px] font-sans font-semibold uppercase tracking-widest text-muted-foreground">
              Additional Requirements (Optional)
            </label>
            <div className="flex items-center gap-1.5">
              {isRecordingField === 'details' && (
                <button
                  type="button"
                  onClick={stopVoiceDictate}
                  className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-sans font-semibold bg-[#137333] text-white hover:bg-[#0f5c29] cursor-pointer transition-all shadow-xs"
                  title="Done & apply transcribed details"
                >
                  <Check className="w-3 h-3" />
                  <span>Done</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => handleToggleVoice('details')}
                className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-sans font-semibold transition-all cursor-pointer ${
                  isRecordingField === 'details'
                    ? 'bg-[#EA4335] text-white animate-pulse shadow-sm'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted border border-border/80'
                }`}
                title={isRecordingField === 'details' ? 'Stop voice recording' : 'Dictate additional requirements with Speech-to-Text'}
              >
                {isRecordingField === 'details' ? (
                  <>
                    <MicOff className="w-3 h-3" />
                    <span>Listening ({recordingMode === 'browser' ? 'Browser STT' : 'GCP STT'})</span>
                  </>
                ) : (
                  <>
                    <Mic className="w-3 h-3 text-[#1A73E8]" />
                    <span>Voice Dictate</span>
                  </>
                )}
              </button>
            </div>
          </div>
          <div className="relative">
            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder={
                isRecordingField === 'details'
                  ? interimTranscript
                    ? `Heard: "${interimTranscript}"...`
                    : 'Listening... Speak additional details, constraints, or tech requirements'
                  : 'Specify any additional requirements, constraints, or priorities...'
              }
              rows={2}
              className={`w-full pl-3.5 pr-12 py-2.5 rounded-xl bg-background border text-foreground placeholder:text-muted-foreground font-sans text-sm focus:outline-none focus:ring-2 focus:ring-[#4285F4]/30 focus:border-[#4285F4] transition-all resize-none shadow-sm ${
                isRecordingField === 'details'
                  ? 'border-[#EA4335] ring-2 ring-[#EA4335]/20 bg-[#FCE8E6]/20'
                  : 'border-border/80'
              }`}
              disabled={isProcessing}
            />
            <div className="absolute right-2.5 top-3 flex items-center gap-1">
              {isRecordingField === 'details' && (
                <div className="flex items-center gap-0.5 px-1 py-0.5 mr-1">
                  <motion.div animate={{ scaleY: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 0.5 }} className="w-0.5 h-3.5 bg-[#EA4335] rounded-full" />
                  <motion.div animate={{ scaleY: [0.7, 1, 0.7] }} transition={{ repeat: Infinity, duration: 0.5, delay: 0.15 }} className="w-0.5 h-3.5 bg-[#EA4335] rounded-full" />
                  <motion.div animate={{ scaleY: [0.4, 0.9, 0.4] }} transition={{ repeat: Infinity, duration: 0.5, delay: 0.3 }} className="w-0.5 h-3.5 bg-[#EA4335] rounded-full" />
                </div>
              )}
              <button
                type="button"
                onClick={() => handleToggleVoice('details')}
                disabled={isProcessing}
                className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                  isRecordingField === 'details'
                    ? 'bg-[#EA4335] text-white'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
                title={isRecordingField === 'details' ? 'Stop voice recording' : 'Dictate requirements with Speech-to-Text'}
              >
                {isRecordingField === 'details' ? <Square className="w-3.5 h-3.5 fill-current" /> : <Mic className="w-4 h-4 text-[#1A73E8]" />}
              </button>
            </div>
          </div>

          {/* Real-time Interim Speech Bubble Preview for Details */}
          {isRecordingField === 'details' && (
            <div className="mt-1.5 px-3 py-1.5 rounded-lg bg-[#E8F0FE] border border-[#4285F4]/30 text-xs font-sans text-[#1A73E8] flex items-center justify-between">
              <span className="flex items-center gap-1.5 truncate">
                <span className="w-2 h-2 rounded-full bg-[#EA4335] animate-pulse" />
                {interimTranscript ? (
                  <span className="truncate">Live: "{interimTranscript}"</span>
                ) : (
                  <span>Listening... Speak into microphone</span>
                )}
              </span>
              <button
                type="button"
                onClick={stopVoiceDictate}
                className="text-[11px] font-semibold text-[#137333] hover:underline cursor-pointer ml-2 shrink-0"
              >
                Done
              </button>
            </div>
          )}

          {/* Transcribing Indicator for Details */}
          {isTranscribing && isRecordingField === 'details' && (
            <div className="mt-1.5 px-3 py-1 rounded-lg bg-[#FEF7E0] border border-[#FBBC05]/40 text-xs font-sans text-[#B06000] flex items-center gap-2">
              <Loader2 className="w-3.5 h-3.5 rounded-full animate-spin text-[#FBBC05]" />
              <span>Transcribing via Google Cloud STT...</span>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <motion.button
            type="submit"
            disabled={!feature.trim() || isProcessing}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className="w-full py-3.5 rounded-xl bg-foreground text-background font-sans uppercase tracking-wider text-xs font-semibold flex items-center justify-center gap-2.5 disabled:opacity-50 disabled:cursor-not-allowed shadow-[2px_2px_0px_0px_rgba(32,33,36,0.12)] hover:bg-foreground/90 hover:-translate-y-0.5 transition-all cursor-pointer"
          >
            <AnimatePresence mode="wait">
              {isProcessing ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2"
                >
                  <Loader2 className="w-4 h-4 rounded-full animate-spin text-[#4285F4]" />
                  <span>AI Analyzing Specs...</span>
                </motion.div>
              ) : (
                <motion.div
                  key="submit"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Allocate Resources</span>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </form>
    </motion.div>
  );
};

export default FeatureInput;
