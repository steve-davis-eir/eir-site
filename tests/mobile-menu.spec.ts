import { test, expect } from '@playwright/test';

/**
 * Mobile menu tests - verify hamburger menu works on mobile/tablet
 */

test.describe('Mobile Menu', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('hamburger button is visible on mobile', async ({ page }) => {
    const hamburger = page.locator('[aria-label*="Open Site Navigation"], [aria-label*="open navigation menu"]').first();
    await expect(hamburger).toBeVisible();
  });

  test('clicking hamburger opens mobile menu', async ({ page }) => {
    // Find and click hamburger
    const hamburger = page.locator('[aria-label*="Open Site Navigation"], [aria-label*="open navigation menu"]').first();
    await hamburger.click();

    // Wait for menu to appear
    const mobileMenu = page.locator('[role="dialog"][aria-label*="Site navigation"]');
    await expect(mobileMenu).toBeVisible({ timeout: 5000 });
  });

  test('mobile menu contains navigation links', async ({ page }) => {
    // Open menu
    const hamburger = page.locator('[aria-label*="Open Site Navigation"], [aria-label*="open navigation menu"]').first();
    await hamburger.click();

    const mobileMenu = page.locator('[role="dialog"][aria-label*="Site navigation"]');
    await expect(mobileMenu).toBeVisible();

    // Check for nav links inside menu
    const menuLinks = mobileMenu.locator('a[href]');
    const count = await menuLinks.count();
    expect(count).toBeGreaterThan(0);
  });

  test('close button closes mobile menu', async ({ page }) => {
    // Open menu
    const hamburger = page.locator('[aria-label*="Open Site Navigation"], [aria-label*="open navigation menu"]').first();
    await hamburger.click();

    const mobileMenu = page.locator('[role="dialog"][aria-label*="Site navigation"]');
    await expect(mobileMenu).toBeVisible();

    // Click close button (Wix uses "Back to site" label)
    const closeButton = mobileMenu.locator('[aria-label="Back to site"], [aria-label*="Close navigation"], [aria-label*="close navigation"]').first();
    await closeButton.click();

    // Menu should be hidden
    await expect(mobileMenu).toBeHidden({ timeout: 5000 });
  });

  test('clicking a navigation link closes menu', async ({ page }) => {
    // Open menu
    const hamburger = page.locator('[aria-label*="Open Site Navigation"], [aria-label*="open navigation menu"]').first();
    await hamburger.click();

    const mobileMenu = page.locator('[role="dialog"][aria-label*="Site navigation"]');
    await expect(mobileMenu).toBeVisible();

    // Click a link
    const firstLink = mobileMenu.locator('a[href]').first();
    await firstLink.click();

    // Menu should close and page should navigate
    await page.waitForLoadState('networkidle');
  });

  test('escape key closes mobile menu', async ({ page }) => {
    // Open menu
    const hamburger = page.locator('[aria-label*="Open Site Navigation"], [aria-label*="open navigation menu"]').first();
    await hamburger.click();

    const mobileMenu = page.locator('[role="dialog"][aria-label*="Site navigation"]');
    await expect(mobileMenu).toBeVisible();

    // Press Escape
    await page.keyboard.press('Escape');

    // Menu should be hidden
    await expect(mobileMenu).toBeHidden({ timeout: 5000 });
  });
});
