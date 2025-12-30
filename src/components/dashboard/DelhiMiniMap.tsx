import { motion } from 'framer-motion';
import { delhiRoads, RoadData } from '@/lib/trafficData';
import { cn } from '@/lib/utils';

interface DelhiMiniMapProps {
  roads: RoadData[];
}

// Simplified Delhi zones for visualization
const zones = [
  { id: 'north', name: 'North Delhi', x: 50, y: 20, width: 100, height: 60 },
  { id: 'west', name: 'West Delhi', x: 10, y: 50, width: 70, height: 80 },
  { id: 'central', name: 'Central Delhi', x: 60, y: 60, width: 80, height: 60 },
  { id: 'east', name: 'East Delhi', x: 130, y: 50, width: 70, height: 80 },
  { id: 'south', name: 'South Delhi', x: 50, y: 110, width: 100, height: 70 },
];

export function DelhiMiniMap({ roads }: DelhiMiniMapProps) {
  const getZoneCongestion = (zoneName: string) => {
    const zoneRoads = roads.filter(
      (r) => r.zone.toLowerCase() === zoneName.toLowerCase()
    );
    if (zoneRoads.length === 0) return 'low';
    
    const highCount = zoneRoads.filter((r) => r.status === 'high').length;
    const mediumCount = zoneRoads.filter((r) => r.status === 'medium').length;
    
    if (highCount > mediumCount) return 'high';
    if (mediumCount > 0) return 'medium';
    return 'low';
  };

  return (
    <div className="glass-card p-6">
      <h3 className="text-lg font-semibold mb-4">Delhi Zone Overview</h3>
      
      <div className="relative aspect-square max-w-[300px] mx-auto">
        <svg viewBox="0 0 200 200" className="w-full h-full">
          {/* Background grid */}
          <defs>
            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-border/30" />
            </pattern>
          </defs>
          <rect width="200" height="200" fill="url(#grid)" />
          
          {/* Zones */}
          {zones.map((zone) => {
            const congestion = getZoneCongestion(zone.name.split(' ')[0]);
            return (
              <motion.g key={zone.id}>
                <motion.rect
                  x={zone.x}
                  y={zone.y}
                  width={zone.width}
                  height={zone.height}
                  rx="8"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: zones.indexOf(zone) * 0.1 }}
                  className={cn(
                    "transition-colors duration-500",
                    congestion === 'low' && "fill-traffic-low/30 stroke-traffic-low",
                    congestion === 'medium' && "fill-traffic-medium/30 stroke-traffic-medium",
                    congestion === 'high' && "fill-traffic-high/30 stroke-traffic-high"
                  )}
                  strokeWidth="2"
                />
                <text
                  x={zone.x + zone.width / 2}
                  y={zone.y + zone.height / 2}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="fill-foreground text-[8px] font-medium"
                >
                  {zone.name.split(' ')[0]}
                </text>
              </motion.g>
            );
          })}
          
          {/* Center dot for reference */}
          <circle cx="100" cy="90" r="4" className="fill-primary" />
          <text x="100" y="100" textAnchor="middle" className="fill-muted-foreground text-[6px]">
            India Gate
          </text>
        </svg>
      </div>
      
      {/* Legend */}
      <div className="flex items-center justify-center gap-4 mt-4 text-xs">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-traffic-low/50" />
          <span className="text-muted-foreground">Low</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-traffic-medium/50" />
          <span className="text-muted-foreground">Medium</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-traffic-high/50" />
          <span className="text-muted-foreground">High</span>
        </div>
      </div>
    </div>
  );
}
