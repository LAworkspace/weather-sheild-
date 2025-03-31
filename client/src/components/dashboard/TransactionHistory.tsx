import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardDescription, CardTitle } from '@/components/ui/card';
import { useWeb3 } from '@/lib/web3';

type Transaction = {
  id: number;
  walletAddress: string;
  type: string;
  amount: number;
  txHash: string;
  timestamp: string;
  policyId?: number;
  details?: any;
};

export default function TransactionHistory() {
  const { isConnected, account } = useWeb3();
  
  // Get transactions for connected wallet
  const { data: transactions, isLoading } = useQuery({
    queryKey: [`/api/transactions/${account}`],
    enabled: isConnected && !!account,
  });
  
  // Format relative time
  const getRelativeTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'today';
    if (diffDays === 1) return 'yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 14) return '1 week ago';
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 60) return '1 month ago';
    return `${Math.floor(diffDays / 30)} months ago`;
  };
  
  // Get transaction icon based on type
  const getTransactionIcon = (type: string, index: number) => {
    // Different background colors for variety
    const bgClasses = [
      'bg-primary-light bg-opacity-10',
      'bg-secondary-light bg-opacity-10',
      'bg-accent-light bg-opacity-10'
    ];
    
    const textClasses = [
      'text-primary',
      'text-secondary',
      'text-accent'
    ];
    
    const bgClass = bgClasses[index % bgClasses.length];
    const textClass = textClasses[index % textClasses.length];
    
    if (type === 'policy_created') {
      return (
        <div className={`h-10 w-10 rounded-full ${bgClass} flex items-center justify-center ring-8 ring-white`}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={textClass}>
            <path d="M14 9a2 2 0 0 1-2 2H6l-4 4V4c0-1.1.9-2 2-2h8a2 2 0 0 1 2 2v5Z"></path>
            <path d="M18 9h2a2 2 0 0 1 2 2v11l-4-4h-6a2 2 0 0 1-2-2v-1"></path>
          </svg>
        </div>
      );
    } else if (type === 'claim_paid') {
      return (
        <div className={`h-10 w-10 rounded-full ${bgClass} flex items-center justify-center ring-8 ring-white`}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={textClass}>
            <rect x="2" y="5" width="20" height="14" rx="2"></rect>
            <line x1="2" y1="10" x2="22" y2="10"></line>
          </svg>
        </div>
      );
    } else {
      return (
        <div className={`h-10 w-10 rounded-full ${bgClass} flex items-center justify-center ring-8 ring-white`}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={textClass}>
            <path d="M12 22v-5"></path>
            <path d="M9 8V2"></path>
            <path d="M15 8V2"></path>
            <path d="M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z"></path>
          </svg>
        </div>
      );
    }
  };
  
  // Format transaction title and description
  const getTransactionDetails = (transaction: Transaction) => {
    if (transaction.type === 'policy_created') {
      const eventType = transaction.details?.policy?.eventType || 'weather';
      const location = transaction.details?.policy?.location || 'location';
      
      return {
        title: 'Policy Created',
        description: `${eventType.charAt(0).toUpperCase() + eventType.slice(1)} policy for ${location.charAt(0).toUpperCase() + location.slice(1)} purchased for ${transaction.amount} ETH`
      };
    } else if (transaction.type === 'claim_paid') {
      const eventType = transaction.details?.policy?.eventType || 'weather';
      const location = transaction.details?.policy?.location || 'location';
      
      return {
        title: 'Claim Paid',
        description: `${eventType.charAt(0).toUpperCase() + eventType.slice(1)} policy for ${location.charAt(0).toUpperCase() + location.slice(1)} paid out ${transaction.amount} ETH`
      };
    } else {
      return {
        title: 'Transaction',
        description: `${transaction.amount} ETH`
      };
    }
  };
  
  return (
    <Card className="bg-white rounded-lg shadow-sm border border-neutral-200 overflow-hidden">
      <CardHeader className="border-b border-neutral-200 bg-neutral-50 px-6 py-4">
        <CardTitle className="text-lg font-medium text-neutral-900">Recent Transactions</CardTitle>
        <CardDescription className="text-sm text-neutral-600">
          Your blockchain transaction history
        </CardDescription>
      </CardHeader>
      
      <CardContent className="p-6">
        <div className="flow-root">
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <svg className="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          ) : !isConnected ? (
            <div className="text-center py-4">
              <p className="text-neutral-600">Connect your wallet to view your transactions</p>
            </div>
          ) : transactions && transactions.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-neutral-600">No transactions found</p>
            </div>
          ) : (
            <ul className="-mb-8">
              {transactions && transactions.map((transaction: Transaction, index: number) => (
                <li key={transaction.id}>
                  <div className="relative pb-8">
                    {index < transactions.length - 1 && (
                      <span className="absolute top-5 left-5 -ml-px h-full w-0.5 bg-neutral-200" aria-hidden="true"></span>
                    )}
                    <div className="relative flex items-start space-x-3">
                      <div className="relative">
                        {getTransactionIcon(transaction.type, index)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div>
                          <div className="text-sm">
                            <a href="#" className="font-medium text-neutral-900">
                              {getTransactionDetails(transaction).title}
                            </a>
                          </div>
                          <p className="mt-0.5 text-sm text-neutral-500">
                            {getRelativeTime(transaction.timestamp)}
                          </p>
                        </div>
                        <div className="mt-2 text-sm text-neutral-700">
                          <p>{getTransactionDetails(transaction).description}</p>
                        </div>
                        <div className="mt-2">
                          <a 
                            href={`https://sepolia.etherscan.io/tx/${transaction.txHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-neutral-600 hover:text-neutral-900 flex items-center"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-xs mr-1 h-3 w-3">
                              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                              <polyline points="15 3 21 3 21 9"></polyline>
                              <line x1="10" y1="14" x2="21" y2="3"></line>
                            </svg>
                            {transaction.txHash.substring(0, 6)}...{transaction.txHash.substring(transaction.txHash.length - 4)}
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
