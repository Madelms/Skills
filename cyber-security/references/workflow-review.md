# Review Workflow

Goal: find what is actually exploitable in this codebase, prove it with evidence, explain it by root cause and by attack chain, and give a fix plan with tests. The steps are ordered so that the complete inventory comes **before** the detailed rule sweep, and every later step builds on it.

Use subagents for breadth when the project is large (one per surface or module: API, frontend, data layer, config/deploy), including for the inventory. Do the root-cause and chain synthesis yourself.

## 0. Input modes (decide first)

| Inputs | Mode |
|---|---|
| Project source only | **Mode 1: Project Security Review** |
| Project source + external VAPT/security/audit report | **Mode 2: Security Report + Project Review** |
| Explicit request to learn from an assessment | **Mode 3: Learn** (see `workflow-learn.md`; never automatic) |

### Mode 1: Project Security Review
Run Phases 1 to 8 below as an independent review. Every finding is identified by the skill; Discovery Source is `Cyber Security Skill` for all rows (the Discovery Source columns may be omitted from the tracker).

### Mode 2: Security Report + Project Review
The external report is an input source, never automatically the truth. Perform three **separate** analyses, in this order, and keep their results distinguishable until correlation:

**A. External report findings.** Extract every finding exactly as reported: its original identifier (never invent one), title, severity, affected operation/data, tested environment and date, and recommendation. Note which environment the report was proven on; compare its date with the repository history (see `workflow-verify.md` VT-01).

**B. Current-source verification.** For each external finding, inspect the current source (use the traps in `workflow-verify.md`, especially VT-02, VT-04, VT-05, VT-08, VT-14) and record one of: Still present / Partially addressed / Fixed in source / Not reproducible from available source / Needs verification / Not applicable, each with evidence (file:line) and the **Verified against** layer. A report is not proof the issue still exists, and a source fix is not proof of deployed remediation: deployed and external layers stay `Not verified` / NEEDS VERIFICATION unless actually observed.

**C. Independent skill review.** Run Phases 1 to 8 below exactly as in Mode 1. Do **not** limit it to the topics in the external report, and do not read the report's findings as a checklist that replaces the inventory gate. Do this analysis before correlating, so the report cannot narrow what you look for. The purpose is to find issues the report did not identify.

**Correlation.** Merge A, B and C into one list with no duplicates. Compare the underlying **security mechanism, affected operation/data, impact and evidence**, not title or wording. For each resulting finding set:
- **Discovery Source:** `External Report` (reported, not independently found by the skill), `Cyber Security Skill` (not in the report), or `Both` (the same underlying issue found by both).
- **External Finding ID:** the report's original identifier when one exists; blank for skill-only findings.
- **Correlation / Relationship:** one of `External report finding independently confirmed`, `External finding remediated in source`, `Skill independently identified additional issue`, `Same underlying vulnerability identified by both`, `Related but distinct issue`, `Correlation uncertain`.

Do not force a match between materially different findings. If unsure whether two findings are the same issue, keep them separate, mark `Correlation uncertain`, and explain why. A `Both` finding keeps its own verification status from analysis B/C; an external finding fixed in source remains a row (status per layer) so the tracker shows what was reported and what was found.

The deliverables must keep **External Report Findings** and **Independent Skill Findings** clearly distinguishable (see `output-templates.md`). The mandatory chain analysis, inventory gate and root-cause grouping apply to the combined result.

### Mode 3: Learn
Not part of a review. Do not modify the skill because a report was provided. Only on an explicit user request, follow `workflow-learn.md`, using the external report, the current-source review and the independent skill findings as evidence; extract generic mechanisms only, and do not learn from false positives, project-specific details or unverified assumptions.

### Four evidence levels
Keep these apart in every finding and summary: **Reported** (an external report says so), **Observed in source**, **Observed in deployed environment**, **Verified externally** (console, key management, DB server, pipeline). Never claim a deployed vulnerability is fixed from source inspection alone.

## 1. Scope and context

- Identify the deliverables the user wants: report, tracker update, plan, tests.
- Note what you **cannot** see: deployed environments, cloud consoles, other repos, pipeline variables. These become NEEDS VERIFICATION items, not guesses.
- Do not modify application code.
- **Output location.** Write all reports, inventories and tracker copies to a working folder **outside the source repository** (session scratch/temp, or a folder the user names). Write inside the repo only when the user explicitly asks; then say the file is sensitive and suggest a gitignored location. Updating a tracker the user pointed to inside the repo counts as an explicit request: edit only that file.
- Never copy secret values into any deliverable; cite file:line only.
- Reports carry a confidentiality banner. Publish or share only when the user asks.

## 2. Recon: detect stacks and entry points

