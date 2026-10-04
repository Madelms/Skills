# API Rules

## API-001 — Mass assignment binds client input to a privileged entity
**Domain:** API  
**Severity:** High–Critical  
**CWE:** CWE-915  
**OWASP:** API3:2023

**Why it matters:** Clients can set ownership, audit, workflow or approval fields that should be server-controlled.

**Detect:** Trace request DTO/entity binding and compare writable fields with trusted fields. Treat URL-, HTML- and markup-bearing fields as high-value targets: a client that can write them controls later sinks in privileged views (see INPUT-002, INPUT-006).

**Evidence:** DTO, mapper, update method and persisted columns.

**Remediation:** Use narrow command DTOs and explicit allowlists; set server-owned fields from trusted context.

**Regression test:** Send every protected field with attacker values and verify they are ignored/rejected. URL/HTML-bearing fields that are server-controlled or restricted reject attacker values from unauthorised callers.

**False-fix traps:** Authentication plus ownership does not prevent mass assignment.

**False positives:** Narrow command DTOs that expose only caller-settable fields, even when the entity has the same property names.

**Chains with:** INPUT-002, API-003

**Provenance:** SRC-001, SRC-002, SRC-004

**Version:** 2.0.0

## API-002 — Sensitive fields are exposed in API responses
**Domain:** API  
**Severity:** Critical–Medium  
**CWE:** CWE-200, CWE-201  
**OWASP:** API3:2023

**Why it matters:** Passwords, tokens, national identifiers and internal secrets can be disclosed even when authorization is correct.

**Detect:** Inspect response DTOs, entity serialization, projections and alternate/admin endpoints. Check list, search, directory and bulk-lookup operations (audience lists, search by e-mail or national identifier, "get all" operations) for personal data returned to roles that do not need it, and for response fields that carry infrastructure identifiers (host, instance or tenant tags) or operational detail.

**Evidence:** Response shape and serializer configuration.

**Remediation:** Use purpose-built response DTOs and deny-list sensitive properties at serialization boundaries. Return role-specific DTOs; restrict bulk directory and lookup operations to the roles that need them and rate-limit them.

**Regression test:** Sensitive-field contract tests fail the build if protected properties appear.

**False-fix traps:** Removing a field from one endpoint does not remove it from logs, exports or alternate DTOs. Authenticating the caller does not make a bulk personal-data listing acceptable; check what every authenticated role can retrieve.

**False positives:** Fields intentionally returned to their owner or an administrator that the client genuinely needs.

**Chains with:** AUTHZ-002, FILE-002

**Provenance:** SRC-002, SRC-003, SRC-005, SRC-006

**Version:** 2.1.0

## API-003 — Client controls security-sensitive workflow state
**Domain:** API  
**Severity:** High  
**CWE:** CWE-602, CWE-915  
**OWASP:** A01:2021; API3:2023

**Why it matters:** Clients may skip approval, change status, impersonate an actor or move an object between stages.

**Detect:** Find request fields representing status, stage, approval, owner, audit identity or security decisions and trace who sets them.

**Evidence:** Command model and state transition code.

**Remediation:** Server-side state machine/transition commands; derive actor and allowed next state from trusted state.

**Regression test:** Invalid transitions and client-forged state fields fail.

**False-fix traps:** Validating a new status value is not enough if the caller is not authorized for that transition.

**False positives:** Client values that are only requests (for example a requested action) and are validated and decided server-side.

**Provenance:** SRC-001

**Version:** 2.0.0

## API-004 — API lacks an authoritative endpoint inventory and negative authorization tests
**Domain:** API  
**Severity:** Medium–High  
**CWE:** CWE-862  
**OWASP:** API9:2023

**Why it matters:** Security gaps persist in forgotten debug, export, delete or alternate endpoints.

**Detect:** Generate route inventory from framework metadata and compare with security tests/documentation.

**Evidence:** Route list and test coverage.

**Remediation:** Maintain machine-readable route inventory and baseline negative tests for protected routes.

**Regression test:** CI enumerates routes and fails when a new sensitive route lacks an authorization test.

**False-fix traps:** Swagger documentation is not proof that every route is secured.

**False positives:** Inventories generated from framework metadata that already cover every route; operations documented as internal-only and unreachable externally.

**Provenance:** SRC-002, SRC-003

**Version:** 2.0.0

## API-005 — API lacks limits on resource consumption
**Domain:** API  
**Severity:** Medium–High  
**CWE:** CWE-770, CWE-400  
**OWASP:** API4:2023

**Why it matters:** Unbounded uploads, page sizes, batch operations or expensive queries let one caller exhaust memory, CPU, storage or paid third-party quotas.

**Detect:** Inspect upload size limits, pagination and maximum page size, batch and bulk operation sizes, expensive search/export/report operations, request timeouts, concurrency limits and outbound-message or paid-API triggers reachable by anonymous or low-privilege callers.

**Evidence:** Limit configuration (or its absence), the handler that accepts the size or count, and the cost of one request.

**Remediation:** Enforce maximum sizes, counts and timeouts at the gateway and in the handler; cap page size; queue or throttle expensive work; authenticate and rate-limit operations that trigger paid or outbound actions.

**Regression test:** Oversized, over-paged and over-batched requests are rejected with a client error; repeated expensive requests are throttled.

**False-fix traps:** A client-side size check is not a limit; pagination without a maximum page size is not a limit; a gateway limit that does not cover the direct origin address is incomplete.

**False positives:** Limits enforced by a verified gateway; operations that are inherently cheap and bounded by the data model.

**Provenance:** SRC-002

**Keywords:** resource consumption, DoS, upload size, pagination, rate limit

**Version:** 2.0.0
