# Protecting participant data

**The promise:** nothing a participant adds is lost, whatever they do, until the research team has it.

Participants never manage their data. There's no save button, no backup and no export. The app does the work and the screens say so in plain words.

## What participants see

| Moment | What the screen says |
| --- | --- |
| After adding an activity | Toast: "Added: Travelling: walking, 08:00 – 08:30" with *Undo*. Shown only after it's stored on the phone. |
| Interrupted mid-entry (call, app switched, battery) | *Add activity* reopens exactly where they were. |
| Deleting an activity | Toast with *Undo*. Nothing is gone until the diary is submitted. |
| Offline after *Yes, submit* | "Waiting to send. Your diary is locked and safe on this phone. When you're back online, tap Submit to send it." |
| Sending | A confirm step, then the thank-you screen only after the research server confirms it arrived. |
| After sending | The diary is read-only under *Past diaries*: "Submitted on Sun 1 Nov. You can look, but not change it." |

## Rules for the app

1. **Store first, confirm second.** Every change is written to the phone's storage before the screen says "Added". If storing fails, say so; never pretend.
2. **Drafts are data.** An unfinished *Add activity* is stored on every change, not only on save.
3. **Keep until receipt.** A diary stays on the phone after *Yes, submit* until the server replies with a receipt. Only then is it marked submitted. If the phone is offline or sending fails, it stays on the phone, locked, with "Waiting to send". Nothing sends by itself: back online, the participant sends it through Review and the confirm step again.
4. **No silent deletes.** Deleted activities are kept as hidden "removed" records until submission, so *Undo* always works and nothing disappears by accident.
5. **Updates never touch data.** A new version of the app must read every diary the old one wrote. Stored data carries a version number for that reason.
6. **Ask to keep storage.** The app asks the browser for persistent storage, so the phone doesn't clear it to free space.
7. **One diary open at a time.** Only the current diary can be changed. Submitted diaries are locked.
8. **Clock times, never rewritten.** An activity stores the clock times the participant chose (23:00 – 06:00), its date, and the phone's time zone offset. Times are local: what the phone's clock shows where the participant is, including when they travel. Clock changes and travel never move a saved entry; the offset lets the research team work out the real length and time zone.
9. **Dates from the study, time from the phone.** Diary start and end dates come from the research team. "Today" and the current-time line come from the phone's clock.

## Real-life risks

- **Install to the Home Screen.** On iPhone, Safari may clear a website's stored data after weeks without use; an app added to the Home Screen is treated as an app and keeps its data. Study onboarding should walk the parent or participant through adding it, and the app should gently remind them if it's opened in the browser instead.
- **Same phone, same browser.** Entries live on the phone they were added on. If a participant switches phone mid-diary, the research team needs to know; *Contact* in the menu is the route.
- **Phone storage full.** If the phone refuses to store, show a needs-action notice right away: "Your phone is full, so this activity couldn't be saved. Free up some space and try again." Never show "Added".

## Parked for later

Entries kept only on the phone can be lost to a cleared browser, a deleted Home Screen app, or a lost or replaced phone. Submitted diaries are safe on the server; the diary in progress and the participant's identity are not. Options to decide with the research team: a server copy of unsubmitted entries (consent and ethics), a study code to reconnect, and loading past diaries from the server instead of keeping them on the phone.

These rules describe behaviour the screens depend on. How the app meets them (storage technology, sync, encryption) is decided when it's built.
