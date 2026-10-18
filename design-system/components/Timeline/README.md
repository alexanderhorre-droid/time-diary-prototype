# Timeline

The vertical day view: hours down the left, activities as blocks placed by their start and length, days running into each other past midnight. Semantic lists and CSS; positions come from CSS custom properties, so there's no layout script.

## Markup

```html
<div class="td-timeline">
  <section class="td-tl-day" id="day-2026-10-20" aria-labelledby="h-20">
    <h2 class="td-tl-day__head" id="h-20">Tue 20 Oct</h2>
    <div class="td-tl-grid">
      <ol class="td-tl-hours" aria-hidden="true"><li><time>00:00</time></li> … <li><time>23:00</time></li></ol>
      <ol class="td-tl-track" aria-label="Activities on Tue 20 Oct">
        <li class="td-event" style="--start:28; --dur:3">
          <button class="td-event__btn">…title…<span class="td-event__time">07:00 – 07:45</span></button>
        </li>
        <li class="td-gap" style="--start:33; --dur:7"><button class="td-gap__btn">Nothing added · 08:15 – 10:00</button></li>
      </ol>
    </div>
  </section>
  <section class="td-tl-day" id="day-2026-10-21">…</section>
</div>
```

## Time is geometry

- One hour is 64px (`--hour-row`); one 15-minute step is 16px (`--quarter`).
- `--start` is the quarter-hour index from that day's 00:00 (07:00 = 28). `--dur` is the length in quarters (45 min = 3).
- The track's activities are listed in time order, so a screen reader hears the day in order without the visual layout. The hour labels are hidden from screen readers; each activity says its own times.
- Every day of the diary is in the page, one `<section>` after another. Scrolling past 23:59 simply continues into the next day. Each day has an `id` (`day-YYYY-MM-DD`) that the TopBar's previous and next links point at.

## Real-life cases

- **Across midnight.** An activity that ends the next day is drawn in both days: `td-event--cont-after` on the first part, `td-event--cont-before` on the second. The edge where it continues is dashed and square, and an arrow (↓ or ↑) beside the time says the same thing. Both parts open the same activity.
- **Overlaps (up to 3).** Overlapping activities share the width in lanes: `--lane` (0, 1, 2) and `--lanes` (2 or 3). The app works out the lanes; the CSS only places them.
- **Short activities.** 45 minutes or less is `td-event--short`: title and time on one line. Add `td-event--narrow` when it is also in a lane, which hides the visible time but keeps it for screen readers.
- **Gaps.** A stretch with nothing in it, inside a day that has activities, shows a dashed block, "Nothing added · 08:15 – 10:00". Tapping it opens *Add activity* with that day and those times filled in. This is the fastest way to catch up. Don't show gaps in days with no activities at all; one empty day is not 24 gaps.
- **Now.** On today, a line marks the current time from the phone's clock and moves as the day goes on. It's decoration, hidden from screen readers.
- **Clock changes.** Every day is drawn as 00:00 – 24:00, including the nights the clocks go back or forward. Activities sit at the clock times entered; no hour is added or removed on screen.
- **A new, empty diary.** It opens at the top with one info notice: "Diary 4 has started. Tap Add activity to fill in your day." The notice goes away as soon as the first activity is added. No gaps are drawn on empty days.

## Mobile

- Day headings scroll with the page and mark each midnight. They don't stick: the TopBar already names the day in view, and a pinned heading under it repeated the same date.
- The timeline ends with room for the floating button, so it never covers the last hours.
- Tapping an activity opens it for editing. Tapping a gap opens *Add activity*.

The consumer provides the days, the activities with their start, length, lane and category pattern, and today's current time.
