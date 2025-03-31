import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import {
  insertPolicySchema,
  insertTransactionSchema,
  insertWeatherDataSchema,
  locations,
  weatherEventTypes,
  policyDurations,
  PolicyStatus,
} from "@shared/schema";

// Helper function to validate request body
const validateBody = <T>(schema: z.ZodType<T>, body: unknown): T => {
  try {
    return schema.parse(body);
  } catch (error) {
    throw { status: 400, message: "Invalid request body", error };
  }
};

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes for policies
  app.get("/api/policies/:walletAddress", async (req, res) => {
    const { walletAddress } = req.params;
    if (!walletAddress) {
      return res.status(400).json({ message: "Wallet address is required" });
    }
    
    const policies = await storage.getPolicies(walletAddress);
    res.json(policies);
  });

  app.get("/api/policy/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid policy ID" });
    }
    
    const policy = await storage.getPolicy(id);
    if (!policy) {
      return res.status(404).json({ message: "Policy not found" });
    }
    
    res.json(policy);
  });

  app.post("/api/policies", async (req, res) => {
    try {
      const policyData = validateBody(insertPolicySchema, req.body);
      const policy = await storage.createPolicy(policyData);
      res.status(201).json(policy);
    } catch (error: any) {
      res.status(error.status || 500).json({ message: error.message || "Failed to create policy" });
    }
  });

  app.patch("/api/policies/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid policy ID" });
    }
    
    try {
      const policy = await storage.getPolicy(id);
      if (!policy) {
        return res.status(404).json({ message: "Policy not found" });
      }
      
      const updates = req.body;
      const updatedPolicy = await storage.updatePolicy(id, updates);
      res.json(updatedPolicy);
    } catch (error: any) {
      res.status(error.status || 500).json({ message: error.message || "Failed to update policy" });
    }
  });

  // API routes for transactions
  app.get("/api/transactions/:walletAddress", async (req, res) => {
    const { walletAddress } = req.params;
    if (!walletAddress) {
      return res.status(400).json({ message: "Wallet address is required" });
    }
    
    const transactions = await storage.getTransactions(walletAddress);
    res.json(transactions);
  });

  app.post("/api/transactions", async (req, res) => {
    try {
      const transactionData = validateBody(insertTransactionSchema, req.body);
      const transaction = await storage.createTransaction(transactionData);
      res.status(201).json(transaction);
    } catch (error: any) {
      res.status(error.status || 500).json({ message: error.message || "Failed to create transaction" });
    }
  });

  // API routes for weather data
  app.get("/api/weather/:location", async (req, res) => {
    const { location } = req.params;
    if (!location) {
      return res.status(400).json({ message: "Location is required" });
    }
    
    const weatherData = await storage.getWeatherData(location);
    if (!weatherData) {
      return res.status(404).json({ message: "Weather data not found for this location" });
    }
    
    res.json(weatherData);
  });

  app.get("/api/weather", async (req, res) => {
    const allWeatherData = await storage.getAllWeatherData();
    res.json(allWeatherData);
  });

  app.patch("/api/weather/:location", async (req, res) => {
    const { location } = req.params;
    if (!location) {
      return res.status(400).json({ message: "Location is required" });
    }
    
    try {
      const weatherData = await storage.getWeatherData(location);
      if (!weatherData) {
        return res.status(404).json({ message: "Weather data not found for this location" });
      }
      
      const updates = req.body;
      const updatedData = await storage.updateWeatherData(location, updates);
      res.json(updatedData);
    } catch (error: any) {
      res.status(error.status || 500).json({ message: error.message || "Failed to update weather data" });
    }
  });

  // API route for location and weather event options
  app.get("/api/options", async (_req, res) => {
    res.json({
      locations,
      weatherEventTypes,
      policyDurations,
    });
  });

  // API route for checking claim eligibility
  app.post("/api/check-eligibility/:policyId", async (req, res) => {
    const policyId = parseInt(req.params.policyId);
    if (isNaN(policyId)) {
      return res.status(400).json({ message: "Invalid policy ID" });
    }
    
    try {
      const policy = await storage.getPolicy(policyId);
      if (!policy) {
        return res.status(404).json({ message: "Policy not found" });
      }
      
      const weatherData = await storage.getWeatherData(policy.location);
      if (!weatherData) {
        return res.status(404).json({ message: "Weather data not found for this location" });
      }
      
      // Check eligibility based on policy type and weather data
      let isEligible = false;
      let reason = "";
      
      switch (policy.eventType) {
        case "rainfall":
          if (policy.threshold <= weatherData.rainfall30d) {
            isEligible = true;
            reason = `Rainfall threshold exceeded: ${weatherData.rainfall30d}mm (threshold: ${policy.threshold}mm)`;
          }
          break;
        case "drought":
          if (policy.threshold <= weatherData.daysWithoutRain) {
            isEligible = true;
            reason = `Days without rain exceeded: ${weatherData.daysWithoutRain} days (threshold: ${policy.threshold} days)`;
          }
          break;
        case "heatwave":
          if (policy.threshold <= weatherData.temperature) {
            isEligible = true;
            reason = `Temperature threshold exceeded: ${weatherData.temperature}°C (threshold: ${policy.threshold}°C)`;
          }
          break;
        case "storm":
          if (policy.threshold <= weatherData.windSpeed) {
            isEligible = true;
            reason = `Wind speed threshold exceeded: ${weatherData.windSpeed}km/h (threshold: ${policy.threshold}km/h)`;
          }
          break;
      }
      
      if (isEligible && policy.status === PolicyStatus.ACTIVE) {
        // Update policy status to claim eligible
        await storage.updatePolicy(policyId, { status: PolicyStatus.CLAIM_ELIGIBLE });
      }
      
      res.json({
        policyId,
        isEligible,
        reason,
        weatherData,
      });
    } catch (error: any) {
      res.status(error.status || 500).json({ message: error.message || "Failed to check eligibility" });
    }
  });

  // API route for processing claim payout
  app.post("/api/claim-payout/:policyId", async (req, res) => {
    const policyId = parseInt(req.params.policyId);
    if (isNaN(policyId)) {
      return res.status(400).json({ message: "Invalid policy ID" });
    }
    
    try {
      const policy = await storage.getPolicy(policyId);
      if (!policy) {
        return res.status(404).json({ message: "Policy not found" });
      }
      
      if (policy.status !== PolicyStatus.CLAIM_ELIGIBLE) {
        return res.status(400).json({ message: "Policy is not eligible for claim payout" });
      }
      
      const { txHash } = req.body;
      if (!txHash) {
        return res.status(400).json({ message: "Transaction hash is required" });
      }
      
      // Update policy status to claimed
      const updatedPolicy = await storage.updatePolicy(policyId, { 
        status: PolicyStatus.CLAIMED, 
        txHash 
      });
      
      // Create transaction record for the claim payout
      const transaction = await storage.createTransaction({
        walletAddress: policy.walletAddress,
        type: "claim_paid",
        amount: policy.coverage,
        txHash,
        timestamp: new Date(),
        policyId,
        details: { reason: "Claim payout for policy", policy }
      });
      
      res.json({
        success: true,
        policy: updatedPolicy,
        transaction
      });
    } catch (error: any) {
      res.status(error.status || 500).json({ message: error.message || "Failed to process claim payout" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