- List projects/packages and their frameworks (`*.csproj`, `package.json`, `pom.xml`/`build.gradle`, `requirements.txt`/`pyproject.toml`, `go.mod`, IaC files, Dockerfiles, pipeline YAML).
- Open the matching `references/stacks/<stack>.md` for each detected stack. Its section 3 says how to enumerate operations for that framework.
- Find the composition root: `Startup.cs`/`Program.cs`, `app.js`/`main.ts`/`server.ts`, Spring `SecurityConfig`, Django `settings.py`/middleware, Flask/FastAPI app factory. Read it fully. Authentication, authorization defaults, CORS, error handling, static files and API docs are all decided here.

## 3. Endpoint and authorization inventory (MANDATORY GATE)

**You may not start Phase 4 (the rule sweep) until this inventory is complete and every row has a classification.**

### Step 1. Enumerate every reachable operation

Use the stack's own mechanism (see the stack file). Include: controller/route handlers, minimal APIs, GraphQL resolvers, websocket hubs, file and static handlers, health/debug/diagnostic endpoints, scheduled jobs and message consumers that read external input, SPA host controllers, and sample/template endpoints.

### Step 2. Resolve effective authentication and authorization per row

Combine, in order: the global default or fallback policy, then the class/router-group level, then the action level and any override. Classify each row as exactly one of:

| Class | Meaning |
|---|---|
| **Anonymous (explicit)** | Marked anonymous/public by an attribute, decorator or route config. |
| **Anonymous (implicit)** | No marker at all and the effective default is open. This is the class reviews miss. |
| **Authenticated** | Any valid principal may call it. |
| **Role/policy protected** | Name the role or policy, and which authentication scheme(s) it accepts. |

### Step 3. Map consumers

Trace which frontend app and page (or which other service) calls each operation, by following the SPA service/API-client files. Signals:
- An anonymous operation called only from an authenticated or admin UI is **over-exposed**.
- An anonymous operation called by no consumer at all is **suspicious**.
- An operation consumed by several apps with different trust levels needs the policy that fits the least privileged legitimate caller.

### Step 4. Completeness check

The number of operations the framework's own enumeration finds must equal the number of inventory rows. Explain any difference (generated routes, conventional routing, dynamic registration).

### Inventory columns

`Op ID | Route + verb | Handler file:line | Effective AuthN | AuthZ policy/role | Ownership check | Input binding | Response data class | Consumers | Anonymous justified? | Rules applied`

- **Op ID:** `OP-NNN`.
- **Response data class:** one of `none`, `reference`, `workflow/state`, `PII`, `credentials/secrets`, `file content`.
- **Input binding:** the DTO/entity/query/route values bound, and whether the whole entity is written.
- **Anonymous justified?:** yes/no plus the public consumer, or "no consumer".

### Anonymous-operation checklist

Every anonymous row (explicit or implicit) must be answered in writing:
1. What data class does it return? File content: apply FILE-005. PII or credentials: API-002 and DATA-001. Reference or workflow data: AUTHZ-001.
2. Does it change state? Apply API-001, API-003, BIZ-001.
3. Does it expose internal workflow, transition or reference data that public pages do not need?
4. Does it take an ID, a path or a URL? Apply AUTHZ-002, FILE-001, INPUT-003, INPUT-006.
5. Is it rate limited? AUTHN-006, API-005.
6. Is its anonymity justified by a public consumer?

### Coverage matrix

Every anonymous or implicit row gets a coverage row: applicable rules x Pass / Fail / N-A with evidence. **Completion gate:** the report cannot be finalised while any inventory row has no verdict.

### Also inventory
- **Data stores:** DB access style (ORM, raw SQL, stored procedures), connection identities.
- **File stores:** local paths, blob/S3 proxies, template folders, shared files written at request time.
- **Secrets/config:** `appsettings*`, `.env*`, `config/*.json`, frontend `assets/config`, environment files, hosting config, IaC variables, pipeline token-replacement files.
- **Frontend:** API service files, auth interceptors/guards, token storage, hard-coded keys, environment flags that change security behaviour, privileged UIs that render stored data.
- **Outbound:** email/SMS/webhook builders that embed data or configurable URLs.
- **Dependencies:** framework and package versions and support status.

## 4. Rule sweep

Scan `rules/INDEX.md`, then go domain by domain. For each rule that applies to the inventory:
1. Follow its **Detect** steps and the stack hints.
2. Trace the full path when needed: route, controller, service, repository, DB/stored procedure, DTO/response, frontend consumer. Many bugs hide one layer below where the attribute is.
3. Record: rule ID, instances (file:line), status (`status-and-severity.md`), the **Verified against** layer, severity with reason.
4. Check the rule's **False-fix traps** against any control you found, and its **False positives** before reporting.

For "check against the skill" (baseline compliance) requests, record every rule as Pass / Fail / Partial / N-A with one line of evidence. A normal review does not include this per-rule table.

