# ActivityList

Step 1 of *Add activity*: every main activity in one scrollable list, grouped under plain category headings, each one a single tap.

## Why no accordions

Adding activities is repetitive, and catch-up means doing it ten times in a row. Accordions cost an extra tap every time and hide the options a child is scanning for. Categories here are `<h3>` headings for orientation only; they are not interactive.

## Structure

- `.td-activity-list` > `section.td-activity-group` (labelled by its `<h3>`) > `ul` > `li` > `button.td-activity`.
- **Used recently** comes first: up to 5 exact past choices (activity plus sub-activity, e.g. "Travelling: cycle"). Tapping one skips the sub-activity step. Hide the group until there is something to show.
- Each card: pattern swatch, heading, optional sub text, and an end marker: a chevron when a sub-activity step follows, a pencil when free text is required, nothing when the next step is only the time.
- Each card carries `data-activity-id`, plus `data-redcap-field` and `data-redcap-code` left empty for now (see *Activity catalogue*).

## Rules

- Sub text truncates at two lines on narrow screens; the full text is still read by screen readers.
- Keep catalogue order. Don't sort by popularity outside *Used recently*; a moving list is hard for children.
- No search field in this release. Add one only if the catalogue grows past about 25 activities.

The consumer provides the catalogue, the recents and the tap handler.
