# Learn Workflow (evolve the skill from a new report)

Goal: turn a VAPT, pentest, audit, incident, newly found vulnerability or skill evaluation into better generic rules, with no duplicates, no project residue and no confidential data. The skill changes only after the user approves a written proposal.

A finding is evidence of a security **mechanism**. Encode the mechanism, not the finding. Never create one rule per finding.

## Phase A: Analyse (no file changes)

1. Read the whole source, including scope, evidence, payloads, remediation and environment notes.
2. For each finding extract mechanism, root cause, preconditions, proof technique and verification lesson.
3. Generalize the finding into a stack-neutral pattern. Remove project names, hosts, identifiers, secrets, PII and finding numbers.
4. Match the pattern against `rules/INDEX.md` using title, keywords, CWE and control. Read candidate rules fully.
5. Write a **dedupe record** per lesson: the three most similar existing rules (ID plus one sentence each on why it is or is not the same mechanism).

| Situation | Action |
|---|---|
| Same root cause/control | Propose improving the existing rule. |
| New mechanism/control | Propose a new rule in the correct domain. |
| Methodology lesson (inventory, chains, verification) | Propose a workflow or template change. |
| Project-specific observation | Do not add a rule; optionally record only a neutral source note. |
| Duplicate finding | Merge into the existing rule; do not create a duplicate ID. |

## Phase B: Build a change proposal

For each proposed change show:
- Source ID and its class (public baseline / engineering practice / evaluation learning)
- Existing rule or proposed rule ID
- Generic mechanism
- Why it is reusable
- The dedupe record
- Exact rule changes, filling **every schema field** for a new rule: Domain, Severity, CWE, OWASP, Why it matters, Detect, Evidence, Remediation, Regression test, False-fix traps, **False positives**, **Provenance**, optional **Chains with**, Version
- Whether severity guidance changes, and why
- Version-bump type (patch / minor / major)

The proposal must be reviewable without exposing confidential source material.

## Phase C: Approval gate

STOP after the proposal. Do not modify `rules/`, `INDEX.md`, `knowledge/`, or version metadata until the user explicitly approves the proposed changes. Approval must be clear enough to identify the proposal being approved.

## Phase D: Apply approved changes

After approval:
1. Add the source to `knowledge/SOURCES.md` first: neutral ID, class, type, stack, date (month), counts of findings mapped. No names. A rule may cite only sources that exist.
2. Update existing rules or add new rules with permanent IDs, filling every schema field.
3. Update `Provenance` on every improved rule (keep earlier sources, add the new one).
4. Regenerate `rules/INDEX.md` with `node scripts/validate-kb.js --write-index`.
5. Update `knowledge/CHANGELOG.md` and the skill version.
6. Add or update stack hints only when the lesson is genuinely stack-specific, and workflow or verification traps (`VT-NN`) when the lesson is methodological.
7. Run `node scripts/validate-kb.js` (layer A). If the change affects detection behaviour, re-run the blind regression (`references/blind-regression.md`, layers B and C).
8. Review the diff for project names, hosts, URLs, secrets, tokens, PII, finding numbers and proprietary identifiers.
9. Show a diff summary and report exactly what changed and what was intentionally not learned.

## Source types

- **Report:** a VAPT, pentest, audit or incident report.
- **Skill evaluation:** blind-test feedback and evaluations of the skill itself. Record it as its own source with the class "Evaluation learning", so methodology improvements have provenance too.
- **Public baseline / engineering practice:** for rules added to close a documented coverage gap without a report behind them.

## Safety rules

- Never copy credentials, API keys, tokens, cookies, IPs, internal hostnames, personal data or proprietary identifiers into the knowledge base.
- Never turn a one-off endpoint name into a generic rule title.
- Prefer control-level lessons over payload-specific tricks.
- Preserve stable rule IDs. Deprecated rules remain in place with a replacement pointer.
- Do not silently downgrade severity because the report's original rating seems high or low; explain any re-rating.
- Keep any answer key used for regression testing outside the skill repository.
