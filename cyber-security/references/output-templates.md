# Output Templates

All reports carry a banner: **CONFIDENTIAL: contains exploit paths and secret locations. Do not share outside the engagement.** Never paste secret values; cite file:line.

## ID conventions

| Kind | Format | Example |
|---|---|---|
| Rule (permanent, in the KB) | `PREFIX-NNN` | `AUTHZ-004` |
| Finding | `F-NNN` | `F-015` |
| Attack chain | `C-NN` | `C-02` |
| Root cause | `RC-N` | `RC-3` |
| Inventory operation | `OP-NNN` | `OP-041` |

A finding that matches no rule uses `Rule: —` and is listed under **Learn candidates**. Rule IDs and finding IDs are never interchangeable; a report must keep both visible.

## Mandatory deliverables (every Review)

Every project security review produces these two files, generated from the actual current review (no invented findings). `<ProjectName>` is the reviewed project's name, taken from the solution/repository/package name or from the user, with spaces replaced by underscores and characters that are invalid in file names removed. Never hard-code a project name in this skill.

| File | Purpose |
|---|---|
| `<ProjectName>_Security_Remediation_Tracker.xlsx` | Executive summary sheet, the actionable `Issues Tracker` (one row per unique finding), chains and root causes, and per-layer verification detail. |
| `<ProjectName>_Security_Review_Summary.docx` | About 2 pages for management and the development team. |

Both are confidential and follow the output-location rule in `workflow-review.md` (outside the source repository unless the user asks otherwise). The detailed report described below remains the evidence base; these two files summarise and track it. If the user supplies an existing tracker, preserve its structure and add the columns below instead of creating a new layout.

### Excel remediation tracker

Sheets, in this order: `Report Summary`, `Issues Tracker`, `Chains and Root Causes`, `Verification Detail`, `Source Reference`, and (when useful) `Developer Assessment`.

**Sheet 1: `Report Summary`.** A real, concise executive summary for management. Top block: project, review date, reviewed commit/branch, input mode (1 or 2), scope, skill version, and what was and was not observable (Source / Repo config / Deployed / External).

Then a counts table that separates the sources. Columns: **External VAPT findings | Cyber Security Skill findings | Both (correlated) | Unique combined total**. Rows: total, then Critical / High / Medium / Low / Informational, then verification-status counts (OPEN, PARTIALLY FIXED, FIXED, NEEDS VERIFICATION on its own line, NOT APPLICABLE), then remediation-status counts (Not Started / Planned / In Progress / Implemented / Blocked).

Definitions (Mode 2):
- **External VAPT findings** = every finding the external report raised (External-only plus Both). Severity is as reported by the external report; status is the **current-source verification** result, never the report's claim.
- **Cyber Security Skill findings** = every finding the independent skill review identified (Skill-only plus Both), with the skill's severity.
- **Both (correlated)** = the same underlying issue found by both.
- **Unique combined total** = after correlation, no duplicates; severity is the reconciled severity shown in the Issues Tracker. Show External-only and Skill-only counts beside it. If a reconciled severity differs from the reported one, say so in the finding's Notes.

In **Mode 1** there is no external report: drop the External and Both columns and show only the skill findings and the combined (= skill) total.

Below the table: inventory counts (operations by class), chain count, and one line each for the main gaps that need deployed or external verification. Do not paste detail that belongs in the other sheets.

**Sheet 2: `Issues Tracker`.** One row per unique finding, focused on actionable issues. Columns, in this order:

