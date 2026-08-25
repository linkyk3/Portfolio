import { existsSync } from "node:fs";
import { resolve } from "node:path";
import dotenv from "dotenv";
import app from "./app";
import { logger } from "./lib/logger";

const candidateEnvFiles = [
  resolve(process.cwd(), ".env.local"),
  resolve(process.cwd(), ".env"),
  resolve(process.cwd(), "..", "..", ".env.local"),
  resolve(process.cwd(), "..", "..", ".env"),
];

for (const envFile of candidateEnvFiles) {
  if (existsSync(envFile)) {
    dotenv.config({ path: envFile, override: false });
  }
}

logger.info(
  {
    hasDiscogsUsername: Boolean(process.env["DISCOGS_USERNAME"]),
    hasDiscogsToken: Boolean(process.env["DISCOGS_API_TOKEN"]),
  },
  "Discogs env configuration check",
);

const rawPort = process.env["PORT"] ?? "3000";

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

app.listen(port, (err) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }

  logger.info({ port }, "Server listening");
});
