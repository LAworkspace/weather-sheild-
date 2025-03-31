import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardDescription, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
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

export default function WeatherData() {
  const [selectedLocation, setSelectedLocation] = useState('mumbai');
  
  // Get all weather data
  const { data: allWeatherData, isLoading: isLoadingAll } = useQuery({
    queryKey: ['/api/weather'],
  });
  
  // Get weather data for selected location
  const { data: locationWeatherData, isLoading: isLoadingLocation } = useQuery({
    queryKey: [`/api/weather/${selectedLocation}`],
  });
  
  // Format date
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };
  
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
  
  // Identify risk factors based on weather data
  const getRiskFactors = (data: WeatherData) => {
    const risks = [];
    
    if (data.rainfall24h > 20) {
      risks.push({
        name: 'Heavy Rainfall',
        description: `${data.rainfall24h}mm in the last 24 hours`,
        level: 'high',
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
            <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"></path>
            <path d="M16 14v6"></path>
            <path d="M8 14v6"></path>
            <path d="M12 16v6"></path>
          </svg>
        )
      });
    }
    
    if (data.rainfall30d > 100) {
      risks.push({
        name: 'Excessive Rainfall (30d)',
        description: `${data.rainfall30d}mm in the last 30 days`,
        level: 'medium',
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
            <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"></path>
            <path d="M16 14v6"></path>
            <path d="M8 14v6"></path>
            <path d="M12 16v6"></path>
          </svg>
        )
      });
    }
    
    if (data.daysWithoutRain > 20) {
      risks.push({
        name: 'Drought Conditions',
        description: `${data.daysWithoutRain} days without rainfall`,
        level: 'high',
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
            <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
          </svg>
        )
      });
    }
    
    if (data.temperature > 35) {
      risks.push({
        name: 'Heatwave',
        description: `Temperature of ${data.temperature}°C`,
        level: 'high',
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
            <path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z"></path>
          </svg>
        )
      });
    }
    
    if (data.windSpeed > 15) {
      risks.push({
        name: 'High Winds',
        description: `Wind speed of ${data.windSpeed}km/h`,
        level: data.windSpeed > 25 ? 'high' : 'medium',
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
            <path d="M17.7 7.7a2.5 2.5 0 1 1 1.8 4.3H2"></path>
            <path d="M9.6 4.6A2 2 0 1 1 11 8H2"></path>
            <path d="M12.6 19.4A2 2 0 1 0 14 16H2"></path>
          </svg>
        )
      });
    }
    
    return risks;
  };
  
  // Risk level badge classes
  const getRiskLevelClasses = (level: string) => {
    switch (level) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };
  
  // Handle location change
  const handleLocationChange = (locationId: string) => {
    setSelectedLocation(locationId);
  };
  
  // Refresh data (simple page reload for demo)
  const handleRefreshData = () => {
    window.location.reload();
  };
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-neutral-900">Weather Data</h1>
        <p className="text-neutral-600 mt-1">Real-time weather conditions from Chainlink Oracles</p>
      </div>
      
      <Tabs defaultValue="location" className="space-y-6">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="location">Location Details</TabsTrigger>
            <TabsTrigger value="comparison">Weather Comparison</TabsTrigger>
            <TabsTrigger value="risk">Risk Assessment</TabsTrigger>
          </TabsList>
          
          <Button
            variant="outline"
            onClick={handleRefreshData}
            className="flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 h-4 w-4">
              <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
              <path d="M3 3v5h5"></path>
              <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"></path>
              <path d="M16 16h5v5"></path>
            </svg>
            Refresh Data
          </Button>
        </div>
        
        {/* Location Details Tab */}
        <TabsContent value="location" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-1">
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-neutral-700 mb-1 block">
                        Select Location
                      </label>
                      <Select 
                        value={selectedLocation}
                        onValueChange={handleLocationChange}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select location" />
                        </SelectTrigger>
                        <SelectContent>
                          {locations.map((location) => (
                            <SelectItem key={location.id} value={location.id}>
                              {location.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {locationWeatherData && (
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-neutral-500">Last Updated</span>
                          <span className="text-sm font-medium">
                            {formatDate(locationWeatherData.lastUpdated)}
                          </span>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-neutral-500">Data Source</span>
                          <div className="flex items-center">
                            <svg className="h-4 w-4 mr-1 text-primary" viewBox="0 0 32 44" xmlns="http://www.w3.org/2000/svg">
                              <path d="M16 0L0 22.5L16 44L32 22.5L16 0Z" fill="currentColor"/>
                              <path d="M16 20.5a2 2 0 100 4 2 2 0 000-4zm8.5 2a8.5 8.5 0 11-17 0 8.5 8.5 0 0117 0z" fill="white"/>
                            </svg>
                            <span className="text-sm font-medium">Chainlink Oracle</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="md:col-span-3">
              {isLoadingLocation ? (
                <div className="flex justify-center items-center h-64">
                  <svg className="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
              ) : locationWeatherData ? (
                <Card>
                  <CardHeader className="border-b border-neutral-200 bg-neutral-50 px-6 py-4">
                    <CardTitle className="text-lg font-medium text-neutral-900">
                      {getLocationName(locationWeatherData.location)} Weather Details
                    </CardTitle>
                    <CardDescription className="text-sm text-neutral-600">
                      Comprehensive weather data for insurance risk assessment
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="p-6">
                    <div className="flex justify-between items-center mb-6">
                      <div>
                        <div className="text-3xl font-bold text-neutral-900">
                          {locationWeatherData.temperature}°C
                        </div>
                        <div className="text-sm text-neutral-600 mt-1">
                          {locationWeatherData.forecast}
                        </div>
                      </div>
                      <div className="flex items-center justify-center h-20 w-20 rounded-full bg-primary-light bg-opacity-10">
                        {getWeatherIcon(locationWeatherData.forecast)}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                      <Card className="border border-neutral-200">
                        <CardContent className="p-4">
                          <h3 className="text-sm font-medium text-neutral-500 mb-2">Rainfall</h3>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <div className="text-xs text-neutral-500">Last 24h</div>
                              <div className="text-lg font-semibold">
                                {locationWeatherData.rainfall24h} mm
                              </div>
                            </div>
                            <div>
                              <div className="text-xs text-neutral-500">Last 30d</div>
                              <div className="text-lg font-semibold">
                                {locationWeatherData.rainfall30d} mm
                              </div>
                            </div>
                          </div>
                          {locationWeatherData.daysWithoutRain > 0 && (
                            <div className="mt-2 pt-2 border-t border-neutral-200">
                              <div className="text-xs text-neutral-500">Days Without Rain</div>
                              <div className={`text-lg font-semibold ${locationWeatherData.daysWithoutRain > 20 ? 'text-warning' : ''}`}>
                                {locationWeatherData.daysWithoutRain} days
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                      
                      <Card className="border border-neutral-200">
                        <CardContent className="p-4">
                          <h3 className="text-sm font-medium text-neutral-500 mb-2">Atmospheric</h3>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <div className="text-xs text-neutral-500">Humidity</div>
                              <div className="text-lg font-semibold">
                                {locationWeatherData.humidity}%
                              </div>
                            </div>
                            <div>
                              <div className="text-xs text-neutral-500">Wind Speed</div>
                              <div className={`text-lg font-semibold ${locationWeatherData.windSpeed > 15 ? 'text-warning' : ''}`}>
                                {locationWeatherData.windSpeed} km/h
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card className="border border-neutral-200">
                        <CardContent className="p-4">
                          <h3 className="text-sm font-medium text-neutral-500 mb-2">Risk Assessment</h3>
                          {getRiskFactors(locationWeatherData).length > 0 ? (
                            <div className="space-y-2">
                              {getRiskFactors(locationWeatherData).map((risk, index) => (
                                <div key={index} className="flex items-center">
                                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRiskLevelClasses(risk.level)} mr-2`}>
                                    {risk.level}
                                  </span>
                                  <span className="text-sm">{risk.name}</span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-sm text-green-600 flex items-center">
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 mr-1">
                                <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path>
                                <path d="m9 12 2 2 4-4"></path>
                              </svg>
                              Low Risk
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-neutral-700 mb-3">Rainfall Trend (Last 30 Days)</h3>
                      <div className="h-48 bg-neutral-50 rounded border border-neutral-200 p-4">
                        <div className="relative h-full w-full">
                          {/* Simple rainfall visualization */}
                          <div className="absolute bottom-0 w-full flex items-end justify-between">
                            {Array.from({ length: 30 }).map((_, index) => {
                              // Generate some visual data for the graph
                              let height = 0;
                              if (locationWeatherData.rainfall30d > 0) {
                                // Create a simple distribution with most recent days having more impact
                                const dayFactor = Math.max(0, 30 - index) / 30; // 1 for most recent, 0 for oldest
                                height = Math.min(100, Math.max(0, locationWeatherData.rainfall30d * dayFactor * Math.random() * 0.15));
                              }
                              
                              return (
                                <div 
                                  key={index} 
                                  style={{ height: `${height}%` }} 
                                  className="w-1.5 bg-primary rounded-t"
                                ></div>
                              );
                            })}
                          </div>
                          
                          {locationWeatherData.daysWithoutRain > 0 && (
                            <div className="absolute top-4 right-4 text-warning text-xs font-medium">
                              {locationWeatherData.daysWithoutRain} days without rain
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="p-6 text-center">
                    <p className="text-neutral-600">No weather data available for this location</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>
        
        {/* Weather Comparison Tab */}
        <TabsContent value="comparison">
          {isLoadingAll ? (
            <div className="flex justify-center items-center h-64">
              <svg className="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          ) : allWeatherData ? (
            <Card>
              <CardHeader className="border-b border-neutral-200 bg-neutral-50 px-6 py-4">
                <CardTitle className="text-lg font-medium text-neutral-900">
                  Location Weather Comparison
                </CardTitle>
                <CardDescription className="text-sm text-neutral-600">
                  Compare weather conditions across all monitored locations
                </CardDescription>
              </CardHeader>
              
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-neutral-700 uppercase bg-neutral-50">
                      <tr>
                        <th scope="col" className="px-6 py-3">Location</th>
                        <th scope="col" className="px-6 py-3">Temperature</th>
                        <th scope="col" className="px-6 py-3">Rainfall (24h)</th>
                        <th scope="col" className="px-6 py-3">Rainfall (30d)</th>
                        <th scope="col" className="px-6 py-3">Days Without Rain</th>
                        <th scope="col" className="px-6 py-3">Wind Speed</th>
                        <th scope="col" className="px-6 py-3">Forecast</th>
                        <th scope="col" className="px-6 py-3">Risk Level</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allWeatherData.map((data: WeatherData) => {
                        const risks = getRiskFactors(data);
                        const highestRisk = risks.reduce((highest, risk) => {
                          if (risk.level === 'high') return 'high';
                          if (risk.level === 'medium' && highest !== 'high') return 'medium';
                          if (risk.level === 'low' && highest !== 'high' && highest !== 'medium') return 'low';
                          return highest;
                        }, 'low');
                        
                        return (
                          <tr key={data.id} className="bg-white border-b hover:bg-neutral-50">
                            <td className="px-6 py-4 font-medium text-neutral-900">
                              {getLocationName(data.location)}
                            </td>
                            <td className="px-6 py-4">
                              {data.temperature}°C
                            </td>
                            <td className="px-6 py-4">
                              {data.rainfall24h} mm
                            </td>
                            <td className="px-6 py-4">
                              {data.rainfall30d} mm
                            </td>
                            <td className="px-6 py-4">
                              <span className={data.daysWithoutRain > 20 ? 'text-warning font-medium' : ''}>
                                {data.daysWithoutRain} days
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className={data.windSpeed > 15 ? 'text-warning font-medium' : ''}>
                                {data.windSpeed} km/h
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              {data.forecast}
                            </td>
                            <td className="px-6 py-4">
                              {risks.length > 0 ? (
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRiskLevelClasses(highestRisk)}`}>
                                  {highestRisk}
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  low
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-neutral-600">No weather data available</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        {/* Risk Assessment Tab */}
        <TabsContent value="risk">
          {isLoadingAll ? (
            <div className="flex justify-center items-center h-64">
              <svg className="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          ) : allWeatherData ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader className="border-b border-neutral-200 bg-neutral-50 px-6 py-4">
                  <CardTitle className="text-lg font-medium text-neutral-900">
                    Risk Assessment
                  </CardTitle>
                  <CardDescription className="text-sm text-neutral-600">
                    Current weather-related risks across locations
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="p-6">
                  <div className="space-y-6">
                    {allWeatherData.map((data: WeatherData) => {
                      const risks = getRiskFactors(data);
                      
                      return (
                        <div key={data.id} className="border-b border-neutral-200 pb-6 last:border-0 last:pb-0">
                          <div className="flex justify-between items-center mb-4">
                            <h3 className="text-base font-medium text-neutral-900">
                              {getLocationName(data.location)}
                            </h3>
                            {risks.length > 0 ? (
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRiskLevelClasses(risks[0].level)}`}>
                                {risks.length} {risks.length === 1 ? 'risk' : 'risks'} detected
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                No risks
                              </span>
                            )}
                          </div>
                          
                          {risks.length > 0 ? (
                            <div className="space-y-3">
                              {risks.map((risk, index) => (
                                <div key={index} className="flex items-start p-3 bg-neutral-50 rounded-md">
                                  <div className={`p-2 rounded-md mr-3 ${getRiskLevelClasses(risk.level)} bg-opacity-20`}>
                                    {risk.icon}
                                  </div>
                                  <div>
                                    <h4 className="text-sm font-medium text-neutral-900">{risk.name}</h4>
                                    <p className="text-xs text-neutral-600 mt-1">{risk.description}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-neutral-600">
                              No significant weather risks detected for this location.
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="border-b border-neutral-200 bg-neutral-50 px-6 py-4">
                  <CardTitle className="text-lg font-medium text-neutral-900">
                    Insurance Recommendations
                  </CardTitle>
                  <CardDescription className="text-sm text-neutral-600">
                    Suggested insurance policies based on current weather patterns
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="p-6">
                  <div className="space-y-6">
                    {allWeatherData.map((data: WeatherData) => {
                      const risks = getRiskFactors(data);
                      const hasRainRisk = risks.some(r => r.name.includes('Rainfall'));
                      const hasDroughtRisk = risks.some(r => r.name.includes('Drought'));
                      const hasHeatRisk = risks.some(r => r.name.includes('Heatwave'));
                      const hasWindRisk = risks.some(r => r.name.includes('Wind'));
                      
                      // Generate recommendations based on risks
                      const recommendations = [];
                      
                      if (hasRainRisk) {
                        recommendations.push({
                          type: 'Rainfall Insurance',
                          description: `Provides coverage against excessive rainfall events in ${getLocationName(data.location)}`,
                          recommended: true
                        });
                      }
                      
                      if (hasDroughtRisk) {
                        recommendations.push({
                          type: 'Drought Insurance',
                          description: `Protection for extended periods without rainfall in ${getLocationName(data.location)}`,
                          recommended: true
                        });
                      }
                      
                      if (hasHeatRisk) {
                        recommendations.push({
                          type: 'Heatwave Insurance',
                          description: `Coverage for extreme temperature events in ${getLocationName(data.location)}`,
                          recommended: true
                        });
                      }
                      
                      if (hasWindRisk) {
                        recommendations.push({
                          type: 'Storm Insurance',
                          description: `Protection against high wind events in ${getLocationName(data.location)}`,
                          recommended: true
                        });
                      }
                      
                      // Always add at least one recommendation even if no risks
                      if (recommendations.length === 0) {
                        // Suggest based on current conditions
                        if (data.daysWithoutRain > 10) {
                          recommendations.push({
                            type: 'Drought Insurance',
                            description: `Consider protection against potential drought conditions in ${getLocationName(data.location)}`,
                            recommended: false
                          });
                        } else if (data.rainfall30d > 50) {
                          recommendations.push({
                            type: 'Rainfall Insurance',
                            description: `Consider protection against future rainfall events in ${getLocationName(data.location)}`,
                            recommended: false
                          });
                        } else {
                          recommendations.push({
                            type: 'Weather Package',
                            description: `General weather protection for ${getLocationName(data.location)}`,
                            recommended: false
                          });
                        }
                      }
                      
                      return (
                        <div key={data.id} className="border-b border-neutral-200 pb-6 last:border-0 last:pb-0">
                          <h3 className="text-base font-medium text-neutral-900 mb-3">
                            {getLocationName(data.location)}
                          </h3>
                          
                          <div className="space-y-2">
                            {recommendations.map((rec, index) => (
                              <div key={index} className="flex items-center justify-between p-3 bg-neutral-50 rounded-md">
                                <div className="flex items-start">
                                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-primary mr-2 flex-shrink-0 mt-0.5">
                                    <rect width="20" height="20" x="2" y="2" rx="2.18" ry="2.18"></rect>
                                    <line x1="7" x2="7" y1="2" y2="22"></line>
                                    <line x1="17" x2="17" y1="2" y2="22"></line>
                                    <line x1="2" x2="22" y1="12" y2="12"></line>
                                    <line x1="2" x2="7" y1="7" y2="7"></line>
                                    <line x1="2" x2="7" y1="17" y2="17"></line>
                                    <line x1="17" x2="22" y1="17" y2="17"></line>
                                    <line x1="17" x2="22" y1="7" y2="7"></line>
                                  </svg>
                                  <div>
                                    <h4 className="text-sm font-medium text-neutral-900">{rec.type}</h4>
                                    <p className="text-xs text-neutral-600 mt-0.5">{rec.description}</p>
                                  </div>
                                </div>
                                {rec.recommended && (
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary bg-opacity-10 text-primary">
                                    Recommended
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-neutral-600">No weather data available for risk assessment</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
