# PastDiaries

The list of submitted diaries, reached from *Past diaries* in the menu. Each row is a link that opens that diary on the timeline, read-only.

## Markup

```html
<ul class="td-rowlinks">
  <li><a class="td-rowlink" href="#past-d2">
    <svg class="td-icon" aria-hidden="true">…lock…</svg>
    <span class="td-rowlink__body">
      <span class="td-rowlink__title">Diary 2 · 5 Oct – 18 Oct</span>
      <span class="td-rowlink__meta">Submitted Sun 18 Oct · 42 activities</span>
    </span>
    <svg class="td-icon" aria-hidden="true">…chevron…</svg>
  </a></li>
</ul>
```

## Rules

- Newest first. The diary in progress is never in this list; once a diary is submitted it stays the *current diary* until the next one starts, then moves here.
- Each row says which diary, its dates, when it was submitted, and how many activities. Rows are at least 72px tall.
- The lock is decoration; the words say it's submitted.
- Opening one shows the timeline with the read-only notice: "Diary 2 · Submitted on Sun 18 Oct. You can look, but not change it." and a *Back to past diaries* link. There is no *Add activity* button and no gaps.
- Nothing submitted yet: "You haven't submitted a diary yet." instead of the list.

`td-rowlinks` / `td-rowlink` is the general pattern for any list of places; Past diaries is its first use.
