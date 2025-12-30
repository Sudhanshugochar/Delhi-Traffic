// Simulated real-time traffic data for Delhi roads

export type TrafficStatus = 'low' | 'medium' | 'high';

export interface RoadData {
  id: string;
  name: string;
  zone: 'North' | 'South' | 'East' | 'West' | 'Central';
  avgSpeed: number;
  vehicleCount: number;
  status: TrafficStatus;
  lastUpdated: Date;
  coordinates: { lat: number; lng: number };
}

export interface Alert {
  id: string;
  type: 'Accident' | 'Heavy Congestion' | 'Sudden Slowdown' | 'Road Work';
  severity: 'Low' | 'Medium' | 'High';
  roadName: string;
  timestamp: Date;
  acknowledged: boolean;
  description: string;
}

export interface TrafficForecast {
  time: string;
  congestionIndex: number;
  predictedSpeed: number;
}

// Delhi major roads data
export const delhiRoads: RoadData[] = [
  { id: '1', name: 'Ring Road', zone: 'Central', avgSpeed: 35, vehicleCount: 4500, status: 'medium', lastUpdated: new Date(), coordinates: { lat: 28.6139, lng: 77.2090 } },
  { id: '2', name: 'NH-48 (Delhi-Gurgaon)', zone: 'South', avgSpeed: 45, vehicleCount: 5200, status: 'low', lastUpdated: new Date(), coordinates: { lat: 28.4817, lng: 77.1025 } },
  { id: '3', name: 'Connaught Place', zone: 'Central', avgSpeed: 15, vehicleCount: 2100, status: 'high', lastUpdated: new Date(), coordinates: { lat: 28.6304, lng: 77.2177 } },
  { id: '4', name: 'Outer Ring Road', zone: 'North', avgSpeed: 55, vehicleCount: 3800, status: 'low', lastUpdated: new Date(), coordinates: { lat: 28.7041, lng: 77.1025 } },
  { id: '5', name: 'Vikas Marg', zone: 'East', avgSpeed: 25, vehicleCount: 2800, status: 'medium', lastUpdated: new Date(), coordinates: { lat: 28.6289, lng: 77.2769 } },
  { id: '6', name: 'Lajpat Nagar', zone: 'South', avgSpeed: 18, vehicleCount: 1900, status: 'high', lastUpdated: new Date(), coordinates: { lat: 28.5677, lng: 77.2433 } },
  { id: '7', name: 'Karol Bagh', zone: 'Central', avgSpeed: 22, vehicleCount: 2300, status: 'medium', lastUpdated: new Date(), coordinates: { lat: 28.6514, lng: 77.1907 } },
  { id: '8', name: 'Rohini Sector 7', zone: 'North', avgSpeed: 48, vehicleCount: 1600, status: 'low', lastUpdated: new Date(), coordinates: { lat: 28.7186, lng: 77.1066 } },
  { id: '9', name: 'Dwarka Sector 21', zone: 'West', avgSpeed: 52, vehicleCount: 2100, status: 'low', lastUpdated: new Date(), coordinates: { lat: 28.5523, lng: 77.0584 } },
  { id: '10', name: 'Mayur Vihar', zone: 'East', avgSpeed: 28, vehicleCount: 2600, status: 'medium', lastUpdated: new Date(), coordinates: { lat: 28.6086, lng: 77.2940 } },
  { id: '11', name: 'Chandni Chowk', zone: 'Central', avgSpeed: 12, vehicleCount: 1800, status: 'high', lastUpdated: new Date(), coordinates: { lat: 28.6506, lng: 77.2303 } },
  { id: '12', name: 'Janpath', zone: 'Central', avgSpeed: 20, vehicleCount: 2400, status: 'medium', lastUpdated: new Date(), coordinates: { lat: 28.6247, lng: 77.2195 } },
  { id: '13', name: 'ITO', zone: 'Central', avgSpeed: 16, vehicleCount: 3200, status: 'high', lastUpdated: new Date(), coordinates: { lat: 28.6280, lng: 77.2410 } },
  { id: '14', name: 'Ashram Chowk', zone: 'South', avgSpeed: 14, vehicleCount: 3800, status: 'high', lastUpdated: new Date(), coordinates: { lat: 28.5700, lng: 77.2536 } },
  { id: '15', name: 'Dhaula Kuan', zone: 'West', avgSpeed: 38, vehicleCount: 4100, status: 'medium', lastUpdated: new Date(), coordinates: { lat: 28.5921, lng: 77.1549 } },
];

// Generate random variation for real-time updates
export function updateRoadData(road: RoadData): RoadData {
  const speedVariation = (Math.random() - 0.5) * 10;
  const vehicleVariation = Math.floor((Math.random() - 0.5) * 500);
  
  const newSpeed = Math.max(5, Math.min(80, road.avgSpeed + speedVariation));
  const newVehicleCount = Math.max(500, road.vehicleCount + vehicleVariation);
  
  let newStatus: TrafficStatus;
  if (newSpeed >= 40) {
    newStatus = 'low';
  } else if (newSpeed >= 20) {
    newStatus = 'medium';
  } else {
    newStatus = 'high';
  }
  
  return {
    ...road,
    avgSpeed: Math.round(newSpeed),
    vehicleCount: newVehicleCount,
    status: newStatus,
    lastUpdated: new Date(),
  };
}

