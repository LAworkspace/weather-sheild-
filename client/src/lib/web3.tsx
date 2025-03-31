import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ethers } from 'ethers';
import { formatEth } from './utils';

// Define Web3 context
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

// Create context with default values
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

// Export context hook
export const useWeb3 = () => useContext(Web3Context);

// Extend Window interface to include ethereum
declare global {
  interface Window {
    ethereum?: any;
  }
}

// Web3 Provider Props
interface Web3ProviderProps {
  children: ReactNode;
}

// Web3 Provider Component
export const Web3Provider = ({ children }: Web3ProviderProps) => {
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null);
  const [account, setAccount] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [balance, setBalance] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  // Connect to Web3 provider
  const connect = async () => {
    if (!window.ethereum) {
      alert('Please install MetaMask or another Web3 provider');
      return;
    }

    try {
      setIsConnecting(true);

      // Request account access
      await window.ethereum.request({ method: 'eth_requestAccounts' });

      // Create provider
      const ethersProvider = new ethers.BrowserProvider(window.ethereum);
      setProvider(ethersProvider);

      // Get network
      const network = await ethersProvider.getNetwork();
      setChainId(Number(network.chainId));

      // Get accounts
      const accounts = await ethersProvider.listAccounts();
      if (accounts.length > 0) {
        const userAccount = accounts[0].address;
        setAccount(userAccount);

        // Get signer
        const signerInstance = await ethersProvider.getSigner();
        setSigner(signerInstance);

        // Get balance
        const userBalance = await ethersProvider.getBalance(userAccount);
        setBalance(formatEth(userBalance));

        setIsConnected(true);
      }
    } catch (error) {
      console.error('Error connecting to Web3:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  // Disconnect from Web3 provider
  const disconnect = () => {
    setProvider(null);
    setSigner(null);
    setAccount(null);
    setChainId(null);
    setBalance(null);
    setIsConnected(false);
  };

  // Handle account and chain changes
  useEffect(() => {
    const handleAccountsChanged = async (accounts: string[]) => {
      if (accounts.length === 0) {
        // User disconnected their wallet
        disconnect();
      } else if (accounts[0] !== account) {
        // Account changed, update state
        setAccount(accounts[0]);

        if (provider) {
          // Update signer
          const signerInstance = await provider.getSigner();
          setSigner(signerInstance);

          // Update balance
          const userBalance = await provider.getBalance(accounts[0]);
          setBalance(formatEth(userBalance));
        }
      }
    };

    const handleChainChanged = (chainIdHex: string) => {
      // Chain changed, refresh page as recommended by MetaMask
      window.location.reload();
    };

    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);
    }

    // Cleanup listeners on unmount
    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      }
    };
  }, [provider, account]);

  // Check if already connected on load
  useEffect(() => {
    const checkConnection = async () => {
      if (window.ethereum) {
        try {
          // Check if already connected
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts.length > 0) {
            // User is already connected, initialize
            await connect();
          }
        } catch (error) {
          console.error('Error checking connection:', error);
        }
      }
    };

    checkConnection();
  }, []);

  // Context value
  const value: Web3ContextType = {
    provider,
    signer,
    account,
    chainId,
    balance,
    isConnecting,
    isConnected,
    connect,
    disconnect,
  };

  return <Web3Context.Provider value={value}>{children}</Web3Context.Provider>;
};

// Utility function to shorten Ethereum address
export const shortenAddress = (address: string | null): string => {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

// Utility function to get network name from chain ID
export const getNetworkName = (chainId: number | null): string => {
  if (!chainId) return 'Not Connected';

  switch (chainId) {
    case 1:
      return 'Ethereum Mainnet';
    case 5:
      return 'Goerli Testnet';
    case 11155111:
      return 'Sepolia Testnet';
    case 31337:
      return 'Local Hardhat Node';
    default:
      return `Unknown Network (${chainId})`;
  }
};