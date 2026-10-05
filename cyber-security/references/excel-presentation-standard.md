# Security Remediation Excel: Professional Presentation Standard

The tracker is a **deliverable for management and engineers, not a data export**. It must look like an enterprise security report the moment it opens: scannable, colour-coded, filterable, printable, and usable with no manual formatting. It must never look like a raw CSV.

## Separation of concerns (data integrity)

1. **Content** is produced by the review and written to a JSON data file (schema below).
2. **Presentation** is applied only by `scripts/build-tracker.js`. It renders the data; it never edits, shortens, merges, rewrites or drops any finding, ID, severity, status, evidence, path, endpoint or recommendation.
3. Never hand-format the workbook. Never hard-code a project name, finding ID, severity or count in the script; the project name, counts and priority table are all derived from the data.

## How to generate (mandatory for every Review)

```bash
cd <skill>/scripts && npm install            # once; installs exceljs
node build-tracker.js <data.json> "<Output folder>/<ProjectName>_Security_Remediation_Tracker.xlsx"
```

Write the data file next to the deliverables (outside the source repo, see `workflow-review.md`). If `build-tracker.js` cannot run (no Node), generate the same structure with another library and meet every requirement below. When *editing* a tracker the user supplied, the existing "preserve structure" rule in `output-templates.md` still wins.

### Data file schema

```json
{
  "project": "Project Name",
  "reviewDate": "YYYY-MM-DD",
  "branch": "branch @ commit",
  "inputMode": "Mode 1: ... | Mode 2: ...",
  "skillVersion": "x.y.z",
  "scope": "...", "observed": "...",
  "summaryNotes": [["Label", "Text"]],
  "columns": ["Finding ID", "..."],
  "findings": [ { "Finding ID": "F-001", "Severity": "Critical", "Verification Status": "OPEN (Source)", "...": "..." } ],
  "sheets": [ { "name": "Chains and Root Causes", "headers": ["..."], "rows": [["..."]], "widths": [8, 38] } ]
}
```

- `findings` keys are the `Issues Tracker` column headers from `output-templates.md`, in that order (or give `columns`). Required keys: `Finding ID`, `Severity`, `Verification Status`. Values pass through verbatim; dates should be real dates or ISO strings and are left blank when unplanned.
- `sheets` carries the other mandated sheets (Chains and Root Causes, Verification Detail, Source Reference, Inventory, Verified Controls, Known Issues Status, Developer Assessment, ...) as verbatim header and row arrays, in sheet order. Two-column `Item | Detail` sheets are sized automatically.
- Mode 2: include `Discovery Source` in the findings; the summary then adds a by-source table.

## Required workbook structure

1. **Report Summary** (executive dashboard): title band with project, "Security Remediation Overview", review date, branch, input mode and skill version; confidentiality banner; **overall posture** pill (derived from the highest unfixed severity); KPI cards for Total, Critical, High, Medium, Low, Info; KPI cards for Open, Partially Fixed, Needs Verification, Fixed, Other/N-A and Open Critical+High; **Severity Distribution** and **Status Distribution** tables with counts, % and in-cell data bars; **Priority Findings** (Critical/High not yet fixed, top 12); scope and notes. Counts are live `COUNTIF` formulas on the tracker, so they stay correct when statuses change.
2. **Issues Tracker**: every finding, all canonical columns, nothing removed.
3. The remaining skill-defined sheets, unchanged in content.

## Tracker rules

| Area | Requirement |
|---|---|
| Header | Dark navy fill, white bold centred text, vertical middle, 34 pt row, AutoFilter on, header row frozen, first columns (through `Task`) frozen. |
| Severity colours | Conditional formatting, prefix match so "High (if confirmed)" colours too: Critical dark red, High orange, Medium amber, Low green, Informational blue. |
| Status colours | Conditional formatting on Verification Status: OPEN red, PARTIALLY FIXED orange, NEEDS VERIFICATION amber, FIXED green, NOT APPLICABLE / ACCEPTED RISK / FALSE POSITIVE grey. Remediation `Status` and `Priority` are also colour-coded; `Status` has a dropdown list. Never colour cells by hand. |
| Sorting | Severity (Critical to Info), then OPEN, NEEDS VERIFICATION, PARTIALLY FIXED, FIXED, then original Finding ID order. A hidden `_SortKey` column supports re-sorting; Finding ID order is preserved in every group. |
| Widths and wrapping | Widths computed from content (85th percentile, clamped: long text 28 to 62, others 10 to 36). Long fields (Description, Evidence, Impact, Attack Scenario, Recommendations, Remediation, Verification Method, Notes) wrap, align top, with row heights estimated so text is readable. No merged cells in data tables. |
| Borders | Thin light-grey borders only; no heavy grid, no decorative rows. |
| Dates | `yyyy-mm-dd`; an EndDate in the past on a not-Implemented row is highlighted red. |
| Print | Landscape, fit to one page wide and any number tall, A3 for the tracker, header row repeated, confidential header, page numbers; the tracker prints the skill-defined columns through `Owner` (detail columns remain on screen). |
| Charts | Not used (the library cannot write native charts reliably). Distributions use data bars. If a toolchain can write native charts, add Findings by Severity and Findings by Status from the live counts, simple and undecorated. |

## Quality gate (run before declaring the tracker done)

- **Data QA:** reload the generated file and compare it to the source data: same row count, no duplicate Finding IDs, every cell of every finding and every extra sheet identical.
- **Visual QA:** render or open it (Excel COM export to image/PDF when available) and check header, severity and status colours, widths, wrapping, dashboard layout, no default styling.
- **Usability QA:** opens without a repair prompt, AutoFilter and frozen panes present, conditional formats present, sort order as specified.
- Report any limitation honestly (for example, charts not native).
