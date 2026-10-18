# Screens & flows

## Timeline (home)

- **Top bar** (fixed to the top of the screen): menu button · app name · **Submit**. Under it, the **day selector**: previous and next day, the day in view ("Tue 20 Oct") and "Day 2 of 14".
- **Timeline**: vertical, one hour per 64px, starting at 00:00. Scrolling past 24:00 continues into the next day without a jump; a day heading ("Tue 20 Oct") marks each midnight and scrolls with the page. Scrolling is how a sleep from 23:00 to 07:00 is seen as one block.
- The day selector follows the scroll: the day just under the top bar is the day in view. Previous and next move one whole day in a single jump, with that day's heading right under the bar.
- **Floating action button** bottom-right opens *Add activity*. It pre-fills the day and the time at the top of the viewport, rounded down to 15 minutes; the participant can change both.
- Tapping an event opens it in the same modal, in edit mode, with *Delete* available.

## Add activity (modal)

1. **Choose an activity.** Full-screen modal, title "Add activity", close × top-right. One flat list, no accordions: every main activity is visible. Category names are plain section headings, not buttons. At the top, **Used recently** lists up to 5 exact choices the participant made before ("Travelling: cycle"); tapping one skips straight to the time step.
2. **Describe it.** Title "Select an option for "Travelling"": sub-activity options (if any), free text (for *Other Activity*), then **Day**, **Start** and **End** in 15-minute steps. End may fall on the next day; it shows "(+1 day)". Activities without sub-activities (Sleeping, Forgot / Unspecified) show only the time fields.
3. **Repeat on other days** (optional): day chips for every day of this diary.
4. **Add to timeline** saves and closes; focus returns to the FAB and a toast says "Added: Travelling: walking, 08:00 – 08:30".
5. **Save and add another** (secondary button beside it) saves and returns to step 1 with the same day and a start time equal to the last end time. This is the catch-up loop: a whole day can be filled in without leaving the modal.

Closing with × after changes asks: "Discard this activity?" with *Keep editing* as the default.

If a slot would hold a fourth overlapping activity, *Add to timeline* explains the limit inline and does not save.

## Submit

- **Submit** is always enabled. When the diary isn't ready it opens a notice saying exactly why ("You haven't added activities for 3 days yet: …") with a link to the first empty day.
- When ready, it opens **Review**: days in order, each with its activities as time ranges. *Edit* (back to that day) or **Submit diary**.
- *Yes, submit* locks the diary at once. Online, it is sent and **Thank you** follows. Offline, the timeline shows "**Waiting to send.** Your diary is locked and safe on this phone. When you're back online, tap Submit to send it." Nothing is sent without the participant: back online, the notice becomes "**Ready to send.** You're back online. Tap Submit to check and send your diary." *Submit* opens Review again (without *Edit* links, since the diary is locked), then the confirm step.
- **Thank you**: confirms the receipt, says when the next diary opens, and has *Start next diary*.

## Next diary and past diaries

- After submission the diary becomes **read only** and moves to *Past diaries* straight away, with the notice "Diary 3 · Submitted on Tue 20 Oct. You can look, but not change it."
- **Waiting screen.** Until the next diary opens, home is a calm screen instead of the old timeline: "Your next diary starts on Mon 2 Nov", "In 13 days", and *See the diary you sent*. No *Add activity*, no *Submit*. The menu's *Current diary* reads "starts 2 Nov".

## Menu (drawer)

Actions above the divider: *Go to today*, *How to add an activity*. Links below it: *Current diary*, *Past diaries*, *Study information*, *Data protection*, *Contact*.
