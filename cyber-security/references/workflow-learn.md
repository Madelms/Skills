# Learn Workflow (evolve the skill from a new report)

Goal: turn a VAPT, pentest, audit, incident or newly found vulnerability into better generic rules, with no duplicates, no project residue and no confidential data. The skill changes only after the user approves a written proposal.

## Phase A: Analyse — no file changes

1. Read the whole source, including scope, evidence, payloads, remediation and environment notes.
2. For each finding extract mechanism, root cause, preconditions, proof technique and verification lesson.
3. Generalize the finding into a stack-neutral pattern. Remove project names, hosts, identifiers, secrets and PII.
4. Match the pattern against `rules/INDEX.md` using title, keywords, CWE and control. Read candidate rules fully.

| Situation | Action |
|---|---|
| Same root cause/control | Propose improving the existing rule. |
| New mechanism/control | Propose a new rule in the correct domain. |
| Project-specific observation | Do not add a rule; optionally record only a neutral source note. |
| Duplicate finding | Merge into the existing rule; do not create a duplicate ID. |

## Phase B: Build a change proposal

For each proposed change show:
- Source ID (for example `SRC-003`)
- Existing rule or proposed rule ID
- Generic mechanism
- Why it is reusable
- Exact rule changes
- New detection/remediation/test guidance
- Whether severity guidance changes
- Why it is not a duplicate

The proposal must be reviewable without exposing confidential source material.

## Phase C: Approval gate

STOP after the proposal. Do not modify `rules/`, `INDEX.md`, `knowledge/`, or version metadata until the user explicitly approves the proposed changes. Approval must be clear enough to identify the proposal being approved.

## Phase D: Apply approved changes

After approval:
1. Update existing rules or add new rules with permanent IDs.
2. Update `rules/INDEX.md`.
3. Update `knowledge/SOURCES.md` with a neutral source ID and generic description only.
4. Update `knowledge/CHANGELOG.md` and the skill version.
5. Add or update stack hints only when the lesson is genuinely stack-specific.
6. Run `node scripts/validate-kb.js`.
7. Review the diff for project names, hosts, URLs, secrets, tokens, PII and proprietary identifiers.
8. Report exactly what changed and what was intentionally not learned.

## Safety rules

- Never copy credentials, API keys, tokens, cookies, IPs, internal hostnames, personal data or proprietary identifiers into the knowledge base.
- Never turn a one-off endpoint name into a generic rule title.
- Prefer control-level lessons over payload-specific tricks.
- Preserve stable rule IDs. Deprecated rules remain in place with a replacement pointer.
- Do not silently downgrade severity because the report's original rating seems high or low; explain any re-rating.