| Column | Content |
|---|---|
| Finding ID | `F-NNN`. |
| External Finding ID | **Mode 2.** The external report's original identifier when available; blank for skill-only findings. Never invent one. |
| Discovery Source | **Mode 2.** `External Report`, `Cyber Security Skill` or `Both`. (Mode 1: `Cyber Security Skill`, or omit the column.) |
| Correlation / Relationship | **Mode 2.** `External report finding independently confirmed`, `External finding remediated in source`, `Skill independently identified additional issue`, `Same underlying vulnerability identified by both`, `Related but distinct issue` or `Correlation uncertain`. |
| Rule ID | Primary `PREFIX-NNN`, or `—`. |
| Task | Short action-oriented title (what to do). |
| Description | The finding: what is wrong, evidence as file:line. Never secret values. |
| Notes | Root cause (`RC-n`), chain (`C-nn`), bypass paths, dependencies, severity reconciliation. |
| Recommendations | The control change and the regression test. |
| Severity | Critical / High / Medium / Low / Informational (use "if confirmed" for NEEDS VERIFICATION). |
| Priority | P0 / P1 / P2 / P3, derived from severity, chain membership and exploitability. |
| Verification Status | Overall: OPEN / PARTIALLY FIXED / FIXED / NEEDS VERIFICATION / NOT APPLICABLE. When the status holds for only some layers, say so in the cell, e.g. `FIXED (source only; deployed not verified)`. Per-layer detail is in `Verification Detail`. |
| Status | **Remediation status:** Not Started / Planned / In Progress / Implemented / Blocked. A new review sets Not Started (or the tracker's existing value). |
| StartDate | Blank until the team plans it. Do not invent dates. |
| EndDate | Blank until the team plans it. |
| Developer | Assignee; blank until assigned. |
| Owner | Accountable owner; blank until assigned. |

The Issues Tracker deliberately does **not** carry the per-layer verification columns or the evidence level; they live in `Verification Detail` so nothing is lost. See `workflow-review.md`, "Input modes", for the correlation rules (compare mechanism, affected operation/data, impact and evidence; keep uncertain pairs separate).

**Sheet 3: `Chains and Root Causes`.** Reproduce this layout exactly; it is taken from an existing generated tracker and must not be redesigned. One sheet, six columns (A to F), two stacked tables separated by one blank row, no merged cells, no frozen panes.

*Table 1: chains (header in row 1, one row per chain below it).*

| Col | Header (exact text) | Content |
|---|---|---|
| A | `Chain` | Chain ID, `C-NN`. |
| B | `Steps (finding IDs, in order)` | Finding IDs joined with ` -> ` in attack order; findings that alternatively provide the same step are joined with `/`, for example `F-013/F-011 -> F-016`. |
| C | `Entry requirement` | What the attacker needs for the first step (anonymous, any registered user, repository read, and so on). |
| D | `Capabilities provided` | Capability names from the capability catalogue in `workflow-review.md` (for example `SECRET-READ, TOKEN-FORGE`), comma-separated. |
| E | `End impact` | The end impact reached, in a sentence. |
| F | `Chain severity` | Critical / High / Medium / Low, rated by the end impact with the entry requirement of the first step. |

*Table 2: root causes (starts after one blank row, so the header is the row after the last chain plus one; one row per root cause below it).*

| Col | Header (exact text) | Content |
|---|---|---|
| A | `Root cause` | Root-cause ID, `RC-n`. |
| B | `Description` | The missing or broken control, in a sentence. |
| C | `Findings` | Finding IDs explained, comma-separated. |
| D | *(empty header cell)* | Left blank. |
| E | `Single fix` | The one control change that closes all the listed findings. |
| F | *(empty header cell)* | Left blank. |

Formatting observed in the reference: both header rows use the header style and data rows the data style; column widths A 8, B 38, C 38, D 28, E 70, F 12. Table 2 deliberately reuses table 1's columns (so `Findings` sits under `Entry requirement` and `Single fix` under `End impact`).

**Sheet 4: `Verification Detail`.** One row per finding: `Finding ID | Verified: Source | Verified: Repo config | Verified: Deployed | Verified: External | Verification Required | Evidence Level`. Each layer cell holds the status for that layer or `Not verified`. `Verification Required` is the exact check that would upgrade the status. `Evidence Level` is the highest of Reported / Observed in source / Observed in deployed environment / Verified externally.

**Sheet 5: `Source Reference`.** Inputs used by the review: input mode (1 or 2), source type and name (external report, earlier tracker, repository, branch/commit), date, and what each was used for; the skill version. In Mode 2 also record the external report's tested environment and date. No secret values.

**Sheet 6 (when useful): `Developer Assessment`.** One row per finding for developer responses and retest: Finding ID, Developer response, Fix reference (commit/PR), Date implemented, Retest result, Retested by, Retest date, Layer retested. Include it when this is a Verify cycle or the user wants developer sign-off.

**Rules for the tracker**
- Three things stay separate and are never merged into one column: **Severity** (impact), **Status** (remediation/implementation progress) and **Verification Status** (with its per-layer detail on `Verification Detail`).
- A planned or implemented remediation is not "fixed". `Status = Implemented` does not change Verification Status. A finding is FIXED only when the evidence for a layer says so, and FIXED is claimed per layer (see `status-and-severity.md`).
- A layer that was not observed is `Not verified`, never FIXED. Source-code evidence never makes the Deployed layer anything other than `Not verified` or NEEDS VERIFICATION.
- Keep tracker formatting simple (header row, frozen header, filters, wrapped text). When editing a tracker the user supplied, preserve its existing columns, sheets, comments and formatting (edit the XML directly if a library would drop features).

### Word summary (about 2 pages)

An executive and technical summary, not a copy of any VAPT or review report. The separation of what the external assessment reported from what the skill independently found must be obvious from the first section.

1. **Executive Summary.** Scope, what was verified against, overall posture in a few sentences, then a compact table that separates the sources (Mode 2):

   | | Total | Critical | High | Medium | Low | Info | Status counts |
   |---|---|---|---|---|---|---|---|
   | **A. External VAPT findings** | | | | | | | current-source verification: open / partially fixed / fixed in source / needs verification |
   | **B. Cyber Security Skill findings** | | | | | | | open / partially fixed / fixed / needs verification |
   | **C. Combined / correlated** | unique total | | | | | | |

   Under the table, one line each for: **findings identified by both**, **external-only findings**, **skill-only findings**. In A, severity is as reported externally and status is the current-source verification, not the external report's claim. In Mode 1 show only B and C (C equals B).
2. **Critical / High highlights:** one or two lines each, with Finding ID, rule ID and Discovery Source.
3. **Main security risks:** the root causes and attack chains that matter most.
4. **Remaining vulnerabilities:** what is still OPEN or PARTIALLY FIXED, with the layer.
5. **External Security Assessment vs. Independent Skill Review** (Mode 2 only, detailed): findings reported by the external assessment; findings independently identified by the skill; findings identified by both; additional skill-only findings; current source verification status of the reported findings (still present / partially addressed / fixed in source / needs verification); important gaps that require deployed or external verification.
6. **Remediation direction:** the first fixes and the order, in plain language.
7. **Verification and retest requirements:** what must be observed on deployed and external layers, and the redeploy/retest checklist.

Do not reproduce the external report; keep the summary concise and suitable for management and the development team.

Rules: confidential banner at the top; no secret values, no payloads; real file paths only; do not claim FIXED for a layer that was not verified; about 2 pages (trim detail rather than exceeding roughly 3 pages).

## Executive summary
Review scope, what was verified against (Source / Repo config / Deployed / External), counts by status and by severity, **NEEDS VERIFICATION on its own line** (severity labelled "if confirmed"), top root causes, chains, and the most important next actions.

## Inventory summary
Counts of operations by class: Anonymous (explicit), Anonymous (implicit), Authenticated, Role/policy protected. Then the list of anonymous operations with: Op ID, route + verb, response data class, consumers, justified yes/no. State the completeness check (framework count vs inventory rows) and the coverage-matrix verdict count.

## Inventory table (appendix)
`Op ID | Route + verb | Handler file:line | Effective AuthN | AuthZ policy/role | Ownership check | Input binding | Response data class | Consumers | Anonymous justified? | Rules applied`

## Coverage matrix
For each anonymous or implicit row: applicable rules x Pass / Fail / N-A, with one line of evidence each.

## Findings table
`Finding ID | Rule ID | Title | Severity | Status | Verified against | Evidence | Root cause | Chain(s)`

## Per-finding block (Critical and High)
- **Finding:** `F-NNN` title, rule ID
- **Evidence:** file:line, config value or test output
- **Impact:** realistic worst case
- **Root cause:** `RC-N`
- **Attack chain:** `C-NN` or none
- **Status:** status plus **Verified against** layer
- **Remediation:** the control change
- **Regression test:** positive, negative, cross-user/role, sibling/lower-layer bypass
- **Verification required:** what must be observed to upgrade the status

## Chains
`C-NN | Steps (F-IDs in order) | Entry requirement | Capabilities provided along the way | End impact | Chain severity`.

## Root-cause section
Group repeated endpoint findings under a shared control failure. Keep the original finding IDs visible.

## Verified controls
Controls that are correctly implemented, with evidence and the layer verified. Include bypass paths that were tested.

## Remaining vulnerabilities
Prioritised list of what is still OPEN or PARTIALLY FIXED, with the layer.

## Remediation plan
For each open/partial item: finding, exact control change, affected layer/files discovered, data/config impact, regression test, dependency and priority. Never invent file names.

## Implementation order
Numbered, smallest-safe-step-first sequence; containment (rotation, removal of anonymous exposure) before refactors.

## Regression plan
For every fix provide a positive test, negative/unauthenticated test, cross-user/role test where relevant, and a bypass test for sibling routes or lower layers. Include a test that a newly added route with no annotation is protected by default.

## Learn candidates
Findings with `Rule: —` or lessons that suggest a new generic pattern: mechanism, why it is reusable, closest three existing rules.

## Tracker DeveloperNote
`STATUS (Verified against: <layer>) — what is true now (evidence file:line). Remaining: what is not done. [Root cause RC-n] [Chain C-nn] [Deploy: retest needed]`

## Baseline pass/fail per rule
Only when the user asks to "check against the skill": every rule as Pass / Fail / Partial / N-A with one line of evidence. A normal review does not include it.
