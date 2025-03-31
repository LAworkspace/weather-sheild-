import { ethers } from 'ethers';
import WeatherInsuranceABI from './WeatherInsurance.json';

// Contract address - update this with your deployed contract address
const WEATHER_INSURANCE_ADDRESS = '0x5FbDB2315678afecb367f032d93F642f64180aa3'; // Default Hardhat first deployment address

export interface Policy {
  policyHolder: string;
  premiumPaid: bigint;
  insuredAmount: bigint;
  minTemperature: bigint;
  maxTemperature: bigint;
  isActive: boolean;
}

export class WeatherInsuranceContract {
  private contract: ethers.Contract | null = null;
  private signer: ethers.JsonRpcSigner | null = null;

  constructor(signerOrProvider: ethers.JsonRpcSigner | ethers.Provider) {
    try {
      // Check if it's a signer by looking for the getAddress method
      if ('getAddress' in signerOrProvider) {
        this.signer = signerOrProvider as ethers.JsonRpcSigner;
        this.contract = new ethers.Contract(
          WEATHER_INSURANCE_ADDRESS,
          WeatherInsuranceABI.abi,
          this.signer
        );
      } else {
        this.contract = new ethers.Contract(
          WEATHER_INSURANCE_ADDRESS,
          WeatherInsuranceABI.abi,
          signerOrProvider
        );
      }
    } catch (error) {
      console.error('Error initializing weather insurance contract:', error);
    }
  }

  // Connect with a new signer
  connect(signer: ethers.JsonRpcSigner) {
    this.signer = signer;
    if (this.contract) {
      this.contract = this.contract.connect(signer);
    }
    return this;
  }

  // Check if the contract is initialized
  isInitialized(): boolean {
    return !!this.contract;
  }

  // Buy a policy
  async buyPolicy(minTemp: number, maxTemp: number, premiumAmount: string): Promise<ethers.ContractTransactionResponse> {
    if (!this.contract) throw new Error('Contract not initialized');
    
    // Convert temperatures to integers (Solidity doesn't handle decimals)
    const minTempInt = Math.floor(minTemp * 10); // Store with 1 decimal precision
    const maxTempInt = Math.floor(maxTemp * 10);
    
    // Convert ETH to Wei
    const premium = ethers.parseEther(premiumAmount);
    
    // Call the contract function
    return await this.contract.buyPolicy(minTempInt, maxTempInt, {
      value: premium
    });
  }

  // Check weather and process payout
  async checkWeatherAndProcessPayout(): Promise<ethers.ContractTransactionResponse> {
    if (!this.contract) throw new Error('Contract not initialized');
    return await this.contract.checkWeatherAndProcessPayout();
  }

  // Get policy details for an address
  async getPolicy(address: string): Promise<Policy> {
    if (!this.contract) throw new Error('Contract not initialized');
    const policy = await this.contract.policies(address);
    return {
      policyHolder: policy.policyHolder,
      premiumPaid: policy.premiumPaid,
      insuredAmount: policy.insuredAmount,
      minTemperature: policy.minTemperature,
      maxTemperature: policy.maxTemperature,
      isActive: policy.isActive
    };
  }
  
  // Get user's current policy
  async getUserPolicy(): Promise<Policy | null> {
    if (!this.contract || !this.signer) throw new Error('Contract or signer not initialized');
    
    try {
      const address = await this.signer.getAddress();
      const policy = await this.getPolicy(address);
      
      // Check if policy is valid (policy holder should match the address)
      if (policy.policyHolder === ethers.ZeroAddress) {
        return null;
      }
      return policy;
    } catch (error) {
      console.error('Error getting user policy:', error);
      return null;
    }
  }
}

// Helper function to create a contract instance
export function getWeatherInsuranceContract(signerOrProvider: ethers.JsonRpcSigner | ethers.Provider): WeatherInsuranceContract {
  return new WeatherInsuranceContract(signerOrProvider);
}