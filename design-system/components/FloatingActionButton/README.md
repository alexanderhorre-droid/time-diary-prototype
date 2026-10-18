# FloatingActionButton

The pill button fixed bottom-right of the timeline that opens *Add activity*.

- **Default is labelled** ("Add activity" beside the plus). The label matters for 9-year-olds and their parents; a bare plus is ambiguous. Use the icon-only variant (`td-fab--icon`, with `aria-label`) only if a usability test shows the label crowds the timeline.
- Sits above the safe area (`env(safe-area-inset-*)`). The timeline ends with `space-8` of padding so the last hour is never hidden behind it.
- On press it opens the modal with the **day and time at the top of the viewport** pre-filled (rounded down to 15 minutes). After the modal closes, focus returns here.
- Hide it on the review, thank-you and read-only screens.

The consumer provides the click handler and the pre-fill values.
