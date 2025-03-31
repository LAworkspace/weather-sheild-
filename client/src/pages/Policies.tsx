import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useWeb3 } from '@/lib/web3';
import { Card, CardContent, CardHeader, CardDescription, CardTitle } from '@/components/ui/card';
import ActivePolicies from '@/components/dashboard/ActivePolicies';

export default function Policies() {
  const { isConnected, account } = useWeb3();
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-neutral-900">Insurance Policies</h1>
        <p className="text-neutral-600 mt-1">Manage your weather insurance policies</p>
      </div>
      
      <div className="space-y-8">
        <ActivePolicies />
        
        <Card className="bg-white rounded-lg shadow-sm border border-neutral-200 overflow-hidden">
          <CardHeader className="border-b border-neutral-200 bg-neutral-50 px-6 py-4">
            <CardTitle className="text-lg font-medium text-neutral-900">Policy Information</CardTitle>
            <CardDescription className="text-sm text-neutral-600">
              Understanding how weather insurance works
            </CardDescription>
          </CardHeader>
          
          <CardContent className="p-6">
            <div className="prose max-w-none">
              <h3>How Weather Insurance Works</h3>
              <p>
                WeatherGuard provides parametric weather insurance, which means payouts are triggered automatically 
                based on predefined weather conditions monitored by reliable oracles.
              </p>
              
              <h4>Key Benefits</h4>
              <ul>
                <li><strong>Automated Claims:</strong> No paperwork or manual verification required</li>
                <li><strong>Instant Payouts:</strong> Receive funds directly to your wallet when conditions are met</li>
                <li><strong>Transparent Terms:</strong> Clear thresholds determine when payouts are triggered</li>
                <li><strong>Blockchain Security:</strong> All policies and transactions are recorded on Ethereum</li>
              </ul>
              
              <h4>Policy Types</h4>
              <ul>
                <li><strong>Rainfall Insurance:</strong> Protects against excessive rainfall events</li>
                <li><strong>Drought Insurance:</strong> Provides coverage during periods without rain</li>
                <li><strong>Heatwave Insurance:</strong> Offers protection during extreme temperature events</li>
                <li><strong>Storm Insurance:</strong> Covers damage risks from high wind events</li>
              </ul>
              
              <h4>How to Purchase</h4>
              <p>
                Simply select your location, the type of weather event you want to insure against, 
                set your desired coverage amount and duration, and pay the premium with ETH.
              </p>
              
              <h4>Checking Policy Status</h4>
              <p>
                All active policies are continuously monitored against real-time weather data. 
                You can manually check their status at any time to see current conditions and 
                eligibility for claims.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
