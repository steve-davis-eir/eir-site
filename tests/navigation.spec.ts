import { test, expect } from '@playwright/test';

/**
 * Navigation tests - verify all navigation links work correctly
 */

test.describe('Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('homepage loads correctly', async ({ page }) => {
    await expect(page).toHaveTitle(/Eir/i);
    await expect(page.locator('body')).toBeVisible();
  });

  test('all main navigation links are present', async ({ page }) => {
    // Check desktop nav links exist
    const navLinks = [
      'Software',
      'Athletes/Coaches',
      'Technology',
      'Lactate Thresholds',
      'About',
    ];

    for (const linkText of navLinks) {
      const link = page.getByRole('link', { name: new RegExp(linkText, 'i') }).first();
      await expect(link).toBeVisible();
    }
  });

  test('navigation to About page works', async ({ page }) => {
    await page.getByRole('link', { name: /about/i }).first().click();
    await expect(page).toHaveURL(/about\.html/);
  });

  test('navigation to Software page works', async ({ page }) => {
    await page.getByRole('link', { name: /software/i }).first().click();
    await expect(page).toHaveURL(/software\.html/);
  });

  test('navigation to Technology page works', async ({ page }) => {
    await page.getByRole('link', { name: /technology/i }).first().click();
    await expect(page).toHaveURL(/technology\.html/);
  });

  test('navigation to Contact page works', async ({ page }) => {
    await page.getByRole('link', { name: /contact/i }).first().click();
    await expect(page).toHaveURL(/contact\.html/);
  });

  test('logo links to homepage', async ({ page }) => {
    // Navigate away first
    await page.goto('/about.html');

    // Click logo/home link
    const homeLink = page.locator('a[href*="index"], a[href="/"], a[href="./"]').first();
    if (await homeLink.isVisible()) {
      await homeLink.click();
      await expect(page).toHaveURL(/index\.html|\/$/);
    }
  });
});

test.describe('Internal links integrity', () => {
  const pages = [
    '/',
    '/index.html',
    '/about.html',
    '/software.html',
    '/technology.html',
    '/contact.html',
    '/join.html',
    '/waitlist.html',
    '/blog.html',
    '/members.html',
    '/lactate.html',
    '/lactate-1.html',
    '/athletes-coaches.html',
    '/privacy-policy.html',
    '/terms.html',
    '/product-gen2.html',
    '/product-early-access.html',
  ];

  for (const pagePath of pages) {
    test(`${pagePath} loads without errors`, async ({ page }) => {
      const response = await page.goto(pagePath);
      expect(response?.status()).toBe(200);

      // Check no JavaScript errors
      const errors: string[] = [];
      page.on('pageerror', error => errors.push(error.message));

      await page.waitForLoadState('networkidle');
      expect(errors).toHaveLength(0);
    });
  }
});
