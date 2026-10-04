# Data Protection Rules

## DATA-001 — Sensitive data is logged, audited or emailed in plaintext
**Domain:** Data Protection  
**Severity:** Critical–High  
**CWE:** CWE-532, CWE-312  
**OWASP:** A09:2021

**Why it matters:** Secondary systems often have broader access than the primary API.

**Detect:** Trace sensitive fields into logs, audit tables, emails, telemetry and exports.

**Evidence:** Sink and serialized content.

**Remediation:** Minimize/redact sensitive values and define explicit audit schemas.

**Regression test:** Sensitive-data log/audit tests fail when protected fields appear.

**False-fix traps:** Masking the API response while retaining plaintext audit copies is incomplete.

**False positives:** Hashed, tokenised or irreversibly masked values; non-sensitive correlation identifiers.

**Provenance:** SRC-002, SRC-003

**Version:** 2.0.0

## DATA-002 — Cryptography uses weak, reversible or misconfigured protection for sensitive data
**Domain:** Data Protection  
**Severity:** High–Medium  
**CWE:** CWE-327, CWE-326  
**OWASP:** A02:2021

**Why it matters:** Weak crypto can expose credentials or confidential data.

**Detect:** Inspect algorithms, key lengths, modes, random generation, key storage and custom crypto.

**Evidence:** Crypto API and key lifecycle.

**Remediation:** Use maintained platform primitives and approved algorithms; protect and rotate keys.

**Regression test:** Known insecure algorithms are rejected by static checks and tests.

**False-fix traps:** Base64 or reversible encoding is not encryption.

**False positives:** Hashing used only for non-secret integrity or cache keys; non-security randomness for non-security identifiers.

**Provenance:** SRC-002, SRC-003

**Version:** 2.0.0

## DATA-003 — Transport security is not enforced for sensitive communication
**Domain:** Data Protection  
**Severity:** High–Medium  
**CWE:** CWE-319  
**OWASP:** A02:2021

**Why it matters:** Credentials and sensitive data can be intercepted or downgraded.

**Detect:** Inspect HTTP redirects, TLS configuration, client base URLs, certificate validation and mixed-content paths.

**Evidence:** Deployment/client configuration and transport behavior.

**Remediation:** HTTPS-only, secure cookies, HSTS where appropriate and correct certificate validation.

**Regression test:** HTTP is redirected/rejected and certificate errors are not bypassed.

**False-fix traps:** Disabling certificate validation to solve test-environment issues is not a fix.

**False positives:** Plain HTTP on loopback or a verified isolated segment; endpoints that only redirect to HTTPS.

**Provenance:** SRC-002, SRC-003

**Version:** 2.0.0
