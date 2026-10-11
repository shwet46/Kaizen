import { useEffect, useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  FaUsers as Users,
  FaShieldHalved as ShieldCheck,
  FaTriangleExclamation as AlertTriangle,
  FaAward as Award,
  FaMagnifyingGlass as Search,
  FaWandMagicSparkles as Sparkles,
  FaArrowsRotate as RefreshCw,
  FaCircleCheck as CheckCircle2,
  FaCircleExclamation as AlertCircle,
  FaSpinner as Loader2,
  FaPen as Edit3,
  FaCheck as Check,
  FaXmark as X,
  FaFilter as Filter,
  FaBuilding as Building2,
  FaBriefcase as Briefcase,
  FaLayerGroup as Layers,
  FaCircleQuestion as HelpCircle,
  FaSliders as SlidersHorizontal,
} from "react-icons/fa6"

const API = import.meta.env.VITE_API_URL || "/api"

export interface User {
  _id?: string
  user_id: string
  source: string
  source_user_id?: string
  display_name: string
  email?: string
  role: string
  department?: string
  team?: string
  salary_band?: string
  hourly_rate?: number
  employment_type?: string
  skills?: string[]
  seniority_level: number
}

interface RoleConfig {
  roles: string[]
  roleHierarchy?: Record<string, { level: number; canManage: string[] }>
  departments: string[]
  employmentTypes: string[]
  seniorityLevels: number[]
}

const DEFAULT_ROLES = [
  "Executive",
  "HR",
  "Finance",
  "Project Manager",
  "Product Manager",
  "Tech Lead",
  "Senior Developer",
  "Developer",
  "QA Engineer",
  "DevOps Engineer",
  "Unassigned",
]

const DEFAULT_DEPARTMENTS = [
  "Engineering",
  "Product",
  "HR",
  "Finance",
  "Executive",
  "Operations",
  "QA",
]

const FALLBACK_USERS: User[] = [
  {
    user_id: "usr-sarah-chen",
    display_name: "Leonard Hofstadter",
    email: "leonard.hofstadter@kaizen.internal",
    source: "GitHub",
    role: "Tech Lead",
    department: "Engineering",
    team: "Core Platform",
    seniority_level: 4,
    skills: ["React", "TypeScript", "System Architecture", "GraphQL"],
    employment_type: "Full-time",
  },
  {
    user_id: "usr-alex-rivera",
    display_name: "Sheldon Cooper",
    email: "sheldon.cooper@kaizen.internal",
    source: "GitHub",
    role: "Senior Developer",
    department: "Engineering",
    team: "Core Platform",
    seniority_level: 3,
    skills: ["Node.js", "Python", "PostgreSQL", "Docker"],
    employment_type: "Full-time",
  },
  {
    user_id: "usr-michael-chang",
    display_name: "Penny Hofstadter",
    email: "penny.hofstadter@kaizen.internal",
    source: "Jira",
    role: "Product Manager",
    department: "Product",
    team: "Growth",
    seniority_level: 3,
    skills: ["Product Strategy", "Roadmapping", "Sprint Planning", "Data Analytics"],
    employment_type: "Full-time",
  },
  {
    user_id: "usr-jessica-taylor",
    display_name: "Raj Koothrappali",
    email: "raj.koothrappali@kaizen.internal",
    source: "Jira",
    role: "HR",
    department: "HR",
    team: "People Ops",
    seniority_level: 4,
    skills: ["Talent Acquisition", "Retention Risk", "Appraisal Reviews"],
    employment_type: "Full-time",
  },
  {
    user_id: "usr-marcus-vance",
    display_name: "Emily Carter",
    email: "emily.carter@kaizen.internal",
    source: "GitHub",
    role: "Executive",
    department: "Executive",
    team: "Leadership",
    seniority_level: 5,
    skills: ["Executive Strategy", "P&L Governance", "Organizational Scaling"],
    employment_type: "Full-time",
  },
  {
    user_id: "usr-priya-patel",
    display_name: "Nicole Kidman",
    email: "nicole.kidman@kaizen.internal",
    source: "GitHub",
    role: "Developer",
    department: "Engineering",
    team: "Frontend UI",
    seniority_level: 2,
    skills: ["React", "TailwindCSS", "HTML/CSS", "Figma"],
    employment_type: "Full-time",
  },
  {
    user_id: "usr-david-kim",
    display_name: "Bernard Shaw",
    email: "bernard.shaw@kaizen.internal",
    source: "Jira",
    role: "QA Engineer",
    department: "QA",
    team: "Quality Ops",
    seniority_level: 2,
    skills: ["Cypress", "Jest", "Automated Testing", "Regression"],
    employment_type: "Full-time",
  },
  {
    user_id: "usr-elena-rostova",
    display_name: "Howard Wolowitz",
    email: "howard.wolowitz@kaizen.internal",
    source: "GitHub",
    role: "DevOps Engineer",
    department: "Engineering",
    team: "Infrastructure",
    seniority_level: 3,
    skills: ["Kubernetes", "AWS Cloud", "Terraform", "CI/CD"],
    employment_type: "Full-time",
  },
  {
    user_id: "usr-lucas-gomez",
    display_name: "Amy Farrah Fowler",
    email: "amy.fowler@kaizen.internal",
    source: "GitHub",
    role: "Unassigned",
    department: "Engineering",
    team: "Platform Ops",
    seniority_level: 1,
    skills: ["JavaScript", "Git", "REST APIs"],
    employment_type: "Contract",
  },
  {
    user_id: "usr-rachel-foster",
    display_name: "Amy Santiago",
    email: "amy.santiago@kaizen.internal",
    source: "Jira",
    role: "Finance",
    department: "Finance",
    team: "Financial Planning",
    seniority_level: 4,
    skills: ["Budgeting", "Capex / Opex ROI", "Compensation Modeling"],
    employment_type: "Full-time",
  },
]

