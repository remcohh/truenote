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

test.describe('Practice View & Metronome Controls Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate((authJson) => {
      localStorage.setItem('truenote_pb_auth', authJson);
    }, mockAuthData);
    await page.reload();

    // Navigate into Practice View by clicking an exercise card
    await page.getByText('C Major Scale Warmup').first().click();

    // Open Metronome modal
    await page.getByTitle('Metronome & Options').click();
    await expect(page.getByRole('heading', { name: 'Metronome & Options' })).toBeVisible();
  });

  test('updates BPM when preset button is clicked', async ({ page }) => {
    // Click 140 BPM preset button inside metronome card
    await page.locator('.metronome-card').getByRole('button', { name: '140' }).click();

    // Verification: main BPM span display inside metronome card updates to 140
    const bpmSpan = page.locator('.metronome-card span.text-4xl');
    await expect(bpmSpan).toHaveText('140');
  });

  test('toggles playback session state', async ({ page }) => {
    const startBtn = page.locator('.metronome-card').getByText('Start Session');
    await expect(startBtn).toBeVisible();

    await startBtn.click({ force: true });
    const stopBtn = page.locator('.metronome-card').getByText('Stop Session');
    await expect(stopBtn).toBeVisible();

    await stopBtn.click({ force: true });
    await expect(startBtn).toBeVisible();
  });

  test('navigates back to Library when clicking Library tab', async ({ page }) => {
    // Close modal first so backdrop overlay doesn't block top header navigation
    await page.keyboard.press('Escape');

    await page.getByRole('button', { name: 'Library' }).click();
    await expect(page.getByPlaceholder('Search exercises...')).toBeVisible();
  });
});
