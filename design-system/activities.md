# Activity catalogue

The activities, as the participant sees them in *Add activity*. Taken from the two reference screenshots; rows marked **TBD** were collapsed there and need the study's list.

| Category | Activity | Sub text | Sub-activities |
| --- | --- | --- | --- |
| General Activities | Sleeping | — | none |
| General Activities | Activities of Daily Living | Eating, drinking, personal care, household routines, caring for children, pets, … | TBD |
| General Activities | Resting | Lunch break, couch time, downtime, … | TBD |
| Travel & Transit | Travelling | Walking, cycle, running, car, public transport, … | walking · cycle · running · car, motorbike, moped, E-scooter, taxi or similar · public transport · other |
| Work / Study | TBD | | |
| Activities At Home (Non-Digital) | TBD | | |
| Activities out of Home (Non-Digital) | TBD | | |
| Digital Media | TBD | | |
| Other | Other Activity | Please specify. | free text |
| Other | Forgot / Unspecified | — | none |

Sub-activity labels keep the study's wording, prefixed with the activity: "Travelling: walking", "Travelling: public transport".

## Placeholders for the research team

Every activity card and sub-activity option carries three attributes in the HTML. They are left **empty** while the UI is being explored, and get filled in later when the REDCap mapping is decided:

```html
<button class="td-activity" data-activity-id="travel.travelling" data-redcap-field="" data-redcap-code="">…</button>
```

- `data-activity-id`: a stable name for the activity. Once participants use it, it never changes.
- `data-redcap-field`, `data-redcap-code`: empty for now.
