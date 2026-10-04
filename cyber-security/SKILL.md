---
name: cyber-security
description: Personal security-engineering playbook for reviewing any software project (.NET, Node.js, Java, Python, Angular, React, SQL, cloud) against a growing rule base. Use it to audit source code, APIs, frontend, database, config and deployment for vulnerabilities and bypass paths; to verify whether reported security findings are really fixed (FIXED / PARTIALLY FIXED / OPEN / NEEDS VERIFICATION / NOT APPLICABLE) instead of trusting claims; to turn findings into root-cause groups, attack chains, remediation plans and regression tests; and to LEARN from new VAPT / pentest / audit / incident reports by updating its own generic rules after approval. Trigger whenever the user says "Cyber Security review", "security review", "check this project against the Cyber Security skill", "verify the security fixes", "re-run the security review", "update the Cyber Security skill with this report", or hands over a VAPT/pentest/audit report, a remediation tracker, or asks whether a project is secure, even if they don't name the skill.
---

# Cyber Security

**Skill version: 2.0.0** (see `knowledge/CHANGELOG.md`)

A reusable, evidence-based security playbook. It works on any stack, and it gets better every time it learns from a new report.

The skill's value comes from four things:
- **The rule base** (`rules/`): generic security patterns with detection, remediation, test guidance, false positives and provenance.
- **The workflows** (`references/workflow-*.md`): how to apply the rules rigorously.
- **The inventory gate:** a review cannot start its rule sweep before every reachable operation has been listed and classified.
- **The learning loop:** each new report becomes better rules, never project-specific notes.

## Pick the mode

| The user says something like | Mode | Read next |
|---|---|---|
| "Run Cyber Security review on this project", "is this secure?", "audit this repo" | **Review** | `references/workflow-review.md` |
| "Check this project against the Cyber Security skill" | **Review** (baseline compliance: report every rule as pass/fail/N-A) | `references/workflow-review.md` |
| "Re-run the security review", "verify the fixes", gives a tracker or earlier findings | **Verify** | `references/workflow-verify.md` |
| "Update the Cyber Security skill using this report", gives a VAPT/pentest/audit/incident | **Learn** | `references/workflow-learn.md` |
| Asks about the skill itself (rule count, coverage, version) | **Maintain** | `rules/INDEX.md`, `knowledge/CHANGELOG.md`, run `node scripts/validate-kb.js` |

### Input modes (decided by the inputs, not by wording)

| Inputs available | Mode | What happens |
|---|---|---|
| Project source only | **Mode 1: Project Security Review** | Independent review by the skill. Every finding is a skill finding. |
| Project source **plus** an external VAPT / pentest / audit report | **Mode 2: Security Report + Project Review** | Three separate analyses: (A) external report findings, (B) current-source verification of each, (C) independent skill review. Findings are then correlated and tagged with a Discovery Source. |
| An explicit user request to improve or learn from an assessment | **Mode 3: Learn** | `references/workflow-learn.md`. Never entered automatically. |

The external report is an **input source, not the truth**: it never overrides the skill's independent analysis, and it is not proof that a finding is still present in the current source. If the user gives a report but does not ask to update the skill, run Mode 2 and do **not** enter Learn mode; at the end, offer Learn in one line. Both review modes produce the two standardized deliverables below. Details: `references/workflow-review.md` ("Input modes") and `references/output-templates.md`.

Always distinguish four levels: **Reported**, **Observed in source**, **Observed in deployed environment**, **Verified externally**. Never claim a deployed vulnerability is fixed from source inspection alone.

**Every Review ends with two standardized deliverables**, named from the project's name: `<ProjectName>_Security_Remediation_Tracker.xlsx` (one row per finding; severity, remediation status and per-layer verification status kept separate) and `<ProjectName>_Security_Review_Summary.docx` (about 2 pages). Structure is defined in `references/output-templates.md`.

Always read `references/status-and-severity.md` before assigning any status or severity. Read `references/output-templates.md` before writing any deliverable.

## Non-negotiables (and why)

1. **Evidence or it didn't happen.** Every status needs proof: file:line, config value, query, or test output. Developers and reports both make claims; code is the ground truth. If you cannot prove a control works, the status is NEEDS VERIFICATION, never FIXED.
2. **Say what you verified against.** Every finding carries a *Verified against* layer: Source, Repo config, Deployed or External. Code review proves what the source does, not what runs on a server. FIXED and OPEN are claimed only for the layer actually checked. Never claim FIXED for an unverified deployment state.
3. **Inventory before sweep.** Build the complete operation inventory (`workflow-review.md`, Phase 3) and give every row an effective authentication and authorization class, including **implicit anonymous** operations, before the detailed rule sweep. Classify every anonymous operation by data class and by consumer.
4. **Look for the bypass, not just the fix.** A fix on one endpoint is worth little if a sibling endpoint, an alternate route, a body field, or a lower layer (repository, stored procedure, storage proxy) bypasses it. `workflow-verify.md` lists the traps.
5. **Group by root cause, then link into chains.** Ten vulnerable endpoints usually mean one or two missing controls. Report the control, then the instances. Then check whether findings combine: one finding's output can be another's entry condition (attack chains).
6. **Separate the security questions.** Keep these apart in your analysis, because they fail independently:
   - Authentication: who are you?
   - Authorization: may your role do this?
   - Ownership: is this object yours?
   - Data exposure: what comes back?
   - Input control: which fields can the client set?
   - Business authorization: may you move this workflow or change these settings?
