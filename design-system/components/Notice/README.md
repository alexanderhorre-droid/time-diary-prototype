# Notice

Short messages that explain what's happening: something isn't available yet, something needs fixing, a diary is read-only, the phone is offline, or an activity was just added. Four kinds, told apart by edge and weight, never by colour.

## Kinds

| Kind | Class | Role | When |
| --- | --- | --- | --- |
| Info | `td-notice` | `status` | Something isn't available yet, or a calm fact: the next diary's date, offline. |
| Needs action | `td-notice td-notice--attention` | `alert`, or none when focus is moved to it (the add screen) | The participant must change something before it can be saved: the overlap limit, a missing sub-activity. Heavy edge and a bar down the side. Has a title. |
| Read-only | `td-notice td-notice--readonly` | `note` | Top of a submitted diary. Dashed and quiet, with a lock. |
| Toast | `td-toast` as a `popover="manual"` | none; announced through a separate `role="status"` region | A confirmation after an action, with *Undo* where it can be undone. |

## Markup

```html
<div class="td-notice td-notice--attention" role="alert">
  <div class="td-notice__body">
    <p class="td-notice__title">This time is full</p>
    <p>08:00 – 08:30 already has 3 activities. Change the time or remove one first.</p>
  </div>
</div>

<!-- Always in the page, never hidden: script clears it, then sets the toast's text a moment later -->
<p class="td-vh" id="live" role="status"></p>

<div popover="manual" class="td-toast">
  <p class="td-toast__text">Added: Travelling: walking, 08:00 – 08:30</p>
  <button class="td-toast__action" type="button">Undo</button>
</div>
```

## Writing them

- Say what is true, then what to do. "08:00 – 08:30 already has 3 activities. Change the time or remove one first."
- Use dates and times, not "soon" or "yesterday".
- Never blame or alarm. Offline is a fact, not an error: "Your diary is safe on this phone".
- Body text is 16px, the same as everything else; a parent may read these aloud to a 9-year-old.

## Behaviour

- **Needs action** appears where the problem is (above the modal's buttons), and focus moves to it so it's announced and visible.
- **Toast** sits above the floating button, never over it, and clears the home indicator. It stays for at least 6 seconds, longer if it has *Undo*, and doesn't disappear while it has focus. Showing and hiding it is the app's only script here.
- **Info** and **Read-only** stay until the situation changes. There's no close button, because they're not something to dismiss.
- Icons are decoration (`aria-hidden`); the words say everything.

**Toast placement is CSS.** Above the floating button by default; at the bottom edge when the floating button is hidden (`.td-fab[hidden] ~ .td-toast`); above the add screen's buttons while it is open (`.td-modal[open]:has(> form > .td-modal__foot:not([hidden])) ~ .td-toast`). A toast that was hidden a moment ago may not be read by screen readers, which is why the words also go to the live region.

The consumer provides the text and, for the toast, the undo handler.
