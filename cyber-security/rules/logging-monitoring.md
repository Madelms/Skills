# Logging and Monitoring Rules

## LOG-001 — Security-relevant failures are not auditable
**Domain:** Logging  
**Severity:** Medium  
**CWE:** CWE-778  
**OWASP:** A09:2021

**Why it matters:** Missing security events prevent detection and incident response.

**Detect:** Check authentication failures, privilege changes, sensitive access, admin actions and key configuration changes. Verify the audit actor comes from the authenticated principal, not a constant or a client-supplied value.

**Evidence:** Event definitions, sinks and retention.

**Remediation:** Log security events with actor, action, target, outcome and correlation ID while minimizing sensitive data. Record before/after values for configuration changes with the real authenticated actor.

**Regression test:** Security events are emitted for representative success/failure paths.

**False-fix traps:** Logging every request is not the same as security auditing.

**False positives:** Events captured by an upstream audit system that is verified to receive them.

**Provenance:** SRC-002, SRC-003, SRC-004

**Version:** 2.0.0

## LOG-002 — Error handling leaks sensitive implementation details
**Domain:** Logging  
**Severity:** Medium–Low  
**CWE:** CWE-209  
**OWASP:** A05:2021

**Why it matters:** Stack traces, SQL, file paths and configuration can reveal attack paths or secrets.

**Detect:** Exercise errors in production-like mode and inspect API/client responses. Also check status semantics and passthrough: a global handler that returns a success status with an error body (a "mask") hides missing authentication from clients, tests and monitoring; source paths, framework or SDK text, and provider headers forwarded from downstream calls are leaks.

**Evidence:** Response body and error middleware.

**Remediation:** Return stable correlation IDs and generic errors; keep details in protected server logs. Return correct status codes with a stable error envelope, and strip downstream provider headers.

**Regression test:** Production error responses contain no stack traces, SQL, secrets or internal paths. No error is returned with a success status, and no response contains source paths, framework or SDK text, or downstream provider headers.

**False-fix traps:** Hiding errors in the UI while the API returns them is not sufficient. A mask that returns a success status for every failure removes the signal that shows whether authentication ran.

**False positives:** Detailed errors enabled only in development and verified disabled in the deployed build.

**Provenance:** SRC-002, SRC-003, SRC-005, SRC-006

**Version:** 2.1.0

## LOG-003 — Logs or audit records are vulnerable to injection or tampering
**Domain:** Logging  
**Severity:** Medium  
**CWE:** CWE-117  
**OWASP:** A09:2021

**Why it matters:** Attacker-controlled newlines/markup can forge or corrupt audit interpretation.

**Detect:** Trace untrusted values into text logs and audit fields.

**Evidence:** Logging call and sink format.

**Remediation:** Structured logging, safe encoders and immutable/controlled audit storage.

**Regression test:** Malicious delimiters remain a single structured field.

**False-fix traps:** Escaping at one logger does not protect a separate audit/export sink.

**False positives:** Structured loggers that encode values as fields so delimiters cannot break a record.

**Provenance:** SRC-002, SRC-003

**Version:** 2.0.0
