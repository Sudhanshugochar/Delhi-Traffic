import { motion } from 'framer-motion';
import { Sun, Moon, Palette, Bell, RefreshCw, Play, Pause, RotateCcw, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { useSettings, AccentColor, ThemeMode } from '@/context/SettingsContext';
import { cn } from '@/lib/utils';

const accentOptions: { color: AccentColor; label: string; hsl: string }[] = [
  { color: 'blue', label: 'Blue', hsl: 'hsl(217, 91%, 60%)' },
  { color: 'green', label: 'Green', hsl: 'hsl(142, 71%, 45%)' },
  { color: 'purple', label: 'Purple', hsl: 'hsl(258, 90%, 66%)' },
  { color: 'orange', label: 'Orange', hsl: 'hsl(25, 95%, 53%)' },
];

const refreshOptions = [
  { value: 5000, label: '5 seconds' },
  { value: 10000, label: '10 seconds' },
  { value: 30000, label: '30 seconds' },
];

const Settings = () => {
  const {
    theme,
    setTheme,
    accentColor,
    setAccentColor,
    alertsEnabled,
    setAlertsEnabled,
    congestionThreshold,
    setCongestionThreshold,
    refreshInterval,
    setRefreshInterval,
    isPaused,
    setIsPaused,
  } = useSettings();

  const handleReset = () => {
    setTheme('dark');
    setAccentColor('blue');
    setAlertsEnabled(true);
    setCongestionThreshold(70);
    setRefreshInterval(5000);
    setIsPaused(false);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Page Title */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-1">Customize your dashboard experience</p>
      </motion.div>

      {/* Theme Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card p-6"
      >
        <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
          <Palette className="w-5 h-5 text-primary" />
          Theme Settings
        </h2>

        <div className="space-y-6">
          {/* Dark/Light Mode */}
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base">Appearance</Label>
              <p className="text-sm text-muted-foreground">Switch between light and dark mode</p>
            </div>
            <div className="flex items-center gap-2 bg-muted p-1 rounded-lg">
              <button
                onClick={() => setTheme('light')}
                className={cn(
                  "p-2 rounded-md transition-colors",
                  theme === 'light' ? "bg-background shadow" : "hover:bg-background/50"
                )}
              >
                <Sun className="w-5 h-5" />
              </button>
              <button
                onClick={() => setTheme('dark')}
                className={cn(
                  "p-2 rounded-md transition-colors",
                  theme === 'dark' ? "bg-background shadow" : "hover:bg-background/50"
                )}
              >
                <Moon className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Accent Color */}
          <div>
            <Label className="text-base">Accent Color</Label>
            <p className="text-sm text-muted-foreground mb-3">Choose your preferred accent color</p>
            <div className="flex items-center gap-3">
              {accentOptions.map((option) => (
                <button
                  key={option.color}
                  onClick={() => setAccentColor(option.color)}
                  className={cn(
                    "w-10 h-10 rounded-full transition-transform relative",
                    accentColor === option.color && "ring-2 ring-offset-2 ring-offset-background scale-110"
                  )}
                  style={{ 
                    backgroundColor: option.hsl,
                    boxShadow: accentColor === option.color ? `0 0 20px ${option.hsl}` : 'none'
                  }}
                >
                  {accentColor === option.color && (
                    <Check className="w-5 h-5 text-white absolute inset-0 m-auto" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Live Preview */}
          <div className="p-4 rounded-lg bg-background/50 border border-border">
            <p className="text-sm text-muted-foreground mb-3">Live Preview</p>
            <div className="flex items-center gap-4">
              <Button>Primary Button</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="secondary">Secondary</Button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Alert Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-card p-6"
      >
        <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
          <Bell className="w-5 h-5 text-primary" />
          Alert Settings
        </h2>

        <div className="space-y-6">
          {/* Enable Alerts */}
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base">Enable Alerts</Label>
              <p className="text-sm text-muted-foreground">Show traffic incident notifications</p>
            </div>
            <Switch
              checked={alertsEnabled}
              onCheckedChange={setAlertsEnabled}
            />
          </div>

          {/* Congestion Threshold */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <Label className="text-base">Congestion Threshold</Label>
                <p className="text-sm text-muted-foreground">Alert when congestion exceeds this level</p>
              </div>
              <span className="text-2xl font-bold text-primary">{congestionThreshold}%</span>
            </div>
            <Slider
              value={[congestionThreshold]}
              onValueChange={([value]) => setCongestionThreshold(value)}
              max={100}
              min={30}
              step={5}
              className="w-full"
              disabled={!alertsEnabled}
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>30%</span>
              <span>100%</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Data Controls */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass-card p-6"
      >
        <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
          <RefreshCw className="w-5 h-5 text-primary" />
          Data Controls
        </h2>

        <div className="space-y-6">
          {/* Refresh Interval */}
          <div>
            <Label className="text-base">Refresh Interval</Label>
            <p className="text-sm text-muted-foreground mb-3">How often to update traffic data</p>
            <div className="flex items-center gap-2">
              {refreshOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setRefreshInterval(option.value)}
                  className={cn(
                    "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                    refreshInterval === option.value 
                      ? "bg-primary text-primary-foreground" 
                      : "bg-muted hover:bg-muted/80"
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Pause/Resume */}
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base">Real-time Updates</Label>
              <p className="text-sm text-muted-foreground">
                {isPaused ? 'Updates are paused' : 'Updates are running'}
              </p>
            </div>
            <Button
              variant={isPaused ? "default" : "outline"}
              onClick={() => setIsPaused(!isPaused)}
            >
              {isPaused ? (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Resume
                </>
              ) : (
                <>
                  <Pause className="w-4 h-4 mr-2" />
                  Pause
                </>
              )}
            </Button>
          </div>

          {/* Reset */}
          <div className="pt-4 border-t border-border">
            <Button variant="outline" onClick={handleReset} className="w-full sm:w-auto">
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset All Settings
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Settings;
