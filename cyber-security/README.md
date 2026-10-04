# Cyber Security Skill

Reusable, evidence-based security engineering playbook for software projects. It is designed to run from Claude against a codebase, a VAPT/pentest/audit report, a remediation tracker, or an earlier review.

## Modes

- **Review:** inspect a codebase and identify vulnerabilities, root causes, bypass paths, remediation and regression tests.
- **Verify:** compare reported findings or claimed fixes with current source and distinguish code state from deployed state.
- **Learn:** analyze a new security report and propose generic rule-base improvements. Changes require explicit approval.
- **Maintain:** validate the knowledge base, inspect rule coverage and manage versions.

## Typical commands

- `Run Cyber Security review on this project.`
- `Verify these security fixes against the current code.`
- `Check this project against the Cyber Security skill baseline.`
- `Update the Cyber Security skill using this VAPT report.`

## Evidence standard

Statuses are evidence-driven: FIXED, PARTIALLY FIXED, OPEN, NEEDS VERIFICATION, or NOT APPLICABLE. Source review does not prove deployment state.

## Validation

From the skill root:

```text
node scripts/validate-kb.js
```

## Portability

The skill is intended to live in a version-controlled repository and be cloned/synchronized on other machines. Keep the repository free of project secrets and confidential material.

## Versioning

Rule IDs are permanent. Use semantic versioning: patch for wording/metadata, minor for new rules or substantive rule improvements, major for schema/workflow changes.
