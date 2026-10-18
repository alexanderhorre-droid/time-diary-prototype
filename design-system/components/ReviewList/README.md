# ReviewList

The last check before sending: every day of the diary in order, each with its activities as time ranges, an *Edit* link per day, and *Submit diary* fixed at the bottom. Plain semantic HTML; nothing here needs script except sending.

## Markup

```html
<form method="post" action="/diary/submit">
<main>
  <div class="td-page-head"><h1>Check your diary</h1><p>19 Oct – 1 Nov · 14 days</p></div>
  <div class="td-review">
    <section class="td-review__day" aria-labelledby="r-19">
      <div class="td-review__head">
        <h2 id="r-19">Mon 19 Oct</h2>
        <a class="td-review__edit" href="#day-2026-10-19">Edit<span class="td-vh"> Mon 19 Oct</span></a>
      </div>
      <ol>
        <li><span class="td-pat td-pat--sm td-pat--travel" aria-hidden="true"></span>
            <span class="td-review__time">07:45 – 08:15</span>
            <span class="td-review__what">Travelling: cycle</span></li>
      </ol>
    </section>
  </div>
</main>
<footer class="td-sticky-foot">
  <button class="td-btn td-btn--primary td-btn--block" type="button" popovertarget="confirm-submit">Submit diary</button>
  <p>You'll confirm on the next step before anything is sent.</p>
</footer>
<div popover id="confirm-submit" class="td-popover td-popover--sheet" role="dialog" aria-labelledby="cs-title">
  <h2 id="cs-title">Submit your diary?</h2>
  <p>This sends 14 days, 19 Oct – 1 Nov, to the research team. After that you can look at it, but not change it.</p>
  <div class="td-popover__stack">
    <button class="td-btn td-btn--primary td-btn--block" type="submit">Yes, submit</button>
    <button class="td-btn td-btn--secondary td-btn--block" type="button"
            popovertarget="confirm-submit" popovertargetaction="hide" autofocus>Not yet, keep checking</button>
  </div>
</div>
</form>
```

## Rules

- **In the app it is a full-screen `<dialog>`,** so the markup above uses `<div class="td-modal__body">` in place of `<main>`: a `<main>` can't go inside a dialog.
- **Minimal but confirming.** One row per activity: category swatch, time range, name. No durations, totals or charts. The point is "yes, that's my week".
- **Days in order**, activities in order of start time. Overlapping activities each get a row.
- **Across midnight:** shown once, on the day it started, as "22:30 – 07:00 +1". Screen readers hear "next day".
- **Sub-activity and free text:** the name is the catalogue label ("Travelling: cycle"). For *Other Activity*, the participant's own words go on a second line.
- **Edit** goes back to that day on the timeline. When the participant returns, they come back to this screen at the same day.
- **Submit diary** is the only primary button on the screen. It doesn't send anything: it opens the second step.

## The second step

Sending can't be undone, so it takes two deliberate taps.

- *Submit diary* opens a bottom sheet (native `popover`, `td-popover--sheet`), within thumb reach.
- It says exactly what will happen, with the dates: "This sends 14 days, 19 Oct – 1 Nov, to the research team. After that you can look at it, but not change it."
- **Yes, submit** is the form's real `type="submit"` button. Only this sends the diary.
- **Not yet, keep checking** closes the sheet. It's the bottom button, nearest where *Submit diary* was, so an accidental second tap lands on the safe choice. It also gets focus first (`autofocus`) for keyboard and screen-reader users.
- Tapping outside or pressing Escape also closes it. Nothing is sent.
- The two buttons are stacked full width, never side by side, so the wrong one can't be hit by a near miss.

Back (top left of the screen) returns to the timeline without submitting. Nothing is lost.

## After Yes, submit

The diary locks at once; nothing in it can change from here. The app sends it and keeps it on the phone until the research team's server confirms it arrived, then shows the thank-you screen. If the phone is offline, Review closes and the timeline shows the locked diary with the notice "**Waiting to send.** Your diary is locked and safe on this phone. It will be sent when you're back online." While offline, *Submit* explains "You're offline. Submit works again as soon as you're back online." Back online, the notice reads "**Ready to send.**" and *Submit* opens this screen again with the same two steps. The diary is locked, so the *Edit* links are left out.

The consumer provides the diary's days and activities, and the submit handler.
