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
| `<ProjectName>_Security_Remediation_Tracker.xlsx` | One row per finding, for the development team to work from. |
| `<ProjectName>_Security_Review_Summary.docx` | About 2 pages for management and the development team. |

Both are confidential and follow the output-location rule in `workflow-review.md` (outside the source repository unless the user asks otherwise). The detailed report described below remains the evidence base; these two files summarise and track it. If the user supplies an existing tracker, preserve its structure and add the columns below instead of creating a new layout.

### Excel remediation tracker

**Sheet 1: `Report Summary`.** Project, review date, reviewed commit/branch, scope, what was verified against (Source / Repo config / Deployed / External) and what was not observable, counts by severity, counts by verification status (NEEDS VERIFICATION on its own line), counts by remediation status, inventory counts (operations by class), chain count.

**Mode 2 additions to `Report Summary`** (shown in a separate block that clearly distinguishes **External Report Findings** from **Independent Skill Findings**):
- Total external report findings
- External findings still present
- External findings partially addressed
- External findings fixed in source
- External findings needing verification (also list "not reproducible from available source" and "not applicable" counts if any)
- Skill-only findings
- Findings identified by both
- Total resulting findings (after correlation, no duplicates)
- Counts by severity (of the resulting findings)
- The evidence level of each count: Reported / Observed in source / Observed in deployed environment / Verified externally

**Sheet 2: `Remediation Tracker`.** One row per finding. Columns, in this order:

| Column | Content |
|---|---|
| Task | Short action-oriented title (what to do). |
| Description | The finding: what is wrong, evidence as file:line. Never secret values. |
| Notes | Root cause (`RC-n`), chain (`C-nn`), bypass paths, dependencies. |
| Recommendations | The control change and the regression test. |
| Priority | P0 / P1 / P2 / P3, derived from severity, chain membership and exploitability. |
| StartDate | Blank until the team plans it. Do not invent dates. |
| EndDate | Blank until the team plans it. |
| Status | **Remediation status:** Not Started / Planned / In Progress / Implemented / Blocked. A new review sets Not Started (or the tracker's existing value). |
| Developer | Assignee; blank until assigned. |
| Owner | Accountable owner; blank until assigned. |
| Finding ID | `F-NNN`. |
| Rule ID | Primary `PREFIX-NNN`, or `—`. |
| Severity | Critical / High / Medium / Low / Informational (use "if confirmed" for NEEDS VERIFICATION). |
| Verification Status | Overall: OPEN / PARTIALLY FIXED / FIXED / NEEDS VERIFICATION / NOT APPLICABLE. |
| Verified: Source | Status for the code, or `Not verified`. |
| Verified: Repo config | Status for committed config, or `Not verified`. |
| Verified: Deployed | Status for the running environment, or `Not verified`. |
| Verified: External | Status for cloud console, key management, DB server, pipeline, or `Not verified`. |
| Verification Required | The exact check to run to upgrade the status. |
| Discovery Source | **Mode 2 only.** `External Report`, `Cyber Security Skill` or `Both`. |
| External Finding ID | **Mode 2 only.** The external report's original identifier when available; blank for skill-only findings. Never invent one. |
| Correlation / Relationship | **Mode 2 only.** `External report finding independently confirmed`, `External finding remediated in source`, `Skill independently identified additional issue`, `Same underlying vulnerability identified by both`, `Related but distinct issue` or `Correlation uncertain`. |

In **Mode 1** (project only) the three Mode 2 columns may be omitted, or Discovery Source set to `Cyber Security Skill`. In **Mode 2** they are mandatory, and the Verification Status of an external finding reflects the current-source verification (analysis B), not the external report's claim. See `workflow-review.md`, "Input modes", for the correlation rules (compare mechanism, affected operation/data, impact and evidence; keep uncertain pairs separate).

**Sheet 3: `Source Reference`.** Inputs used by the review: input mode (1 or 2), source type and name (external report, earlier tracker, repository, branch/commit), date, and what each was used for; the skill version. In Mode 2 also record the external report's tested environment and date. No secret values.

**Sheet 4 (when useful): `Developer Assessment`.** One row per finding for developer responses and retest: Finding ID, Developer response, Fix reference (commit/PR), Date implemented, Retest result, Retested by, Retest date, Layer retested. Include it when this is a Verify cycle or the user wants developer sign-off.

**Rules for the tracker**
- Three things stay separate and are never merged into one column: **Severity** (impact), **Status** (remediation/implementation progress) and **Verification Status** with its four per-layer columns.
- A planned or implemented remediation is not "fixed". `Status = Implemented` does not change Verification Status. A finding is FIXED only when the evidence for a layer says so, and FIXED is claimed per layer (see `status-and-severity.md`).
- A layer that was not observed is `Not verified`, never FIXED. In particular, source-code evidence never makes `Verified: Deployed` anything other than `Not verified` or NEEDS VERIFICATION.
- Keep tracker formatting simple (header row, frozen header, filters, wrapped text). When editing a tracker the user supplied, preserve its existing columns, sheets, comments and formatting (edit the XML directly if a library would drop features).

### Word summary (about 2 pages)

An executive and technical summary, not a copy of any VAPT or review report. Sections, in order:
1. **Executive Summary:** scope, what was verified against, overall posture in a few sentences.
2. **Finding counts by severity**, with verification-status counts beside them (NEEDS VERIFICATION on its own line).
3. **Critical / High highlights:** one or two lines each, with Finding ID and rule ID.
4. **Main security risks:** the root causes and attack chains that matter most.
5. **Remaining vulnerabilities:** what is still OPEN or PARTIALLY FIXED, with the layer.
6. **Remediation direction:** the first fixes and the order, in plain language.
7. **Verification and retest requirements:** what must be observed on deployed and external layers, and the redeploy/retest checklist.

**Mode 2 only:** add one concise section, **"External Security Assessment vs. Independent Skill Review"**, after section 5 (or in place of overlapping detail), covering:
- Findings reported by the external assessment
- Findings independently identified by the skill
- Findings identified by both
- Additional skill-only findings
- Current source verification status of the reported findings (still present / partially addressed / fixed in source / needs verification)
- Important gaps that require deployed or external verification

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
