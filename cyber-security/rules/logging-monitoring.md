# Logging and Monitoring Rules

## LOG-001 — Security-relevant failures are not auditable
**Domain:** Logging  
**Severity:** Medium  
**CWE:** CWE-778  
**OWASP:** A09:2021

**Why it matters:** Missing security events prevent detection and incident response.

**Detect:** Check authentication failures, privilege changes, sensitive access, admin actions and key configuration changes.

**Evidence:** Event definitions, sinks and retention.

**Remediation:** Log security events with actor, action, target, outcome and correlation ID while minimizing sensitive data.

**Regression test:** Security events are emitted for representative success/failure paths.

**False-fix traps:** Logging every request is not the same as security auditing.

**Version:** 1.0.0

## LOG-002 — Error handling leaks sensitive implementation details
**Domain:** Logging  
**Severity:** Medium–Low  
**CWE:** CWE-209  
**OWASP:** A05:2021

**Why it matters:** Stack traces, SQL, file paths and configuration can reveal attack paths or secrets.

**Detect:** Exercise errors in production-like mode and inspect API/client responses.

**Evidence:** Response body and error middleware.

**Remediation:** Return stable correlation IDs and generic errors; keep details in protected server logs.

**Regression test:** Production error responses contain no stack traces, SQL, secrets or internal paths.

**False-fix traps:** Hiding errors in the UI while the API returns them is not sufficient.

**Version:** 1.0.0

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

**Version:** 1.0.0
