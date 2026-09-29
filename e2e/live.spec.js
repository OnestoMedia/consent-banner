import { test, expect } from '@playwright/test';
const url = process.env.LIVE_URL;
test.skip(!url, 'set LIVE_URL=https://site to run');
test.beforeEach(async ({ context }) => {
  await context.addInitScript(() => Object.defineProperty(navigator, 'webdriver', { get: () => false }));
});
const gaCookies = async (context) => (await context.cookies()).filter((c) => /^_ga|^_gcl|^_fbp|^ph_/.test(c.name)).map((c) => c.name);

test('no tracking cookies before a choice', async ({ page, context }) => {
  await page.goto(url); await page.waitForTimeout(3000);
  expect(await gaCookies(context)).toEqual([]);
});
test('reject → still none', async ({ page, context }) => {
  await page.goto(url);
  await page.locator('#cc-main .cm__btn[data-role="necessary"]').click();
  await page.reload(); await page.waitForTimeout(3000);
  expect(await gaCookies(context)).toEqual([]);
});
test('accept → _ga set', async ({ page, context }) => {
  await page.goto(url);
  await page.locator('#cc-main .cm__btn[data-role="all"]').click();
  await page.waitForTimeout(3000);
  expect(await gaCookies(context)).toContain('_ga');
});
