import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, X, TrendingUp, Clock, MapPin } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TrafficBadge } from '@/components/dashboard/TrafficBadge';
import { 
  delhiRoads, 
  RoadData, 
  updateRoadData, 
  generateSpeedTrend,
  TrafficStatus 
} from '@/lib/trafficData';
import { useSettings } from '@/context/SettingsContext';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';

const LiveTraffic = () => {
  const { refreshInterval, isPaused } = useSettings();
  const [roads, setRoads] = useState<RoadData[]>(delhiRoads);
  const [searchTerm, setSearchTerm] = useState('');
  const [zoneFilter, setZoneFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedRoad, setSelectedRoad] = useState<RoadData | null>(null);
  const [roadSpeedTrend, setRoadSpeedTrend] = useState<{ time: string; speed: number }[]>([]);

  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setRoads(prev => prev.map(updateRoadData));
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [refreshInterval, isPaused]);

  useEffect(() => {
    if (selectedRoad) {
      setRoadSpeedTrend(generateSpeedTrend(15));
    }
  }, [selectedRoad]);

  const filteredRoads = roads.filter(road => {
    const matchesSearch = road.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesZone = zoneFilter === 'all' || road.zone === zoneFilter;
    const matchesStatus = statusFilter === 'all' || road.status === statusFilter;
    return matchesSearch && matchesZone && matchesStatus;
  });

  const zones = ['North', 'South', 'East', 'West', 'Central'];

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold">Live Traffic</h1>
        <p className="text-muted-foreground mt-1">Real-time road-wise traffic monitoring</p>
      </motion.div>

      {/* Filters */}
      <div className="glass-card p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search road name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-background/50"
            />
          </div>
          <Select value={zoneFilter} onValueChange={setZoneFilter}>
            <SelectTrigger className="w-full md:w-[180px] bg-background/50">
              <SelectValue placeholder="All Zones" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Zones</SelectItem>
              {zones.map(zone => (
                <SelectItem key={zone} value={zone}>{zone} Delhi</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-[180px] bg-background/50">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="low">Low Traffic</SelectItem>
              <SelectItem value="medium">Medium Traffic</SelectItem>
              <SelectItem value="high">High Congestion</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Traffic Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-4 text-muted-foreground font-medium text-sm">Road Name</th>
                <th className="text-left p-4 text-muted-foreground font-medium text-sm">Zone</th>
                <th className="text-left p-4 text-muted-foreground font-medium text-sm">Avg Speed</th>
                <th className="text-left p-4 text-muted-foreground font-medium text-sm">Vehicles</th>
                <th className="text-left p-4 text-muted-foreground font-medium text-sm">Status</th>
                <th className="text-left p-4 text-muted-foreground font-medium text-sm">Last Updated</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {filteredRoads.map((road, index) => (
                  <motion.tr
                    key={road.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => setSelectedRoad(road)}
                    className="border-b border-border/50 hover:bg-muted/30 cursor-pointer transition-colors"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-primary" />
                        <span className="font-medium">{road.name}</span>
                      </div>
                    </td>
                    <td className="p-4 text-muted-foreground">{road.zone} Delhi</td>
                    <td className="p-4">
                      <motion.span 
                        key={road.avgSpeed}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="font-mono font-semibold"
                      >
                        {road.avgSpeed} km/h
                      </motion.span>
                    </td>
                    <td className="p-4 font-mono">{road.vehicleCount.toLocaleString()}</td>
                    <td className="p-4">
                      <TrafficBadge status={road.status} />
                    </td>
                    <td className="p-4 text-muted-foreground text-sm">
                      {road.lastUpdated.toLocaleTimeString()}
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>

      {/* Road Detail Sheet */}
      <Sheet open={!!selectedRoad} onOpenChange={() => setSelectedRoad(null)}>
        <SheetContent className="w-full sm:max-w-lg bg-card border-border">
          {selectedRoad && (
            <>
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary" />
                  {selectedRoad.name}
                </SheetTitle>
              </SheetHeader>

              <div className="mt-6 space-y-6">
                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="glass-card p-4">
                    <p className="text-sm text-muted-foreground">Current Speed</p>
                    <p className="text-2xl font-bold">{selectedRoad.avgSpeed} km/h</p>
                  </div>
                  <div className="glass-card p-4">
                    <p className="text-sm text-muted-foreground">Vehicles</p>
                    <p className="text-2xl font-bold">{selectedRoad.vehicleCount.toLocaleString()}</p>
                  </div>
                </div>

                {/* Status */}
                <div className="glass-card p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Traffic Status</span>
                    <TrafficBadge status={selectedRoad.status} />
                  </div>
                </div>

                {/* Speed Trend */}
                <div className="glass-card p-4">
                  <h4 className="font-semibold mb-4 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Speed Trend (Last 15 min)
                  </h4>
                  <div className="h-[150px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={roadSpeedTrend}>
                        <XAxis 
                          dataKey="time" 
                          stroke="hsl(var(--muted-foreground))" 
                          fontSize={10}
                          tickLine={false}
                        />
                        <YAxis 
                          stroke="hsl(var(--muted-foreground))" 
                          fontSize={10}
                          tickLine={false}
                        />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'hsl(var(--card))', 
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px'
                          }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="speed" 
                          stroke="hsl(var(--primary))" 
                          strokeWidth={2}
                          dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Zone Info */}
                <div className="glass-card p-4">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>Last updated: {selectedRoad.lastUpdated.toLocaleTimeString()}</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default LiveTraffic;
