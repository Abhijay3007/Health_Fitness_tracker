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
});
