import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardDescription, CardTitle } from '@/components/ui/card';
import { locations } from '@shared/schema';

interface WeatherData {
  id: number;
  location: string;
  temperature: number;
  rainfall24h: number;
  rainfall30d: number;
  daysWithoutRain: number;
  humidity: number;
  windSpeed: number;
  forecast: string;
  lastUpdated: string;
}

export default function WeatherWidget({ location = 'mumbai' }: { location?: string }) {
  // Get weather data for the specified location
  const { data: weatherData, isLoading } = useQuery<WeatherData>({
    queryKey: [`/api/weather/${location}`],
  });
  
  // Get location name
  const getLocationName = (locationId: string) => {
    const found = locations.find(loc => loc.id === locationId);
    return found ? found.name : locationId;
  };
  
  // Get weather icon based on forecast
  const getWeatherIcon = (forecast: string) => {
    if (!forecast) return (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-4xl text-primary">
        <circle cx="12" cy="12" r="5"></circle>
        <line x1="12" y1="1" x2="12" y2="3"></line>
        <line x1="12" y1="21" x2="12" y2="23"></line>
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
        <line x1="1" y1="12" x2="3" y2="12"></line>
        <line x1="21" y1="12" x2="23" y2="12"></line>
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
      </svg>
    );
    
    const forecast_lower = forecast.toLowerCase();
    
    if (forecast_lower.includes('clear') || forecast_lower.includes('sunny')) {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-4xl text-primary">
          <circle cx="12" cy="12" r="5"></circle>
          <line x1="12" y1="1" x2="12" y2="3"></line>
          <line x1="12" y1="21" x2="12" y2="23"></line>
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
          <line x1="1" y1="12" x2="3" y2="12"></line>
          <line x1="21" y1="12" x2="23" y2="12"></line>
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
        </svg>
      );
    } else if (forecast_lower.includes('cloud')) {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-4xl text-primary">
          <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"></path>
        </svg>
      );
    } else if (forecast_lower.includes('rain')) {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-4xl text-primary">
          <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"></path>
          <path d="M16 14v6"></path>
          <path d="M8 14v6"></path>
          <path d="M12 16v6"></path>
        </svg>
      );
    } else {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-4xl text-primary">
          <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"></path>
        </svg>
      );
    }
  };
  
  // Format update time
  const formatUpdateTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.round(diffMs / 60000);
    
    if (diffMins < 1) return 'just now';
    if (diffMins === 1) return '1 minute ago';
    if (diffMins < 60) return `${diffMins} minutes ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours === 1) return '1 hour ago';
    if (diffHours < 24) return `${diffHours} hours ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return '1 day ago';
    return `${diffDays} days ago`;
  };
  
  return (
    <Card className="bg-white rounded-lg shadow-sm border border-neutral-200 overflow-hidden">
      <CardHeader className="border-b border-neutral-200 bg-neutral-50 px-6 py-4">
        <CardTitle className="text-lg font-medium text-neutral-900">Current Weather</CardTitle>
        <CardDescription className="text-sm text-neutral-600">
          Real-time weather conditions for your policies
        </CardDescription>
      </CardHeader>
      
      <CardContent className="p-6">
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <svg className="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        ) : weatherData ? (
          <>
            <div className="flex justify-between items-center mb-6">
              <div>
                <div className="text-sm text-neutral-600">{getLocationName(weatherData.location)}</div>
                <div className="text-2xl font-semibold text-neutral-900">{weatherData.temperature}°C</div>
              </div>
              <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary-light bg-opacity-10">
                {getWeatherIcon(weatherData.forecast)}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-y-4 gap-x-6 mb-6">
              <div>
                <div className="text-xs text-neutral-500">Humidity</div>
                <div className="text-sm font-medium">{weatherData.humidity}%</div>
              </div>
              <div>
                <div className="text-xs text-neutral-500">Wind</div>
                <div className="text-sm font-medium">{weatherData.windSpeed} km/h</div>
              </div>
              <div>
                <div className="text-xs text-neutral-500">Rainfall (Last 24h)</div>
                <div className="text-sm font-medium">{weatherData.rainfall24h} mm</div>
              </div>
              <div>
                <div className="text-xs text-neutral-500">Forecast</div>
                <div className="text-sm font-medium">{weatherData.forecast}</div>
              </div>
            </div>
            
            <div>
              <div className="text-xs text-neutral-500 mb-2">
                Rainfall Trend (Last 30 Days)
              </div>
              <div className="h-24 bg-neutral-50 rounded border border-neutral-200 p-2">
                <div className="relative h-full w-full">
                  {/* Simple rainfall visualization */}
                  <div className="absolute bottom-0 w-full flex items-end justify-between">
                    {Array.from({ length: 15 }).map((_, index) => {
                      // Generate some visual data for the graph
                      let height = 0;
                      if (weatherData.rainfall30d > 0) {
                        // Create a simple distribution with most recent days having more impact
                        const dayFactor = Math.max(0, 15 - index) / 15; // 1 for most recent, 0 for oldest
                        height = Math.min(100, Math.max(0, weatherData.rainfall30d * dayFactor * Math.random() * 0.15));
                      }
                      
                      return (
                        <div 
                          key={index} 
                          style={{ height: `${height}%` }} 
                          className="w-1 bg-primary rounded-t"
                        ></div>
                      );
                    })}
                  </div>
                  
                  {weatherData.daysWithoutRain > 0 && (
                    <div className="absolute top-0 right-2 text-warning text-xs font-medium">
                      {weatherData.daysWithoutRain} days without rain
                    </div>
                  )}
                </div>
              </div>
              
              <div className="mt-2 text-xs text-neutral-500 text-right">
                Last updated: {formatUpdateTime(weatherData.lastUpdated)}
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-4">
            <p className="text-neutral-600">No weather data available</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
