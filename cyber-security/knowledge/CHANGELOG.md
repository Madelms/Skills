# Changelog

## 2.0.0 — 2026-10-04

Major release (schema and workflow changes). Source: SRC-004 (skill evaluation), with baseline additions from SRC-002.

**Schema**
- Every rule now has required `**False positives:**` and `**Provenance:**` fields (valid SRC IDs only), and an optional `**Chains with:**` field. Optional `**Keywords:**` feeds `--write-index`. All 59 rules carry `Version: 2.0.0`.

**Rules** (50 -> 59)
- Moved INPUT-001..003 from `api-mass-assignment.md` to the new `input-validation.md`; IDs and content preserved.
- Added AUTHN-007, API-005, INPUT-004, INPUT-005, INPUT-006, FILE-006, BIZ-004, BIZ-005, PLAT-008.
- Improved INPUT-001, INPUT-002, API-001, FE-001, SECRET-004, PLAT-005, AUTHZ-006, FILE-005, DB-003, AUTHZ-002, AUTHZ-001, LOG-001 (append-only, except INPUT-001's CWE list and Why text).
- Corrected the INDEX title of DATA-002 to match the rule.
- `api-mass-assignment.md` keeps its name; its heading is now "API Rules".

**Workflows and references**
- Review: mandatory endpoint and authorization inventory gate (explicit/implicit anonymous, consumers, response data class, coverage matrix) before the rule sweep; chain analysis with capability catalogue; output location outside the source repository.
- Verify: Verified-against axis (Source, Repo config, Deployed, External); VT-13 and VT-14.
- Learn: dedupe record, full-schema proposals, provenance and SOURCES updates, skill-evaluation source type.
- Status and severity: verified-against rules, NEEDS VERIFICATION rated "if confirmed".
- Output templates rewritten with ID conventions (rule, finding, chain, root cause, operation).
- Stack hints restructured into eight sections each.
- Added `references/blind-regression.md` (validation layers B and C).

**Tooling**
- Validator rewritten: anchored fields, prefix-to-file map, INDEX title/domain/severity, file and rule references (illustrative lines exempt), Chains and Provenance references, version consistency, VT-NN uniqueness, near-duplicate warnings, confidentiality scan with optional local `.kb-denylist`, `--write-index`.
- README gains install/sync and Learn approval flow; `.gitignore` gains local-only entries.

**Knowledge**
- SOURCES: added Class, Stack, Date and Findings-mapped columns and SRC-004.
- Added `knowledge/learn-records/2.0.0-SRC-004.md`.

## 1.0.0 — 2026-10-04

- Initial reusable Cyber Security Skill architecture.
- Added evidence-based Review, Verify and Learn workflows.
- Added 50 generic security rules across authentication, authorization, API, input validation, files, secrets/config, data protection, database, frontend, business logic, logging and platform/deployment.
- Initial rule patterns were generalized from a security review/VAPT learning exercise and baseline security engineering practice; no project-specific identifiers are retained.
- Added stack hints and knowledge-base validator.
