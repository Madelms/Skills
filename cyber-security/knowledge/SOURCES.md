# Knowledge Sources

Sources are recorded with neutral IDs. Do not put client names, hosts, URLs, credentials, tokens, PII, finding numbers or proprietary identifiers here. The only application names allowed are the two assessment labels in SRC-005 and SRC-006, recorded at the maintainer's explicit request; never copy report contents beside them.

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
| SRC-005 | Evaluation learning | Independent VAPT assessment — Training Courses | .NET + Angular + SQL Server | 2026-09 | 21 findings reviewed (5 Critical, 6 High, 5 Medium, 4 Low, 1 Informational), mapped to mechanisms | Authentication-factor lifecycle and bypass, token handling and leakage, role-matrix (function-level) authorization, sentinel-identifier object access, Origin and Authorization-header semantics, error masking, cookie and config exposure, environment separation. |
| SRC-006 | Evaluation learning | Independent VAPT assessment — Talmatha | .NET + Angular + SQL Server | 2026 | 25 findings reviewed (13 Critical, 8 High, 3 Medium, 1 Low), mapped to mechanisms | Dynamic-expression and dynamic-SQL injection, role-matrix and workflow authorization, bulk personal-data exposure, identifier disclosure chained into file download, config variants in production, CSP and fingerprint headers, verbose errors. |

Provenance rule: a rule's `Provenance` field may cite only IDs in this table. When a rule combines a public baseline with an evaluation lesson, cite both so the origin of each part stays visible.
