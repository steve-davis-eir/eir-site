import { test, expect } from '@playwright/test';

/**
 * Form tests - verify form submission works correctly
 */

test.describe('Newsletter Form', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page.waitForLoadState('networkidle');
  });

  test('newsletter form is present on homepage', async ({ page }) => {
    const form = page.locator('form').first();
    await expect(form).toBeVisible();
  });

  test('email input field exists', async ({ page }) => {
    const emailInput = page.locator('input[type="email"]').first();
    await expect(emailInput).toBeVisible();
  });

  test('submit button exists', async ({ page }) => {
    const submitButton = page.locator('form button, form [type="submit"]').first();
    await expect(submitButton).toBeVisible();
  });

  test('form shows error for empty email', async ({ page }) => {
    // Find and click submit without entering email
    const submitButton = page.locator('form button, form [type="submit"]').first();
    await submitButton.click();

    // Check for error message or validation
    const errorMessage = page.locator('.form-message--error, [class*="error"]');
    const validationMessage = page.locator('input[type="email"]:invalid');

    // Either custom error or browser validation should show
    const hasError = await errorMessage.isVisible().catch(() => false);
    const hasValidation = await validationMessage.count() > 0;

    expect(hasError || hasValidation).toBeTruthy();
  });

  test('form shows error for invalid email', async ({ page }) => {
    const emailInput = page.locator('input[type="email"]').first();
    await emailInput.fill('invalid-email');

    const submitButton = page.locator('form button, form [type="submit"]').first();
    await submitButton.click();

    // Wait a moment for validation
    await page.waitForTimeout(500);

    // Check localStorage - should NOT have a submission
    const submissions = await page.evaluate(() => {
      return JSON.parse(localStorage.getItem('formSubmissions') || '[]');
    });

    // If email validation worked, no submission should be stored
    // (Or it should show error message)
    const errorMessage = page.locator('.form-message--error');
    const hasError = await errorMessage.isVisible().catch(() => false);

    expect(hasError || submissions.length === 0).toBeTruthy();
  });

  test('form submits successfully with valid email', async ({ page }) => {
    const emailInput = page.locator('input[type="email"]').first();
    await emailInput.fill('test@example.com');

    // Check the newsletter checkbox if present (use force due to custom Wix styling)
    const checkbox = page.locator('input[type="checkbox"]').first();
    if (await checkbox.isVisible()) {
      await checkbox.check({ force: true });
    }

    const submitButton = page.locator('form button, form [type="submit"]').first();
    await submitButton.click();

    // Wait for submission to process
    await page.waitForTimeout(1000);

    // Check for success message or button text change
    const successMessage = page.locator('.form-message--success');
    const buttonWithThankYou = page.locator('button:has-text("Thank you")');

    // Either the success message or the button should show "Thank you"
    const hasSuccessMessage = await successMessage.isVisible().catch(() => false);
    const hasButtonChange = await buttonWithThankYou.isVisible().catch(() => false);
    expect(hasSuccessMessage || hasButtonChange).toBeTruthy();
  });

  test('form submission is stored in localStorage', async ({ page }) => {
    const emailInput = page.locator('input[type="email"]').first();
    await emailInput.fill('test@example.com');

    const checkbox = page.locator('input[type="checkbox"]').first();
    if (await checkbox.isVisible()) {
      await checkbox.check({ force: true });
    }

    const submitButton = page.locator('form button, form [type="submit"]').first();
    await submitButton.click();

    await page.waitForTimeout(1000);

    // Check localStorage
    const submissions = await page.evaluate(() => {
      return JSON.parse(localStorage.getItem('formSubmissions') || '[]');
    });

    expect(submissions.length).toBeGreaterThan(0);
    expect(submissions[0]).toHaveProperty('timestamp');
    expect(submissions[0]).toHaveProperty('page');
  });

  test('submit button text changes to "Thank you"', async ({ page }) => {
    const emailInput = page.locator('input[type="email"]').first();
    await emailInput.fill('test@example.com');

    const checkbox = page.locator('input[type="checkbox"]').first();
    if (await checkbox.isVisible()) {
      await checkbox.check({ force: true });
    }

    const submitButton = page.locator('form button, form [type="submit"]').first();
    await submitButton.click();

    // Button text should change
    await expect(submitButton).toContainText(/thank you/i, { timeout: 5000 });
  });

  test('form resets after successful submission', async ({ page }) => {
    const emailInput = page.locator('input[type="email"]').first();
    await emailInput.fill('test@example.com');

    const submitButton = page.locator('form button, form [type="submit"]').first();
    await submitButton.click();

    // Wait for reset (4 seconds in the JS)
    await page.waitForTimeout(5000);

    // Email field should be empty
    await expect(emailInput).toHaveValue('');
  });
});

