import { test, expect } from '@playwright/test';

/**
 * Visual regression tests - capture and compare screenshots across viewports
 */

// Pages to test visually
const pagesToTest = [
  { path: '/', name: 'homepage' },
  { path: '/about.html', name: 'about' },
  { path: '/software.html', name: 'software' },
  { path: '/technology.html', name: 'technology' },
  { path: '/contact.html', name: 'contact' },
  { path: '/join.html', name: 'join' },
  { path: '/waitlist.html', name: 'waitlist' },
  { path: '/blog.html', name: 'blog' },
  { path: '/product-gen2.html', name: 'product-gen2' },
];

test.describe('Visual Regression - Full Page', () => {
  for (const pageInfo of pagesToTest) {
    test(`${pageInfo.name} page visual test`, async ({ page }, testInfo) => {
      await page.goto(pageInfo.path);
      await page.waitForLoadState('networkidle');

      // Wait for images to load
      await page.waitForTimeout(1000);

      // Take full page screenshot
      await expect(page).toHaveScreenshot(`${pageInfo.name}-full.png`, {
        fullPage: true,
        maxDiffPixels: 100, // Allow some variance for dynamic content
        threshold: 0.2, // 20% pixel difference threshold
      });
    });
  }
});

test.describe('Visual Regression - Above the Fold', () => {
  for (const pageInfo of pagesToTest) {
    test(`${pageInfo.name} above-the-fold visual test`, async ({ page }, testInfo) => {
      await page.goto(pageInfo.path);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(500);

      // Take viewport screenshot (above the fold)
      await expect(page).toHaveScreenshot(`${pageInfo.name}-viewport.png`, {
        maxDiffPixels: 50,
        threshold: 0.2,
      });
    });
  }
});

test.describe('Visual Regression - Header', () => {
  test('header visual consistency', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Find header element
    const header = page.locator('header, [data-mesh-id*="SITE_HEADER"], #SITE_HEADER').first();

    if (await header.isVisible()) {
      await expect(header).toHaveScreenshot('header.png', {
        maxDiffPixels: 20,
        threshold: 0.1,
      });
    }
  });
});

test.describe('Visual Regression - Footer', () => {
  test('footer visual consistency', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Scroll to footer
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);

    // Find footer element
    const footer = page.locator('footer, [data-mesh-id*="SITE_FOOTER"], #SITE_FOOTER').first();

    if (await footer.isVisible()) {
      await expect(footer).toHaveScreenshot('footer.png', {
        maxDiffPixels: 20,
        threshold: 0.1,
      });
    }
  });
});

test.describe('Visual Regression - Mobile Menu', () => {
  // Only run on mobile viewports
  test.skip(({ browserName }, testInfo) => {
    const project = testInfo.project.name;
    return project.includes('Desktop');
  });

  test('mobile menu open state', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Open mobile menu
    const hamburger = page.locator('[aria-label*="Open Site Navigation"], [aria-label*="open navigation menu"]').first();

    if (await hamburger.isVisible()) {
      await hamburger.click();
      await page.waitForTimeout(500);

      // Take screenshot of open menu
      await expect(page).toHaveScreenshot('mobile-menu-open.png', {
        maxDiffPixels: 50,
        threshold: 0.2,
      });
    }
  });
});

test.describe('Visual Regression - Forms', () => {
  test('newsletter form appearance', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Scroll to form area (usually in footer)
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight - 1000));
    await page.waitForTimeout(500);

    const form = page.locator('form').first();

    if (await form.isVisible()) {
      await expect(form).toHaveScreenshot('newsletter-form.png', {
        maxDiffPixels: 30,
        threshold: 0.2,
      });
    }
  });

  test('contact form appearance', async ({ page }) => {
    await page.goto('/contact.html');
    await page.waitForLoadState('networkidle');

    const form = page.locator('form').first();

    if (await form.isVisible()) {
      await expect(form).toHaveScreenshot('contact-form.png', {
        maxDiffPixels: 30,
        threshold: 0.2,
      });
    }
  });
});

test.describe('Visual Regression - Product Pages', () => {
  test('product gen2 page hero', async ({ page }) => {
    await page.goto('/product-gen2.html');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    await expect(page).toHaveScreenshot('product-gen2-hero.png', {
      maxDiffPixels: 50,
      threshold: 0.2,
    });
  });

  test('product early access page hero', async ({ page }) => {
    await page.goto('/product-early-access.html');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    await expect(page).toHaveScreenshot('product-early-access-hero.png', {
      maxDiffPixels: 50,
      threshold: 0.2,
    });
  });
});

test.describe('Responsive Layout Tests', () => {
  const viewports = [
    { name: 'mobile-portrait', width: 375, height: 667 },
    { name: 'mobile-landscape', width: 667, height: 375 },
    { name: 'tablet-portrait', width: 768, height: 1024 },
    { name: 'tablet-landscape', width: 1024, height: 768 },
    { name: 'desktop', width: 1440, height: 900 },
    { name: 'desktop-wide', width: 1920, height: 1080 },
  ];

  for (const vp of viewports) {
    test(`homepage at ${vp.name} (${vp.width}x${vp.height})`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(500);

      await expect(page).toHaveScreenshot(`homepage-${vp.name}.png`, {
        maxDiffPixels: 100,
        threshold: 0.2,
      });
    });
  }
});
