const { chromium } = require(process.env.PW || 'playwright');
(async () => {
  const S = process.argv[2] || require('path').join(__dirname, 'output');
  require('fs').mkdirSync(S + '/shots', { recursive: true });
  const b = await chromium.launch({ executablePath: process.env.CHROMIUM || undefined });
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const p = await ctx.newPage();
  await p.goto((process.env.BASE_URL || 'http://127.0.0.1:8765/') + 'index.html'); await p.waitForTimeout(700);
  await p.evaluate(() => document.getElementById('reset-data').click()); await p.waitForTimeout(500);
  await p.evaluate(() => document.getElementById('fill-days').click()); await p.waitForTimeout(400);
  // last day of the diary
  await p.evaluate(() => { location.hash = '#day-2026-11-01'; }); await p.waitForTimeout(300);
  await p.evaluate(() => window.scrollBy(0, 1300)); await p.waitForTimeout(200);
  await p.screenshot({ path: `${S}/shots/h1-last-day.png` });
  await p.evaluate(() => document.getElementById('submit-btn').click()); await p.waitForTimeout(300);
  await p.click('#review .td-sticky-foot .td-btn'); await p.click('#cs-yes'); await p.waitForTimeout(1500);
  await p.click('#thanks-next'); await p.waitForTimeout(400);
  await p.evaluate(() => document.getElementById('skip-next').click()); await p.waitForTimeout(600);
  await p.screenshot({ path: `${S}/shots/h2-new-first-day.png` });
  console.log(await p.evaluate(() => ({ label: document.getElementById('day-label').textContent, events: document.querySelectorAll('.td-event').length, note: document.getElementById('empty-text').textContent })));
  await b.close();
})();
