---
name: cyber-security
description: Personal security-engineering playbook for reviewing any software project (.NET, Node.js, Java, Python, Angular, React, SQL, cloud) against a growing rule base. Use it to audit source code, APIs, frontend, database, config and deployment for vulnerabilities and bypass paths; to verify whether reported security findings are really fixed (FIXED / PARTIALLY FIXED / OPEN / NEEDS VERIFICATION / NOT APPLICABLE) instead of trusting claims; to turn findings into root-cause groups, remediation plans and regression tests; and to LEARN from new VAPT / pentest / audit / incident reports by updating its own generic rules after approval. Trigger whenever the user says "Cyber Security review", "security review", "check this project against the Cyber Security skill", "verify the security fixes", "re-run the security review", "update the Cyber Security skill with this report", or hands over a VAPT/pentest/audit report, a remediation tracker, or asks whether a project is secure, even if they don't name the skill.
---

# Cyber Security

**Skill version: 1.0.0** (see `knowledge/CHANGELOG.md`)

A reusable, evidence-based security playbook. It works on any stack, and it gets better every time it learns from a new report.

The skill's value comes from three things:
- **The rule base** (`rules/`): generic security patterns with detection, remediation and test guidance.
- **The workflows** (`references/workflow-*.md`): how to apply the rules rigorously.
- **The learning loop:** each new report becomes better rules, never project-specific notes.

## Pick the mode

| The user says something like | Mode | Read next |
|---|---|---|
| "Run Cyber Security review on this project", "is this secure?", "audit this repo" | **Review** | `references/workflow-review.md` |
| "Check this project against the Cyber Security skill" | **Review** (baseline compliance: report every rule as pass/fail/N-A) | `references/workflow-review.md` |
| "Re-run the security review", "verify the fixes", gives a tracker or earlier findings | **Verify** | `references/workflow-verify.md` |
| "Update the Cyber Security skill using this report", gives a VAPT/pentest/audit/incident | **Learn** | `references/workflow-learn.md` |
| Asks about the skill itself (rule count, coverage, version) | **Maintain** | `rules/INDEX.md`, `knowledge/CHANGELOG.md`, run `node scripts/validate-kb.js` |

When the user gives a report **and** a codebase, they usually want **Verify** first (what is the real state?). Offer **Learn** afterwards; never mix it in silently.

Always read `references/status-and-severity.md` before assigning any status or severity. Read `references/output-templates.md` before writing any deliverable.

## Non-negotiables (and why)

1. **Evidence or it didn't happen.** Every status needs proof: file:line, config value, query, or test output. Developers and reports both make claims; code is the ground truth. If you cannot prove a control works, the status is NEEDS VERIFICATION, never FIXED.
2. **Source state ≠ deployed state.** Code review proves what the source does. It does not prove what runs on a server. Say which one you verified.
3. **Look for the bypass, not just the fix.** A fix on one endpoint is worth little if a sibling endpoint, an alternate route, a body field, or a lower layer (repository, stored procedure, storage proxy) bypasses it. `workflow-verify.md` lists the traps.
4. **Group by root cause.** Ten vulnerable endpoints usually mean one or two missing controls. Report the control, then the instances, so fixes land once and globally.
5. **Separate the security questions.** Keep these apart in your analysis, because they fail independently:
   - Authentication: who are you?
   - Authorization: may your role do this?
   - Ownership: is this object yours?
   - Data exposure: what comes back?
   - Input control: which fields can the client set?
   - Business authorization: may you move this workflow or change these settings?
6. **Read-only on application code** unless the user asks for fixes. A review changes trackers and reports, not the app.
7. **The knowledge base stays generic and confidential-free.** No project names, client names, hosts, URLs, IPs, credentials, keys, tokens, PII or proprietary identifiers in `rules/` or `knowledge/`. Sources are recorded only as neutral IDs (`SRC-00N`). The repository may be shared or cloned anywhere, so treat everything in it as potentially public.
8. **Learn mode modifies the skill only after explicit user approval** of a written change proposal. See `workflow-learn.md`.

## Rule base at a glance

`rules/INDEX.md` lists every rule: ID, title, keywords and severity range. Scan it first, then open only the domain files relevant to the project.

| File | Prefix | Covers |
|---|---|---|
| `rules/authn.md` | AUTHN | token validation, default-deny, passwords, OTP, reset, enumeration, sessions, MFA, brute force |
| `rules/authz-idor.md` | AUTHZ | role checks, BOLA/IDOR, ownership on read and write, function-level authz, multi-tenancy |
| `rules/api-mass-assignment.md` | API | mass assignment, over-exposed responses, client-controlled state, rate limits, API inventory |
| `rules/input-validation.md` | INPUT | injection (SQL/NoSQL/command/LDAP), XSS sinks, SSRF, deserialization, XXE, open redirects |
| `rules/files-storage.md` | FILE | path traversal, file authz, uploads, listing-with-content, shared file mutation, storage proxies |
| `rules/secrets-config.md` | SECRET | secrets in source, frontend keys, runtime config exposure, dev shortcuts in builds |
| `rules/data-protection.md` | DATA | password storage, secrets in logs/audit/email, PII minimisation, crypto, transport |
| `rules/database.md` | DB | least-privilege accounts, raw SQL, stored procedures, row-level security, backups |
| `rules/frontend.md` | FE | token storage, client-side-only checks, XSS in SPA, dependency risk, CSP |
| `rules/business-logic.md` | BIZ | workflow integrity, admin-controlled content in outbound messages, quotas, races, audit of config |
| `rules/logging-monitoring.md` | LOG | security event logging, error leakage, alerting, log injection |
| `rules/platform-deployment.md` | PLAT | debug/diagnostic endpoints, API docs exposure, CORS, headers, TLS, template leftovers, deployment verification |

Technology-specific detection hints live in `references/stacks/*.md`. Load only the stacks you detect, because rules stay technology-neutral and point there.

## Maintaining the skill

- Run `node scripts/validate-kb.js` after any change to `rules/` or `knowledge/`. It checks the rule schema, unique IDs, that `INDEX.md` matches the rule files, changelog/version consistency, and scans for things that look like secrets or hosts. Use `--write-index` to regenerate `INDEX.md` from the rule files.
- Never delete or renumber a rule. Mark it `Status: Deprecated` with a pointer to its replacement.
- Bump the version: **minor** for new rules or substantive improvements, **patch** for wording or metadata fixes, **major** for schema or workflow changes. Update the version line above, `knowledge/CHANGELOG.md`, and the affected rules' `Version` field.
- Commit with a message that names the version and source ID (e.g. `v1.1.0: learn SRC-002 — add FILE-009, improve AUTHZ-004`), then push. GitHub is the source of truth.
