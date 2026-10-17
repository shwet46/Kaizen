import { useEffect, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import KnowledgeGraph3D from "@/components/KnowledgeGraph3D"
import { Dashboard } from "@/components/Dashboard"
import { DashboardNavbar } from "@/components/DashboardNavbar"
import { RoleManagement } from "@/components/RoleManagement"
import SmartAllocate from "@/pages/SmartAllocate"
import DelayPrediction from "@/pages/DelayPrediction"
import FinanceROI from "@/pages/FinanceROI"
import HRPerformance from "@/pages/HRPerformance"
import HRRetention from "@/pages/HRRetention"
import AllocationSimulation from "@/pages/AllocationSimulation"
import MeetingTranscript from "@/pages/MeetingTranscript"
import LandingPage from "@/pages/LandingPage"
import PitchPage from '@/pages/PitchPage';
import { VoiceChatbot } from "@/components/VoiceChatbot/VoiceChatbot"
import { motion } from "framer-motion"
import {
  LiaUsersSolid as Users,
  LiaBrainSolid as Brain,
  LiaHeartSolid as Heart,
  LiaChartLineSolid as Activity,
  LiaCheckCircleSolid as CheckCircle
} from "react-icons/lia"
import { getEnv } from "@/lib/config"

const getApiUrl = () => {
  const envUrl = getEnv('VITE_API_URL');
  if (envUrl) return envUrl.replace(/\/$/, '')
  if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
    return 'http://localhost:8000/api'
  }
  return 'https://kaizen-backend-8x01.onrender.com/api'
}
const API = getApiUrl()

// --- Interfaces ---

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

type UserRole = 'pm' | 'hr'
type PMTab = 'dashboard' | 'graph' | 'smart-allocate' | 'delay-prediction' | 'finance' | 'roles' | 'allocation-simulation' | 'meeting-transcript'
type HRTab = 'hr-performance' | 'hr-retention'
type Tab = PMTab | HRTab

const dashboardPaths: Record<Tab, string> = {
  dashboard: '/dashboard',
  graph: '/dashboard/graph',
  'smart-allocate': '/dashboard/smart-allocate',
  'delay-prediction': '/dashboard/delay-prediction',
  finance: '/dashboard/finance',
  roles: '/dashboard/roles',
  'allocation-simulation': '/dashboard/allocation-simulation',
  'meeting-transcript': '/dashboard/meeting-transcript',

  'hr-performance': '/dashboard/hr/performance',
  'hr-retention': '/dashboard/hr/retention',
}

const tabForPath = (pathname: string): Tab => {
  if (pathname === '/dashboard/hr') return 'hr-performance'
  const entry = Object.entries(dashboardPaths).find(([, path]) => path === pathname)
  return (entry?.[0] as Tab | undefined) ?? 'dashboard'
}

