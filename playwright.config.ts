import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 60_000,
  expect: {
    timeout: 10_000,
  },
  use: {
    baseURL: "http://127.0.0.1:5001",
    trace: "retain-on-failure",
  },
  webServer: {
    command: "set -a && source .env && set +a && PORT=5001 HOST=127.0.0.1 npm run dev",
    url: "http://127.0.0.1:5001",
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
