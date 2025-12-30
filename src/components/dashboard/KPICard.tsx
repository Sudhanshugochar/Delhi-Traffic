import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface KPICardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  status?: 'normal' | 'warning' | 'critical';
  suffix?: string;
}

export function KPICard({ title, value, icon: Icon, trend, status = 'normal', suffix }: KPICardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "glass-card p-6 relative overflow-hidden",
        status === 'critical' && "pulse-critical border-traffic-high/50",
        status === 'warning' && "border-traffic-medium/50"
      )}
    >
      {/* Background glow */}
      <div className={cn(
        "absolute -right-8 -top-8 w-32 h-32 rounded-full blur-3xl opacity-20",
        status === 'critical' && "bg-traffic-high",
        status === 'warning' && "bg-traffic-medium",
        status === 'normal' && "bg-primary"
      )} />

      <div className="relative">
        <div className="flex items-start justify-between mb-4">
          <div className={cn(
            "p-3 rounded-xl",
            status === 'critical' && "bg-traffic-high/20",
            status === 'warning' && "bg-traffic-medium/20",
            status === 'normal' && "bg-primary/20"
          )}>
            <Icon className={cn(
              "w-6 h-6",
              status === 'critical' && "text-traffic-high",
              status === 'warning' && "text-traffic-medium",
              status === 'normal' && "text-primary"
            )} />
          </div>
          {trend && (
            <div className={cn(
              "flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full",
              trend.isPositive ? "bg-traffic-low/20 text-traffic-low" : "bg-traffic-high/20 text-traffic-high"
            )}>
              <span>{trend.isPositive ? '↑' : '↓'}</span>
              <span>{Math.abs(trend.value)}%</span>
            </div>
          )}
        </div>

        <div className="space-y-1">
          <motion.div 
            key={value}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-baseline gap-1"
          >
            <span className="kpi-value">{value}</span>
            {suffix && <span className="text-lg text-muted-foreground">{suffix}</span>}
          </motion.div>
          <p className="kpi-label">{title}</p>
        </div>
      </div>
    </motion.div>
  );
}
