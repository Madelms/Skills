# Knowledge Sources

Sources are recorded with neutral IDs only. Do not put client names, project names, hosts, URLs, credentials, tokens, PII, finding numbers or proprietary identifiers here.

Each source has a **Class**, so provenance keeps three kinds of knowledge apart:
- **Public baseline:** published taxonomies and guidance (OWASP, CWE).
- **Engineering practice:** generic secure-engineering knowledge.
- **Evaluation learning:** lessons derived from a real review, report or skill evaluation, generalised into mechanisms.

| Source ID | Class | Type | Stack | Date | Findings mapped | Generic use |
|---|---|---|---|---|---|---|
| SRC-001 | Evaluation learning | VAPT/security-review learning exercise | .NET + Angular | 2026-09 | counts not recorded | Authentication, authorization, object-level access, mass assignment, secrets, file security, deployment verification and related false-fix traps. |
| SRC-002 | Public baseline | OWASP baseline | stack-neutral | n/a | n/a | General web/API access-control, injection, cryptographic, authentication and API security patterns, and the baseline-only rules added in 2.0.0. |
| SRC-003 | Engineering practice | Security engineering practice | stack-neutral | n/a | n/a | Generic regression, least-privilege and defense-in-depth guidance. |
| SRC-004 | Evaluation learning | Skill evaluation (blind review of a web application, compared with a prior verified review) | .NET + Angular | 2026-10 | 12 rule improvements, 9 rule additions, workflow changes (counts only) | Methodology lessons: complete operation inventory, implicit anonymous access, consumer mapping, response data classes, attack chains, verified-against layers, and mechanisms that had no rule (shared-file mutation, outbound-message content, dependency risk, URL-bearing fields). |

Provenance rule: a rule's `Provenance` field may cite only IDs in this table. When a rule combines a public baseline with an evaluation lesson, cite both so the origin of each part stays visible.
