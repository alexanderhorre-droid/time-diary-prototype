# Time Diary

A monochrome design system for a long-running time-use diary study. Participants log what they did, hour by hour, on a vertical timeline; after a fixed period set by the researcher (14 days in this first release) they review and submit the diary, and the next one opens.

"Time Diary" is a working name. Swap it in `tokens.json` and the top bar when the study names the app.

## What this system is for

Three things matter more than anything visual:

1. **Nothing a participant enters is ever lost.** Every change is saved on the device before the UI says it is saved, and stays there until the researcher's server confirms receipt. See *Protecting participant data*.
2. **It still works in years.** The study runs for years, across phones, OS updates and browser releases. Semantic HTML, plain CSS custom properties, system fonts, no framework in the rendering path, no web fonts to fail to load.
3. **Everyone can complete it.** WCAG 2.2 AA as the floor. Buttons are never disabled; when an action is not available yet the button still responds and explains why. See *Accessibility*.

## Who fills it in

The same app serves three waves of the study, years apart:

| Wave | Who taps | Design consequence |
| --- | --- | --- |
| Age 9 | the parent, with the child beside them | The parent is the primary user and reads the screens; words simple enough to read aloud and talk through with the child; one decision per screen; nothing that punishes a wrong tap. |
| Age 15 | the teen alone | Fast to use, never childish; private-feeling; works one-handed on a phone. |
| Age 19 | the young adult alone | Same as 15, plus efficient catch-up after busy days. |

**Real life, not ideal life.** People log as it happens, at bedtime, or days later in one sitting. The design assumes all three:

- **Catch-up is a first-class flow.** After *Add to timeline*, *Save and add another* keeps the modal open, keeps the day, and starts the new activity where the last one ended.
- **Gaps are visible and tappable.** Empty stretches on the timeline read "Nothing added 09:00 – 12:00" and open *Add activity* with those times filled in.
- **Nothing expires.** No session timeouts, no lost drafts. Any day in the current diary can be edited until it is submitted.
- **Not remembering is an answer.** *Forgot / Unspecified* is always one tap away.

Write in plain words a parent can read aloud to a 9-year-old; teens and adults read plain words faster too. Prefer "add" and "activity" over "log" and "entry". *Submit* stays as the button name because researchers and helpers know it; the text around it explains it ("Submit sends your diary to the research team").

## Content fundamentals

The voice is calm, plain and specific. A participant opens this app once or twice a day for weeks; it should feel like a well-made paper diary, not a product.

- **Second person, present tense.** "You haven't added any activities for Tue 20 Oct yet."
- **Say what is true and what to do next**, in that order. "The next diary opens in 2 days, on Sat 31 Oct."
- **Use the participant's own time.** Dates as `Mon 19 Oct`, times as 24-hour `07:15`, durations as `7 h 30 min`. Never relative-only ("yesterday") where a date fits.
- **Name activities exactly as the catalogue does.** "Travelling: public transport", not "Bus".
- **Sentence case** for everything except activity names that the study defines in title case ("Activities of Daily Living").
- **No exclamation marks, no emoji, no blame.** "Something went wrong" is never enough: say what was kept and what will happen.

| Situation | Write | Not |
| --- | --- | --- |
| Submit not ready | You haven't added activities for 3 days yet: Mon 19, Tue 20 and Thu 22 Oct. | Please complete all fields! |
| Next diary locked | The next diary opens in 2 days, on Sat 31 Oct. | Unavailable |
| Saved | Saved on this device · 13:42 | Success! |
| Offline submit | Waiting to send. Your diary is locked and safe on this phone. When you're back online, tap Submit to send it. | Network error |
| Overlap limit | This time already has 3 activities. Change the time or remove one first. | Max overlap exceeded |

## Visual foundations

**Monochrome only.** Black, white and five greys, defined once in `tokens.json` for a light and a dark theme. Meaning never rides on colour: activity categories are told apart by **pattern** (see below), states by **shape and weight** (solid, outline, dashed), and every state also has words.

**Colour roles.** `bg` is the ground; `surface-100` holds cards and events; `surface-200` heads categories; `ink` is text and patterns; `ink-muted` is supporting text; `inverse-bg`/`inverse-ink` mark the one primary action on screen (the FAB on the timeline, *Add to timeline* in the modal, *Submit diary* on review). `line` is decorative, `line-strong` edges controls.

**Type.** The system font stack (`--font-sans`) for everything; a monospace stack (`--font-mono`) for times so hour labels and ranges line up. Weight carries hierarchy: 700 for titles, 600 for headings and labels, 400 for text. Inputs are never smaller than 16px.

**Space.** A 4px base: `space-1` to `space-8`. Screens have a 16px gutter (`space-4`). The main column caps at 640px (`content-max`) on wide screens.

**Shape.** `radius-md` (8px) on buttons, cards and inputs; `radius-pill` on the FAB, chips and the save status; square on the timeline grid. Two shadows only: the top bar and the floating layer (FAB, drawer).

**Time is geometry.** One hour is 64px (`hour-row`), one 15-minute step is 16px (`quarter`). Event top and height are always whole quarters, so the grid and the data agree.

## Category patterns

The reference app colour-codes categories with a coloured left bar. Here each category has a pattern swatch instead, which works in monochrome, prints, and survives colour-vision differences. The same pattern marks the category's events on the timeline.

| Category | Pattern | Class |
| --- | --- | --- |
| General Activities | solid | `td-pat--general` |
| Travel & Transit | diagonal stripes | `td-pat--travel` |
| Work / Study | horizontal lines | `td-pat--work` |
| Activities At Home (Non-Digital) | dots | `td-pat--home` |
| Activities out of Home (Non-Digital) | crosshatch | `td-pat--out` |
| Digital Media | vertical lines | `td-pat--digital` |
| Other | outline only | `td-pat--other` |

Patterns are drawn in `ink` on `bg` with a 1.5px `ink` edge. Never put text over a pattern.

## Iconography

A small set of inline SVG icons, 24px, 2px stroke, round caps and joins, `stroke="currentColor"`, no fill: **close** (×), **menu** (three lines), **plus**, **chevron** (left, right, down), **check**, **info** (i in circle), **lock**, **copy**, **pencil**. Inline SVG rather than an icon font or sprite file: nothing to fetch, nothing to break. Every icon-only button has an `aria-label`; decorative icons get `aria-hidden="true"`.

## Building with it

- Load `tokens.css` (generated) then `components/bundle.css`. There is no JavaScript bundle: components are HTML patterns with classes prefixed `td-`. Behaviour is the app's own, documented in each component's guidelines.
- Set the theme with `data-theme="light"` or `"dark"` on `<html>`; follow `prefers-color-scheme` by default.
- Every activity in the UI carries `data-activity-id` and two REDCap placeholders, left empty for now. See *Activity catalogue*.

## Sections

- **Activity catalogue** — the categories, activities and sub-activities from the reference screens, with empty placeholders for the research team.
- **Screens & flows** — timeline, add activity, review, submit, past diaries.
- **Protecting participant data** — storage, autosave, submission and locking.
- **Accessibility** — the rules every screen meets.
