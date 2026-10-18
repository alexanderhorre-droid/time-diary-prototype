const { chromium } = require(process.env.PW || 'playwright');
(async () => {
  const S = process.argv[2] || require('path').join(__dirname, 'output'), scheme = process.argv[3];
  require('fs').mkdirSync(S + '/shots', { recursive: true });
  const b = await chromium.launch({ executablePath: process.env.CHROMIUM || undefined });
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, colorScheme: scheme });
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
  const menu = async () => { await p.locator('button[popovertarget="menu"]:visible').first().click(); await p.waitForTimeout(150); };
  const shot = async n => { await p.waitForTimeout(250); await p.screenshot({ path: `${S}/shots/${n}-${scheme}.png` }); };
  const isOpen = id => p.evaluate(id => { const e = document.getElementById(id); return e.open ?? e.matches(':popover-open'); }, id);
  const out = {};
  await p.goto((process.env.BASE_URL || 'http://127.0.0.1:8765/') + 'index.html'); await p.waitForTimeout(600);
  await menu(); await p.click('#reset-data'); await p.waitForTimeout(500);
  await menu(); await p.click('#pretend-offline'); await p.waitForTimeout(200);
  await menu(); await p.click('#fill-days'); await p.waitForTimeout(300);
  await p.click('#submit-btn', { force: true }); await p.waitForTimeout(200); await p.click('#review .td-sticky-foot .td-btn'); await p.click('#cs-yes');
  await p.waitForTimeout(500); out.offNote = await p.textContent('#readonly-text'); await shot('r1-offline');
  await p.click('#submit-btn', { force: true }); await p.waitForTimeout(200); out.offWhy = await isOpen('submit-why'); out.offWhyText = await p.textContent('#sw-text'); await shot('r2-offline-why'); await p.keyboard.press('Escape');
  await menu(); await p.click('#pretend-offline'); await p.waitForTimeout(1500);
  out.autoSent = await isOpen('thanks'); out.onNote = await p.textContent('#readonly-text'); out.toastShown = await isOpen('toast'); await shot('r3-ready');
  await p.click('#submit-btn'); await p.waitForTimeout(300); out.reviewOpen = await isOpen('review'); out.editLinks = await p.locator('#review .td-review__edit').count(); await shot('r4-review');
  await p.click('#review .td-sticky-foot .td-btn'); await p.waitForTimeout(200); out.sheet = await isOpen('confirm-submit');
  await p.click('#cs-yes'); await p.waitForTimeout(1500); out.thanks = await isOpen('thanks');
  // normal online flow still has Edit links
  await p.click('#thanks-next'); await p.waitForTimeout(300); await menu(); await p.click('#reset-data'); await p.waitForTimeout(500);
  await menu(); await p.click('#fill-days'); await p.waitForTimeout(300); await p.click('#submit-btn'); await p.waitForTimeout(300);
  out.normalEdit = await p.locator('#review .td-review__edit').count();
  out.errs = errs; console.log(JSON.stringify(out, null, 1)); await b.close();
})();
