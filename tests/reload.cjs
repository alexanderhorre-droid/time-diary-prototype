const { chromium } = require(process.env.PW || 'playwright');
(async () => {
  const S = require('path').join(__dirname, 'output'); require('fs').mkdirSync(S + '/shots', { recursive: true });
  const b = await chromium.launch({ executablePath: process.env.CHROMIUM || undefined });
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
  const st = () => p.evaluate(() => ({ hash: location.hash, events: document.querySelectorAll('.td-event').length, label: document.getElementById('day-label').textContent,
    headTop: location.hash.startsWith('#day-') ? (document.querySelector(location.hash) ? Math.round(document.querySelector(location.hash).getBoundingClientRect().top) : 'none') : null, waiting: !document.getElementById('page-waiting').hidden }));
  const out = {};
  await p.goto((process.env.BASE_URL || 'http://127.0.0.1:8765/') + 'index.html'); await p.waitForTimeout(700);
  await p.evaluate(() => document.getElementById('day-next').click()); await p.evaluate(() => document.getElementById('day-next').click()); await p.waitForTimeout(200);
  out.before = await st();
  await p.reload(); await p.waitForTimeout(900); out.afterReload = await st();
  await p.goto((process.env.BASE_URL || 'http://127.0.0.1:8765/') + 'index.html#day-2026-10-30'); await p.waitForTimeout(900); out.directLink = await st();
  await p.goto((process.env.BASE_URL || 'http://127.0.0.1:8765/') + 'index.html#past-d2'); await p.waitForTimeout(900); out.past = await st();
  await p.goto((process.env.BASE_URL || 'http://127.0.0.1:8765/') + 'index.html#day-1999-01-01'); await p.waitForTimeout(900); out.badDay = await st();
  out.errs = errs; console.log(JSON.stringify(out, null, 1)); await b.close();
})();
