# API and Input-Control Rules

## API-001 — Mass assignment binds client input to a privileged entity
**Domain:** API  
**Severity:** High–Critical  
**CWE:** CWE-915  
**OWASP:** API3:2023

**Why it matters:** Clients can set ownership, audit, workflow or approval fields that should be server-controlled.

**Detect:** Trace request DTO/entity binding and compare writable fields with trusted fields.

**Evidence:** DTO, mapper, update method and persisted columns.

**Remediation:** Use narrow command DTOs and explicit allowlists; set server-owned fields from trusted context.

**Regression test:** Send every protected field with attacker values and verify they are ignored/rejected.

**False-fix traps:** Authentication plus ownership does not prevent mass assignment.

**Version:** 1.0.0

## API-002 — Sensitive fields are exposed in API responses
**Domain:** API  
**Severity:** Critical–Medium  
**CWE:** CWE-200, CWE-201  
**OWASP:** API3:2023

**Why it matters:** Passwords, tokens, national identifiers and internal secrets can be disclosed even when authorization is correct.

**Detect:** Inspect response DTOs, entity serialization, projections and alternate/admin endpoints.

**Evidence:** Response shape and serializer configuration.

**Remediation:** Use purpose-built response DTOs and deny-list sensitive properties at serialization boundaries.

**Regression test:** Sensitive-field contract tests fail the build if protected properties appear.

**False-fix traps:** Removing a field from one endpoint does not remove it from logs, exports or alternate DTOs.

**Version:** 1.0.0

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

**Version:** 1.0.0

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

**Version:** 1.0.0

## INPUT-001 — Injection sink receives untrusted input
**Domain:** Input Validation  
**Severity:** Critical–High  
**CWE:** CWE-89, CWE-78, CWE-90  
**OWASP:** A03:2021 Injection

**Why it matters:** SQL, command, LDAP and similar injection can cross trust boundaries.

**Detect:** Trace untrusted input to string-built queries, commands, interpreters or expression evaluators.

**Evidence:** Sink and missing parameterization/encoding.

**Remediation:** Parameterized APIs, safe builders and allowlists; avoid string concatenation into executable syntax.

**Regression test:** Injection payloads remain data and cannot alter query/command semantics.

**False-fix traps:** Input validation alone is weaker than parameterization at the sink.

**Version:** 1.0.0

## INPUT-002 — Untrusted input reaches an unsafe HTML/JavaScript sink
**Domain:** Input Validation  
**Severity:** High–Critical  
**CWE:** CWE-79  
**OWASP:** A03:2021 Injection

**Why it matters:** Stored/reflected XSS can execute with another user's privileges.

**Detect:** Trace user input into raw HTML, DOM APIs, templates, unsafe URL bindings or HTML rendering libraries.

**Evidence:** Source and sink plus context.

**Remediation:** Contextual output encoding, safe framework bindings and sanitization only where raw HTML is genuinely required.

**Regression test:** Script payloads render inert in every output context.

**False-fix traps:** Encoding for HTML is not equivalent to JavaScript or URL-context encoding.

**Version:** 1.0.0

## INPUT-003 — Server-side request forgery or unsafe outbound URL handling
**Domain:** Input Validation  
**Severity:** High  
**CWE:** CWE-918  
**OWASP:** A10:2021 SSRF

**Why it matters:** Attackers may make the server access internal services or cloud metadata.

**Detect:** Find HTTP clients using user-controlled URLs, redirects or webhooks; inspect DNS/IP validation.

**Evidence:** URL source, sink and network controls.

**Remediation:** Prefer allowlists of destinations; validate resolved addresses, schemes and redirects; isolate outbound networking.

**Regression test:** Internal/private/link-local addresses and unexpected schemes are rejected.

**False-fix traps:** Blocking one hostname does not prevent DNS rebinding or alternate IP representations.

**Version:** 1.0.0
