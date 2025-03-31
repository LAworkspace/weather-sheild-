import {
  users, type User, type InsertUser,
  policies, type Policy, type InsertPolicy,
  transactions, type Transaction, type InsertTransaction,
  weatherData, type WeatherData, type InsertWeatherData,
} from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Policy operations
  getPolicies(walletAddress: string): Promise<Policy[]>;
  getPolicy(id: number): Promise<Policy | undefined>;
  createPolicy(policy: InsertPolicy): Promise<Policy>;
  updatePolicy(id: number, updates: Partial<Policy>): Promise<Policy | undefined>;
  
  // Transaction operations
  getTransactions(walletAddress: string): Promise<Transaction[]>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  
  // Weather data operations
  getWeatherData(location: string): Promise<WeatherData | undefined>;
  getAllWeatherData(): Promise<WeatherData[]>;
  updateWeatherData(location: string, data: Partial<WeatherData>): Promise<WeatherData | undefined>;
  createWeatherData(data: InsertWeatherData): Promise<WeatherData>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private policiesMap: Map<number, Policy>;
  private transactionsMap: Map<number, Transaction>;
  private weatherDataMap: Map<string, WeatherData>;
  private currentUserId: number;
  private currentPolicyId: number;
  private currentTransactionId: number;
  private currentWeatherDataId: number;

  constructor() {
    this.users = new Map();
    this.policiesMap = new Map();
    this.transactionsMap = new Map();
    this.weatherDataMap = new Map();
    this.currentUserId = 1;
    this.currentPolicyId = 1;
    this.currentTransactionId = 1;
    this.currentWeatherDataId = 1;
    
    // Initialize with some default weather data
    this.initializeWeatherData();
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Policy operations
  async getPolicies(walletAddress: string): Promise<Policy[]> {
    return Array.from(this.policiesMap.values()).filter(
      (policy) => policy.walletAddress.toLowerCase() === walletAddress.toLowerCase(),
    );
  }

  async getPolicy(id: number): Promise<Policy | undefined> {
    return this.policiesMap.get(id);
  }

  async createPolicy(insertPolicy: InsertPolicy): Promise<Policy> {
    const id = this.currentPolicyId++;
    const policy: Policy = { ...insertPolicy, id };
    this.policiesMap.set(id, policy);
    return policy;
  }

  async updatePolicy(id: number, updates: Partial<Policy>): Promise<Policy | undefined> {
    const policy = this.policiesMap.get(id);
    if (!policy) return undefined;
    
    const updatedPolicy = { ...policy, ...updates };
    this.policiesMap.set(id, updatedPolicy);
    return updatedPolicy;
  }

  // Transaction operations
  async getTransactions(walletAddress: string): Promise<Transaction[]> {
    return Array.from(this.transactionsMap.values())
      .filter(tx => tx.walletAddress.toLowerCase() === walletAddress.toLowerCase())
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const id = this.currentTransactionId++;
    const transaction: Transaction = { ...insertTransaction, id };
    this.transactionsMap.set(id, transaction);
    return transaction;
  }

  // Weather data operations
  async getWeatherData(location: string): Promise<WeatherData | undefined> {
    return this.weatherDataMap.get(location);
  }

  async getAllWeatherData(): Promise<WeatherData[]> {
    return Array.from(this.weatherDataMap.values());
  }

  async updateWeatherData(location: string, updates: Partial<WeatherData>): Promise<WeatherData | undefined> {
    const data = this.weatherDataMap.get(location);
    if (!data) return undefined;
    
    const updatedData = { ...data, ...updates, lastUpdated: new Date() };
    this.weatherDataMap.set(location, updatedData);
    return updatedData;
  }

  async createWeatherData(insertData: InsertWeatherData): Promise<WeatherData> {
    const id = this.currentWeatherDataId++;
    const data: WeatherData = { ...insertData, id };
    this.weatherDataMap.set(data.location, data);
    return data;
  }

  // Initialize with default weather data for demonstration
  private initializeWeatherData() {
    const now = new Date();
    
    const mumbaiData: InsertWeatherData = {
      location: "mumbai",
      temperature: 32,
      rainfall24h: 0,
      rainfall30d: 0,
      daysWithoutRain: 32,
      humidity: 65,
      windSpeed: 12,
      forecast: "Clear sky",
      lastUpdated: now,
    };
    
    const newYorkData: InsertWeatherData = {
      location: "new-york",
      temperature: 24,
      rainfall24h: 22,
      rainfall30d: 85,
      daysWithoutRain: 0,
      humidity: 78,
      windSpeed: 8,
      forecast: "Partly cloudy",
      lastUpdated: now,
    };
    
    const londonData: InsertWeatherData = {
      location: "london",
      temperature: 18,
      rainfall24h: 5,
      rainfall30d: 65,
      daysWithoutRain: 0,
      humidity: 82,
      windSpeed: 15,
      forecast: "Light rain",
      lastUpdated: now,
    };
    
    const tokyoData: InsertWeatherData = {
      location: "tokyo",
      temperature: 28,
      rainfall24h: 0,
      rainfall30d: 45,
      daysWithoutRain: 3,
      humidity: 70,
      windSpeed: 10,
      forecast: "Sunny",
      lastUpdated: now,
    };
    
    const sydneyData: InsertWeatherData = {
      location: "sydney",
      temperature: 26,
      rainfall24h: 0,
      rainfall30d: 20,
      daysWithoutRain: 10,
      humidity: 75,
      windSpeed: 18,
      forecast: "Mostly sunny",
      lastUpdated: now,
    };
    
    this.createWeatherData(mumbaiData);
    this.createWeatherData(newYorkData);
    this.createWeatherData(londonData);
    this.createWeatherData(tokyoData);
    this.createWeatherData(sydneyData);
  }
}

export const storage = new MemStorage();
