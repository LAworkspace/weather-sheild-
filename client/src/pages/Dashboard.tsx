import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useWeb3 } from '@/lib/web3';
import StatCard from '@/components/dashboard/StatCard';
import PolicyForm from '@/components/dashboard/PolicyForm';
import ActivePolicies from '@/components/dashboard/ActivePolicies';
import WeatherWidget from '@/components/dashboard/WeatherWidget';
import TransactionHistory from '@/components/dashboard/TransactionHistory';
import ChainlinkWidget from '@/components/dashboard/ChainlinkWidget';

export default function Dashboard() {
  const { isConnected, account } = useWeb3();
  
  // Get active policies to display stats
  const { data: policies } = useQuery({
    queryKey: [`/api/policies/${account}`],
    enabled: isConnected && !!account,
  });
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Dashboard Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-neutral-900">Weather Insurance Dashboard</h1>
        <p className="text-neutral-600 mt-1">Secure your assets against weather risks with blockchain-powered insurance</p>
      </div>
      
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard 
          title="Active Policies" 
          value={isConnected ? (policies?.filter(p => p.status === 'active' || p.status === 'claim_eligible').length || 0) : 0}
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
              <rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect>
              <line x1="3" x2="21" y1="9" y2="9"></line>
              <line x1="9" x2="9" y1="21" y2="9"></line>
            </svg>
          }
          bgColorClass="bg-primary-light bg-opacity-10"
          textColorClass="text-primary"
        />
        
        <StatCard 
          title="Total Coverage" 
          value={`${isConnected ? (policies?.reduce((sum, policy) => sum + policy.coverage, 0) || 0).toFixed(1) : 0} ETH`}
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
              <path d="M2 16V8a6 6 0 0 1 6-6h8a6 6 0 0 1 6 6v8a6 6 0 0 1-6 6H8a6 6 0 0 1-6-6z"></path>
              <circle cx="12" cy="12" r="3"></circle>
              <path d="M12 4v1"></path>
              <path d="M12 19v1"></path>
              <path d="M20 12h-1"></path>
              <path d="M5 12H4"></path>
              <path d="M17.5 7.5l-.7.7"></path>
              <path d="M7.2 16.8l-.7.7"></path>
              <path d="M16.8 16.8l.7.7"></path>
              <path d="M7.9 7.9l-.7-.7"></path>
            </svg>
          }
          bgColorClass="bg-secondary-light bg-opacity-10"
          textColorClass="text-secondary"
        />
        
        <StatCard 
          title="Pending Claims" 
          value={isConnected ? (policies?.filter(p => p.status === 'claim_eligible').length || 0) : 0}
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
              <rect x="2" y="5" width="20" height="14" rx="2"></rect>
              <line x1="2" y1="10" x2="22" y2="10"></line>
            </svg>
          }
          bgColorClass="bg-accent-light bg-opacity-10"
          textColorClass="text-accent"
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Create New Policy & Active Policies */}
        <div className="lg:col-span-2">
          <PolicyForm />
          <ActivePolicies />
        </div>
        
        {/* Right Column - Weather Data and Recent Activities */}
        <div className="lg:col-span-1 space-y-8">
          <WeatherWidget />
          <TransactionHistory />
          <ChainlinkWidget />
        </div>
      </div>
    </div>
  );
}
