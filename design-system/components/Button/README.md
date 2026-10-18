# Button

Native `<button>` in three emphases, plus a "not available yet" state that is never disabled.

## Variants

| Class | Use |
| --- | --- |
| `td-btn td-btn--primary` | The one main action on a screen: *Add to timeline*, *Submit diary*, *Start next diary*. One per view. |
| `td-btn td-btn--secondary` | The useful alternative: *Save and add another*, *Edit*. |
| `td-btn td-btn--ghost` | Low-stakes actions: *Cancel*, *Keep editing*. |
| `td-icon-btn` | Icon-only (close, menu, previous/next day). Needs `aria-label`. 48 × 48. |

## Not available yet

Never use the `disabled` attribute. A disabled button can't be focused, gives no reason, and a parent, child or teen will just tap it again. Instead:

- Add `aria-disabled="true"`. It renders with a **dashed** edge and a lock icon, so the state is clear without colour.
- Keep it focusable and clickable. On press, write the reason into an element linked by `aria-describedby` with `role="status"`, or open a notice.
- The reason says what is missing and how to fix it, with a link to the place to fix it.

## The consumer provides

The label (a verb, two or three words), the click handler, and for `aria-disabled` the reason text. Minimum size is 48px high; don't override it.
