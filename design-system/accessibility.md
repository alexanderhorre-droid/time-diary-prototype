# Accessibility

WCAG 2.2 AA is the floor. These are the rules every screen in this system follows, in one place, so the app keeps them as it grows.

## Never disabled

No button or link uses the `disabled` attribute. An action that isn't available yet still responds and says why.

- Mark it `aria-disabled="true"`: a dashed edge and a lock icon, so the state reads without colour.
- Pressing it opens a native popover (or a notice) that says what's missing and links to where to fix it. Example: *Submit* → "Not ready to submit yet … Go to Thu 22 Oct".

## Use the platform

Native HTML elements first, because they bring keyboard, screen-reader and switch support for free, and they will still work in years:

| Need | Element |
| --- | --- |
| Panels: menu, "not ready yet", confirm before submit | `popover` + `popovertarget` |
| Add activity | `<dialog>` |
| One choice (sub-activity) | `<fieldset>` + radio buttons |
| Several choices (other days) | `<fieldset>` + checkboxes |
| Times | `<select>` with `<optgroup>` per day |
| Sending the diary | `<form>` + `<button type="submit">` |
| Going somewhere | `<a href>`, never a button |

## Structure

- One `<h1>` per screen. Headings follow in order: day headings are `<h2>`.
- Landmarks: `<header>`, `<nav>`, `<main>`, `<footer>`. Exactly one visible `<main>` per view (the timeline, or the open menu page). Never a `<main>` inside a `<dialog>`; full-screen dialogs use a `<div>`.
- No inline `style` attributes: layout lives in the stylesheet. Script only sets CSS custom properties that carry data (an activity's `--start` and `--dur`, the bar's measured `--topbar-h`).
- Lists are lists: activities on the timeline and in the review are `<ol>` in time order, so a screen reader hears the day in order without the visual layout.
- Every field has a visible `<label>`; every group has a `<legend>`.
- Icon-only buttons have an `aria-label`. Decorative icons and patterns are `aria-hidden`.

## Seeing it

**Contrast** (measured, both themes):

| Pair | Light | Dark | Needed |
| --- | --- | --- | --- |
| `ink` on `bg` | 18.9 | 18.2 | 4.5 |
| `ink-muted` on `bg` | 7.8 | 7.8 | 4.5 |
| `ink-muted` on `surface-200` (category headings) | 6.4 | 6.0 | 4.5 |
| `inverse-ink` on `inverse-bg` (primary button, toast) | 18.9 | 18.2 | 4.5 |
| `line-strong` control edges on `bg` | 4.7 | 5.7 | 3 |
| `line-strong` on `surface-100` | 4.3 | 5.2 | 3 |

- **Never colour alone.** It's monochrome, so this is built in: categories are patterns plus names, states are solid, outline or dashed plus words.
- **Focus ring:** 3px solid, 2px offset, on everything interactive.
- **Text** is 1rem (16px by default) or larger for anything a participant reads, inputs included (smaller inputs make iOS zoom in). 12–14px only for supporting details that are also said elsewhere.
- **Dark mode** follows the phone's setting.

## Touching it

- Every target is at least 48 × 48px. Activity cards are 64px tall; options 56px.
- Primary and secondary actions are stacked full width at the bottom, within thumb reach. Confirm steps put the safe choice where a slip lands.
- Hover styles only apply with a mouse, so nothing looks stuck after a tap.
- No gestures required: no swipe, long-press or drag. Everything is a tap.

## Time and change

- **No time limits.** Nothing expires, no session times out, no draft is lost.
- Toasts stay at least 6 seconds and don't vanish while focused. *Undo* instead of "Are you sure?" for small things; a confirm step only for sending the diary.
- Motion is minimal and switched off with `prefers-reduced-motion`.
- Works in portrait and landscape.

## Errors

- Checked when saving, not while typing.
- Said in words, next to the problem, with focus moved there (no `role="alert"` as well, or it is read out twice): "08:00 – 08:30 already has 3 activities. Change the time or remove one first."
- Never blame. Offline is a fact, not an error.

## Larger text

All font sizes and line heights are in `rem`, so text follows the phone's own text-size setting, not only browser zoom. On iPhone the root size comes from Dynamic Type (17px at the default setting). Spacing and tap targets stay in `px`, and buttons and rows use a minimum height, so they grow with their text instead of clipping it.

## Test before each release

- VoiceOver on iPhone and TalkBack on Android, through add activity, review and submit.
- Text zoom at 200% and the phone's largest text setting.
- Landscape.
- A Bluetooth keyboard: Tab, Enter, Space, Escape, arrow keys.
- Dark mode and reduced motion.
