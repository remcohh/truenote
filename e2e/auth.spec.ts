import { test, expect } from '@playwright/test';

test.describe('Authentication Page Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage to ensure user is logged out
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('displays Sign In form by default when unauthenticated', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Sign In' })).toBeVisible();
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByLabel('Password')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Sign In', exact: true })).toBeVisible();
  });

  test('switches to Create Account form when clicking register toggle', async ({ page }) => {
    await page.getByRole('button', { name: "Don't have an account? Create one" }).click();
    await expect(page.getByRole('heading', { name: 'Create Account' })).toBeVisible();
    await expect(page.getByLabel('Name')).toBeVisible();
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByLabel('Password')).toBeVisible();
  });

  test('allows typing credentials into form fields', async ({ page }) => {
    await page.getByLabel('Email').fill('musician@example.com');
    await page.getByLabel('Password').fill('secretpass123');

    await expect(page.getByLabel('Email')).toHaveValue('musician@example.com');
    await expect(page.getByLabel('Password')).toHaveValue('secretpass123');
  });
});
