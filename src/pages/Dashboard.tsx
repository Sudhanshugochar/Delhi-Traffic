import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Gauge, AlertTriangle, Car, Activity } from 'lucide-react';
import { KPICard } from '@/components/dashboard/KPICard';
import { DelhiMiniMap } from '@/components/dashboard/DelhiMiniMap';
import { SpeedChart, VehicleChart } from '@/components/dashboard/TrafficCharts';
import { 
  delhiRoads, 
  RoadData, 
  updateRoadData, 
  generateSpeedTrend, 
  generateVehicleTrend,
  calculateKPIs,
  generateAlerts 
} from '@/lib/trafficData';
import { useSettings } from '@/context/SettingsContext';

const Dashboard = () => {
  const { refreshInterval, isPaused } = useSettings();
  const [roads, setRoads] = useState<RoadData[]>(delhiRoads);
  const [speedData, setSpeedData] = useState(generateSpeedTrend());
  const [vehicleData, setVehicleData] = useState(generateVehicleTrend());
  const [alertCount, setAlertCount] = useState(generateAlerts().filter(a => !a.acknowledged).length);

  const kpis = calculateKPIs(roads);

  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setRoads(prev => prev.map(updateRoadData));
      setSpeedData(generateSpeedTrend());
      setVehicleData(generateVehicleTrend());
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [refreshInterval, isPaused]);

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold">Traffic Dashboard</h1>
        <p className="text-muted-foreground mt-1">Real-time overview of Delhi traffic conditions</p>
      </motion.div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Average Speed (Delhi)"
          value={kpis.avgSpeed}
          suffix="km/h"
          icon={Gauge}
          trend={{ value: 5, isPositive: true }}
          status={kpis.avgSpeed < 20 ? 'critical' : kpis.avgSpeed < 35 ? 'warning' : 'normal'}
        />
        <KPICard
          title="Congested Roads"
          value={kpis.congestedCount}
          icon={AlertTriangle}
          status={kpis.congestedCount > 5 ? 'critical' : kpis.congestedCount > 3 ? 'warning' : 'normal'}
        />
        <KPICard
          title="Active Alerts"
          value={alertCount}
          icon={Activity}
          status={alertCount > 3 ? 'critical' : alertCount > 1 ? 'warning' : 'normal'}
        />
        <KPICard
          title="Traffic Severity Index"
          value={kpis.severityIndex}
          suffix="%"
          icon={Car}
          trend={{ value: 3, isPositive: false }}
          status={kpis.severityIndex > 70 ? 'critical' : kpis.severityIndex > 50 ? 'warning' : 'normal'}
        />
      </div>

      {/* Charts and Map */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <SpeedChart data={speedData} />
          <VehicleChart data={vehicleData} />
        </div>
        <div>
          <DelhiMiniMap roads={roads} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
