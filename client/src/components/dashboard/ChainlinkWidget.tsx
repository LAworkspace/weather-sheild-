import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardDescription, CardTitle } from '@/components/ui/card';

export default function ChainlinkWidget() {
  // Get weather data for Mumbai and New York
  const { data: mumbaiData } = useQuery({
    queryKey: ['/api/weather/mumbai'],
  });
  
  const { data: newYorkData } = useQuery({
    queryKey: ['/api/weather/new-york'],
  });
  
  // Format update time
  const formatUpdateTime = (timestamp: string) => {
    if (!timestamp) return 'N/A';
    
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.round(diffMs / 60000);
    
    if (diffMins < 1) return 'just now';
    if (diffMins === 1) return '1 min ago';
    if (diffMins < 60) return `${diffMins} min ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours === 1) return '1 hour ago';
    if (diffHours < 24) return `${diffHours} hours ago`;
    
    return `${Math.floor(diffHours / 24)} days ago`;
  };
  
  // Refresh oracle data
  const handleRefreshData = () => {
    // Invalidate weather data queries to force a refresh
    window.location.reload(); // Simple refresh for demo
  };
  
  return (
    <Card className="bg-white rounded-lg shadow-sm border border-neutral-200 overflow-hidden">
      <CardHeader className="border-b border-neutral-200 bg-neutral-50 px-6 py-4">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-lg font-medium text-neutral-900">Oracle Data</CardTitle>
            <CardDescription className="text-sm text-neutral-600">
              Chainlink weather data feeds
            </CardDescription>
          </div>
          
          {/* Chainlink logo */}
          <svg className="h-6 w-6" viewBox="0 0 32 44" xmlns="http://www.w3.org/2000/svg">
            <path d="M16 0L0 22.5L16 44L32 22.5L16 0Z" fill="#375BD2"/>
            <path d="M16 20.5a2 2 0 100 4 2 2 0 000-4zm8.5 2a8.5 8.5 0 11-17 0 8.5 8.5 0 0117 0z" fill="white"/>
          </svg>
        </div>
      </CardHeader>
      
      <CardContent className="p-6">
        <div className="divide-y divide-neutral-200">
          {mumbaiData && (
            <div className="pb-4">
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-neutral-600">Mumbai Weather Oracle</span>
                <span className="text-xs text-neutral-500">Updated {formatUpdateTime(mumbaiData.lastUpdated)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Temperature</span>
                <span className="font-medium">{mumbaiData.temperature}°C</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Rainfall (24h)</span>
                <span className="font-medium">{mumbaiData.rainfall24h}mm</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Days Without Rain</span>
                <span className={`font-medium ${mumbaiData.daysWithoutRain > 30 ? 'text-warning' : ''}`}>
                  {mumbaiData.daysWithoutRain} days
                </span>
              </div>
            </div>
          )}
          
          {newYorkData && (
            <div className="py-4">
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-neutral-600">New York Weather Oracle</span>
                <span className="text-xs text-neutral-500">Updated {formatUpdateTime(newYorkData.lastUpdated)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Temperature</span>
                <span className="font-medium">{newYorkData.temperature}°C</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Rainfall (24h)</span>
                <span className="font-medium">{newYorkData.rainfall24h}mm</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Total Rainfall (30d)</span>
                <span className="font-medium">{newYorkData.rainfall30d}mm</span>
              </div>
            </div>
          )}
        </div>
        
        <div className="mt-4 pt-4 border-t border-neutral-200">
          <Button
            variant="link"
            onClick={handleRefreshData}
            className="text-sm text-primary hover:text-primary-dark font-medium flex items-center justify-center w-full"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1 h-4 w-4">
              <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
              <path d="M3 3v5h5"></path>
              <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"></path>
              <path d="M16 16h5v5"></path>
            </svg>
            Refresh Oracle Data
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
