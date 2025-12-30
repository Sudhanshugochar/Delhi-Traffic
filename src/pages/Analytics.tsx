import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Sun, Moon, BarChart2, Clock } from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  Cell,
  PieChart,
  Pie,
  Legend
} from 'recharts';
import { 
  generateHourlyTraffic, 
  generateZoneData, 
  generateForecast,
  TrafficForecast 
} from '@/lib/trafficData';
import { cn } from '@/lib/utils';

const Analytics = () => {
  const [hourlyData, setHourlyData] = useState(generateHourlyTraffic());
  const [zoneData, setZoneData] = useState(generateZoneData());
  const [forecast, setForecast] = useState<TrafficForecast[]>(generateForecast());

  useEffect(() => {
    const interval = setInterval(() => {
      setForecast(generateForecast());
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // Morning vs Evening comparison
  const morningData = hourlyData.filter((_, i) => i >= 6 && i <= 10);
  const eveningData = hourlyData.filter((_, i) => i >= 17 && i <= 21);
  const morningAvg = Math.round(morningData.reduce((sum, d) => sum + d.congestion, 0) / morningData.length);
  const eveningAvg = Math.round(eveningData.reduce((sum, d) => sum + d.congestion, 0) / eveningData.length);

  const comparisonData = [
    { name: 'Morning Rush', value: morningAvg, fill: 'hsl(var(--traffic-medium))' },
    { name: 'Evening Rush', value: eveningAvg, fill: 'hsl(var(--traffic-high))' },
  ];

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold">Analytics</h1>
        <p className="text-muted-foreground mt-1">Traffic insights and predictions</p>
      </motion.div>

      {/* Forecast Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {forecast.map((item, index) => (
          <motion.div
            key={item.time}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="glass-card p-6"
          >
            <div className="flex items-center gap-2 text-muted-foreground mb-4">
              <Clock className="w-4 h-4" />
              <span className="text-sm font-medium">Forecast {item.time}</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-3xl font-bold">{item.congestionIndex}%</p>
                <p className="text-xs text-muted-foreground">Congestion Index</p>
              </div>
              <div>
                <p className="text-3xl font-bold">{item.predictedSpeed}</p>
                <p className="text-xs text-muted-foreground">km/h Avg Speed</p>
              </div>
            </div>
            <div className="mt-4 h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className={cn(
                  "h-full rounded-full transition-all duration-500",
                  item.congestionIndex > 70 ? "bg-traffic-high" :
                  item.congestionIndex > 50 ? "bg-traffic-medium" : "bg-traffic-low"
                )}
                style={{ width: `${item.congestionIndex}%` }}
              />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Hourly Trends */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-card p-6"
      >
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary" />
          24-Hour Traffic Pattern
        </h3>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={hourlyData}>
              <defs>
                <linearGradient id="congestionGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="hour" 
                stroke="hsl(var(--muted-foreground))" 
                fontSize={11}
                tickLine={false}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))" 
                fontSize={11}
                tickLine={false}
                domain={[0, 100]}
                unit="%"
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  color: 'hsl(var(--foreground))'
                }}
              />
              <Area 
                type="monotone" 
                dataKey="congestion" 
                stroke="hsl(var(--primary))" 
                strokeWidth={2}
                fill="url(#congestionGradient)"
                name="Congestion %"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Morning vs Evening */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card p-6"
        >
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Sun className="w-5 h-5 text-traffic-medium" />
            <Moon className="w-5 h-5 text-primary" />
            Rush Hour Comparison
          </h3>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparisonData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" domain={[0, 100]} stroke="hsl(var(--muted-foreground))" fontSize={11} />
                <YAxis type="category" dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={11} width={100} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {comparisonData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-4 text-center">
            <div className="bg-traffic-medium/10 rounded-lg p-3">
              <p className="text-2xl font-bold text-traffic-medium">{morningAvg}%</p>
              <p className="text-xs text-muted-foreground">Morning (6AM - 10AM)</p>
            </div>
            <div className="bg-traffic-high/10 rounded-lg p-3">
              <p className="text-2xl font-bold text-traffic-high">{eveningAvg}%</p>
              <p className="text-xs text-muted-foreground">Evening (5PM - 9PM)</p>
            </div>
          </div>
        </motion.div>

        {/* Zone-wise Heatmap */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card p-6"
        >
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-primary" />
            Zone-wise Congestion
          </h3>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={zoneData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="zone" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} domain={[0, 100]} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="congestion" name="Congestion %" radius={[4, 4, 0, 0]}>
                  {zoneData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={
                        entry.congestion > 60 ? 'hsl(var(--traffic-high))' :
                        entry.congestion > 40 ? 'hsl(var(--traffic-medium))' :
                        'hsl(var(--traffic-low))'
                      } 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 flex items-center justify-center gap-6 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-traffic-low" />
              <span className="text-muted-foreground">&lt;40% Low</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-traffic-medium" />
              <span className="text-muted-foreground">40-60% Medium</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-traffic-high" />
              <span className="text-muted-foreground">&gt;60% High</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Analytics;
