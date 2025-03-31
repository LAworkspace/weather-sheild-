import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { ethers } from "ethers";

/**
 * Combines class names using clsx and tailwind-merge
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a bigint as ETH with proper decimal formatting
 * @param wei Amount in wei (bigint)
 * @param decimals Number of decimals to display
 * @returns Formatted ETH string
 */
export function formatEth(wei: bigint, decimals = 5): string {
  const ethValue = ethers.formatEther(wei);
  const parts = ethValue.split('.');
  
  if (parts.length === 1) return parts[0] + ' ETH';
  
  const integerPart = parts[0];
  const fractionalPart = parts[1].slice(0, decimals);
  
  return `${integerPart}.${fractionalPart} ETH`;
}

/**
 * Formats a timestamp as a date string
 * @param timestamp Unix timestamp (seconds)
 * @returns Formatted date string
 */
export function formatDate(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleString();
}

/**
 * Formats a temperature value from blockchain format (tenths of degree)
 * to human-readable format
 * @param temp Temperature in tenths of degree (e.g. 250 = 25.0°C)
 * @returns Formatted temperature string
 */
export function formatTemperature(temp: bigint): string {
  const tempNumber = Number(temp) / 10;
  return `${tempNumber.toFixed(1)}°C`;
}

/**
 * Shortens an Ethereum address for display
 * @param address Full Ethereum address
 * @returns Shortened address (e.g. 0x1234...5678)
 */
export function shortenAddress(address: string): string {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

/**
 * Gets transaction URL for etherscan or block explorer
 * @param txHash Transaction hash
 * @param chainId Chain ID
 * @returns URL to view transaction
 */
export function getTransactionUrl(txHash: string, chainId: number): string {
  // For local development/hardhat
  if (chainId === 31337) {
    return `#`;
  }
  
  // For Ethereum mainnet
  if (chainId === 1) {
    return `https://etherscan.io/tx/${txHash}`;
  }
  
  // For Sepolia testnet
  if (chainId === 11155111) {
    return `https://sepolia.etherscan.io/tx/${txHash}`;
  }
  
  // For Goerli testnet (deprecated but still used)
  if (chainId === 5) {
    return `https://goerli.etherscan.io/tx/${txHash}`;
  }
  
  // Default fallback to Etherscan
  return `https://etherscan.io/tx/${txHash}`;
}