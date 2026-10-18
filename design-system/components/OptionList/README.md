# OptionList

Native radio buttons in a `<fieldset>` for choosing the sub-activity that describes a main activity ("Travelling" → "Travelling: cycle").

- The `<legend>` is the step title: `Select an option for "<Activity>"`.
- Each option is a whole-row `<label>` (56px minimum) wrapping a real `<input type="radio">`. Arrow keys move between options; the selected row gets a heavier edge and a filled dot, so it never depends on colour.
- Labels repeat the activity name ("Travelling: walking") exactly as the catalogue writes it, so the timeline and review read the same.
- Pre-select nothing, except when the participant arrived from *Used recently* or is editing.
- The *Other* option of a category may need free text: show a `td-input` right under it when selected.
- Each option carries `data-activity-id`, plus the two REDCap placeholders left empty for now.

The consumer provides the options and the `name`.
