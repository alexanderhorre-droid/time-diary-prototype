# DayChips

A grid of checkboxes, one per day of the current diary, for copying an activity to days when it repeated (school, the same bus, the same bedtime).

- Plain HTML: a `<fieldset>` with a `<legend>` ("Also on other days?") and a hint. Each chip is a `<label>` over a real, visually hidden `<input type="checkbox" name="days" value="2026-10-20">`, so the chosen days submit with the form like any field. Weekday above, date below, 7 per row, so a 14-day diary reads as two calendar weeks. No script.
- **Checked** = filled (`inverse-bg`). The day being edited has a **dashed** edge and is always checked; unchecking it is allowed and moves the activity off that day.
- Each copy is saved as its own activity, linked by a shared `repeatGroupId`, so participants can edit or delete one day without touching the others. When they edit a linked activity, ask once: "Change only this day, or all 4 days?"
- Copies respect the overlap limit per day. If a copy would make a fourth overlap, skip that day and say which: "Not added on Thu 22 Oct: that time already has 3 activities."
- Copies respect the last day too. An activity that ends after midnight isn't copied onto the diary's last day: "Not added on Sun 1 Nov: the last day of the diary ends at midnight."
- Changing *Day* moves the dashed "current" mark and unticks the old day, so moving an activity never leaves a copy behind.
- Days outside the current diary never appear.

The consumer provides the diary's days and the current day.
