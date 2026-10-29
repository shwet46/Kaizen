import React, { useEffect, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Ticket, X, ArrowRight, User } from 'lucide-react';

export interface JiraTicketNotificationItem {
  id?: string;
  key: string;
  summary: string;
  title?: string;
  assignee?: string;
  assigneeRole?: string;
  priority?: string;
  status?: string;
  timestamp?: Date | string;
  count?: number;
  batchKeys?: string[];
}

export function notifyJiraTicketAllocated(ticket: JiraTicketNotificationItem) {
  if (typeof window !== 'undefined') {
    // Only show real Jira ticket popups (KAN-xxx), ignore PROJ- placeholders
    if (!ticket || !ticket.key || !ticket.key.toUpperCase().startsWith('KAN-')) {
      return;
    }
    window.dispatchEvent(new CustomEvent('jira-ticket-allocated', { detail: ticket }));
  }
}

interface JiraTicketNotificationProps {
  onNavigateToOverview?: () => void;
}

export const JiraTicketNotification: React.FC<JiraTicketNotificationProps> = ({ onNavigateToOverview }) => {
  const [notifications, setNotifications] = useState<JiraTicketNotificationItem[]>([]);
  const timersRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const removeNotification = useCallback((key: string) => {
    if (timersRef.current[key]) {
      clearTimeout(timersRef.current[key]);
      delete timersRef.current[key];
    }
    setNotifications(prev => prev.filter(n => n.key !== key));
  }, []);

  useEffect(() => {
    const handleTicketAllocated = (event: Event) => {
      const customEvent = event as CustomEvent<JiraTicketNotificationItem>;
      const ticket = customEvent.detail;
      if (!ticket || !ticket.key) return;

      // Strictly allow only KAN ticket popups
      if (!ticket.key.toUpperCase().startsWith('KAN-')) return;

      const normalized: JiraTicketNotificationItem = {
        ...ticket,
        summary: ticket.summary || ticket.title || 'Task Allocated',
        assignee: ticket.assignee || 'Assigned Engineer',
        priority: ticket.priority ? (ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1)) : 'Medium',
        status: ticket.status || 'Allocated',
        timestamp: ticket.timestamp || new Date(),
      };

      setNotifications(prev => {
        // Keep at most 3 notifications at once, avoiding exact duplicate keys
        const filtered = prev.filter(n => n.key !== normalized.key);
        return [normalized, ...filtered].slice(0, 3);
      });

      // Clear any existing timer for this key
      if (timersRef.current[normalized.key]) {
        clearTimeout(timersRef.current[normalized.key]);
      }

      // Auto-dismiss after 6.5 seconds
      timersRef.current[normalized.key] = setTimeout(() => {
        removeNotification(normalized.key);
      }, 6500);
    };

    window.addEventListener('jira-ticket-allocated', handleTicketAllocated);
    return () => {
      window.removeEventListener('jira-ticket-allocated', handleTicketAllocated);
      Object.values(timersRef.current).forEach(t => clearTimeout(t));
    };
  }, [removeNotification]);

  if (notifications.length === 0) return null;

  return (
    <aside
      className="fixed top-20 right-4 sm:right-6 z-[9998] flex flex-col gap-2.5 max-w-sm sm:max-w-md w-full pointer-events-none"
      aria-label="Jira Ticket Notifications"
    >
      <AnimatePresence>
        {notifications.map((item) => (
          <motion.div
            key={item.key}
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: 50, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="pointer-events-auto bg-card border-2 border-[#34A853]/40 shadow-[0_10px_30px_rgba(0,0,0,0.18),4px_4px_0px_0px_rgba(52,168,83,0.2)] rounded-xl p-3.5 sm:p-4 text-foreground backdrop-blur-md relative overflow-hidden"
            role="alert"
            aria-live="polite"
          >
            {/* Top Accent Stripe */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#34A853] via-[#4285F4] to-[#7E57C2]" />

            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-[#E6F4EA] border border-[#34A853]/30 text-[#137333] shrink-0">
                  <Ticket className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-[#137333]">
                      New Jira Ticket Added
                    </span>
                    <span className="w-1.5 h-1.5 rounded-full bg-[#34A853] animate-pulse" />
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="px-1.5 py-0.5 rounded bg-[#E8F0FE] text-[#1A73E8] border border-[#4285F4]/30 font-mono font-bold text-xs">
                      {item.key}
                    </span>
                    <span className="text-[11px] font-sans text-muted-foreground font-medium">
                      Status: <strong className="text-foreground">{item.status}</strong>
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => removeNotification(item.key)}
                className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                aria-label="Dismiss notification"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Ticket Summary */}
            <p className="mt-2 text-xs sm:text-sm font-sans font-medium text-foreground line-clamp-2">
              {item.summary}
            </p>

            {/* Metadata Footer */}
            <div className="mt-2.5 pt-2 border-t border-border/60 flex items-center justify-between text-xs font-sans">
              <div className="flex items-center gap-1.5 text-muted-foreground truncate">
                <User className="w-3.5 h-3.5 text-[#4285F4] shrink-0" />
                <span className="truncate">
                  Allocated to: <strong className="text-foreground font-semibold">{item.assignee}</strong>
                  {item.assigneeRole && <span className="text-muted-foreground"> ({item.assigneeRole})</span>}
                </span>
              </div>

              {item.priority && (
                <span className={`text-[10px] font-sans font-bold px-1.5 py-0.5 rounded shrink-0 border ${
                  item.priority.toLowerCase() === 'high' || item.priority.toLowerCase() === 'critical' || item.priority.toLowerCase() === 'highest'
                    ? 'bg-[#FCE8E6] text-[#C5221F] border-[#EA4335]/30'
                    : 'bg-[#FEF7E0] text-[#8C6D00] border-[#FBBC05]/30'
                }`}>
                  {item.priority}
                </span>
              )}
            </div>

            {/* Quick action to overview */}
            {onNavigateToOverview && (
              <div className="mt-2 flex justify-end">
                <button
                  onClick={() => {
                    removeNotification(item.key);
                    onNavigateToOverview();
                  }}
                  className="inline-flex items-center gap-1 text-[11px] font-sans font-semibold text-[#1A73E8] hover:underline cursor-pointer"
                >
                  <span>View in Overview</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </aside>
  );
};

export default JiraTicketNotification;
