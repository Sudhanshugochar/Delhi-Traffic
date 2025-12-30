import { TrafficStatus } from '@/lib/trafficData';
import { cn } from '@/lib/utils';

interface TrafficBadgeProps {
  status: TrafficStatus;
  showLabel?: boolean;
}

const statusConfig = {
  low: {
    label: 'Low Traffic',
    className: 'bg-traffic-low/20 text-traffic-low border border-traffic-low/30',
  },
  medium: {
    label: 'Medium',
    className: 'bg-traffic-medium/20 text-traffic-medium border border-traffic-medium/30',
  },
  high: {
    label: 'Congested',
    className: 'bg-traffic-high/20 text-traffic-high border border-traffic-high/30',
  },
};

export function TrafficBadge({ status, showLabel = true }: TrafficBadgeProps) {
  const config = statusConfig[status];
  
  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
      config.className
    )}>
      <span className={cn(
        "w-1.5 h-1.5 rounded-full",
        status === 'low' && "bg-traffic-low",
        status === 'medium' && "bg-traffic-medium",
        status === 'high' && "bg-traffic-high animate-pulse"
      )} />
      {showLabel && config.label}
    </span>
  );
}