7. **Read-only on application code** unless the user asks for fixes. A review changes trackers and reports, not the app. Write deliverables outside the source repository by default (see `workflow-review.md`).
8. **The knowledge base stays generic and confidential-free.** No project names, client names, hosts, URLs, IPs, credentials, keys, tokens, PII, finding numbers or proprietary identifiers in `rules/` or `knowledge/`. Sources are recorded only as neutral IDs (`SRC-00N`). The repository may be shared or cloned anywhere, so treat everything in it as potentially public.
9. **Learn mode modifies the skill only after explicit user approval** of a written change proposal. See `workflow-learn.md`.

## Rule base at a glance

`rules/INDEX.md` lists every rule: ID, title, domain, severity range and keywords. Scan it first, then open only the domain files relevant to the project.

| File | Prefix | Covers |
|---|---|---|
| `rules/authn.md` | AUTHN | token validation, passwords, OTP, reset, enumeration, brute force, session and token lifecycle |
| `rules/authz-idor.md` | AUTHZ | role checks, BOLA/IDOR, ownership on read and write, function-level authz, default-deny, multi-tenancy |
| `rules/api-mass-assignment.md` | API | mass assignment, over-exposed responses, client-controlled state, endpoint inventory, resource consumption |
| `rules/input-validation.md` | INPUT | injection (SQL/NoSQL/command/LDAP), XSS sinks, SSRF, deserialization, XML parsing, open redirects and URL embedding |
| `rules/files-storage.md` | FILE | path traversal, file authz, uploads, listing-with-content, storage proxies, shared file mutation |
| `rules/secrets-config.md` | SECRET | secrets in source, frontend keys, runtime config exposure, dev shortcuts and runtime-mode selection |
| `rules/data-protection.md` | DATA | secrets in logs/audit/email, crypto, transport |
| `rules/database.md` | DB | least-privilege accounts, dynamic SQL, lower-layer authorization and tenant predicates |
| `rules/frontend.md` | FE | token storage, client-side-only checks, privileged UIs trusting stored data, bundles |
| `rules/business-logic.md` | BIZ | workflow integrity, settings authorization, client-state decisions, outbound-message content, races |
| `rules/logging-monitoring.md` | LOG | security event logging, audit actor, error leakage, log injection |
| `rules/platform-deployment.md` | PLAT | debug/diagnostic endpoints, API docs exposure, CORS, headers, TLS, template leftovers, deployment verification, dependency risk |

Technology-specific detection hints live in `references/stacks/*.md` (eight fixed sections each, including how to enumerate operations for that framework). Load only the stacks you detect, because rules stay technology-neutral and point there.

The knowledge base does not currently cover: backup and restore, physical and network-perimeter security, cryptographic protocol design, mobile-client specifics. Do not claim coverage there.

## ID conventions

| Kind | Format | Example |
|---|---|---|
| Rule (permanent, in the KB) | `PREFIX-NNN` | `AUTHZ-004` |
| Finding (in a report) | `F-NNN` | `F-015` |
| Attack chain | `C-NN` | `C-02` |
| Root cause | `RC-N` | `RC-3` |
| Inventory operation | `OP-NNN` | `OP-041` |

A finding with no matching rule has `Rule: —` and is listed under **Learn candidates**.

## Maintaining the skill

- Run `node scripts/validate-kb.js` after any change to `rules/` or `knowledge/`. It checks the rule schema (anchored fields), the prefix-to-file map, unique IDs, INDEX title/domain/severity, file and rule references (illustrative lines containing "e.g." or "example" are exempt), `Chains with` and provenance references, version consistency, unique VT-NN trap IDs, near-duplicate rules, and a confidentiality scan (secret shapes, private IPs, URL allow-list, optional local `.kb-denylist`). Use `--write-index` to regenerate `INDEX.md` from the rule files.
- A passing validator proves only knowledge-base integrity (validation layer A). Behavioural validation is separate: see `references/blind-regression.md`.
- Never delete or renumber a rule. Mark it `**Status:** Deprecated` with a pointer to its replacement; the validator then rejects new references to it.
- Bump the version: **minor** for new rules or substantive improvements, **patch** for wording or metadata fixes, **major** for schema or workflow changes. Update the version line above, `knowledge/CHANGELOG.md`, and the affected rules' `Version` field.
- Commit with a message that names the version and source ID (e.g. `v1.1.0: learn SRC-002 — add FILE-009, improve AUTHZ-004`), then push. GitHub is the source of truth.
