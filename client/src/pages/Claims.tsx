import { useQuery } from '@tanstack/react-query';
import { useWeb3 } from '@/lib/web3';
import { Card, CardContent, CardHeader, CardDescription, CardTitle } from '@/components/ui/card';
import { PolicyStatus } from '@shared/schema';
import ActivePolicies from '@/components/dashboard/ActivePolicies';
import TransactionHistory from '@/components/dashboard/TransactionHistory';

export default function Claims() {
  const { isConnected, account } = useWeb3();
  
  // Get policies with focus on claim-eligible ones
  const { data: policies } = useQuery({
    queryKey: [`/api/policies/${account}`],
    enabled: isConnected && !!account,
  });
  
  // Calculate claim stats
  const eligiblePolicies = policies?.filter(p => p.status === PolicyStatus.CLAIM_ELIGIBLE)?.length || 0;
  const claimedPolicies = policies?.filter(p => p.status === PolicyStatus.CLAIMED)?.length || 0;
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-neutral-900">Claims Dashboard</h1>
        <p className="text-neutral-600 mt-1">Manage and process your insurance claims</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card className="bg-white rounded-lg shadow-sm border border-neutral-200">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-md bg-yellow-100">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-yellow-600">
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
                </svg>
              </div>
              <div className="ml-4">
                <h2 className="text-sm font-medium text-neutral-500">Eligible Claims</h2>
                <p className="text-2xl font-semibold text-neutral-900">{eligiblePolicies}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white rounded-lg shadow-sm border border-neutral-200">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-md bg-green-100">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-green-600">
                  <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path>
                  <path d="m9 12 2 2 4-4"></path>
                </svg>
              </div>
              <div className="ml-4">
                <h2 className="text-sm font-medium text-neutral-500">Claims Paid</h2>
                <p className="text-2xl font-semibold text-neutral-900">{claimedPolicies}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <ActivePolicies />
          
          <Card className="bg-white rounded-lg shadow-sm border border-neutral-200 overflow-hidden">
            <CardHeader className="border-b border-neutral-200 bg-neutral-50 px-6 py-4">
              <CardTitle className="text-lg font-medium text-neutral-900">Claim Process</CardTitle>
              <CardDescription className="text-sm text-neutral-600">
                How automated claims work on WeatherGuard
              </CardDescription>
            </CardHeader>
            
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary-light bg-opacity-20 text-primary">
                      1
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-base font-medium">Oracle Data Monitoring</h3>
                    <p className="mt-1 text-sm text-neutral-600">
                      Chainlink oracles continuously monitor weather conditions in your policy's location
                    </p>
                  </div>
                </div>
                
                <div className="flex">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary-light bg-opacity-20 text-primary">
                      2
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-base font-medium">Threshold Detection</h3>
                    <p className="mt-1 text-sm text-neutral-600">
                      When weather conditions cross your policy's threshold, claim eligibility is automatically triggered
                    </p>
                  </div>
                </div>
                
                <div className="flex">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary-light bg-opacity-20 text-primary">
                      3
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-base font-medium">Claim Notification</h3>
                    <p className="mt-1 text-sm text-neutral-600">
                      Your policy status updates to "Claim Eligible" when conditions for a payout are met
                    </p>
                  </div>
                </div>
                
                <div className="flex">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary-light bg-opacity-20 text-primary">
                      4
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-base font-medium">Payout Processing</h3>
                    <p className="mt-1 text-sm text-neutral-600">
                      Click "Claim Payout" button to initiate the smart contract transfer of funds to your wallet
                    </p>
                  </div>
                </div>
                
                <div className="flex">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary-light bg-opacity-20 text-primary">
                      5
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-base font-medium">Blockchain Confirmation</h3>
                    <p className="mt-1 text-sm text-neutral-600">
                      The transaction is recorded on the Ethereum blockchain with full transparency
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="lg:col-span-1">
          <TransactionHistory />
        </div>
      </div>
    </div>
  );
}
