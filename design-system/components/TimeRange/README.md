# TimeRange

Day, start and end of an activity in 15-minute steps, using native `<select>` elements.

## Why selects

`<input type="time" step="900">` is honoured inconsistently across browsers and years; some ignore the step, some show a 1-minute wheel. A `<select>` with 96 options per day is the same everywhere, works with screen readers and switch access, and can't produce an invalid value.

## Behaviour

- **Day** lists the days of the current diary. It is pre-filled from where the participant was on the timeline, and editable, because the timeline scrolls across midnight.
- **Start** shows 00:00 to 23:45.
- **End** lists the 96 steps after the start, grouped by day with `<optgroup>`: the rest of the start day, then "Wed 21 Oct (next day)". Next-day options also read "07:15 (+1 day)", so the closed select is never ambiguous. A sleep from 23:00 to 07:15 is one activity, drawn across both days.
- **The diary's last day ends at midnight.** On that day End stops at "00:00 (midnight)", with no next-day group, and a hint under it says so: "Sun 1 Nov is the last day of this diary, so activities end by midnight. Add the rest in your next diary." No activity runs into the next diary, so nothing is stored twice; the morning after a last-night sleep is added in the next diary.
- Values are quarter-hour indexes from the start day's 00:00 (`23:00` = 92, `07:15` next day = 125), so the stored data and the timeline's `--start` and `--dur` agree.
- The duration is an `<output for="start end">` ("Lasts 8 h 15 min").
- **The only script:** when *Start* or *Day* changes, the app rebuilds the End options and the duration. It keeps the chosen end if it's still after the start, otherwise it picks start + 1 hour. The markup itself is complete without script, and saving checks that End is after Start.
- In the catch-up loop (*Save and add another*), Start defaults to the previous activity's end.

## Limits

Activities may overlap, up to 3 at any moment. If saving would make a fourth, show a notice above the buttons: "This time already has 3 activities. Change the time or remove one first." Store the limit as a setting, not a constant; it may change.

The consumer provides the diary's days and the pre-fill values; store times as quarter-hour indexes from the day's 00:00 plus a date, never as formatted strings.
