# Page

A full screen reached from the menu: *Past diaries*, *How to add an activity*, *Study information*, *Data protection*, *Contact*.

## Markup

```html
<section class="td-page" aria-labelledby="pt-contact">
  <header class="td-page__head">
    <a class="td-icon-btn" href="#timeline" aria-label="Back to your diary">‹</a>
    <h1 id="pt-contact" tabindex="-1">Contact</h1>
  </header>
  <main class="td-page__body td-prose">…</main>
</section>
```

## Rules

- **Back arrow, no menu.** A page is one step away from the timeline; the arrow always returns there. The header sticks and clears the notch.
- **Readable text:** `td-prose` keeps lines near 65 characters, with plain lists and paragraphs.
- **Placeholders** (`td-placeholder`, dashed) mark text the research team still has to provide: the study description, the data protection statement, contact details, the participant code. They are visible on purpose, so nothing ships with made-up details.
- **Facts** (`td-facts`) stack each label above its value, so long labels never squeeze the value on a phone. Email and phone numbers are shown as plain, selectable text.
- **One `<main>`:** the page body. The timeline (and its `<main>`) is hidden while a page is open.
- Focus moves to the `<h1>` when a page opens, so screen readers announce where you are.
