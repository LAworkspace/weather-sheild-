import { pgTable, text, serial, integer, boolean, timestamp, json, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Original users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Weather event types enum
export const WeatherEventType = {
  RAINFALL: "rainfall",
  DROUGHT: "drought",
  HEATWAVE: "heatwave",
  STORM: "storm",
} as const;

export type WeatherEventTypeValue = typeof WeatherEventType[keyof typeof WeatherEventType];

// Policy status enum
export const PolicyStatus = {
  ACTIVE: "active",
  CLAIM_ELIGIBLE: "claim_eligible",
  CLAIMED: "claimed",
  EXPIRED: "expired",
} as const;

export type PolicyStatusValue = typeof PolicyStatus[keyof typeof PolicyStatus];

// Insurance policies table
export const policies = pgTable("policies", {
  id: serial("id").primaryKey(),
  walletAddress: text("wallet_address").notNull(),
  location: text("location").notNull(),
  eventType: text("event_type").notNull(),
  threshold: real("threshold").notNull(),
  coverage: real("coverage").notNull(),
  premium: real("premium").notNull(),
  duration: integer("duration").notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  status: text("status").notNull(),
  currentValue: real("current_value").notNull(),
  txHash: text("tx_hash"),
});

export const insertPolicySchema = createInsertSchema(policies).omit({
  id: true,
});

export type InsertPolicy = z.infer<typeof insertPolicySchema>;
export type Policy = typeof policies.$inferSelect;

// Transactions table
export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  walletAddress: text("wallet_address").notNull(),
  type: text("type").notNull(), // 'policy_created', 'claim_paid'
  amount: real("amount").notNull(),
  txHash: text("tx_hash").notNull(),
  timestamp: timestamp("timestamp").notNull(),
  policyId: integer("policy_id"),
  details: json("details"),
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
});

export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Transaction = typeof transactions.$inferSelect;

// Weather data table
export const weatherData = pgTable("weather_data", {
  id: serial("id").primaryKey(),
  location: text("location").notNull(),
  temperature: real("temperature"),
  rainfall24h: real("rainfall_24h"),
  rainfall30d: real("rainfall_30d"),
  daysWithoutRain: integer("days_without_rain"),
  humidity: real("humidity"),
  windSpeed: real("wind_speed"),
  forecast: text("forecast"),
  lastUpdated: timestamp("last_updated").notNull(),
});

export const insertWeatherDataSchema = createInsertSchema(weatherData).omit({
  id: true,
});

export type InsertWeatherData = z.infer<typeof insertWeatherDataSchema>;
export type WeatherData = typeof weatherData.$inferSelect;

// Locations
export const locations = [
  { id: "new-york", name: "New York, USA" },
  { id: "london", name: "London, UK" },
  { id: "tokyo", name: "Tokyo, Japan" },
  { id: "sydney", name: "Sydney, Australia" },
  { id: "mumbai", name: "Mumbai, India" },
];

// Weather event types
export const weatherEventTypes = [
  { id: WeatherEventType.RAINFALL, name: "Excessive Rainfall" },
  { id: WeatherEventType.DROUGHT, name: "Drought" },
  { id: WeatherEventType.HEATWAVE, name: "Heatwave" },
  { id: WeatherEventType.STORM, name: "Storm" },
];

// Policy durations
export const policyDurations = [
  { days: 30, name: "30 Days" },
  { days: 60, name: "60 Days" },
  { days: 90, name: "90 Days" },
  { days: 180, name: "180 Days" },
  { days: 365, name: "365 Days" },
];
