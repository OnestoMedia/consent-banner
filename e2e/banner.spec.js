import { test, expect } from '@playwright/test';

test.beforeEach(async ({ context }) => {
  // CookieConsent hides the banner from bots (hideFromBots); Playwright sets navigator.webdriver.
  await context.addInitScript(() => Object.defineProperty(navigator, 'webdriver', { get: () => false }));
});

const consentCalls = (page) => page.evaluate(() =>
  window.dataLayer.filter((e) => e && e[0] === 'consent').map((e) => [e[1], JSON.parse(JSON.stringify(e[2]))]));
const cookie = async (context, name) => (await context.cookies()).find((c) => c.name === name)?.value;

test('first visit: default denied, bar visible in Dutch', async ({ page }) => {
  await page.goto('/demo/index.html');
  await expect(page.locator('#cc-main')).toContainText('Cookies op deze site');
  const calls = await consentCalls(page);
  expect(calls[0]).toEqual(['default', expect.objectContaining({ analytics_storage: 'denied', ad_storage: 'denied', wait_for_update: 500 })]);
  expect(calls.filter(([t]) => t === 'update')).toHaveLength(0);
});

test('reject → denied update, cookie, no banner after reload', async ({ page, context }) => {
  await page.goto('/demo/index.html');
  await page.locator('#cc-main .cm__btn[data-role="necessary"]').click();
  expect(await cookie(context, 'om_consent')).toBe('r1.a0.m0');
  await page.reload();
  await expect(page.locator('#cc-main .cm')).toBeHidden();
  const calls = await consentCalls(page);
  expect(calls[1]).toEqual(['update', expect.objectContaining({ analytics_storage: 'denied' })]);
});

test('accept → granted; returning visit restores before page events', async ({ page, context }) => {
  await page.goto('/demo/index.html');
  await page.locator('#cc-main .cm__btn[data-role="all"]').click();
  expect(await cookie(context, 'om_consent')).toBe('r1.a1.m1');
  await page.reload();
  const order = await page.evaluate(() => window.dataLayer.map((e) => (e && e[0] === 'consent' ? 'consent:' + e[1] : e && e.event)).filter(Boolean));
  expect(order.indexOf('consent:update')).toBeGreaterThan(-1);
  expect(order.indexOf('consent:update')).toBeLessThan(order.indexOf('demo_page_ready'));
});

test('footer link opens preferences with three categories', async ({ page }) => {
  await page.goto('/demo/index.html');
  await page.locator('#cc-main .cm__btn[data-role="necessary"]').click();
  await page.locator('#open').click();
  await expect(page.locator('#cc-main .pm')).toBeVisible();
  await expect(page.locator('#cc-main .pm')).toContainText('Analytisch');
  await expect(page.locator('#cc-main .pm')).toContainText('Marketing');
});

for (const [lang, title] of [['en-GB', 'Cookies on this site'], ['de-AT', 'Cookies auf dieser Website'], ['fr', 'Cookies sur ce site'], ['pt-BR', 'Cookies on this site']]) {
  test(`language ${lang}`, async ({ page }) => {
    await page.goto(`/demo/index.html?lang=${lang}`);
    await expect(page.locator('#cc-main')).toContainText(title);
  });
}

test('u-form', async ({ page }) => {
  await page.goto('/demo/index.html?formal=u');
  await expect(page.locator('#cc-main')).toContainText('uw toestemming');
});

test('revision bump asks again', async ({ page }) => {
  await page.goto('/demo/index.html');
  await page.locator('#cc-main .cm__btn[data-role="all"]').click();
  await page.goto('/demo/index.html?revision=2');
  await expect(page.locator('#cc-main .cm')).toBeVisible();
  const calls = await consentCalls(page);
  expect(calls.filter(([t]) => t === 'update')).toHaveLength(0);
});

test('bundle cannot load → no banner, still denied, failure reported', async ({ page }) => {
  await page.route('**/dist/om-consent.min.js', (r) => r.abort());
  await page.goto('/demo/index.html');
  await page.waitForFunction(() => window.__omFailed === true);
  expect((await consentCalls(page)).filter(([t]) => t === 'update')).toHaveLength(0);
  await expect(page.locator('#cc-main')).toHaveCount(0);
});
