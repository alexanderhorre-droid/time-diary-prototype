# AddActivityModal

The full-screen modal behind the floating action button: step 1 is the ActivityList, step 2 is the sub-activity, time and repeat.

## Structure

- A native `<dialog class="td-modal">` opened with `showModal()`: focus is trapped, Escape closes, the page behind is inert. Focus goes to the title on open and back to the FAB on close.
- **Head:** back (step 2 only), title "Add activity" with a small step counter, close ×.
- **Body:** scrolls on its own; the head and foot stay put.
- **Step 2** opens with a card naming the chosen activity only when it has no options (Sleeping, Resting); with options, the heading "Select an option for “Travelling”" already names it.
- **Duration** reads "30 min", "1 h" or "8 h 15 min", never "0 h 30 min".
- **Toasts** inside the open modal sit above its buttons; after it closes, above the floating button. Show them after the screen changes.
- **Foot:** *Add to timeline* (primary) and *Save and add another* (secondary), stacked full width so both are easy thumb targets.

## Catch-up loop

*Save and add another* saves, shows a toast ("Added: Travelling: walking, 08:00 – 08:30"), and returns to step 1 with the same day and the start time set to this end time. A whole day can be filled without closing the modal. A counter in the head ("3 added") reassures that each one saved.

## Saving and leaving

- The draft is saved to the device on every change, so an interrupted entry (phone call, app switched, battery) reopens exactly where it was.
- Close × with unsaved choices asks: "Discard this activity?" — *Keep editing* (primary) or *Discard*.
- Validation happens on *Add to timeline*, never while typing: missing option or free text, or the overlap limit, shown as a notice above the buttons with focus moved to it.

## Editing

Tapping an event on the timeline opens this modal at step 2 with everything filled, title "Edit activity", and a *Delete* ghost button. Delete shows an undo toast instead of a confirm dialog; the activity is kept as a tombstone until the diary is submitted.

The consumer provides the catalogue, the pre-fill (day, start) and the save handler.
