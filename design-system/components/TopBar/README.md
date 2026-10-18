# TopBar

The fixed header of the timeline screen: menu, app name, *Submit*, and the day selector. Each fact appears once. Plain semantic HTML and CSS; it works with no JavaScript.

## Markup

```html
<header class="td-topbar">
  <div class="td-topbar__row">
    <button class="td-icon-btn" popovertarget="menu" aria-label="Menu">…</button>
    <div class="td-topbar__title"><h1 class="td-topbar__name">Time Diary</h1></div>
    <button class="td-btn td-btn--secondary td-btn--sm" aria-disabled="true" popovertarget="submit-why">Submit</button>
  </div>
  <nav class="td-daynav" aria-label="Day">…previous · <p>Tue 20 Oct</p> · next…</nav>
</header>
<div popover id="submit-why" class="td-popover" role="dialog">…</div>
```

## Parts

- **Row 1:** menu link · `<h1>` app name · *Submit*.
- **Day selector:** previous and next are **links** to the day anchors on the timeline (`#day-2026-10-19`). The day in view is plain text (not a heading: each day on the timeline already has its own `<h2>`, and a second one made screen readers list every date twice), with "Day 2 of 14" under it. On the first and last day the missing arrow is `inert` and `visibility: hidden`, so it keeps its space but can't be reached by tap, keyboard or screen reader. That line is how the diary's length is shown; the full date range lives in the menu and in the Submit popover, not here.

## What was left out, on purpose

Diary number, the date range, and an activity count. Each repeated something already on screen or on the timeline itself.

## Submit, never disabled

*Submit* uses the native `popover` attribute. While the diary isn't ready, the button has `aria-disabled="true"` (dashed edge, lock icon; the icon goes when Submit is available), and pressing it opens a popover. The popover says what's missing, links to the first empty day, and can be closed. HTML handles this with no script: tap outside or press Escape to close.

When the diary is ready, swap the button for `td-btn--primary` and point it at Review.

## Fixed, not sticky

The bar is `position: fixed`, and the timeline starts below it (`padding-top: var(--topbar-h)`, set from the bar's real height). With `position: sticky`, phones (Safari and Chrome) could draw one frame of a long jump between days before re-pinning the bar, so the hours behind it flashed through. The timeline is its own layer (`z-index: 0`) under the bar (`z-index: 10`).

## Mobile and PWA

- The bar is padded by `env(safe-area-inset-top)`, so in the installed app it clears the iPhone notch or Dynamic Island and the Android status bar. Use `<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">`.
- Every tappable thing is at least 48 × 48.
- Long names and periods are cut short with an ellipsis rather than wrapping.
- Hover styles apply only on devices with a mouse, so they never stay stuck after a tap.

## Optional enhancement

Script may update the day selector as the timeline scrolls, but the links must keep working without it.
