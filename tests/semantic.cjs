const { chromium } = require(process.env.PW || 'playwright');
(async () => {
  const S = process.argv[2] || require('path').join(__dirname, 'output');
  require('fs').mkdirSync(S + '/shots', { recursive: true });
  const b = await chromium.launch({ executablePath: process.env.CHROMIUM || undefined });
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
  const out = {};
  const mains = () => p.evaluate(() => [...document.querySelectorAll('main')].filter(m => m.checkVisibility()).length);
  const toastBottom = () => p.evaluate(() => Math.round(innerHeight - document.getElementById('toast').getBoundingClientRect().bottom));
  await p.goto((process.env.BASE_URL || 'http://127.0.0.1:8765/') + 'index.html'); await p.waitForTimeout(700);
  out.timelineMains = await mains();
  out.headings = await p.evaluate(() => [...document.querySelectorAll('h1,h2,h3')].filter(h => h.checkVisibility()).slice(0, 4).map(h => h.tagName + ' ' + h.textContent));
  // toast on the timeline: above the floating button
  await p.evaluate(() => document.getElementById('fill-days').click()); await p.waitForTimeout(400);
  out.toastTimeline = await toastBottom(); out.fabTop = await p.evaluate(() => Math.round(innerHeight - document.getElementById('fab').getBoundingClientRect().top));
  out.live = await p.textContent('#live');
  // first day: previous arrow inert and invisible
  await p.evaluate(() => scrollTo(0, 0)); await p.waitForTimeout(200);
  out.prevInert = await p.evaluate(() => { const a = document.getElementById('day-prev'); return { inert: a.inert, vis: getComputedStyle(a).visibility, w: a.offsetWidth }; });
  // add activity: heading name, toast above the buttons, error focus
  await p.click('#fab'); await p.waitForTimeout(300);
  out.addHeading = await p.evaluate(() => document.getElementById('add-title').innerText.replace(/\n/g, ' | ') + ' // ' + document.getElementById('add-title').textContent);
  await p.locator('section[aria-labelledby="g-1"] .td-activity').first().click(); await p.waitForTimeout(300);
  await p.click('#add-btn'); await p.waitForTimeout(300);
  out.errorFocused = await p.evaluate(() => document.activeElement.id + ' role=' + document.getElementById('add-error').getAttribute('role'));
  await p.locator('.td-options:not([hidden]) .td-option').first().click(); await p.click('#next-btn'); await p.waitForTimeout(400);
  out.toastInModal = await toastBottom(); out.footTop = await p.evaluate(() => Math.round(innerHeight - document.getElementById('add-foot').getBoundingClientRect().top));
  await p.screenshot({ path: `${S}/shots/sem-modal-toast.png` });
  await p.evaluate(() => document.getElementById('add').close()); await p.waitForTimeout(200);
  // a menu page: one main, toast at the bottom edge
  await p.evaluate(() => { location.hash = '#help'; }); await p.waitForTimeout(400);
  out.pageMains = await mains();
  await p.evaluate(() => { location.hash = '#past'; }); await p.waitForTimeout(400); out.pastMains = await mains();
  // thanks dialog has no main
  out.mainInDialog = await p.evaluate(() => !!document.querySelector('dialog main'));
  out.inlineStyles = await p.evaluate(() => [...new Set([...document.querySelectorAll('[style]:not(li):not(html)')].map(e => e.tagName + '#' + e.id + '.' + e.className + ' ' + e.getAttribute('style').slice(0, 50)))]);
  out.errs = errs; console.log(JSON.stringify(out, null, 1)); await b.close();
})();
