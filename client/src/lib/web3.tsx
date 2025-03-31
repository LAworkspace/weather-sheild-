import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ethers } from 'ethers';
import { useToast } from '@/hooks/use-toast';

interface Web3ContextType {
  provider: ethers.BrowserProvider | null;
  signer: ethers.JsonRpcSigner | null;
  account: string | null;
  chainId: number | null;
  balance: string | null;
  isConnecting: boolean;
  isConnected: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
}

const Web3Context = createContext<Web3ContextType>({
  provider: null,
  signer: null,
  account: null,
  chainId: null,
  balance: null,
  isConnecting: false,
  isConnected: false,
  connect: async () => {},
  disconnect: () => {},
});

export const useWeb3 = () => useContext(Web3Context);

interface Web3ProviderProps {
  children: ReactNode;
}

export const Web3Provider = ({ children }: Web3ProviderProps) => {
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null);
  const [account, setAccount] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [balance, setBalance] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const { toast } = useToast();

  // Initialize Ethereum provider from window.ethereum
  const initProvider = () => {
    if (typeof window !== 'undefined' && window.ethereum) {
      const provider = new ethers.BrowserProvider(window.ethereum);
      setProvider(provider);
      return provider;
    }
    return null;
  };

  // Update account information
  const updateAccount = async (newAccount: string, newProvider: ethers.BrowserProvider) => {
    setAccount(newAccount);
    
    try {
      const signer = await newProvider.getSigner();
      setSigner(signer);
      
      const network = await newProvider.getNetwork();
      setChainId(Number(network.chainId));
      
      const balance = await newProvider.getBalance(newAccount);
      setBalance(ethers.formatEther(balance));
      
      setIsConnected(true);
    } catch (error) {
      console.error('Error updating account:', error);
      toast({
        title: 'Error',
        description: 'Failed to get account details',
        variant: 'destructive',
      });
    }
  };

  // Connect wallet
  const connect = async () => {
    if (isConnecting) return;
    
    try {
      setIsConnecting(true);
      
      if (!window.ethereum) {
        toast({
          title: 'MetaMask Not Found',
          description: 'Please install MetaMask to use this application',
          variant: 'destructive',
        });
        return;
      }
      
      const currentProvider = provider || initProvider();
      if (!currentProvider) {
        toast({
          title: 'Provider Error',
          description: 'Failed to initialize Ethereum provider',
          variant: 'destructive',
        });
        return;
      }
      
      const accounts = await currentProvider.send('eth_requestAccounts', []);
      if (accounts.length === 0) {
        toast({
          title: 'Connection Failed',
          description: 'No accounts found or user rejected the connection',
          variant: 'destructive',
        });
        return;
      }
      
      await updateAccount(accounts[0], currentProvider);
      
      toast({
        title: 'Wallet Connected',
        description: 'Successfully connected to your wallet',
      });
    } catch (error) {
      console.error('Error connecting to wallet:', error);
      toast({
        title: 'Connection Failed',
        description: error instanceof Error ? error.message : 'Failed to connect to wallet',
        variant: 'destructive',
      });
    } finally {
      setIsConnecting(false);
    }
  };

  // Disconnect wallet
  const disconnect = () => {
    setProvider(null);
    setSigner(null);
    setAccount(null);
    setChainId(null);
    setBalance(null);
    setIsConnected(false);
    
    toast({
      title: 'Wallet Disconnected',
      description: 'Your wallet has been disconnected',
    });
  };

  // Listen for account changes
  useEffect(() => {
    if (typeof window === 'undefined' || !window.ethereum) return;
    
    const handleAccountsChanged = async (accounts: string[]) => {
      if (accounts.length === 0) {
        // User disconnected their wallet
        disconnect();
      } else if (account !== accounts[0] && provider) {
        // Account changed
        await updateAccount(accounts[0], provider);
      }
    };
    
    const handleChainChanged = () => {
      // Reload the page when chain changes
      window.location.reload();
    };
    
    const handleDisconnect = () => {
      disconnect();
    };
    
    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);
    window.ethereum.on('disconnect', handleDisconnect);
    
    // Check if already connected
    const checkConnection = async () => {
      try {
        const newProvider = initProvider();
        if (newProvider) {
          const accounts = await newProvider.listAccounts();
          if (accounts.length > 0) {
            await updateAccount(accounts[0].address, newProvider);
          }
        }
      } catch (error) {
        console.error('Error checking connection:', error);
      }
    };
    
    checkConnection();
    
    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
        window.ethereum.removeListener('disconnect', handleDisconnect);
      }
    };
  }, [account, provider]);

  return (
    <Web3Context.Provider value={{
      provider,
      signer,
      account,
      chainId,
      balance,
      isConnecting,
      isConnected,
      connect,
      disconnect,
    }}>
      {children}
    </Web3Context.Provider>
  );
};

// Helper functions
export const shortenAddress = (address: string | null): string => {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export const getNetworkName = (chainId: number | null): string => {
  if (!chainId) return '';
  
  switch (chainId) {
    case 1:
      return 'Ethereum Mainnet';
    case 5:
      return 'Goerli Testnet';
    case 11155111:
      return 'Sepolia Testnet';
    default:
      return 'Unknown Network';
  }
};

// Add MetaMask type to window
declare global {
  interface Window {
    ethereum?: any;
  }
}