test.describe('Contact Form', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/contact.html');
    await page.evaluate(() => localStorage.clear());
    await page.waitForLoadState('networkidle');
  });

  test('contact page loads', async ({ page }) => {
    await expect(page).toHaveURL(/contact/);
  });

  test('contact form exists', async ({ page }) => {
    const form = page.locator('form').first();
    await expect(form).toBeVisible();
  });
});

test.describe('Waitlist Form', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/waitlist.html');
    await page.evaluate(() => localStorage.clear());
    await page.waitForLoadState('networkidle');
  });

  test('waitlist page loads', async ({ page }) => {
    await expect(page).toHaveURL(/waitlist/);
  });

  test('waitlist form exists', async ({ page }) => {
    const form = page.locator('form').first();
    await expect(form).toBeVisible();
  });

  test('dropdown Training Type can be clicked and shows options', async ({ page }) => {
    // Find the Training Type dropdown button
    const dropdown = page.locator('[role="combobox"][aria-label="Training Type"]');
    await expect(dropdown).toBeVisible();

    // Click the dropdown
    await dropdown.click();

    // Wait for custom dropdown menu to appear
    await page.waitForTimeout(300);

    // Check that a visible dropdown menu appeared
    const menu = page.locator('.custom-dropdown-menu:visible').first();
    await expect(menu).toBeVisible();

    // Click on "Cycling" option
    const cyclingOption = menu.locator('text=Cycling');
    await cyclingOption.click();

    // Verify the dropdown button text changed
    const dropdownText = page.locator('[role="combobox"][aria-label="Training Type"] [data-hook="dropdown-base-text"]');
    await expect(dropdownText).toHaveText('Cycling');
  });

  test('dropdown Primary Goal can be clicked and shows options', async ({ page }) => {
    // Find the Primary Goal dropdown button
    const dropdown = page.locator('[role="combobox"][aria-label="Primary Goal"]');
    await expect(dropdown).toBeVisible();

    // Click the dropdown
    await dropdown.click();

    // Wait for custom dropdown menu to appear
    await page.waitForTimeout(300);

    // Check that a visible dropdown menu appeared
    const menu = page.locator('.custom-dropdown-menu:visible').first();
    await expect(menu).toBeVisible();

    // Click on an option
    const option = menu.locator('text=Train Smarter');
    await option.click();

    // Verify the dropdown button text changed
    const dropdownText = page.locator('[role="combobox"][aria-label="Primary Goal"] [data-hook="dropdown-base-text"]');
    await expect(dropdownText).toHaveText('Train Smarter');
  });
});

test.describe('Join Form', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/join.html');
    await page.evaluate(() => localStorage.clear());
    await page.waitForLoadState('networkidle');
  });

  test('join page loads', async ({ page }) => {
    await expect(page).toHaveURL(/join/);
  });

  test('join form exists', async ({ page }) => {
    const form = page.locator('form').first();
    await expect(form).toBeVisible();
  });

  test('dropdown Training Type can be clicked on join page', async ({ page }) => {
    // Find the Training Type dropdown button
    const dropdown = page.locator('[role="combobox"][aria-label="Training Type"]');
    await expect(dropdown).toBeVisible();

    // Click the dropdown
    await dropdown.click();

    // Wait for custom dropdown menu to appear
    await page.waitForTimeout(300);

    // Check that a visible dropdown menu appeared
    const menu = page.locator('.custom-dropdown-menu:visible').first();
    await expect(menu).toBeVisible();
  });

  test('dropdown Primary Goal can be clicked on join page', async ({ page }) => {
    // Find the Primary Goal dropdown button
    const dropdown = page.locator('[role="combobox"][aria-label="Primary Goal"]');
    await expect(dropdown).toBeVisible();

    // Click the dropdown
    await dropdown.click();

    // Wait for custom dropdown menu to appear
    await page.waitForTimeout(300);

    // Check that a visible dropdown menu appeared
    const menu = page.locator('.custom-dropdown-menu:visible').first();
    await expect(menu).toBeVisible();
  });
});
