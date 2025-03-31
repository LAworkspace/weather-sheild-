import { ethers } from 'ethers';
import WeatherInsuranceABI from './WeatherInsurance.json';

// Contract address - will be updated after deployment
const CONTRACT_ADDRESS = '0x5FbDB2315678afecb367f032d93F642f64180aa3'; // Default local hardhat deployment address

export interface Policy {
  policyHolder: string;
  premiumPaid: bigint;
  insuredAmount: bigint;
  minTemperature: bigint;
  maxTemperature: bigint;
  isActive: boolean;
}

/**
 * Class to interact with the WeatherInsurance smart contract
 */
export class WeatherInsuranceContract {
  private contract: ethers.Contract | null = null;
  private signer: ethers.JsonRpcSigner | null = null;

  /**
   * Constructor
   * @param signerOrProvider Signer or provider to connect to the contract
   */
  constructor(signerOrProvider: ethers.JsonRpcSigner | ethers.Provider) {
    if (signerOrProvider instanceof ethers.JsonRpcSigner) {
      this.signer = signerOrProvider;
      this.contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        WeatherInsuranceABI.abi,
        this.signer
      );
    } else {
      this.contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        WeatherInsuranceABI.abi,
        signerOrProvider
      );
    }
  }

  /**
   * Connect with a signer to enable write operations
   * @param signer JsonRpcSigner to connect with
   */
  connect(signer: ethers.JsonRpcSigner) {
    this.signer = signer;
    if (this.contract) {
      this.contract = this.contract.connect(signer);
    } else {
      this.contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        WeatherInsuranceABI.abi,
        signer
      );
    }
  }

  /**
   * Check if the contract is initialized
   * @returns True if the contract is initialized
   */
  isInitialized(): boolean {
    return this.contract !== null;
  }

  /**
   * Buy a new insurance policy
   * @param minTemp Minimum temperature for policy activation (in tenths of a degree)
   * @param maxTemp Maximum temperature for policy activation (in tenths of a degree)
   * @param premiumAmount Premium amount in ETH
   * @returns Transaction response
   */
  async buyPolicy(minTemp: number, maxTemp: number, premiumAmount: string): Promise<ethers.ContractTransactionResponse> {
    if (!this.contract || !this.signer) {
      throw new Error('Contract or signer not initialized');
    }

    // Convert temperatures to blockchain format (tenths of degree)
    const minTempInt = Math.round(minTemp * 10);
    const maxTempInt = Math.round(maxTemp * 10);

    // Convert premium amount to wei
    const premium = ethers.parseEther(premiumAmount);

    // Buy policy
    return await this.contract.buyPolicy(minTempInt, maxTempInt, { value: premium });
  }

  /**
   * Check weather conditions and process payout if conditions are met
   * @returns Transaction response
   */
  async checkWeatherAndProcessPayout(): Promise<ethers.ContractTransactionResponse> {
    if (!this.contract || !this.signer) {
      throw new Error('Contract or signer not initialized');
    }

    return await this.contract.checkWeatherAndProcessPayout();
  }

  /**
   * Get policy details for a given address
   * @param address Address to get policy for
   * @returns Policy details
   */
  async getPolicy(address: string): Promise<Policy> {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }

    return await this.contract.getPolicy(address);
  }

  /**
   * Get policy details for the current user
   * @returns Policy details or null if no signer is available
   */
  async getUserPolicy(): Promise<Policy | null> {
    if (!this.contract || !this.signer) {
      throw new Error('Contract or signer not initialized');
    }

    const address = await this.signer.getAddress();
    return await this.getPolicy(address);
  }
}

/**
 * Get a WeatherInsurance contract instance
 * @param signerOrProvider Signer or provider to connect with
 * @returns WeatherInsurance contract instance
 */
export function getWeatherInsuranceContract(signerOrProvider: ethers.JsonRpcSigner | ethers.Provider): WeatherInsuranceContract {
  return new WeatherInsuranceContract(signerOrProvider);
}