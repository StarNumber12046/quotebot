import { type Config } from "drizzle-kit";
import process from "process";

export default {
  schema: "./src/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  tablesFilter: ["backend_*"],
} satisfies Config;
