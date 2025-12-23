import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for Eir site E2E and visual regression testing.
 * Tests across mobile, tablet, and desktop viewports.
 */
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html', { open: 'never' }],
    ['list']
  ],
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  // Configure projects for different viewports
  projects: [
    // Desktop browsers
    {
      name: 'Desktop Chrome',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 },
      },
    },
    {
      name: 'Desktop Firefox',
      use: {
        ...devices['Desktop Firefox'],
        viewport: { width: 1920, height: 1080 },
      },
    },
    {
      name: 'Desktop Safari',
      use: {
        ...devices['Desktop Safari'],
        viewport: { width: 1920, height: 1080 },
      },
    },

    // Tablet
    {
      name: 'iPad',
      use: {
        ...devices['iPad Pro 11'],
      },
    },
    {
      name: 'iPad Landscape',
      use: {
        ...devices['iPad Pro 11 landscape'],
      },
    },

    // Mobile
    {
      name: 'iPhone 14',
      use: {
        ...devices['iPhone 14'],
      },
    },
    {
      name: 'iPhone 14 Pro Max',
      use: {
        ...devices['iPhone 14 Pro Max'],
      },
    },
    {
      name: 'Pixel 7',
      use: {
        ...devices['Pixel 7'],
      },
    },
  ],

  // Run local server before tests
  webServer: {
    command: 'npx serve -l 3000',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
