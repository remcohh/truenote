import { test, expect } from '@playwright/test';

const mockAuthData = JSON.stringify({
  token: 'mock-jwt-token-12345',
  record: {
    id: 'user_123',
    email: 'musician@example.com',
    name: 'Test Musician',
    username: 'musician',
  },
});

test.describe('Exercise Navigation & Library Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate((authJson) => {
      localStorage.setItem('truenote_pb_auth', authJson);
    }, mockAuthData);
    await page.reload();
  });

  test('displays exercise library and navigation tabs when authenticated', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Library' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Stats' })).toBeVisible();
    await expect(page.getByPlaceholder('Search exercises...')).toBeVisible();
  });

  test('filters exercise list using search input', async ({ page }) => {
    const searchInput = page.getByPlaceholder('Search exercises...');
    await searchInput.fill('Arpeggio');

    await expect(page.getByText('G Major Triad Arpeggio')).toBeVisible();
  });

  test('navigates to Practice View when selecting an exercise', async ({ page }) => {
    await page.getByText('C Major Scale Warmup').first().click();

    // Open Metronome modal via control bar button
    await page.getByTitle('Metronome & Options').click();

    // Verify modal contains heading and start session button inside metronome card
    await expect(page.getByRole('heading', { name: 'Metronome & Options' })).toBeVisible();
    await expect(page.locator('.metronome-card').getByText('Start Session')).toBeVisible();
  });
});
