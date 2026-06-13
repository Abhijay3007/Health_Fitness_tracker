import { test, expect } from '@playwright/test';

test.describe('AuraFit Authentication E2E Flow', () => {
  test('should complete the entire registration and login pipeline successfully', async ({ page }) => {
    const testEmail = `user_${Date.now()}@test.com`;
    const testPassword = 'SecretPassword123';

    // 1. Go to register page
    await page.goto('/register');

    // Step 1: Account Credentials
    await page.getByPlaceholder('Jane Doe').fill('Test User');
    await page.getByPlaceholder('jane@example.com').fill(testEmail);
    await page.getByPlaceholder('•••••••• (min 6 characters)').fill(testPassword);
    await page.click('button:has-text("Continue to Profile")');

    // Step 2: Fitness Profile
    await page.getByPlaceholder('25').fill('25');
    await page.getByPlaceholder('175').fill('178');
    await page.getByPlaceholder('70').fill('72');
    
    // Click submit
    await page.click('button:has-text("Register")');

    // Wait for redirect to login page (takes ~2s due to success message timeout)
    await page.waitForURL('**/login', { timeout: 10000 });
    
    const welcomeHeading = page.getByRole('heading', { name: 'Welcome back', exact: true });
    await expect(welcomeHeading).toBeVisible();

    // 2. Perform Login with registered credentials
    await page.getByPlaceholder('you@example.com').fill(testEmail);
    await page.getByPlaceholder('••••••••').fill(testPassword);
    await page.click('button:has-text("Sign In")');

    // Wait for redirect to dashboard
    await page.waitForURL('**/dashboard', { timeout: 10000 });

    const heading = page.locator('h1');
    await expect(heading).toContainText("Today's Overview");
  });

  test('should simulate password reset successfully', async ({ page }) => {
    await page.goto('/login');

    // Click on forgot password link
    await page.click('a:has-text("Forgot password?")');

    // Check we navigated to /forgot-password
    await page.waitForURL('**/forgot-password');
    await expect(page.getByRole('heading', { name: 'Reset password' })).toBeVisible();

    // Request password reset for standard user
    await page.getByPlaceholder('you@example.com').fill('user@tracker.com');
    await page.click('button:has-text("Request Temp Password")');

    // Expect success message and temporary password box to be visible
    await expect(page.locator('text=Password Reset Simulated!')).toBeVisible({ timeout: 15000 });
    await expect(page.locator('text=Local Testing Bypass:')).toBeVisible({ timeout: 15000 });
  });

  test('should authenticate successfully with mock Google account', async ({ page }) => {
    await page.goto('/login');

    // Click on Google Account button
    await page.click('button:has-text("Google Account")');

    // Expect modal to show
    await expect(page.getByRole('heading', { name: 'Google Auth Options' })).toBeVisible();

    // Click mock login option
    await page.click('button:has-text("Use Mock Google Account")');

    // Wait for redirect to dashboard
    await page.waitForURL('**/dashboard', { timeout: 10000 });

    const heading = page.locator('h1');
    await expect(heading).toContainText("Today's Overview");
  });
});
