# Time Diary: handoff

The prototype, the design system and the PRD describe the same app and are in step as of 18 Oct 2026. Build from the design system and the PRD; use the prototype to see how it behaves.

## The three pieces

| What | Where | Access |
| --- | --- | --- |
| Prototype (this repository) | https://alexanderhorre-droid.github.io/time-diary-prototype/ | Public link, sample data only |
| PRD: what the app does, rules, open questions | https://claude.ai/artifact/MLs9C2fZQhJo4qJXEYktf9 | Private: ask Alex to share it |
| Design system: tokens, components, CSS, accessibility and data rules | https://claude.ai/artifact/N1LuWvZZe83WNxMjD1jL7n | Private: ask Alex to share it. A copy of its files is in `design-system/` |

## Real or mocked

| Real (build it this way) | Mocked (replace it) |
| --- | --- |
| Screens, wording, layout and every rule in the PRD | The research server: sending returns a made-up receipt |
| Saving each change on the phone first (IndexedDB), drafts, undo | "Today" is fixed at Tue 20 Oct 2026, 14:30 |
| Locking on *Yes, submit*; "Waiting to send" when offline | Diary dates are hard-coded, not from the study |
| Read-only past diaries, the waiting screen between diaries | Sample activities and past diaries |
| Installable web app that opens offline | Menu items marked "prototype" |

## What a production build needs

1. **A receiving server** that accepts a diary and replies with a receipt (time received and a reference). The thank-you screen appears only after that reply.
2. **REDCap mapping:** every activity and option carries empty `data-redcap-field` and `data-redcap-code` placeholders for the research team to fill.
3. **Diary dates from the study,** not the phone, so a wrong phone clock can't open a diary early.
4. **Participant identity:** a study code or personal link, so the app knows whose diary it is.
5. **Data-loss protection** (parked on purpose). Entries live only on the phone until submitted, so a cleared browser or a lost phone loses the diary in progress.

## Decisions already made

- Semantic HTML and plain CSS; JavaScript only for what HTML can't do with data stored on the phone. No framework.
- Buttons are never disabled: they respond and explain why.
- 14-day diaries for now. Submit needs every day filled, then Review, then a second confirm step.
- *Yes, submit* locks the diary. Offline it waits on the phone; back online, nothing sends by itself, and the participant sends it through Review again.
- Up to 3 activities at the same moment. Times in 15-minute steps.
- Times are local clock times, saved with the phone's time zone offset; days are always drawn 00:00 – 24:00.
- An activity may run past midnight, except on a diary's last day, which ends at midnight.
- The top bar is fixed (not sticky), to stop a flicker on phones.

## Open decisions

These are in the PRD's open questions:

- [ ] App name to replace "Time Diary"
- [ ] Full activity list and sub-activities
- [ ] REDCap fields and codes
- [ ] Data loss: copy unsubmitted entries to the server? Needs consent and ethics approval
- [ ] Participant identity: study code or personal link
- [ ] Remind a participant whose diary is locked but never sent?
- [ ] Past diaries: keep on the phone, or load from the server?
- [ ] Onboarding: guiding participants to install the app to the Home Screen
- [ ] Diary length after the prototype: weekly, bi-weekly or monthly

## Working on the prototype

See [README.md](README.md): `python3 tools/build.py`, then serve the folder. Edit `src/` and `design-system/` only; everything at the root is generated.

Contact: Alex Horré.
