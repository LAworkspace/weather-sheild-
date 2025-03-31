import { ethers } from 'ethers';
import WeatherOracleABI from './WeatherOracle.json';

// Oracle contract address - will be updated after deployment
const ORACLE_ADDRESS = '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512'; // Default local hardhat deployment address

export interface WeatherData {
  temperature: bigint;
  rainfall24h: bigint;
  rainfall30d: bigint;
  daysWithoutRain: bigint;
  windSpeed: bigint;
  lastUpdated: bigint;
}

/**
 * Class to interact with the WeatherOracle smart contract
 */
export class WeatherOracleContract {
  private contract: ethers.Contract | null = null;
  private provider: ethers.Provider | null = null;

  /**
   * Constructor
   * @param provider Provider to connect to the contract
   */
  constructor(provider: ethers.Provider) {
    this.provider = provider;
    this.contract = new ethers.Contract(
      ORACLE_ADDRESS,
      WeatherOracleABI.abi,
      provider
    );
  }

  /**
   * Check if the contract is initialized
   * @returns True if the contract is initialized
   */
  isInitialized(): boolean {
    return this.contract !== null;
  }

  /**
   * Get current temperature
   * @returns Current temperature in tenths of a degree
   */
  async getTemperature(): Promise<bigint> {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }
    return await this.contract.getTemperature();
  }

  /**
   * Get rainfall data
   * @returns Rainfall data: [rainfall24h, rainfall30d, daysWithoutRain]
   */
  async getRainfallData(): Promise<[bigint, bigint, bigint]> {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }
    return await this.contract.getRainfallData();
  }

  /**
   * Get wind speed
   * @returns Current wind speed in tenths of km/h
   */
  async getWindSpeed(): Promise<bigint> {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }
    return await this.contract.getWindSpeed();
  }

  /**
   * Get all weather data
   * @returns All weather data in a structured object
   */
  async getAllWeatherData(): Promise<WeatherData> {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }
    
    const data = await this.contract.getAllWeatherData();
    
    return {
      temperature: data[0],
      rainfall24h: data[1],
      rainfall30d: data[2],
      daysWithoutRain: data[3],
      windSpeed: data[4],
      lastUpdated: data[5]
    };
  }
}

/**
 * Get a WeatherOracle contract instance
 * @param provider Provider to connect with
 * @returns WeatherOracle contract instance
 */
export function getWeatherOracleContract(provider: ethers.Provider): WeatherOracleContract {
  return new WeatherOracleContract(provider);
}

/**
 * Format weather data for display
 * @param data Weather data from oracle
 * @returns Formatted data for display
 */
export function formatWeatherData(data: WeatherData): Record<string, string | number> {
  return {
    temperature: Number(data.temperature) / 10,
    rainfall24h: Number(data.rainfall24h) / 10,
    rainfall30d: Number(data.rainfall30d),
    daysWithoutRain: Number(data.daysWithoutRain),
    windSpeed: Number(data.windSpeed) / 10,
    lastUpdated: new Date(Number(data.lastUpdated) * 1000).toLocaleString()
  };
}