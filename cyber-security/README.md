# Cyber Security Skill

Skill version: 2.0.0

Reusable, evidence-based security engineering playbook for software projects. It is designed to run from Claude against a codebase, a VAPT/pentest/audit report, a remediation tracker, or an earlier review.

## Modes

- **Review:** build a complete endpoint and authorization inventory first, then sweep the rules, hunt bypasses, link findings into attack chains and group them by root cause.
- **Verify:** compare reported findings or claimed fixes with current source, and state which layer was verified (Source, Repo config, Deployed, External).
- **Learn:** analyse a new security report or skill evaluation and propose generic rule-base improvements. Changes require explicit approval.
- **Maintain:** validate the knowledge base, inspect rule coverage and manage versions.

## Typical commands

- `Run Cyber Security review on this project.`
- `Verify these security fixes against the current code.`
- `Check this project against the Cyber Security skill baseline.`
- `Update the Cyber Security skill using this VAPT report.`

## Evidence standard

Statuses are evidence-driven: FIXED, PARTIALLY FIXED, OPEN, NEEDS VERIFICATION, or NOT APPLICABLE. Every status names the layer it was verified against. Source review does not prove deployment state.

## Layout

- `SKILL.md`: entry point, mode selection, non-negotiables.
- `rules/`: 12 domain files plus `INDEX.md`.
- `references/`: workflows, status and severity, output templates, blind-regression protocol, stack hints.
- `knowledge/`: `SOURCES.md` (neutral source IDs), `CHANGELOG.md`, `learn-records/`.
- `scripts/validate-kb.js`: knowledge-base validator.

## Validation

From the skill root:

```text
node scripts/validate-kb.js
node scripts/validate-kb.js --write-index
```

The validator checks rule schema, prefix-to-file mapping, ID uniqueness, INDEX consistency, references, provenance, version consistency and confidentiality. It is validation layer A only. Layers B (blind regression) and C (generalisation) are described in `references/blind-regression.md`.

## Install and sync on another machine

The skill lives in a Git repository and GitHub is the source of truth.

1. Clone the repository into your Claude skills folder (for example under `~/.claude/skills/`), keeping the folder name `cyber-security`.
2. Run `node scripts/validate-kb.js` to confirm the clone is intact.
3. Copy `.kb-denylist.example` to `.kb-denylist` and list your own confidential terms (client and project names). The file is gitignored and stays on your machine; the validator then fails if any listed term appears in the knowledge base.
4. To update, `git pull`, then validate again.

## Learn approval flow

1. Learn mode analyses the report and writes a change proposal. Nothing in the skill changes.
2. You approve the proposal (all of it or named parts).
3. The skill adds the source, applies the changes, regenerates the index, bumps the version, runs the validator and shows a diff summary.

## Portability and confidentiality

Keep the repository free of project secrets and confidential material. Sources are neutral IDs only. Never commit reports, trackers or answer keys that came from a real engagement.

## Versioning

Rule IDs are permanent. Use semantic versioning: patch for wording/metadata, minor for new rules or substantive rule improvements, major for schema/workflow changes.
