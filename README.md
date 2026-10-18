# Time Diary prototype

A clickable prototype of the Time Diary study app: a mobile web app (PWA) built with semantic HTML and plain CSS, with JavaScript only where it's needed. It uses sample data and sends nothing anywhere.

- **Open it on a phone:** https://alexanderhorre-droid.github.io/time-diary-prototype/
- **Handing over?** Read [HANDOFF.md](HANDOFF.md) first.

## What's where

| Path | What it is | Edit? |
| --- | --- | --- |
| `src/page.py` | The page template: top bar, timeline shell, menu, pages, Add activity, Review, Thank you | Yes |
| `src/app.js` | Everything that needs script: timeline drawing, saving to the phone (IndexedDB), drafts, review and submit, diaries | Yes |
| `design-system/` | The design system: `tokens.json`, `components/bundle.css`, a README and preview per component, accessibility, data and screen notes | Yes |
| `tools/` | The build: `build.py` runs everything; `tokens_css.py`, `pwa.py` and `single_file.py` are its steps | Rarely |
| `tests/` | Browser checks (Playwright) for the main flows | Yes |
| `index.html`, `app.js`, `tokens.css`, `components.css`, `manifest.webmanifest`, `sw.js`, icons | **Generated.** The installable app that GitHub Pages serves | **No.** Rebuild instead |
| `dist/time-diary-prototype.html` | **Generated.** The single-file version shown inside Claude | No |

## Change something

```sh
python3 tools/build.py          # rebuild everything from src/ and design-system/
python3 -m http.server 8765     # then open http://127.0.0.1:8765/
```

Change `src/` or `design-system/`, run the build, check it in the browser, then commit and push to `main`. GitHub Pages republishes within a minute or two. Asset links carry a content hash and the offline helper always checks for new files, so phones pick up the update when the app is reopened.

Needs Python 3 with Pillow (`pip install pillow`, for the app icons). There's no other build tooling and no framework.

## Run the tests

```sh
npm install playwright && npx playwright install chromium   # once
python3 -m http.server 8765 &                               # serve the repository root
node tests/resend.cjs                                       # any of the files below
```

Each test drives the app in a phone-sized browser and prints what it found as JSON. Screenshots go to `tests/output/`. Set `BASE_URL` to test another address, or `CHROMIUM` to use a specific Chromium build.

| Test | Checks |
| --- | --- |
| `resend.cjs` | Submitting offline locks the diary ("Waiting to send"). Back online, nothing sends by itself; Submit opens Review (no Edit links), the confirm step and Thank you |
| `reload.cjs` | Refreshing on a day, opening a link to a day, opening a past diary |
| `daynav.cjs` | Previous / next day: one jump per tap, the heading lands under the top bar, Back isn't filled with days |
| `semantic.cjs` | One `<main>` per view, headings, inert day arrow, toast placement and live region, error focus |
| `lastday.cjs` | The diary's last day ends at midnight; copies that would cross it aren't added |
| `handover.cjs` | Submit a diary, start the next one, check it opens empty with its notice |

## Prototype-only

These exist so the prototype can be clicked through. A real build replaces them.

- **A fixed "today":** Tue 20 Oct 2026 at 14:30 (`FIRST_TODAY` and `NOW_Q` in `src/app.js`; `START` and `TODAY_I` in `src/page.py`).
- **A fake research server:** `sendToResearchServer()` in `src/app.js` waits a moment and returns a made-up receipt.
- **Sample data:** `seed()` and `SIMPLE_DAY` in `src/app.js`.
- **Menu items marked "prototype":** *Fill empty days*, *Skip to the next diary*, *Pretend to be offline*, *Reset to sample data*.
