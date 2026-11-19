import { defineConfig } from "drizzle-kit";

// Reads DATABASE_URL from the environment (or local .env file), so the same
// command works locally and against the live cloud database:
//   DATABASE_URL="<live-url>" npx drizzle-kit push
export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema.ts",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
