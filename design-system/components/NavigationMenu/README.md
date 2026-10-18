# NavigationMenu

The menu behind the ☰ button in the TopBar: a panel from the left with actions above a divider and places below it. Native `popover`, no script at all.

## Markup

```html
<button class="td-icon-btn" popovertarget="menu" aria-label="Menu">☰</button>

<nav popover id="menu" class="td-drawer" aria-labelledby="menu-title">
  <div class="td-drawer__head">
    <h2 id="menu-title">Menu</h2>
    <button class="td-icon-btn" popovertarget="menu" popovertargetaction="hide" aria-label="Close menu">×</button>
  </div>
  <ul aria-label="Actions">…</ul>
  <hr>
  <ul aria-label="Pages">…</ul>
</nav>
```

## Contents

**Actions** (do something on the current screen):
- *Go to today*: link to today's anchor on the timeline.
- *How to add an activity*: link to a short help page.

**Pages** (go somewhere else):
- *Current diary*, with its dates. This is where the full date range lives now that the TopBar shows only "Day 2 of 14".
- *Past diaries*, with a count. Submitted diaries open there as read-only.
- *Study information*, *Data protection*, *Contact*.

## Not in the menu

No backup, export or settings. Participants never manage their own data: the app keeps every entry on the device until the diary is submitted and the research team confirms receipt.

## Rules

- Mark the page you're on with `aria-current="page"` (bold text and a bar on the left).
- Every item is a full-width row, at least 48px tall. Text only, no icons: the words do the work, and fewer icons means less to scan.
- Tap outside, press Escape or use the × to close. The popover handles all three.
- The panel respects the safe areas (notch, home indicator) and scrolls on its own if the list is longer than the screen. Scrolling inside it doesn't scroll the page behind.
- In the app, the TopBar's menu link becomes a `<button popovertarget="menu">`.

The consumer provides the hrefs, the current page, the diary dates and the count of past diaries.
