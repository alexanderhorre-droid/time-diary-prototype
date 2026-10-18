# Confirmation

The thank-you screen after *Yes, submit*: the diary arrived, when the next one starts, and one way back. Plain semantic HTML; no script.

## Markup

```html
<main class="td-confirm">
  <div class="td-confirm__mark" aria-hidden="true">✓</div>
  <h1 tabindex="-1">Thank you</h1>
  <p>Your diary for 19 Oct – 1 Nov was sent to the research team.</p>
  <p>Your next diary starts on <strong>Mon 2 Nov</strong>.</p>
  <p class="td-confirm__receipt">Received Sun 1 Nov, 18:42 · Ref 7F3K-2Q</p>
</main>
<footer class="td-sticky-foot">
  <a class="td-btn td-btn--primary td-btn--block" href="/">Start next diary</a>
</footer>
```

## Rules

- **Only shown after the research server confirms it received the diary.** Never before. Until then the diary is still on the phone, and if the phone is offline the locked timeline says "Waiting to send". Back online, the participant sends it through Review and the confirm step again.
- **In the app it is a full-screen `<dialog>`,** so the content sits in `<div class="td-confirm td-confirm--fill">`, not `<main>`: a `<main>` can't go inside a dialog. Use `<main>` only when it is a page of its own.
- **Three facts, nothing else:** it was sent (with the dates), when the next diary starts, and a receipt line.
- **The receipt** (time received and a short reference) is small and muted. It's for a parent or the research team if anyone ever asks "did it arrive?". The reference comes from the server's reply.
- **Next diary:** say the date. If it starts later, "Your next diary starts on Mon 9 Nov" is enough; the top bar's *Submit* explains the wait if they try early.
- **Start next diary** is a link (`<a>`), because it goes somewhere. It opens the timeline of the next diary, or the waiting screen if it hasn't started yet (see Page).
- Focus moves to the `<h1>` when the screen appears (`tabindex="-1"`), so screen readers announce "Thank you" first.
- The check mark is decoration; the heading says it.
- Visiting this screen again (back button, reload) shows the same content. Submitting twice is impossible: the diary is already locked.

## After this

The submitted diary moves to *Past diaries* in the menu, read-only, with the read-only notice at the top.

## Waiting screen

Until the next diary starts, home is a centred `td-confirm td-waiting` screen: a top bar with only the menu and the app name; an `<h1>` "Your next diary starts on Mon 2 Nov"; a muted line "In 13 days" (or "Tomorrow"); and a secondary *See the diary you sent* link. It replaces the timeline, so nobody mistakes the sent diary for one they can still fill in.

The consumer provides the diary dates, the next diary's start date, and the server's receipt time and reference.
