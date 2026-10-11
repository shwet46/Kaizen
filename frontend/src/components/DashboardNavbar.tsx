import {
  LiaBarsSolid as Menu,
  LiaTimesSolid as CloseIcon,
  LiaChartLineSolid as Activity,
  LiaChartBarSolid as BarChart3,
  LiaBrainSolid as Brain,
  LiaClockSolid as Clock,
  LiaFileAltSolid as FileText,
  LiaSitemapSolid as Network,
  LiaCogSolid as Settings,
  LiaUsersSolid as Users,
  LiaBoltSolid as Zap
} from "react-icons/lia"
import { motion } from "framer-motion"
import { ViewDropdown } from "@/components/ViewDropdown"

type UserRole = 'pm' | 'hr'

type DashboardNavbarProps = {
  activeTab: string
  userRole: UserRole
  health: { status: string } | null
  mobileMenuOpen: boolean
  onBackToLanding: () => void
  onNavigateTab: (tab: string) => void
  onRoleSwitch: (role: UserRole) => void
  onToggleMobileMenu: () => void
  onOpenQuickActions: () => void
}

const projectManagerNavItems = [
  { id: 'dashboard', label: 'Overview', icon: Activity },
  { id: 'graph', label: 'Knowledge Graph', icon: Network },
  { id: 'smart-allocate', label: 'Smart Allocate', icon: Brain },
  { id: 'delay-prediction', label: 'Delay Prediction', icon: Clock },
  { id: 'finance', label: 'Finance & ROI', icon: BarChart3 },
  { id: 'meeting-transcript', label: 'Meeting Transcript', icon: FileText },
  { id: 'roles', label: 'Roles', icon: Settings },
]

const humanResourcesNavItems = [
  { id: 'hr-performance', label: 'Performance', icon: Activity },
  { id: 'hr-retention', label: 'Retention Risk', icon: Users },
]

export function DashboardNavbar({
  activeTab,
  userRole,
  health,
  mobileMenuOpen,
  onBackToLanding,
  onNavigateTab,
  onRoleSwitch,
  onToggleMobileMenu,
  onOpenQuickActions,
}: DashboardNavbarProps) {
  const dashboardNavItems = userRole === 'hr' ? humanResourcesNavItems : projectManagerNavItems

  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-background/95 shadow-[0_2px_8px_rgba(32,33,36,0.04)] backdrop-blur">
      <div className="mx-auto max-w-7xl px-3 py-2.5 sm:px-6 sm:py-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3 sm:gap-4">
            <button
              onClick={onBackToLanding}
              className="group flex shrink-0 items-center gap-2.5 text-left cursor-pointer"
              title="Back to Landing Page"
            >
              <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-white border border-border/80 p-1 shadow-[2px_2px_0px_0px_rgba(32,33,36,0.08)]">
                <img
                  src="/icon.svg"
                  alt="Kaizen"
                  className="h-full w-full object-contain"
                />
              </div>
              <span
                className="hidden font-serif text-2xl tracking-tight text-foreground group-hover:opacity-90 xs:inline font-normal"
                style={{ fontFamily: "'Instrument Serif', serif" }}
              >
                Kaizen
              </span>
            </button>

            <div className="hidden h-5 w-px bg-border/80 sm:block" />

            <div className="hidden items-center gap-2 lg:flex">
              <span className="text-[11px] font-sans font-medium uppercase tracking-wider text-muted-foreground">
                Role:
              </span>
              <ViewDropdown
                currentRole={userRole}
                onSelectRole={onRoleSwitch}
                onNavigateTab={onNavigateTab}
                activeTab={activeTab}
              />
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <button
              onClick={onOpenQuickActions}
              className="flex items-center gap-1.5 rounded-lg border border-border/80 bg-card px-2.5 py-1.5 text-xs font-sans font-semibold text-foreground shadow-[2px_2px_0px_0px_rgba(32,33,36,0.08)] transition-all hover:bg-muted/70 hover:shadow-[3px_3px_0px_0px_rgba(32,33,36,0.12)] hover:-translate-y-0.5 active:translate-y-0 active:shadow-none sm:px-3.5 sm:py-2 cursor-pointer"
              title="Open Quick Actions Drawer"
            >
              <Zap className="h-3.5 w-3.5 fill-[#FBBC05]/20 text-[#FBBC05]" />
              <span className="hidden sm:inline">Quick Actions</span>
              <span className="sm:hidden">Actions</span>
            </button>

            {health && (
              <div className="hidden items-center gap-2 rounded-full border border-border/80 bg-card/90 px-3 py-1 text-xs font-mono sm:flex shadow-[1px_1px_0px_0px_rgba(32,33,36,0.06)]">
                <div className={`h-2 w-2 animate-pulse rounded-full ${health.status === 'ok' ? 'bg-[#34A853]' : 'bg-[#EA4335]'}`} />
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  SYS: {health.status.toUpperCase()}
                </span>
              </div>
            )}

            <button
              onClick={onToggleMobileMenu}
              className="rounded-lg border border-border p-1.5 hover:bg-muted md:hidden sm:p-2 cursor-pointer"
              aria-label="Toggle dashboard menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <CloseIcon className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <nav className="mt-2.5 flex items-center gap-1.5 overflow-x-auto border-t border-border pt-2 pb-2.5 px-0.5 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden" aria-label="Dashboard navigation">
          {dashboardNavItems.map(({ id, label, icon: Icon }) => {
            const isActive = activeTab === id
            return (
              <button
                key={id}
                onClick={() => onNavigateTab(id)}
                className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs sm:text-sm font-sans transition-all cursor-pointer ${
                  isActive
                    ? 'bg-foreground text-background shadow-[2px_2px_0px_0px_rgba(32,33,36,0.12)] font-semibold'
                    : 'text-foreground/75 hover:text-foreground hover:bg-muted/70 font-medium'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{label}</span>
              </button>
            )
          })}
        </nav>

        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-3 space-y-3 border-t border-border pt-3 md:hidden"
          >
            <div className="space-y-1.5">
              <span className="mb-1 block text-[11px] font-sans font-medium uppercase tracking-wider text-muted-foreground">
                Switch Operating Role
              </span>
              <div className="grid grid-cols-2 gap-2">
                {(['pm', 'hr'] as const).map((role) => (
                  <button
                    key={role}
                    onClick={() => { onRoleSwitch(role); onToggleMobileMenu(); }}
                    className={`rounded-lg border-2 px-3 py-2 text-center text-xs font-sans font-medium transition-all ${userRole === role
                      ? 'border-border bg-foreground text-background font-semibold'
                      : 'border-border bg-card hover:bg-muted'
                      }`}
                  >
                    {role === 'pm' ? 'Project Manager' : 'Human Resources'}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => { onOpenQuickActions(); onToggleMobileMenu(); }}
              className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-border/20 bg-[#FEF7E0] px-3 py-2 text-xs font-sans font-bold text-[#8c6d00]"
            >
              <Zap className="h-3.5 w-3.5 text-[#FBBC05]" /> Open Quick Actions
            </button>
          </motion.div>
        )}
      </div>
    </header>
  )
}
