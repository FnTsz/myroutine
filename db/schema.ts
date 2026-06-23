import { pgTable, text, integer, serial, boolean, real, unique } from "drizzle-orm/pg-core";

export const habits = pgTable("habits", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  frequency: text("frequency").notNull().default("daily"),
  frequencyDays: integer("frequency_days").default(1),
  color: text("color").default("#6366f1"),
  createdAt: text("created_at").notNull().default(new Date().toISOString()),
  active: boolean("active").notNull().default(true),
});

export const habitLogs = pgTable("habit_logs", {
  id: serial("id").primaryKey(),
  habitId: integer("habit_id").notNull().references(() => habits.id, { onDelete: "cascade" }),
  date: text("date").notNull(),
  completed: boolean("completed").notNull().default(false),
});

export const meals = pgTable("meals", {
  id: serial("id").primaryKey(),
  date: text("date").notNull(),
  mealType: text("meal_type").notNull(),
  description: text("description").notNull(),
  calories: integer("calories"),
  protein: integer("protein"),
  carbs: integer("carbs"),
  createdAt: text("created_at").notNull().default(new Date().toISOString()),
});

export const dietConfig = pgTable("diet_config", {
  id: serial("id").primaryKey(),
  dailyGoal: integer("daily_goal").notNull().default(2000),
  proteinGoal: integer("protein_goal").notNull().default(150),
  carbsGoal: integer("carbs_goal").notNull().default(250),
});

export const sleepLogs = pgTable("sleep_logs", {
  id: serial("id").primaryKey(),
  date: text("date").notNull().unique(),
  score: integer("score").notNull(),
  notes: text("notes"),
  createdAt: text("created_at").notNull().default(new Date().toISOString()),
});

export const trainingPlans = pgTable("training_plans", {
  id: serial("id").primaryKey(),
  date: text("date").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  type: text("type").default("run"),
  plannedDistance: real("planned_distance"),
  plannedDuration: integer("planned_duration"),
  createdAt: text("created_at").notNull().default(new Date().toISOString()),
});

export const hydrationLogs = pgTable("hydration_logs", {
  id: serial("id").primaryKey(),
  date: text("date").notNull().unique(),
  amountMl: integer("amount_ml").notNull().default(0),
  createdAt: text("created_at").notNull().default(new Date().toISOString()),
});

export const stravaTokens = pgTable("strava_tokens", {
  id: serial("id").primaryKey(),
  athleteId: integer("athlete_id").notNull(),
  accessToken: text("access_token").notNull(),
  refreshToken: text("refresh_token").notNull(),
  expiresAt: integer("expires_at").notNull(),
});

export const stravaActivities = pgTable("strava_activities", {
  id: serial("id").primaryKey(),
  stravaId: text("strava_id").notNull().unique(),
  date: text("date").notNull(),
  name: text("name").notNull(),
  type: text("type").notNull(),
  distance: real("distance"),
  duration: integer("duration"),
  avgHeartRate: integer("avg_heart_rate"),
  avgPace: real("avg_pace"),
  elevationGain: real("elevation_gain"),
  rawData: text("raw_data"),
  createdAt: text("created_at").notNull().default(new Date().toISOString()),
});