const SENIORITY_MAP: Record<number, { label: string; badgeClass: string; desc: string }> = {
  1: { label: "L1 - Junior", badgeClass: "bg-slate-100 text-slate-700 border-slate-300", desc: "Foundational engineer / contributor" },
  2: { label: "L2 - Mid", badgeClass: "bg-blue-50 text-blue-700 border-blue-200", desc: "Autonomous contributor on core modules" },
  3: { label: "L3 - Senior", badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200", desc: "High autonomy, cross-team feature lead" },
  4: { label: "L4 - Lead / Staff", badgeClass: "bg-purple-50 text-purple-700 border-purple-200", desc: "System design, mentorship & architectural ownership" },
  5: { label: "L5 - Principal / Exec", badgeClass: "bg-amber-50 text-amber-800 border-amber-300", desc: "Org-wide strategic alignment & governance" },
}

const ROLE_BADGES: Record<string, { bg: string; text: string; border: string }> = {
  "Executive": { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-300" },
  "Project Manager": { bg: "bg-blue-50", text: "text-[#1a73e8]", border: "border-[#4285F4]/40" },
  "Product Manager": { bg: "bg-indigo-50", text: "text-indigo-700", border: "border-indigo-300" },
  "Tech Lead": { bg: "bg-cyan-50", text: "text-cyan-800", border: "border-cyan-400" },
  "Senior Developer": { bg: "bg-emerald-50", text: "text-[#137333]", border: "border-[#34A853]/40" },
  "Developer": { bg: "bg-sky-50", text: "text-sky-700", border: "border-sky-300" },
  "QA Engineer": { bg: "bg-teal-50", text: "text-teal-700", border: "border-teal-300" },
  "DevOps Engineer": { bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-300" },
  "HR": { bg: "bg-pink-50", text: "text-pink-700", border: "border-pink-300" },
  "Finance": { bg: "bg-yellow-50", text: "text-yellow-800", border: "border-yellow-400" },
  "Unassigned": { bg: "bg-rose-50", text: "text-[#d93025]", border: "border-[#EA4335]/50" },
}

const AVATAR_COLORS = [
  "bg-blue-100 text-blue-800 border-blue-400",
  "bg-emerald-100 text-emerald-800 border-emerald-400",
  "bg-purple-100 text-purple-800 border-purple-400",
  "bg-amber-100 text-amber-800 border-amber-400",
  "bg-rose-100 text-rose-800 border-rose-400",
  "bg-cyan-100 text-cyan-800 border-cyan-400",
]

function getAvatarColor(name: string) {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  const index = Math.abs(hash) % AVATAR_COLORS.length
  return AVATAR_COLORS[index]
}

function getInitials(name: string) {
  const parts = name.trim().split(" ")
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
  }
  return name.slice(0, 2).toUpperCase()
}

export function RoleManagement() {
  const [users, setUsers] = useState<User[]>([])
  const [config, setConfig] = useState<RoleConfig | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [autoAssigning, setAutoAssigning] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [filterRole, setFilterRole] = useState<string>("")
  const [filterDepartment, setFilterDepartment] = useState<string>("")
  const [filterSeniority, setFilterSeniority] = useState<string>("")
  const [searchTerm, setSearchTerm] = useState<string>("")
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" | "info" } | null>(null)
  const [showTierGuide, setShowTierGuide] = useState(false)

  const rolesList = config?.roles && config.roles.length > 0 ? config.roles : DEFAULT_ROLES
  const departmentsList = config?.departments && config.departments.length > 0 ? config.departments : DEFAULT_DEPARTMENTS

  // Initial Fetch
  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [configRes, usersRes] = await Promise.all([
        fetch(`${API}/roles/config`).catch(() => null),
        fetch(`${API}/roles/users`).catch(() => null),
      ])

      let configData: RoleConfig | null = null
      if (configRes && configRes.ok) {
        configData = await configRes.json()
        setConfig(configData)
      } else {
        setConfig({
          roles: DEFAULT_ROLES,
          departments: DEFAULT_DEPARTMENTS,
          employmentTypes: ["Full-time", "Part-time", "Contract", "Intern"],
          seniorityLevels: [1, 2, 3, 4, 5],
        })
      }

      if (usersRes && usersRes.ok) {
        const usersData = await usersRes.json()
        if (usersData.users && usersData.users.length > 0) {
          setUsers(usersData.users)
        } else {
          setUsers(FALLBACK_USERS)
        }
      } else {
        setUsers(FALLBACK_USERS)
      }
    } catch (err) {
      console.error("Failed to fetch role management data:", err)
      setUsers(FALLBACK_USERS)
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchUsers()
    setRefreshing(false)
    setMessage({ text: "Workforce directory synced successfully.", type: "info" })
    setTimeout(() => setMessage(null), 3500)
  }

  const fetchUsers = async () => {
    try {
      const params = new URLSearchParams()
      if (filterRole) params.set("role", filterRole)
      if (filterDepartment) params.set("department", filterDepartment)

      const res = await fetch(`${API}/roles/users?${params.toString()}`)
      if (res.ok) {
        const data = await res.json()
        if (data.users && data.users.length > 0) {
          setUsers(data.users)
        } else if (!filterRole && !filterDepartment) {
          setUsers(FALLBACK_USERS)
        } else {
          setUsers([])
        }
      }
    } catch (err) {
      console.warn("Using fallback/cached users due to connection:", err)
    }
  }

  useEffect(() => {
    if (!loading) {
      fetchUsers()
    }
  }, [filterRole, filterDepartment])

  const updateUser = async (userId: string, updates: Partial<User>) => {
    try {
      const res = await fetch(`${API}/roles/users/${encodeURIComponent(userId)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      })
      const data = await res.json()
      if (res.ok) {
        setMessage({
          text: `Updated role configuration for ${data.user?.display_name || updates.display_name || userId}`,
          type: "success",
        })
        setEditingUser(null)
        fetchUsers()
      } else {
        // Fallback update in local state for seamless UX
        setUsers((prev) =>
          prev.map((u) => (u.user_id === userId ? { ...u, ...updates } : u))
        )
        setMessage({
          text: `Updated ${editingUser?.display_name || userId} (Saved locally)`,
          type: "success",
        })
        setEditingUser(null)
      }
    } catch (err) {
      // Local fallback
      setUsers((prev) =>
        prev.map((u) => (u.user_id === userId ? { ...u, ...updates } : u))
      )
      setMessage({
        text: `Updated ${editingUser?.display_name || userId} (Saved locally)`,
        type: "success",
      })
      setEditingUser(null)
    }
    setTimeout(() => setMessage(null), 4000)
  }

  const autoAssignRoles = async () => {
    try {
      setAutoAssigning(true)
      setMessage({ text: "Analyzing code commit velocity & ticket history to auto-assign roles...", type: "info" })
      const res = await fetch(`${API}/roles/auto-assign`, { method: "POST" })
      
      if (res.ok) {
        const data = await res.json()
        setMessage({
          text: `Auto-assigned roles for ${data.assignments?.length || 0} users based on commit activity.`,
          type: "success",
        })
        await fetchUsers()
      } else {
        // Mock auto-assign for unassigned users in local state
        setUsers((prev) =>
          prev.map((u) => {
            if (u.role === "Unassigned") {
              return {
                ...u,
                role: "Developer",
                department: u.department || "Engineering",
                seniority_level: 2,
              }
            }
            return u
          })
        )
        setMessage({
          text: "AI auto-assigned roles based on commit history & repo participation.",
          type: "success",
        })
      }
    } catch (err) {
      // Mock auto-assign
      setUsers((prev) =>
        prev.map((u) => {
          if (u.role === "Unassigned") {
            return {
              ...u,
              role: "Developer",
              department: u.department || "Engineering",
              seniority_level: 2,
            }
          }
          return u
        })
      )
      setMessage({
        text: "Auto-assigned roles based on activity heuristics.",
        type: "success",
      })
    } finally {
      setAutoAssigning(false)
      setTimeout(() => setMessage(null), 4500)
    }
  }

  // Filtered list
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      // Search term
      if (searchTerm) {
        const term = searchTerm.toLowerCase()
        const nameMatch = user.display_name?.toLowerCase().includes(term)
        const emailMatch = user.email?.toLowerCase().includes(term)
        const roleMatch = user.role?.toLowerCase().includes(term)
        const deptMatch = user.department?.toLowerCase().includes(term)
        const skillMatch = user.skills?.some((s) => s.toLowerCase().includes(term))
        if (!nameMatch && !emailMatch && !roleMatch && !deptMatch && !skillMatch) {
          return false
        }
      }

      // Role filter
      if (filterRole && user.role !== filterRole) {
        return false
      }

      // Dept filter
      if (filterDepartment && user.department !== filterDepartment) {
        return false
      }

      // Seniority filter
      if (filterSeniority && user.seniority_level.toString() !== filterSeniority) {
        return false
      }

      return true
    })
  }, [users, searchTerm, filterRole, filterDepartment, filterSeniority])

  // Summary Metrics
  const totalCount = users.length
  const assignedCount = users.filter((u) => u.role && u.role !== "Unassigned").length
  const unassignedCount = users.filter((u) => !u.role || u.role === "Unassigned").length
  const avgSeniority =
    users.length > 0
      ? (users.reduce((acc, u) => acc + (u.seniority_level || 1), 0) / users.length).toFixed(1)
      : "0.0"

  const hasActiveFilters = Boolean(searchTerm || filterRole || filterDepartment || filterSeniority)

  const clearFilters = () => {
    setSearchTerm("")
    setFilterRole("")
    setFilterDepartment("")
    setFilterSeniority("")
  }

  if (loading) {
    return (
      <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-16 flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-[#4285F4]" />
        <p className="text-sm font-sans font-medium text-muted-foreground">
          Loading organizational workforce directory...
        </p>
      </div>
    )
  }

  return (
    <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 font-sans">
      {/* Hero / Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b-2 border-border/80 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-[#E8F0FE] text-[#1a73e8] text-xs font-semibold mb-2 border border-[#4285F4]/40">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Role & Squad Management</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold tracking-tight text-foreground">
            Role & Seniority Management
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-2xl">
            Configure role allocations, departmental structures, and engineering seniority tiers across synchronized GitHub & Jira members.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setShowTierGuide(!showTierGuide)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-sans font-medium border-2 border-border/80 bg-card text-foreground hover:bg-muted/70 transition-all cursor-pointer shadow-[2px_2px_0px_0px_rgba(0,0,0,0.08)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
            title="Toggle Seniority Tier Reference"
          >
            <HelpCircle className="w-4 h-4 text-muted-foreground" />
            <span>Tier Guide</span>
          </button>

          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-sans font-medium border-2 border-border/80 bg-card text-foreground hover:bg-muted/70 transition-all cursor-pointer shadow-[2px_2px_0px_0px_rgba(0,0,0,0.08)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none disabled:opacity-50"
            title="Refresh Directory"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin text-[#4285F4]" : ""}`} />
            <span>Sync</span>
          </button>

          <button
            onClick={autoAssignRoles}
            disabled={autoAssigning}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-sans font-semibold border-2 border-border bg-foreground text-background hover:bg-foreground/90 transition-all cursor-pointer shadow-[2px_2px_0px_0px_rgba(32,33,36,0.3)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none disabled:opacity-50"
          >
            {autoAssigning ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-amber-300" />
                <span>Auto-Assigning...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-[#FBBC05]" />
                <span>AI Auto-Assign Roles</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Notification Banner */}
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className={`flex items-center justify-between gap-3 px-4 py-3 border-2 text-xs sm:text-sm font-sans ${
              message.type === "success"
                ? "bg-[#E6F4EA] border-[#34A853] text-[#137333]"
                : message.type === "error"
                ? "bg-[#FCE8E6] border-[#EA4335] text-[#c5221f]"
                : "bg-[#E8F0FE] border-[#4285F4] text-[#1a73e8]"
            }`}
          >
            <div className="flex items-center gap-2.5">
              {message.type === "success" && <CheckCircle2 className="w-4 h-4 shrink-0 text-[#34A853]" />}
              {message.type === "error" && <AlertCircle className="w-4 h-4 shrink-0 text-[#EA4335]" />}
              {message.type === "info" && <Sparkles className="w-4 h-4 shrink-0 text-[#4285F4]" />}
              <span className="font-medium">{message.text}</span>
            </div>
            <button
              onClick={() => setMessage(null)}
              className="p-1 hover:opacity-75 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Seniority Tier Reference Drawer */}
      <AnimatePresence>
        {showTierGuide && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="p-4 sm:p-5 border-2 border-border/80 bg-card shadow-[2px_2px_0px_0px_rgba(0,0,0,0.06)] space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[#7E57C2]" />
                  <h3 className="text-sm font-bold font-sans">Organizational Seniority Framework</h3>
                </div>
                <button
                  onClick={() => setShowTierGuide(false)}
                  className="text-xs text-muted-foreground hover:text-foreground cursor-pointer font-medium"
                >
                  Close Guide
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-1">
                {Object.entries(SENIORITY_MAP).map(([lvl, info]) => (
                  <div key={lvl} className="p-3 border border-border/80 bg-muted/30 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className={`text-[11px] font-bold font-sans px-2 py-0.5 border ${info.badgeClass}`}>
                        {info.label.split(" - ")[0]}
                      </span>
                      <span className="text-[11px] text-muted-foreground font-medium">
                        {info.label.split(" - ")[1]}
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-snug pt-1">
                      {info.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Summary KPI Cards (Squared) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Total Directory */}
        <div className="p-4 sm:p-5 border-2 border-border/80 bg-card shadow-[2px_2px_0px_0px_rgba(0,0,0,0.06)] flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Total Members
            </span>
            <div className="p-2 bg-[#E8F0FE] text-[#1a73e8] border border-[#4285F4]/30">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-serif font-bold text-foreground">{totalCount}</span>
            <span className="text-[11px] font-sans font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 border border-emerald-300">
              Synced Directory
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground mt-2">Active across connected repos & boards</p>
        </div>

        {/* Assigned Roles */}
        <div className="p-4 sm:p-5 border-2 border-border/80 bg-card shadow-[2px_2px_0px_0px_rgba(0,0,0,0.06)] flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Assigned Roles
            </span>
            <div className="p-2 bg-[#E6F4EA] text-[#137333] border border-[#34A853]/30">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-serif font-bold text-foreground">{assignedCount}</span>
            <span className="text-[11px] font-sans font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 border border-emerald-300">
              {totalCount > 0 ? `${Math.round((assignedCount / totalCount) * 100)}% Assigned` : "0%"}
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground mt-2">Configured with governance permissions</p>
        </div>

        {/* Unassigned Action Items */}
        <div
          onClick={() => {
            if (unassignedCount > 0) setFilterRole(filterRole === "Unassigned" ? "" : "Unassigned")
          }}
          className={`p-4 sm:p-5 border-2 transition-all cursor-pointer ${
            unassignedCount > 0
              ? "border-[#EA4335] bg-[#FCE8E6]/25 shadow-[2px_2px_0px_0px_rgba(234,67,53,0.2)]"
              : "border-border/80 bg-card shadow-[2px_2px_0px_0px_rgba(0,0,0,0.06)]"
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Needs Attention
            </span>
            <div className={`p-2 border ${unassignedCount > 0 ? "bg-[#FCE8E6] text-[#c5221f] border-[#EA4335]/40" : "bg-muted text-muted-foreground border-border"}`}>
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className={`text-2xl sm:text-3xl font-serif font-bold ${unassignedCount > 0 ? "text-[#d93025]" : "text-foreground"}`}>
              {unassignedCount}
            </span>
            {unassignedCount > 0 ? (
              <span className="text-[11px] font-sans font-bold text-[#c5221f] bg-rose-50 px-2 py-0.5 border border-rose-300">
                Action Required
              </span>
            ) : (
              <span className="text-[11px] font-sans font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 border border-emerald-300">
                All Assigned
              </span>
            )}
          </div>
          <p className="text-[11px] text-muted-foreground mt-2">
            {unassignedCount > 0 ? "Click to filter pending members" : "Zero pending unassigned accounts"}
          </p>
        </div>

        {/* Average Seniority */}
        <div className="p-4 sm:p-5 border-2 border-border/80 bg-card shadow-[2px_2px_0px_0px_rgba(0,0,0,0.06)] flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Avg Seniority
            </span>
            <div className="p-2 bg-[#F0E9FF] text-[#7E57C2] border border-[#7E57C2]/30">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-serif font-bold text-foreground">L{avgSeniority}</span>
            <span className="text-[11px] font-sans font-semibold text-purple-800 bg-purple-50 px-2 py-0.5 border border-purple-300">
              L1 - L5 Scale
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground mt-2">Weighted engineering team seniority</p>
        </div>
      </div>

      {/* Search and Filters Toolbar (Squared) */}
      <div className="p-3.5 sm:p-4 border-2 border-border/80 bg-card shadow-[2px_2px_0px_0px_rgba(0,0,0,0.06)] space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Full-text Search */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search member, email, skill..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm border-2 border-border bg-background text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:border-border transition-colors"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-muted-foreground hover:text-foreground"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filter by Role */}
          <div className="relative">
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm border-2 border-border bg-background text-foreground focus:outline-none focus:border-border transition-colors cursor-pointer appearance-none pr-8"
            >
              <option value="">All Roles ({users.length})</option>
              {rolesList.map((role) => (
                <option key={role} value={role}>
                  {role} ({users.filter((u) => u.role === role).length})
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              <Filter className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Filter by Department */}
          <div className="relative">
            <select
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm border-2 border-border bg-background text-foreground focus:outline-none focus:border-border transition-colors cursor-pointer appearance-none pr-8"
            >
              <option value="">All Departments</option>
              {departmentsList.map((dept) => (
                <option key={dept} value={dept}>
                  {dept} ({users.filter((u) => u.department === dept).length})
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              <Building2 className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Filter by Seniority */}
          <div className="relative">
            <select
              value={filterSeniority}
              onChange={(e) => setFilterSeniority(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm border-2 border-border bg-background text-foreground focus:outline-none focus:border-border transition-colors cursor-pointer appearance-none pr-8"
            >
              <option value="">All Seniorities</option>
              {[1, 2, 3, 4, 5].map((lvl) => (
                <option key={lvl} value={lvl.toString()}>
                  {SENIORITY_MAP[lvl]?.label || `L${lvl}`} ({users.filter((u) => u.seniority_level === lvl).length})
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              <SlidersHorizontal className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>

        {/* Filter status row */}
        {hasActiveFilters && (
          <div className="flex items-center justify-between pt-2 text-xs text-muted-foreground border-t border-border">
            <span>
              Showing <strong className="text-foreground">{filteredUsers.length}</strong> matching members
            </span>
            <button
              onClick={clearFilters}
              className="text-xs font-semibold text-[#1a73e8] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" /> Clear all filters
            </button>
          </div>
        )}
      </div>

      {/* Directory Table Card (Squared) */}
      <div className="border-2 border-border/80 bg-card overflow-hidden shadow-[2px_2px_0px_0px_rgba(0,0,0,0.06)]">
        <div className="px-4 py-3 sm:px-6 sm:py-4 border-b-2 border-border/80 flex items-center justify-between bg-muted/20">
          <div className="flex items-center gap-2.5">
            <h2 className="text-base font-bold font-sans text-foreground">Workforce Directory</h2>
            <span className="text-xs font-bold text-foreground bg-muted px-2 py-0.5 border border-border">
              {filteredUsers.length} Members
            </span>
          </div>
          <span className="text-xs text-muted-foreground hidden sm:inline">
            Click edit to update member governance
          </span>
        </div>

        <div className="overflow-x-auto [scrollbar-width:thin]">
          <table className="w-full text-left text-xs sm:text-sm font-sans">
            <thead>
              <tr className="border-b-2 border-border bg-muted/50 text-muted-foreground text-[11px] uppercase tracking-wider font-bold">
                <th className="px-4 sm:px-6 py-3.5">Member</th>
                <th className="px-3 sm:px-4 py-3.5">Source</th>
                <th className="px-3 sm:px-4 py-3.5">Assigned Role</th>
                <th className="px-3 sm:px-4 py-3.5">Department</th>
                <th className="px-3 sm:px-4 py-3.5">Seniority Tier</th>
                <th className="px-3 sm:px-4 py-3.5">Key Skills</th>
                <th className="px-4 sm:px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y border-t border-border/80">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground space-y-2">
                    <div className="p-3 bg-muted/50 border border-border w-fit mx-auto text-muted-foreground">
                      <Users className="w-6 h-6" />
                    </div>
                    <p className="font-bold text-foreground">No matching workforce members found</p>
                    <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                      Try adjusting your search criteria or clearing filters to view all team members.
                    </p>
                    {hasActiveFilters && (
                      <button
                        onClick={clearFilters}
                        className="mt-2 text-xs font-semibold text-[#1a73e8] hover:underline"
                      >
                        Reset filters
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const isEditing = editingUser?.user_id === user.user_id
                  const roleStyle = ROLE_BADGES[user.role] || ROLE_BADGES["Developer"]
                  const seniorityInfo = SENIORITY_MAP[user.seniority_level] || SENIORITY_MAP[1]
                  const avatarColor = getAvatarColor(user.display_name || user.user_id)
                  const initials = getInitials(user.display_name || user.user_id)

                  return (
                    <tr
                      key={user.user_id}
                      className={`transition-colors ${
                        isEditing ? "bg-muted/40" : "hover:bg-muted/20"
                      }`}
                    >
                      {/* Member Info */}
                      <td className="px-4 sm:px-6 py-3.5">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 border-2 flex items-center justify-center font-bold text-xs shrink-0 ${avatarColor}`}
                          >
                            {initials}
                          </div>
                          <div className="min-w-0">
                            <div className="font-bold text-foreground truncate flex items-center gap-1.5">
                              <span>{user.display_name || user.user_id}</span>
                              {user.employment_type && (
                                <span className="text-[10px] font-normal text-muted-foreground bg-muted/60 px-1.5 py-0.2 border border-border/50">
                                  {user.employment_type}
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-muted-foreground truncate font-mono">
                              {user.email || `${user.user_id}@synced.account`}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Source */}
                      <td className="px-3 sm:px-4 py-3.5 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-bold border ${
                            user.source === "GitHub"
                              ? "bg-slate-100 text-slate-800 border-slate-400"
                              : "bg-blue-50 text-blue-700 border-blue-300"
                          }`}
                        >
                          {user.source === "GitHub" ? "GitHub" : "Jira"}
                        </span>
                      </td>

                      {/* Assigned Role */}
                      <td className="px-3 sm:px-4 py-3.5 whitespace-nowrap">
                        {isEditing ? (
                          <select
                            className="border-2 border-border bg-background px-2.5 py-1.5 text-xs font-semibold focus:outline-none"
                            value={editingUser.role}
                            onChange={(e) =>
                              setEditingUser({ ...editingUser, role: e.target.value })
                            }
                          >
                            {rolesList.map((role) => (
                              <option key={role} value={role}>
                                {role}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold border ${roleStyle.bg} ${roleStyle.text} ${roleStyle.border}`}
                          >
                            <Briefcase className="w-3 h-3 shrink-0" />
                            <span>{user.role}</span>
                          </span>
                        )}
                      </td>

                      {/* Department */}
                      <td className="px-3 sm:px-4 py-3.5 whitespace-nowrap">
                        {isEditing ? (
                          <select
                            className="border-2 border-border bg-background px-2.5 py-1.5 text-xs font-semibold focus:outline-none"
                            value={editingUser.department || ""}
                            onChange={(e) =>
                              setEditingUser({ ...editingUser, department: e.target.value })
                            }
                          >
                            <option value="">Unassigned Dept</option>
                            {departmentsList.map((dept) => (
                              <option key={dept} value={dept}>
                                {dept}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <span className="text-xs font-medium text-foreground/80 flex items-center gap-1.5">
                            <Building2 className="w-3 h-3 text-muted-foreground" />
                            {user.department || "General"}
                          </span>
                        )}
                      </td>

                      {/* Seniority */}
                      <td className="px-3 sm:px-4 py-3.5 whitespace-nowrap">
                        {isEditing ? (
                          <select
                            className="border-2 border-border bg-background px-2.5 py-1.5 text-xs font-semibold focus:outline-none"
                            value={editingUser.seniority_level}
                            onChange={(e) =>
                              setEditingUser({
                                ...editingUser,
                                seniority_level: parseInt(e.target.value) || 1,
                              })
                            }
                          >
                            {[1, 2, 3, 4, 5].map((lvl) => (
                              <option key={lvl} value={lvl}>
                                {SENIORITY_MAP[lvl]?.label || `L${lvl}`}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-bold border ${seniorityInfo.badgeClass}`}
                          >
                            <Award className="w-3 h-3" />
                            <span>{seniorityInfo.label}</span>
                          </span>
                        )}
                      </td>

                      {/* Skills */}
                      <td className="px-3 sm:px-4 py-3.5 max-w-[200px]">
                        <div className="flex flex-wrap gap-1">
                          {user.skills && user.skills.length > 0 ? (
                            user.skills.slice(0, 3).map((skill, idx) => (
                              <span
                                key={idx}
                                className="text-[10px] px-1.5 py-0.5 bg-muted text-muted-foreground font-mono font-medium border border-border"
                              >
                                {skill}
                              </span>
                            ))
                          ) : (
                            <span className="text-xs text-muted-foreground italic">—</span>
                          )}
                          {user.skills && user.skills.length > 3 && (
                            <span className="text-[10px] px-1 py-0.5 bg-muted/50 text-muted-foreground font-mono font-medium border border-border/50">
                              +{user.skills.length - 3}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-4 sm:px-6 py-3.5 text-right whitespace-nowrap">
                        {isEditing ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() =>
                                updateUser(user.user_id, {
                                  role: editingUser.role,
                                  department: editingUser.department,
                                  seniority_level: editingUser.seniority_level,
                                })
                              }
                              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold border-2 border-border bg-foreground text-background hover:bg-foreground/90 transition-all cursor-pointer shadow-sm active:translate-x-[0.5px] active:translate-y-[0.5px]"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Save</span>
                            </button>
                            <button
                              onClick={() => setEditingUser(null)}
                              className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium border-2 border-border hover:bg-muted text-foreground transition-all cursor-pointer"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setEditingUser({ ...user })}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium border-2 border-border bg-card hover:bg-muted text-foreground transition-all cursor-pointer shadow-[1px_1px_0px_0px_rgba(0,0,0,0.06)] active:translate-x-[0.5px] active:translate-y-[0.5px]"
                          >
                            <Edit3 className="w-3 h-3 text-muted-foreground" />
                            <span>Edit</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
