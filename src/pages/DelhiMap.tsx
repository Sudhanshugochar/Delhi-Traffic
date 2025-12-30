import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, ZoomIn, ZoomOut, Crosshair } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TrafficBadge } from '@/components/dashboard/TrafficBadge';
import { delhiRoads, RoadData, updateRoadData } from '@/lib/trafficData';
import { useSettings } from '@/context/SettingsContext';
import { cn } from '@/lib/utils';

const DelhiMap = () => {
  const { refreshInterval, isPaused } = useSettings();
  const [roads, setRoads] = useState<RoadData[]>(delhiRoads);
  const [zoom, setZoom] = useState(1);
  const [hoveredRoad, setHoveredRoad] = useState<RoadData | null>(null);
  const [selectedRoad, setSelectedRoad] = useState<RoadData | null>(null);

  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setRoads(prev => prev.map(updateRoadData));
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [refreshInterval, isPaused]);

  // Calculate positions for roads on the map
  const getPosition = (road: RoadData) => {
    const zonePositions: Record<string, { baseX: number; baseY: number }> = {
      North: { baseX: 50, baseY: 15 },
      South: { baseX: 50, baseY: 75 },
      East: { baseX: 80, baseY: 45 },
      West: { baseX: 20, baseY: 45 },
      Central: { baseX: 50, baseY: 45 },
    };

    const base = zonePositions[road.zone];
    const offset = (parseInt(road.id) % 3) * 8 - 8;
    
    return {
      x: base.baseX + offset + (Math.random() - 0.5) * 10,
      y: base.baseY + offset + (Math.random() - 0.5) * 10,
    };
  };

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold">Delhi Map</h1>
          <p className="text-muted-foreground mt-1">Interactive traffic visualization</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => setZoom(z => Math.max(0.5, z - 0.25))}>
            <ZoomOut className="w-4 h-4" />
          </Button>
          <span className="text-sm font-mono w-12 text-center">{Math.round(zoom * 100)}%</span>
          <Button variant="outline" size="icon" onClick={() => setZoom(z => Math.min(2, z + 0.25))}>
            <ZoomIn className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={() => setZoom(1)}>
            <Crosshair className="w-4 h-4" />
          </Button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Map Area */}
        <div className="lg:col-span-3 glass-card p-4 overflow-hidden">
          <div 
            className="relative w-full aspect-[4/3] bg-background/50 rounded-xl overflow-hidden"
            style={{ transform: `scale(${zoom})`, transformOrigin: 'center' }}
          >
            {/* Grid background */}
            <svg className="absolute inset-0 w-full h-full">
              <defs>
                <pattern id="mapGrid" width="5%" height="5%" patternUnits="userSpaceOnUse">
                  <path d="M 100 0 L 0 0 0 100" fill="none" stroke="hsl(var(--border))" strokeWidth="0.5" opacity="0.3" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#mapGrid)" />
              
              {/* Zone labels */}
              <text x="50%" y="10%" textAnchor="middle" className="fill-muted-foreground text-xs font-medium">NORTH DELHI</text>
              <text x="50%" y="90%" textAnchor="middle" className="fill-muted-foreground text-xs font-medium">SOUTH DELHI</text>
              <text x="10%" y="50%" textAnchor="middle" className="fill-muted-foreground text-xs font-medium" transform="rotate(-90, 50, 200)">WEST</text>
              <text x="90%" y="50%" textAnchor="middle" className="fill-muted-foreground text-xs font-medium" transform="rotate(90, 450, 200)">EAST</text>
              <text x="50%" y="50%" textAnchor="middle" className="fill-primary text-sm font-bold">CENTRAL DELHI</text>

              {/* Ring Road representation */}
              <ellipse 
                cx="50%" cy="50%" rx="35%" ry="35%" 
                fill="none" 
                stroke="hsl(var(--muted-foreground))" 
                strokeWidth="2"
                strokeDasharray="8 4"
                opacity="0.3"
              />
            </svg>

            {/* Road markers */}
            {roads.map((road) => {
              const pos = getPosition(road);
              return (
                <motion.div
                  key={road.id}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className={cn(
                    "absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-300",
                    (hoveredRoad?.id === road.id || selectedRoad?.id === road.id) && "z-10"
                  )}
                  style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                  onMouseEnter={() => setHoveredRoad(road)}
                  onMouseLeave={() => setHoveredRoad(null)}
                  onClick={() => setSelectedRoad(road)}
                >
                  {/* Pulsing circle for high congestion */}
                  {road.status === 'high' && (
                    <div className="absolute inset-0 w-8 h-8 -ml-2 -mt-2 rounded-full bg-traffic-high/30 animate-ping" />
                  )}
                  
                  <div className={cn(
                    "w-4 h-4 rounded-full border-2 transition-transform",
                    road.status === 'low' && "bg-traffic-low border-traffic-low",
                    road.status === 'medium' && "bg-traffic-medium border-traffic-medium",
                    road.status === 'high' && "bg-traffic-high border-traffic-high",
                    (hoveredRoad?.id === road.id || selectedRoad?.id === road.id) && "scale-150"
                  )} />

                  {/* Tooltip */}
                  {(hoveredRoad?.id === road.id) && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 p-3 glass-card min-w-[180px] text-sm z-20"
                    >
                      <p className="font-semibold">{road.name}</p>
                      <p className="text-muted-foreground text-xs">{road.zone} Delhi</p>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-xs">Speed: {road.avgSpeed} km/h</span>
                        <TrafficBadge status={road.status} showLabel={false} />
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-6 mt-4 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-traffic-low" />
              <span className="text-muted-foreground">Low Traffic (40+ km/h)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-traffic-medium" />
              <span className="text-muted-foreground">Medium (20-40 km/h)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-traffic-high animate-pulse" />
              <span className="text-muted-foreground">Congested (&lt;20 km/h)</span>
            </div>
          </div>
        </div>

        {/* Detail Panel */}
        <div className="space-y-4">
          <div className="glass-card p-4">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary" />
              {selectedRoad ? 'Road Details' : 'Select a Road'}
            </h3>

            {selectedRoad ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-4"
              >
                <div>
                  <h4 className="text-lg font-bold">{selectedRoad.name}</h4>
                  <p className="text-sm text-muted-foreground">{selectedRoad.zone} Delhi</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-background/50 rounded-lg p-3">
                    <p className="text-xs text-muted-foreground">Speed</p>
                    <p className="text-xl font-bold">{selectedRoad.avgSpeed}</p>
                    <p className="text-xs text-muted-foreground">km/h</p>
                  </div>
                  <div className="bg-background/50 rounded-lg p-3">
                    <p className="text-xs text-muted-foreground">Vehicles</p>
                    <p className="text-xl font-bold">{(selectedRoad.vehicleCount / 1000).toFixed(1)}k</p>
                    <p className="text-xs text-muted-foreground">count</p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <TrafficBadge status={selectedRoad.status} />
                </div>

                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => setSelectedRoad(null)}
                >
                  Clear Selection
                </Button>
              </motion.div>
            ) : (
              <p className="text-muted-foreground text-sm">
                Click on any road marker on the map to view detailed traffic information.
              </p>
            )}
          </div>

          {/* Road List */}
          <div className="glass-card p-4">
            <h3 className="font-semibold mb-3 text-sm">All Roads</h3>
            <div className="space-y-2 max-h-[300px] overflow-auto">
              {roads.map(road => (
                <button
                  key={road.id}
                  onClick={() => setSelectedRoad(road)}
                  className={cn(
                    "w-full flex items-center justify-between p-2 rounded-lg text-left transition-colors text-sm",
                    "hover:bg-muted/50",
                    selectedRoad?.id === road.id && "bg-primary/10"
                  )}
                >
                  <span className="truncate">{road.name}</span>
                  <TrafficBadge status={road.status} showLabel={false} />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DelhiMap;