// Generate sample alerts
export function generateAlerts(): Alert[] {
  const alertTypes: Alert['type'][] = ['Accident', 'Heavy Congestion', 'Sudden Slowdown', 'Road Work'];
  const severities: Alert['severity'][] = ['Low', 'Medium', 'High'];
  
  return [
    {
      id: '1',
      type: 'Heavy Congestion',
      severity: 'High',
      roadName: 'Ashram Chowk',
      timestamp: new Date(Date.now() - 5 * 60000),
      acknowledged: false,
      description: 'Severe traffic jam due to peak hour rush. Expected delay: 25 minutes.',
    },
    {
      id: '2',
      type: 'Accident',
      severity: 'Medium',
      roadName: 'Ring Road',
      timestamp: new Date(Date.now() - 15 * 60000),
      acknowledged: false,
      description: 'Minor collision near Moolchand. Two vehicles involved. Clearance in progress.',
    },
    {
      id: '3',
      type: 'Sudden Slowdown',
      severity: 'Low',
      roadName: 'NH-48',
      timestamp: new Date(Date.now() - 30 * 60000),
      acknowledged: true,
      description: 'Traffic slowing down near Rajiv Chowk metro station.',
    },
    {
      id: '4',
      type: 'Road Work',
      severity: 'Medium',
      roadName: 'Outer Ring Road',
      timestamp: new Date(Date.now() - 45 * 60000),
      acknowledged: false,
      description: 'Lane closure for road repairs. Expected completion: 2 hours.',
    },
    {
      id: '5',
      type: 'Heavy Congestion',
      severity: 'High',
      roadName: 'Chandni Chowk',
      timestamp: new Date(Date.now() - 60 * 60000),
      acknowledged: false,
      description: 'Market area congestion. Recommend alternate routes via Kashmere Gate.',
    },
  ];
}

// Generate speed trend data
export function generateSpeedTrend(minutes: number = 10): { time: string; speed: number }[] {
  const data = [];
  const now = new Date();
  
  for (let i = minutes; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 60000);
    data.push({
      time: time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      speed: Math.round(25 + Math.random() * 20),
    });
  }
  
  return data;
}

// Generate vehicle count trend
export function generateVehicleTrend(minutes: number = 10): { time: string; count: number }[] {
  const data = [];
  const now = new Date();
  
  for (let i = minutes; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 60000);
    data.push({
      time: time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      count: Math.round(2000 + Math.random() * 3000),
    });
  }
  
  return data;
}

// Generate hourly traffic data
export function generateHourlyTraffic(): { hour: string; congestion: number; vehicles: number }[] {
  const hours = [];
  for (let i = 0; i < 24; i++) {
    const hour = i.toString().padStart(2, '0') + ':00';
    // Simulate rush hours
    let congestion;
    if (i >= 8 && i <= 10) {
      congestion = 70 + Math.random() * 25;
    } else if (i >= 17 && i <= 20) {
      congestion = 75 + Math.random() * 20;
    } else if (i >= 1 && i <= 5) {
      congestion = 10 + Math.random() * 15;
    } else {
      congestion = 30 + Math.random() * 30;
    }
    
    hours.push({
      hour,
      congestion: Math.round(congestion),
      vehicles: Math.round(congestion * 50 + Math.random() * 500),
    });
  }
  return hours;
}

// Generate zone-wise data
export function generateZoneData(): { zone: string; congestion: number; avgSpeed: number }[] {
  return [
    { zone: 'North', congestion: Math.round(40 + Math.random() * 20), avgSpeed: Math.round(35 + Math.random() * 15) },
    { zone: 'South', congestion: Math.round(50 + Math.random() * 25), avgSpeed: Math.round(30 + Math.random() * 15) },
    { zone: 'East', congestion: Math.round(45 + Math.random() * 20), avgSpeed: Math.round(32 + Math.random() * 15) },
    { zone: 'West', congestion: Math.round(35 + Math.random() * 25), avgSpeed: Math.round(40 + Math.random() * 15) },
    { zone: 'Central', congestion: Math.round(65 + Math.random() * 25), avgSpeed: Math.round(20 + Math.random() * 15) },
  ];
}

// Generate forecast data
export function generateForecast(): TrafficForecast[] {
  return [
    { time: '+15 min', congestionIndex: Math.round(55 + Math.random() * 20), predictedSpeed: Math.round(28 + Math.random() * 10) },
    { time: '+30 min', congestionIndex: Math.round(50 + Math.random() * 25), predictedSpeed: Math.round(30 + Math.random() * 12) },
    { time: '+60 min', congestionIndex: Math.round(45 + Math.random() * 30), predictedSpeed: Math.round(35 + Math.random() * 15) },
  ];
}

// Calculate KPIs
export function calculateKPIs(roads: RoadData[]) {
  const avgSpeed = Math.round(roads.reduce((sum, road) => sum + road.avgSpeed, 0) / roads.length);
  const congestedCount = roads.filter(road => road.status === 'high').length;
  const severityIndex = Math.round(100 - (avgSpeed / 60) * 100);
  
  return {
    avgSpeed,
    congestedCount,
    severityIndex: Math.min(100, Math.max(0, severityIndex)),
  };
}
