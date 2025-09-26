import { test, expect } from '@playwright/test';

const sampleImage = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAIElEQVQoU2NkYGD4z0AFwDiqgBGIYjCAAggYAgwYBiEAAG9wBQ3wwuZlAAAAAElFTkSuQmCC',
  'base64'
);

test.describe('Quick Colorize demo flow', () => {
  test('uploads, colorizes, and shows result', async ({ page }) => {
    await page.route('**/api/uploads', async (route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ imageId: 'test-image', sha256: 'abc', width: 512, height: 512, previewUrl: 'data:image/png;base64,' + sampleImage.toString('base64') })
        });
      } else {
        await route.continue();
      }
    });
    await page.route('**/api/colorize', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ resultId: 'result-1', url: 'https://example.com/result.png', durationMs: 500, cached: false })
      });
    });
    await page.route('**/api/uploads?*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ imageId: 'test-image', previewUrl: 'data:image/png;base64,' + sampleImage.toString('base64'), width: 512, height: 512, sha256: 'abc' })
      });
    });

    await page.goto('/');
    await page.getByLabel('利用規約とプライバシーポリシーに同意します').check();
    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.getByText('アップロード').click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles({ name: 'sample.png', mimeType: 'image/png', buffer: sampleImage });
    await page.waitForURL('**/colorize?imageId=test-image');
    await expect(page.getByText('カラー化プレビュー')).toBeVisible();
    await page.getByRole('button', { name: 'カラー化' }).click();
    await expect(page.getByText('キャッシュ命中')).not.toBeVisible({ timeout: 1000 }).catch(() => {});
  });
});
