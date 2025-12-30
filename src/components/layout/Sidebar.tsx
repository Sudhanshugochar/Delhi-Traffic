import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Radio, 
  Map, 
  BarChart3, 
  Bell, 
  Settings,
  Menu,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/live-traffic', label: 'Live Traffic', icon: Radio },
  { path: '/map', label: 'Delhi Map', icon: Map },
  { path: '/analytics', label: 'Analytics', icon: BarChart3 },
  { path: '/alerts', label: 'Alerts', icon: Bell },
  { path: '/settings', label: 'Settings', icon: Settings },
];

export function Sidebar() {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile Toggle */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="fixed top-4 left-4 z-50 p-2 rounded-lg bg-sidebar text-sidebar-foreground lg:hidden"
      >
        {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileOpen(false)}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ 
          width: isOpen ? 256 : 80,
          x: isMobileOpen ? 0 : (typeof window !== 'undefined' && window.innerWidth < 1024) ? -256 : 0
        }}
        className={cn(
          "fixed left-0 top-0 h-screen bg-sidebar border-r border-sidebar-border z-50",
          "flex flex-col transition-all duration-300",
          "lg:relative lg:translate-x-0"
        )}
      >
        {/* Logo */}
        <div className="h-16 flex items-center px-4 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
              <Radio className="w-6 h-6 text-primary" />
            </div>
            <AnimatePresence>
              {isOpen && (
                <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  className="overflow-hidden"
                >
                  <h1 className="font-bold text-lg text-foreground whitespace-nowrap">Delhi Traffic</h1>
                  <p className="text-xs text-muted-foreground whitespace-nowrap">Control Center</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-6 px-3 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setIsMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200",
                  "hover:bg-sidebar-accent",
                  isActive && "bg-primary/10 text-primary border-l-2 border-primary"
                )}
              >
                <item.icon className={cn(
                  "w-5 h-5 flex-shrink-0",
                  isActive ? "text-primary" : "text-sidebar-foreground"
                )} />
                <AnimatePresence>
                  {isOpen && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }}
                      className={cn(
                        "font-medium whitespace-nowrap overflow-hidden",
                        isActive ? "text-primary" : "text-sidebar-foreground"
                      )}
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </NavLink>
            );
          })}
        </nav>

        {/* Toggle Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="hidden lg:flex items-center justify-center p-3 border-t border-sidebar-border text-sidebar-foreground hover:text-foreground transition-colors"
        >
          <Menu className={cn("w-5 h-5 transition-transform", !isOpen && "rotate-180")} />
        </button>
      </motion.aside>
    </>
  );
}
