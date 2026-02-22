import { z } from "zod"

// JWT_SECRET: Allow dev fallback to prevent blocking during development
// Per user requirement: "Do not crash on missing JWT_SECRET during dev"
const jwtSecretSchema = 
  process.env.NODE_ENV === "production"
    ? z.string().min(1, "JWT_SECRET is required in production")
    : z.string().min(1, "JWT_SECRET is required").default("dev")

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  JWT_SECRET: jwtSecretSchema,
  NEWS_API_KEY: z.string().optional(),
  THESPORTSDB_API_KEY: z.string().optional(),
  ADMIN_PASSWORD: z.string().optional(),
  ADMIN_PASSWORD_HASH: z.string().optional(),
  // REMOVED: CLAUDE_API_KEY - All AI features removed per requirements
  // Security: RISK-002 - Add API base URL environment variables
  NEXT_PUBLIC_THESPORTSDB_API_BASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_NEWSDATA_API_BASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_UFC_API_BASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_NEWS_API_KEY: z.string().optional(), // Only if key must be public
})

// Parse with defaults for dev
const parsedEnv = envSchema.safeParse({
  ...process.env,
  JWT_SECRET: process.env.JWT_SECRET || (process.env.NODE_ENV !== "production" ? "dev" : undefined),
})

let env: z.infer<typeof envSchema>

if (!parsedEnv.success) {
  if (process.env.NODE_ENV !== "production") {
    console.warn("[ENV] JWT_SECRET not set, using 'dev' fallback for development")
    // Use fallback in dev
    env = envSchema.parse({
      ...process.env,
      JWT_SECRET: "dev",
    })
  } else {
    const missingFields = parsedEnv.error.errors.map((e) => e.path.join(".")).join(", ")
    throw new Error(
      `Environment validation failed. Missing or invalid fields: ${missingFields}\n` +
        `Please set these in your .env.local file. See README.env.example for required variables.`
    )
  }
} else {
  env = parsedEnv.data
}

export { env }

// Log API key status
if (!process.env.THESPORTSDB_API_KEY) {
  console.warn("[ENV] THESPORTSDB_API_KEY not set, using free tier fallback '123'")
}

// Helper function to check if JWT_SECRET is available
export function hasJwtSecret(): boolean {
  return !!process.env.JWT_SECRET && process.env.JWT_SECRET.length > 0
}

// Helper function to get JWT secret with validation
export function getJwtSecret(): string {
  if (!hasJwtSecret()) {
    throw new Error("JWT_SECRET environment variable is required")
  }
  return process.env.JWT_SECRET!
}