Go beyond the rules too. If you find a vulnerability that no rule covers, report it with `Rule: —` and list it as a **Learn candidate** (generic pattern plus why it is new). Do not edit the skill during a review.

## 5. Bypass hunt (where reviews earn their keep)

For each control you found, ask:
- **Same logic, other door:** another route, an older API version, a GraphQL field, a batch endpoint, an export, an "Obsolete" action still mapped?
- **Twin operation:** a fix applied to one operation while an equivalent anonymous operation remains (find it through the inventory)?
- **Client-supplied identity:** does authorization use an id from the body/query/header instead of the token claim or the stored record?
- **Lower layer:** does a repository, stored procedure, storage proxy or background job skip the check?
- **Encoding/normalisation:** `%2e%2e`, `%5c`, double encoding, Unicode, case, trailing dots, absolute paths, null bytes, rooted second arguments to path joins.
- **Role confusion:** does a helper return "allowed" for any non-tenant role, and is it used behind a policy that admits non-admins?
- **Default allow:** any controller or action without an attribute while there is no fallback policy?
- **Secret exposure:** is the control's key or secret readable (repo, frontend bundle, file-read bug)? If so, the control is forgeable.
- **Frontend dependency:** does the fix break a frontend flow, tempting someone to re-open it? Is a frontend flag switching on insecure code paths?
- **Runtime mode:** does committed hosting config select a development mode (SECRET-004, PLAT-005)?

## 5b. Chain analysis (MANDATORY, after the bypass hunt)

Findings combine. For each finding record what it **provides** to an attacker and what it **requires**.

Capability catalogue (extend it, do not rename existing entries):

| Capability | Meaning |
|---|---|
| `ENUMERATE` | Learn identifiers, users, structure |
| `FILE-READ` | Read arbitrary or other users' files |
| `SECRET-READ` | Obtain a key, credential or token |
| `TOKEN-FORGE` | Create or alter an accepted credential |
| `FIELD-WRITE` | Set a field the caller should not control |
| `SCRIPT-EXEC(role)` | Run script in another user's browser, naming that role |
| `CROSS-TENANT-WRITE` | Modify another tenant's or user's record |
| `CODE-EXEC` | Run code on the server |

A **chain** exists when one finding's *provides* satisfies another finding's *requires*. Report chains as `C-NN` with the ordered finding IDs. The chain's severity is the end impact reached, using the entry requirement of the first step. Findings keep their own severity; the chain explains the amplification and is reported separately.

Generic examples:
- `FILE-READ` (path traversal) leads to `SECRET-READ` (config with signing keys) leads to `TOKEN-FORGE` leads to a privileged API.
- `FIELD-WRITE` on a URL- or HTML-bearing field (mass assignment) leads past a sanitizer-bypass sink to `SCRIPT-EXEC(admin)` inside a privileged UI.
- An anonymous reference/workflow listing (`ENUMERATE`) supplies identifiers that make an ownership gap exploitable.

Rules carry an optional `Chains with:` field to suggest likely partners; use it as a prompt, not a limit.

## 6. Root-cause synthesis

Group findings into **RC-n** root causes. A root cause is a missing or broken control, for example:
- No default-deny authorization
- Entity-level binding
- Ownership checked on a client-supplied id
- Secrets in source
- Unsafe path construction
- Plaintext password lifecycle
- Client-driven workflow state
- Anonymous exposure of operations that only privileged UIs use

For each RC, list the findings it explains and the single fix that closes all of them. Only report root causes the code supports.

## 7. Deliverables

**Every Review produces two standardized deliverables**, in addition to the detailed report below, named from the reviewed project's name (never hard-coded): `<ProjectName>_Security_Remediation_Tracker.xlsx` and `<ProjectName>_Security_Review_Summary.docx`. Their exact structure is the "Mandatory deliverables" section of `references/output-templates.md`. Generate them from the actual review (no invented findings), keep severity, remediation status and per-layer verification status separate, and write them to the same output location as the report. The review is not complete until both exist.

Use `references/output-templates.md`. The default report has: executive summary with counts by status (NEEDS VERIFICATION counted on its own line), inventory summary, findings table, Critical/High detail, Medium/Low/Info summary, chains, root causes, verified controls, remaining vulnerabilities, a phased remediation plan, implementation order, and a regression test plan.

Rules for the deliverables:
- Use real file paths only; never invent file names.
- Reports that contain exploit paths or secret locations are **confidential**.
- If you touched a tracker spreadsheet, preserve its structure and formatting. Add columns; never rename or remove them. Edit the XML directly if the available libraries would drop features such as comments or tables.

## 8. Close-out

- Summarise the status counts, the top 3 risks and the first fix to make.
- List NEEDS VERIFICATION items with how to verify each.
- List Learn-mode candidates and offer to run Learn mode.
