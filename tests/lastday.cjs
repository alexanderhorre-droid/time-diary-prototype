const { chromium } = require(process.env.PW || 'playwright');
(async () => {
  const S = process.argv[2] || require('path').join(__dirname, 'output'), scheme = process.argv[3] || 'light';
  require('fs').mkdirSync(S + '/shots', { recursive: true });
  const b = await chromium.launch({ executablePath: process.env.CHROMIUM || undefined });
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, colorScheme: scheme });
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
  const out = {};
  await p.goto((process.env.BASE_URL || 'http://127.0.0.1:8765/') + 'index.html'); await p.waitForTimeout(700);
  await p.evaluate(() => document.getElementById('reset-data').click()); await p.waitForTimeout(500);
  await p.click('#fab'); await p.waitForTimeout(300);
  await p.locator('.td-activity[data-title="Sleeping"]').first().click(); await p.waitForTimeout(300);
  const endInfo = () => p.evaluate(() => { const e = document.getElementById('f-end'); return { groups: [...e.querySelectorAll('optgroup')].map(g => g.label + ':' + g.children.length), last: e.options[e.options.length - 1].text, value: e.value, hint: document.getElementById('end-hint').hidden ? null : document.getElementById('end-hint').textContent }; });
  // normal day, 22:30
  await p.selectOption('#f-start', '90'); out.normalDay = await endInfo();
  // last day
  await p.selectOption('#f-day', '13'); out.lastDay = await endInfo();
  await p.evaluate(() => document.getElementById('end-hint').scrollIntoView({ block: 'center' })); await p.waitForTimeout(150);
  await p.screenshot({ path: `${S}/shots/lastday-${scheme}.png` });
  // back to day 13 of 14 (index 12), overnight to 07:00 (+1), also tick the last day
  await p.selectOption('#f-day', '12'); await p.selectOption('#f-start', '90'); await p.selectOption('#f-end', '124');
  await p.locator('input[name="days"][value="13"]').check({ force: true });
  await p.click('#add-btn'); await p.waitForTimeout(500);
  out.toast = await p.textContent('#toast-text');
  out.errs = errs; console.log(JSON.stringify(out, null, 1)); await b.close();
})();
