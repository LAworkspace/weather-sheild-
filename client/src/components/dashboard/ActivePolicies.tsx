import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { Card, CardContent, CardHeader, CardDescription, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useWeb3 } from '@/lib/web3';
import { useToast } from '@/hooks/use-toast';
import { PolicyStatus } from '@shared/schema';
import { ethers } from 'ethers';

type Policy = {
  id: number;
  walletAddress: string;
  location: string;
  eventType: string;
  threshold: number;
  coverage: number;
  premium: number;
  duration: number;
  startDate: string;
  endDate: string;
  status: string;
  currentValue: number;
  txHash?: string;
};

export default function ActivePolicies() {
  const { isConnected, account, signer } = useWeb3();
  const { toast } = useToast();
  const [claimingPolicyId, setClaimingPolicyId] = useState<number | null>(null);
  
  // Get active policies for connected wallet
  const { data: policies, isLoading } = useQuery({
    queryKey: [`/api/policies/${account}`],
    enabled: isConnected && !!account,
  });
  
  // Check policy eligibility for claim
  const checkEligibilityMutation = useMutation({
    mutationFn: async (policyId: number) => {
      const response = await apiRequest('POST', `/api/check-eligibility/${policyId}`, {});
      return response.json();
    },
    onSuccess: (data) => {
      if (data.isEligible) {
        toast({
          title: 'Claim Eligible',
          description: data.reason,
        });
        queryClient.invalidateQueries({ queryKey: [`/api/policies/${account}`] });
      } else {
        toast({
          title: 'Not Eligible for Claim',
          description: 'The policy conditions have not been met yet',
        });
      }
    },
    onError: (error) => {
      toast({
        title: 'Eligibility Check Failed',
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        variant: 'destructive',
      });
    },
  });
  
  // Process claim payout
  const claimPayoutMutation = useMutation({
    mutationFn: async (policy: Policy) => {
      if (!signer || !account) {
        throw new Error('Wallet not connected');
      }
      
      // Simulate blockchain transaction for claim payout
      // In a real implementation, this would call a smart contract function
      try {
        // Create transaction to simulate contract call
        const tx = await signer.sendTransaction({
          to: ethers.ZeroAddress, // This would be the contract address
          value: ethers.parseEther("0"), // Just a call, no value
        });
        
        // Wait for transaction to be mined
        await tx.wait();
        
        // Update policy status via API
        const response = await apiRequest('POST', `/api/claim-payout/${policy.id}`, {
          txHash: tx.hash,
        });
        
        return response.json();
      } catch (error) {
        console.error('Transaction error:', error);
        throw error;
      }
    },
    onSuccess: () => {
      toast({
        title: 'Claim Processed',
        description: 'Your claim has been processed successfully and payout is on its way',
      });
      
      setClaimingPolicyId(null);
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: [`/api/policies/${account}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/transactions/${account}`] });
    },
    onError: (error) => {
      toast({
        title: 'Claim Processing Failed',
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        variant: 'destructive',
      });
      setClaimingPolicyId(null);
    },
  });
  
  // Calculate days remaining for policy
  const getDaysRemaining = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };
  
  // Format event type and threshold for display
  const formatEventThreshold = (policy: Policy) => {
    switch(policy.eventType) {
      case 'rainfall':
        return `Rainfall > ${policy.threshold}mm`;
      case 'drought':
        return `No rain for ${policy.threshold} days`;
      case 'heatwave':
        return `Temperature > ${policy.threshold}°C`;
      case 'storm':
        return `Wind speed > ${policy.threshold}km/h`;
      default:
        return `${policy.threshold}`;
    }
  };
  
  // Get status badge color
  const getStatusBadgeColor = (status: string) => {
    switch(status) {
      case PolicyStatus.ACTIVE:
        return 'bg-green-100 text-green-800';
      case PolicyStatus.CLAIM_ELIGIBLE:
        return 'bg-yellow-100 text-yellow-800';
      case PolicyStatus.CLAIMED:
        return 'bg-blue-100 text-blue-800';
      case PolicyStatus.EXPIRED:
        return 'bg-neutral-100 text-neutral-800';
      default:
        return 'bg-neutral-100 text-neutral-800';
    }
  };
  
  // Handler for claim payout button
  const handleClaimPayout = (policy: Policy) => {
    setClaimingPolicyId(policy.id);
    claimPayoutMutation.mutate(policy);
  };
  
  return (
    <Card className="bg-white rounded-lg shadow-sm border border-neutral-200 overflow-hidden">
      <CardHeader className="border-b border-neutral-200 bg-neutral-50 px-6 py-4">
        <CardTitle className="text-lg font-medium text-neutral-900">Active Policies</CardTitle>
        <CardDescription className="text-sm text-neutral-600">
          Your current weather insurance coverage
        </CardDescription>
      </CardHeader>
      
      <CardContent className="divide-y divide-neutral-200">
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <svg className="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        ) : !isConnected ? (
          <div className="p-6 text-center">
            <p className="text-neutral-600">Connect your wallet to view your policies</p>
          </div>
        ) : policies && policies.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-neutral-600">You don't have any active policies yet</p>
          </div>
        ) : (
          policies && policies.map((policy: Policy) => (
            <div key={policy.id} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-base font-medium text-neutral-900">
                    {policy.eventType.charAt(0).toUpperCase() + policy.eventType.slice(1)} Policy - {policy.location.charAt(0).toUpperCase() + policy.location.slice(1)}
                  </h3>
                  <p className="text-sm text-neutral-600 mt-1">Coverage: {policy.coverage} ETH</p>
                </div>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(policy.status)}`}>
                  {policy.status.replace('_', ' ').charAt(0).toUpperCase() + policy.status.replace('_', ' ').slice(1)}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <div className="text-xs text-neutral-500">Threshold</div>
                  <div className="text-sm font-medium">{formatEventThreshold(policy)}</div>
                </div>
                <div>
                  <div className="text-xs text-neutral-500">Expiration</div>
                  <div className="text-sm font-medium">{policy.duration} days ({getDaysRemaining(policy.endDate)} remaining)</div>
                </div>
                <div>
                  <div className="text-xs text-neutral-500">Premium Paid</div>
                  <div className="text-sm font-medium">{policy.premium} ETH</div>
                </div>
                <div>
                  <div className="text-xs text-neutral-500">Current Status</div>
                  <div className="text-sm font-medium">
                    {policy.status === PolicyStatus.CLAIM_ELIGIBLE ? (
                      <span className="text-warning font-semibold">Eligible for claim</span>
                    ) : (
                      <span>Monitoring ({policy.currentValue} {policy.eventType === 'rainfall' ? 'mm rainfall' : 
                        policy.eventType === 'drought' ? 'days without rain' : 
                        policy.eventType === 'heatwave' ? '°C' : 
                        'km/h wind speed'})</span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <Button
                  variant="link"
                  onClick={() => checkEligibilityMutation.mutate(policy.id)}
                  disabled={checkEligibilityMutation.isPending}
                  className="text-sm text-primary hover:text-primary-dark font-medium flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1 h-4 w-4">
                    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                  Check Status
                </Button>
                
                {policy.txHash && (
                  <Button 
                    variant="link"
                    onClick={() => window.open(`https://sepolia.etherscan.io/tx/${policy.txHash}`, '_blank')}
                    className="text-sm text-neutral-600 hover:text-neutral-800 font-medium flex items-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1 h-4 w-4">
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                      <polyline points="15 3 21 3 21 9"></polyline>
                      <line x1="10" y1="14" x2="21" y2="3"></line>
                    </svg>
                    View on Etherscan
                  </Button>
                )}
                
                {policy.status === PolicyStatus.CLAIM_ELIGIBLE && (
                  <Button
                    variant="default"
                    onClick={() => handleClaimPayout(policy)}
                    disabled={claimPayoutMutation.isPending && claimingPolicyId === policy.id}
                    className="px-3 py-1.5 bg-accent hover:bg-accent-dark text-white text-sm font-medium rounded-md flex items-center transition-colors duration-200"
                  >
                    {claimPayoutMutation.isPending && claimingPolicyId === policy.id ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </>
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1 h-4 w-4">
                          <rect x="2" y="5" width="20" height="14" rx="2"></rect>
                          <line x1="2" y1="10" x2="22" y2="10"></line>
                        </svg>
                        Claim Payout
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
