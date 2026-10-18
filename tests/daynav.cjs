const { chromium } = require(process.env.PW || 'playwright');
(async () => {
  const S = require('path').join(__dirname, 'output'); require('fs').mkdirSync(S + '/shots', { recursive: true });
  const b = await chromium.launch({ executablePath: process.env.CHROMIUM || undefined });
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto((process.env.BASE_URL || 'http://127.0.0.1:8765/') + 'index.html'); await p.waitForTimeout(700);
  await p.evaluate(() => { window.__scrolls = 0; addEventListener('scroll', () => window.__scrolls++); window.__h = history.length; });
  const labels = [];
  labels.push(await p.textContent('#day-label'));
  for (let k = 0; k < 3; k++) { await p.evaluate(() => document.getElementById('day-next').click()); await p.waitForTimeout(150); labels.push(await p.evaluate(() => document.getElementById('day-label').textContent + ' prevHidden=' + document.getElementById('day-prev').hidden + ' y=' + scrollY)); }
  console.log(JSON.stringify(labels)); await p.evaluate(() => document.getElementById('day-prev').click()); await p.waitForTimeout(150); labels.push(await p.textContent('#day-label'));
  const r = await p.evaluate(() => ({ scrolls: window.__scrolls, historyGrew: history.length - window.__h, hash: location.hash,
    headTop: Math.round(document.querySelector(location.hash).getBoundingClientRect().top), bar: document.getElementById('topbar').offsetHeight }));
  console.log(JSON.stringify({ labels, ...r, errs })); await b.close();
})();
