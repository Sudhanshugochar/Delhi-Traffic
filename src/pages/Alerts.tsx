import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Car, Construction, Zap, Check, Filter, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { generateAlerts, Alert } from '@/lib/trafficData';
import { cn } from '@/lib/utils';
import { useSettings } from '@/context/SettingsContext';

const alertIcons = {
  'Accident': AlertTriangle,
  'Heavy Congestion': Car,
  'Sudden Slowdown': Zap,
  'Road Work': Construction,
};

const severityColors = {
  'Low': 'bg-traffic-low/20 text-traffic-low border-traffic-low/30',
  'Medium': 'bg-traffic-medium/20 text-traffic-medium border-traffic-medium/30',
  'High': 'bg-traffic-high/20 text-traffic-high border-traffic-high/30 pulse-critical',
};

const Alerts = () => {
  const { alertsEnabled } = useSettings();
  const [alerts, setAlerts] = useState<Alert[]>(generateAlerts());
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const filteredAlerts = alerts.filter(alert => {
    const matchesSeverity = severityFilter === 'all' || alert.severity === severityFilter;
    const matchesType = typeFilter === 'all' || alert.type === typeFilter;
    return matchesSeverity && matchesType;
  });

  const handleAcknowledge = (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, acknowledged: true } : alert
    ));
  };

  const formatTimeAgo = (date: Date) => {
    const minutes = Math.floor((Date.now() - date.getTime()) / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes} min ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  };

  if (!alertsEnabled) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <AlertTriangle className="w-16 h-16 text-muted-foreground mx-auto" />
          <h2 className="text-2xl font-bold">Alerts Disabled</h2>
          <p className="text-muted-foreground">Enable alerts in Settings to view traffic incidents.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold">Alerts</h1>
          <p className="text-muted-foreground mt-1">Real-time traffic incidents & anomalies</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {alerts.filter(a => !a.acknowledged).length} active
          </span>
        </div>
      </motion.div>

      {/* Filters */}
      <div className="glass-card p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Filter by:</span>
          </div>
          <Select value={severityFilter} onValueChange={setSeverityFilter}>
            <SelectTrigger className="w-full sm:w-[180px] bg-background/50">
              <SelectValue placeholder="All Severities" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Severities</SelectItem>
              <SelectItem value="Low">Low</SelectItem>
              <SelectItem value="Medium">Medium</SelectItem>
              <SelectItem value="High">High</SelectItem>
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-full sm:w-[200px] bg-background/50">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="Accident">Accident</SelectItem>
              <SelectItem value="Heavy Congestion">Heavy Congestion</SelectItem>
              <SelectItem value="Sudden Slowdown">Sudden Slowdown</SelectItem>
              <SelectItem value="Road Work">Road Work</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Alert Timeline */}
      <div className="space-y-4">
        <AnimatePresence>
          {filteredAlerts.map((alert, index) => {
            const Icon = alertIcons[alert.type];
            return (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.05 }}
                className={cn(
                  "glass-card p-5 relative overflow-hidden",
                  alert.acknowledged && "opacity-60"
                )}
              >
                {/* Severity indicator */}
                <div className={cn(
                  "absolute left-0 top-0 bottom-0 w-1",
                  alert.severity === 'High' && "bg-traffic-high",
                  alert.severity === 'Medium' && "bg-traffic-medium",
                  alert.severity === 'Low' && "bg-traffic-low"
                )} />

                <div className="flex items-start gap-4 pl-4">
                  {/* Icon */}
                  <div className={cn(
                    "p-3 rounded-xl flex-shrink-0",
                    alert.severity === 'High' && "bg-traffic-high/20",
                    alert.severity === 'Medium' && "bg-traffic-medium/20",
                    alert.severity === 'Low' && "bg-traffic-low/20"
                  )}>
                    <Icon className={cn(
                      "w-5 h-5",
                      alert.severity === 'High' && "text-traffic-high",
                      alert.severity === 'Medium' && "text-traffic-medium",
                      alert.severity === 'Low' && "text-traffic-low"
                    )} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold">{alert.type}</h3>
                          <span className={cn(
                            "px-2 py-0.5 rounded text-xs font-medium border",
                            severityColors[alert.severity]
                          )}>
                            {alert.severity}
                          </span>
                          {alert.acknowledged && (
                            <span className="px-2 py-0.5 rounded text-xs font-medium bg-muted text-muted-foreground">
                              Acknowledged
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{alert.roadName}</p>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground flex-shrink-0">
                        <Clock className="w-3 h-3" />
                        {formatTimeAgo(alert.timestamp)}
                      </div>
                    </div>

                    <p className="text-sm mt-3">{alert.description}</p>

                    {!alert.acknowledged && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleAcknowledge(alert.id)}
                        className="mt-4"
                      >
                        <Check className="w-4 h-4 mr-2" />
                        Acknowledge
                      </Button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {filteredAlerts.length === 0 && (
          <div className="text-center py-12">
            <Check className="w-12 h-12 text-traffic-low mx-auto mb-4" />
            <p className="text-muted-foreground">No alerts matching your filters</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Alerts;
