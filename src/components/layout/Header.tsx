import { Bell, Activity, Clock } from 'lucide-react';
import { useSettings } from '@/context/SettingsContext';
import { Badge } from '@/components/ui/badge';
import { useState, useEffect } from 'react';

export function Header() {
  const { isPaused, alertsEnabled } = useSettings();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="h-16 bg-card/50 backdrop-blur-xl border-b border-border sticky top-0 z-30">
      <div className="h-full px-6 flex items-center justify-between">
        {/* Left side - Status */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isPaused ? 'bg-traffic-medium' : 'bg-traffic-low animate-pulse'}`} />
            <span className="text-sm text-muted-foreground">
              {isPaused ? 'Paused' : 'Live'}
            </span>
          </div>
          <Badge variant="outline" className="gap-1.5 text-xs">
            <Activity className="w-3 h-3" />
            System Online
          </Badge>
        </div>

        {/* Right side - Time and notifications */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span className="text-sm font-medium tabular-nums">
              {currentTime.toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit',
                second: '2-digit',
                hour12: true 
              })}
            </span>
            <span className="text-xs">
              {currentTime.toLocaleDateString('en-IN', { 
                day: '2-digit',
                month: 'short',
                year: 'numeric'
              })}
            </span>
          </div>
          
          {alertsEnabled && (
            <button className="relative p-2 rounded-lg hover:bg-muted transition-colors">
              <Bell className="w-5 h-5 text-muted-foreground" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-traffic-high rounded-full animate-pulse" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
