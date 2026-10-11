import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  LiaBriefcaseSolid as Briefcase,
  LiaUsersSolid as Users,
  LiaChevronDownSolid as ChevronDown,
  LiaCheckSolid as Check,
} from "react-icons/lia"

export type UserRole = 'pm' | 'hr'

interface ViewDropdownProps {
  currentRole: 'pm' | 'hr'
  onSelectRole: (role: 'pm' | 'hr') => void
  onNavigateTab?: (tab: string) => void
  activeTab?: string
}

export function ViewDropdown({
  currentRole,
  onSelectRole,
}: ViewDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setIsOpen(false)
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  const roles = [
    {
      id: 'pm' as const,
      title: 'Project Manager',
      subtitle: 'Delivery health, allocations & forecasting',
      icon: <Briefcase className="w-4 h-4 text-[#4285F4]" />,
      accentBg: 'bg-[#E8F0FE] text-[#1a73e8]',
    },
    {
      id: 'hr' as const,
      title: 'Human Resources',
      subtitle: 'Workforce analytics & retention risk',
      icon: <Users className="w-4 h-4 text-[#34A853]" />,
      accentBg: 'bg-[#E6F4EA] text-[#137333]',
    },
  ]

  const activeRole = roles.find(r => r.id === currentRole) || roles[0]

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-1.5 text-xs sm:text-sm font-sans font-medium rounded-lg border transition-all cursor-pointer ${
          isOpen
            ? 'border-border/40 bg-muted/60 text-foreground shadow-[0_1px_2px_rgba(0,0,0,0.05)]'
            : 'border-border/80 bg-card text-foreground hover:bg-muted/50 hover:border-border/30 shadow-[0_1px_2px_rgba(0,0,0,0.05)] active:translate-y-[0.5px]'
        }`}
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <span className="flex items-center gap-1.5 font-semibold">
          {activeRole.icon}
          <span>{activeRole.title}</span>
        </span>
        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="ml-0.5 text-muted-foreground"
        >
          <ChevronDown className="w-3.5 h-3.5" />
        </motion.span>
      </button>

      {/* Dropdown Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.98 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute left-0 sm:left-auto sm:right-0 mt-2 w-72 rounded-xl bg-card border border-border/80 shadow-[0_10px_30px_-5px_rgba(0,0,0,0.08),0_4px_6px_-2px_rgba(0,0,0,0.03)] z-50 overflow-hidden p-1.5 space-y-1"
          >
            {roles.map((role) => {
              const isSelected = currentRole === role.id
              return (
                <button
                  key={role.id}
                  onClick={() => {
                    onSelectRole(role.id)
                    setIsOpen(false)
                  }}
                  className={`w-full flex items-center justify-between gap-3 p-2.5 rounded-lg text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-foreground text-background font-semibold shadow-sm'
                      : 'hover:bg-muted/70 text-foreground'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className={`p-1.5 rounded-md ${isSelected ? 'bg-background/20 text-background' : role.accentBg}`}>
                      {role.icon}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold leading-tight font-sans truncate">{role.title}</p>
                      <p className={`text-[11px] leading-tight font-sans truncate mt-0.5 ${isSelected ? 'text-background/80' : 'text-muted-foreground'}`}>
                        {role.subtitle}
                      </p>
                    </div>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-emerald-400 shrink-0 mr-1" />}
                </button>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
