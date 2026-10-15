import { defineConfig, devices } from '@playwright/test';

// Software WebGL (SwiftShader) so R3F scenes render in headless Chromium.
const launchOptions = {
  args: [
    '--enable-unsafe-swiftshader',
    '--use-angle=swiftshader',
    '--ignore-gpu-blocklist',
  ],
};

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: 'http://localhost:3100',
    trace: 'on-first-retry',
  },
  webServer: {
    command: 'npm run build && npm run start -- -p 3100',
    port: 3100,
    reuseExistingServer: !process.env.CI,
    timeout: 240_000,
  },
  projects: [
    {
      name: 'chromium',
      testIgnore: /perf\.spec\.ts/,
      use: { ...devices['Desktop Chrome'], launchOptions },
    },
    {
      name: 'mobile',
      testIgnore: /perf\.spec\.ts/,
      use: { ...devices['Pixel 7'], launchOptions },
    },
    {
      // Timing and byte budgets (e2e/perf.spec.ts). Opt-in: `npm run test:e2e`
      // names only chromium and mobile, `npm run test:perf` runs this project
      // alone. It needs the machine to itself: SwiftShader shares the CPU with
      // every parallel worker, which would skew LCP and starve the throttled
      // page. (A bare `npx playwright test` still runs it, after the others.)
      name: 'perf',
      testMatch: /perf\.spec\.ts/,
      dependencies: ['chromium', 'mobile'],
      use: { ...devices['Desktop Chrome'], launchOptions },
    },
  ],
});
