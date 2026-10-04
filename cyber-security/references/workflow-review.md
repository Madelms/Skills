# Review Workflow

Goal: find what is actually exploitable in this codebase, prove it with evidence, explain it by root cause, and give a fix plan with tests. The steps are ordered so that cheap, high-yield work comes first and every later step builds on the inventory.

Use subagents for breadth when the project is large (one per surface: API, frontend, data layer, config/deploy), but do the root-cause synthesis yourself.

## 1. Scope and context (5 minutes, saves hours)

- Identify the deliverables the user wants: report, tracker update, plan, tests.
- Note what you **cannot** see: deployed environments, cloud consoles, other repos, pipeline variables. These become NEEDS VERIFICATION items, not guesses.
- Do not modify application code. Write deliverables beside the project or where the user asks.

## 2. Recon: detect stacks and entry points

- List projects/packages and their frameworks (`*.csproj`, `package.json`, `pom.xml`/`build.gradle`, `requirements.txt`/`pyproject.toml`, `go.mod`, IaC files, Dockerfiles, pipeline YAML).
- Open the matching `references/stacks/<stack>.md` for each detected stack. It gives the grep patterns and framework pitfalls you'll use below.
- Find the composition root: `Startup.cs`/`Program.cs`, `app.js`/`main.ts`/`server.ts`, Spring `SecurityConfig`, Django `settings.py`/middleware, Flask/FastAPI app factory. Read it fully. Authentication, authorization defaults, CORS, error handling, static files and API docs are all decided here.

## 3. Attack-surface inventory (the backbone of the review)

Build a table of every externally reachable operation. For each row, record:

| Route + verb | Handler (file:line) | AuthN required? | Authz policy/role | Ownership check | Input binding (DTO/entity) | Response shape (sensitive fields?) | Side effects |
|---|---|---|---|---|---|---|---|

Include: API controllers/routes, minimal APIs, GraphQL resolvers, websocket hubs, file/static handlers, health/debug/diagnostic endpoints, scheduled jobs that read external input, message consumers, SPA host controllers, sample/template endpoints.

Note the **effective** authorization (class attribute + action attribute + global filter/fallback). An action with nothing on it inherits the default, which is often "anonymous".

Also inventory:
- **Data stores:** DB access style (ORM, raw SQL, stored procedures), connection identities.
- **File stores:** local paths, blob/S3 proxies, template folders.
- **Secrets/config:** `appsettings*`, `.env*`, `config/*.json`, frontend `assets/config`, environment files, IaC variables, pipeline token-replacement files.
- **Frontend:** API service files, auth interceptors/guards, token storage, hard-coded keys, environment flags that change security behaviour.
- **Outbound:** email/SMS/webhook builders that embed data or configurable URLs.

## 4. Rule sweep

Scan `rules/INDEX.md`, then go domain by domain. For each rule whose "Applies when" matches the inventory:
1. Follow its **Detect** steps and stack hints.
2. Trace the full path when needed: route → controller → service → repository → DB/stored procedure → DTO/response → frontend consumer. Many bugs hide one layer below where the attribute is.
3. Record: rule ID, instances (file:line), status (`status-and-severity.md`), severity with reason.
4. Check the rule's **False-fix traps** against any control you found.

For "check against the skill" (baseline compliance) requests, record every rule as Pass / Fail / Partial / N-A with one line of evidence.

Go beyond the rules too. If you find a vulnerability that no rule covers, report it, and list it at the end as a **candidate for Learn mode** (generic pattern + why it is new). Do not edit the skill during a review.

## 5. Bypass hunt (where reviews earn their keep)

For each control you found, ask:
- **Same logic, other door:** another route, an older API version, a GraphQL field, a batch endpoint, an export, an "Obsolete" action still mapped?
- **Client-supplied identity:** does authorization use an id from the body/query/header instead of the token claim or the stored record?
- **Lower layer:** does a repository, stored procedure, storage proxy or background job skip the check?
- **Encoding/normalisation:** `%2e%2e`, `%5c`, double encoding, Unicode, case, trailing dots, absolute paths, null bytes.
- **Role confusion:** does a helper return "allowed" for any non-tenant role, and is it used behind a policy that admits non-admins?
- **Default allow:** any controller or action without an attribute while there is no fallback policy?
- **Secret exposure:** is the control's key or secret readable (repo, frontend bundle, file-read bug)? If so, the control is forgeable.
- **Frontend dependency:** does the fix break a frontend flow, tempting someone to re-open it? Is a frontend flag (e.g. "isProduction") switching on insecure code paths?

## 6. Root-cause synthesis

Group findings into **RC-n** root causes. A root cause is a missing or broken control, for example:
- No default-deny authorization
- Entity-level binding
- Ownership checked on a client-supplied id
- Secrets in source
- Unsafe path construction
- Plaintext password lifecycle
- Client-driven workflow state

For each RC, list the findings it explains and the single fix that closes all of them. Only report root causes the code supports.

## 7. Deliverables

Use `references/output-templates.md`. The default report has:
- Executive summary with status counts
- A findings table
- Critical and High detail
- Medium/Low/Info summary
- Root causes
- Verified existing controls
- Remaining vulnerabilities
- A phased remediation plan
- Implementation order
- A regression test plan

Rules for the deliverables:
- Use real file paths only; never invent file names.
- Reports that contain exploit paths or secret locations are **confidential**. Keep them local, and only publish them when the user asks, with a reminder about sharing.
- If you touched a tracker spreadsheet, preserve its structure and formatting. Add columns; never rename or remove them. Edit the XML directly if the available libraries would drop features such as comments or tables.

## 8. Close-out

- Summarise the status counts, the top 3 risks and the first fix to make.
- List NEEDS VERIFICATION items with how to verify each.
- List Learn-mode candidates (new generic patterns) and offer to run Learn mode.
