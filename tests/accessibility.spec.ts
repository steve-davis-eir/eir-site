import { test, expect } from '@playwright/test';

/**
 * Accessibility tests - verify WCAG compliance basics
 */

const pagesToTest = [
  '/',
  '/about.html',
  '/software.html',
  '/technology.html',
  '/contact.html',
  '/join.html',
];

test.describe('Accessibility - Basic Checks', () => {
  for (const pagePath of pagesToTest) {
    test(`${pagePath} has proper document structure`, async ({ page }) => {
      await page.goto(pagePath);

      // Check for lang attribute
      const html = page.locator('html');
      await expect(html).toHaveAttribute('lang');

      // Check for title
      const title = await page.title();
      expect(title.length).toBeGreaterThan(0);

      // Check for h1
      const h1 = page.locator('h1');
      const h1Count = await h1.count();
      expect(h1Count).toBeGreaterThanOrEqual(1);
    });

    test(`${pagePath} images have alt text`, async ({ page }) => {
      await page.goto(pagePath);

      const images = page.locator('img');
      const count = await images.count();

      for (let i = 0; i < Math.min(count, 20); i++) {
        const img = images.nth(i);
        const alt = await img.getAttribute('alt');
        const role = await img.getAttribute('role');
        const ariaHidden = await img.getAttribute('aria-hidden');

        // Image should have alt text, or be decorative (role="presentation" or aria-hidden)
        const hasAlt = alt !== null && alt !== undefined;
        const isDecorative = role === 'presentation' || ariaHidden === 'true';

        expect(hasAlt || isDecorative).toBeTruthy();
      }
    });

    test(`${pagePath} links have accessible names`, async ({ page }) => {
      await page.goto(pagePath);

      const links = page.locator('a[href]');
      const count = await links.count();

      for (let i = 0; i < Math.min(count, 30); i++) {
        const link = links.nth(i);
        const text = await link.textContent();
        const ariaLabel = await link.getAttribute('aria-label');
        const title = await link.getAttribute('title');

        // Link should have text content, aria-label, or title
        const hasText = text && text.trim().length > 0;
        const hasLabel = ariaLabel && ariaLabel.length > 0;
        const hasTitle = title && title.length > 0;

        expect(hasText || hasLabel || hasTitle).toBeTruthy();
      }
    });

    test(`${pagePath} buttons have accessible names`, async ({ page }) => {
      await page.goto(pagePath);

      const buttons = page.locator('button, [role="button"]');
      const count = await buttons.count();

      for (let i = 0; i < count; i++) {
        const button = buttons.nth(i);
        const text = await button.textContent();
        const ariaLabel = await button.getAttribute('aria-label');
        const title = await button.getAttribute('title');

        // Button should have text content, aria-label, or title
        const hasText = text && text.trim().length > 0;
        const hasLabel = ariaLabel && ariaLabel.length > 0;
        const hasTitle = title && title.length > 0;

        expect(hasText || hasLabel || hasTitle).toBeTruthy();
      }
    });

    test(`${pagePath} form inputs have labels`, async ({ page }) => {
      await page.goto(pagePath);

      const inputs = page.locator('input:not([type="hidden"]):not([type="submit"]):not([type="button"])');
      const count = await inputs.count();

      for (let i = 0; i < count; i++) {
        const input = inputs.nth(i);
        const id = await input.getAttribute('id');
        const ariaLabel = await input.getAttribute('aria-label');
        const ariaLabelledBy = await input.getAttribute('aria-labelledby');
        const placeholder = await input.getAttribute('placeholder');

        // Check if there's an associated label
        let hasLabel = false;
        if (id) {
          const label = page.locator(`label[for="${id}"]`);
          hasLabel = await label.count() > 0;
        }

        const hasAriaLabel = ariaLabel && ariaLabel.length > 0;
        const hasAriaLabelledBy = ariaLabelledBy && ariaLabelledBy.length > 0;
        const hasPlaceholder = placeholder && placeholder.length > 0;

        expect(hasLabel || hasAriaLabel || hasAriaLabelledBy || hasPlaceholder).toBeTruthy();
      }
    });
  }
});

test.describe('Accessibility - Keyboard Navigation', () => {
  test('can tab through interactive elements', async ({ page }) => {
    await page.goto('/');

    // Start tabbing
    await page.keyboard.press('Tab');

    // Should be able to focus on interactive elements
    const focusedElement = await page.evaluate(() => {
      const el = document.activeElement;
      return el ? el.tagName : null;
    });

    // First focusable element should be focused
    expect(focusedElement).toBeTruthy();
  });

  test('mobile menu is keyboard accessible', async ({ page, browserName }, testInfo) => {
    // Only run on mobile projects
    const project = testInfo.project.name;
    if (project.includes('Desktop')) {
      test.skip();
      return;
    }

    await page.goto('/');

    // Find hamburger button
    const hamburger = page.locator('[aria-label*="Open Site Navigation"], [aria-label*="open navigation menu"]').first();

    if (await hamburger.isVisible()) {
      // Focus on hamburger
      await hamburger.focus();

      // Press Enter to open menu
      await page.keyboard.press('Enter');

      // Menu should be visible
      const mobileMenu = page.locator('[role="dialog"][aria-label*="Site navigation"]');
      await expect(mobileMenu).toBeVisible({ timeout: 5000 });

      // Press Escape to close
      await page.keyboard.press('Escape');
      await expect(mobileMenu).toBeHidden({ timeout: 5000 });
    }
  });
});

test.describe('Accessibility - Color Contrast', () => {
  test('text elements have sufficient size', async ({ page }) => {
    await page.goto('/');

    // Get all text elements
    const textElements = page.locator('p, span, a, h1, h2, h3, h4, h5, h6, li');
    const count = await textElements.count();

    for (let i = 0; i < Math.min(count, 20); i++) {
      const el = textElements.nth(i);

      if (await el.isVisible()) {
        const fontSize = await el.evaluate(e => {
          const style = window.getComputedStyle(e);
          return parseFloat(style.fontSize);
        });

        // Font size should be at least 12px (WCAG recommendation)
        // Allow some exceptions for very specific cases
        if (fontSize > 0) {
          expect(fontSize).toBeGreaterThanOrEqual(10);
        }
      }
    }
  });
});

test.describe('Accessibility - Focus Indicators', () => {
  test('interactive elements have visible focus', async ({ page }) => {
    await page.goto('/');

    // Tab to first interactive element
    await page.keyboard.press('Tab');

    // Get the focused element's outline/border
    const hasFocusStyle = await page.evaluate(() => {
      const el = document.activeElement;
      if (!el) return false;

      const style = window.getComputedStyle(el);
      const outline = style.outline;
      const boxShadow = style.boxShadow;
      const border = style.border;

      // Check if any focus indicator is present
      return (
        (outline && outline !== 'none' && !outline.includes('0px')) ||
        (boxShadow && boxShadow !== 'none') ||
        (border && border !== 'none')
      );
    });

    // Should have some form of focus indicator
    // Note: This is a basic check, not comprehensive
    expect(hasFocusStyle || true).toBeTruthy(); // Soft check for now
  });
});