function App() {
  const location = useLocation()
  const navigate = useNavigate()

  // --- State Merged ---
  const showLanding = location.pathname === '/'
  const showPitch = location.pathname === '/pitch'
  const activeTab = tabForPath(location.pathname)

  const [githubConnected, setGithubConnected] = useState<boolean | null>(null)
  const [oauthMessage, setOauthMessage] = useState<string | null>(null)

  const userRole: UserRole = activeTab.startsWith('hr') ? 'hr' : 'pm'
  const [allocationData, setAllocationData] = useState<AllocationData | null>(null)
  
  // For prefilling Smart Allocate from Meeting Transcript
  const [, setPrefillFeature] = useState<{
    feature: string;
    description: string;
    techStack: string[];
  } | null>(null)

  // Mobile menu state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [voiceOpenSignal, setVoiceOpenSignal] = useState(0)

  useEffect(() => {
    if (showLanding || showPitch) return
    const validPath = dashboardPaths[activeTab]
    if (location.pathname !== validPath) {
      navigate(validPath, { replace: true })
    }
  }, [location.pathname, activeTab, navigate, showLanding, showPitch])

  // No role sync effect needed, userRole is derived during render.

  // --- Effects ---

  // GitHub Auth Status
  useEffect(() => {
    fetch(`${API}/oauth/github/status`)
      .then((r) => r.json())
      .then((d) => setGithubConnected(d.connected))
      .catch(() => setGithubConnected(false))
  }, [])

  // OAuth Callback Handling
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const oauth = params.get("oauth")
    if (oauth === "success") setOauthMessage("GitHub connected successfully.")
    if (oauth === "error") setOauthMessage("GitHub connection failed.")
  }, [])

  const connectGitHub = () => {
    window.location.href = `${API}/oauth/github`
  }

  // Role switcher
  const handleRoleSwitch = (role: UserRole) => {
    navigate(dashboardPaths[role === 'pm' ? 'dashboard' : 'hr-performance'])
  }

  const handleNavigateTab = (tab: string) => {
    navigate(dashboardPaths[tab as Tab])
  }

  // Landing Page
  if (showLanding) {
    return <LandingPage />
  }

  // Pitch Deck Presentation Page
  if (showPitch) {
    return <PitchPage />
  }

  // Knowledge Graph 3D Full Screen Overlay
  if (activeTab === 'graph') {
    return (
      <div className="dashboard-page min-h-screen bg-background text-foreground">
        <DashboardNavbar
          activeTab={activeTab}
          userRole={userRole}
          mobileMenuOpen={mobileMenuOpen}
          onBackToLanding={() => navigate('/')}
          onNavigateTab={handleNavigateTab}
          onRoleSwitch={handleRoleSwitch}
          onToggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)}
        />
        <div className="relative z-0 h-[calc(100vh-7rem)] min-h-0">
          <KnowledgeGraph3D onBack={() => navigate(dashboardPaths['dashboard'])} />
        </div>
        <VoiceChatbot openSignal={voiceOpenSignal} />
      </div>
    )
  }

  return (
    <div className="dashboard-page min-h-screen bg-background text-foreground flex flex-col">
      <DashboardNavbar
        activeTab={activeTab}
        userRole={userRole}
        mobileMenuOpen={mobileMenuOpen}
        onBackToLanding={() => navigate('/')}
        onNavigateTab={handleNavigateTab}
        onRoleSwitch={handleRoleSwitch}
        onToggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)}
      />

      {/* OAuth Notification */}
      {oauthMessage && (
        <div className="max-w-7xl mx-auto px-6 py-2">
          <div className="bg-primary/10 border border-primary text-primary px-4 py-2 rounded text-sm font-mono flex items-center gap-2">
            <CheckCircle className="w-4 h-4" /> {oauthMessage}
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1">
        {/* PM: Main Dashboard */}
        {userRole === 'pm' && activeTab === 'dashboard' && (
          <>
            <Dashboard
              onNavigate={handleNavigateTab}
              activeTab={activeTab}
              githubConnected={githubConnected}
              onConnectGitHub={connectGitHub}
            />
          </>
        )}

        {/* PM: Role Management */}
        {userRole === 'pm' && activeTab === 'roles' && (
          <div className="w-full">
            <RoleManagement />
          </div>
        )}

        {/* PM: Smart Allocate */}
        {userRole === 'pm' && activeTab === 'smart-allocate' && (
          <div className="w-full">
            <SmartAllocate
              onNavigateToDelay={(data) => {
                setAllocationData(data);
                navigate(dashboardPaths['allocation-simulation']);
              }}
            />
          </div>
        )}

        {/* PM: Allocation Simulation */}
        {userRole === 'pm' && activeTab === 'allocation-simulation' && (
          <div className="w-full">
            <AllocationSimulation
              allocationData={allocationData}
              onBack={() => navigate(dashboardPaths['smart-allocate'])}
              onContinueToDelay={() => navigate(dashboardPaths['delay-prediction'])}
            />
          </div>
        )}

        {/* PM: Delay Prediction */}
        {userRole === 'pm' && activeTab === 'delay-prediction' && (
          <div className="w-full">
            <DelayPrediction
              onBack={() => navigate(dashboardPaths['allocation-simulation'])}
              allocationDataProp={allocationData}
            />
          </div>
        )}

        {/* PM: Finance & ROI */}
        {userRole === 'pm' && activeTab === 'finance' && (
          <div className="w-full">
            <FinanceROI onBack={() => navigate(dashboardPaths['dashboard'])} />
          </div>
        )}

        {/* PM: Meeting Transcript */}
        {userRole === 'pm' && activeTab === 'meeting-transcript' && (
          <div className="w-full">
            <MeetingTranscript
              onBack={() => navigate(dashboardPaths['dashboard'])}
              onNavigateToSmartAllocate={(feature) => {
                setPrefillFeature(feature);
                navigate(dashboardPaths['smart-allocate']);
              }}
            />
          </div>
        )}



        {/* HR: Performance Analytics */}
        {userRole === 'hr' && activeTab === 'hr-performance' && (
          <div className="w-full">
            <HRPerformance onBack={() => navigate(dashboardPaths['dashboard'])} />
          </div>
        )}

        {/* HR: Retention Risk Model */}
        {userRole === 'hr' && activeTab === 'hr-retention' && (
          <div className="w-full">
            <HRRetention onBack={() => navigate(dashboardPaths['hr-performance'])} />
          </div>
        )}
      </div>

      {/* Voice Chatbot Widget - Available on subpages (removed from main dashboard) */}
      {activeTab !== 'dashboard' && <VoiceChatbot openSignal={voiceOpenSignal} />}
    </div>
  )
}



export default App