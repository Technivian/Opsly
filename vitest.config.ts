import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    globalSetup: ['./tests/global-setup.ts'],
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['server/**/*.ts'],
      exclude: ['server/replit_integrations/**'],
    },
    testTimeout: 10000,
    hookTimeout: 10000,
    // Run tests sequentially to avoid shared-database contention.
    // The integration tests share a single Postgres database and clean it
    // between tests (tests/setup.ts afterEach). They must therefore never run
    // concurrently. In Vitest 4 the single-process option lives under
    // poolOptions.forks; a top-level `singleFork` is ignored, which let files
    // run in parallel forks and caused flaky auth/automation failures.
    pool: 'forks',
    poolOptions: {
      forks: { singleFork: true },
    },
    fileParallelism: false,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './client/src'),
      '@shared': path.resolve(__dirname, './shared'),
    },
  },
});
