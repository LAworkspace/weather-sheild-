import { Button } from "@/components/ui/button";
import { useWeb3, shortenAddress, getNetworkName } from "@/lib/web3";

export default function WalletConnect() {
  const { isConnected, isConnecting, connect, disconnect, account, balance, chainId } = useWeb3();
  
  return (
    <div className="flex items-center">
      {!isConnected ? (
        <Button
          variant="default"
          size="sm"
          disabled={isConnecting}
          onClick={connect}
          className="px-4 py-2 bg-primary hover:bg-primary-dark text-white font-medium rounded-md flex items-center transition-colors duration-200"
        >
          {isConnecting ? (
            <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1 h-4 w-4">
              <path d="M19 6.5a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0Z"></path>
              <path d="M9 6.5a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0Z"></path>
              <path d="M5 13.5V19a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-5.5"></path>
              <path d="M14 13.5V16"></path>
            </svg>
          )}
          Connect Wallet
        </Button>
      ) : (
        <div className="flex items-center border border-neutral-200 rounded-md px-3 py-1.5 bg-neutral-50">
          <div className="mr-3">
            <div className="flex items-center">
              <div className="h-2.5 w-2.5 rounded-full bg-green-500 mr-1.5"></div>
              <span className="text-xs font-medium text-neutral-600">
                {getNetworkName(chainId)}
              </span>
            </div>
            <div className="text-sm font-medium">{shortenAddress(account)}</div>
          </div>
          <div className="px-3 py-1 bg-neutral-100 rounded text-sm font-medium" onClick={disconnect} role="button" tabIndex={0}>
            {balance ? `${parseFloat(balance).toFixed(4)} ETH` : '0 ETH'}
          </div>
        </div>
      )}
    </div>
  );
}
