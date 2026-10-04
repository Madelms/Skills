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

## DATA-004 — Credential or session token is transmitted in a URL or to an untrusted origin
**Domain:** Data Protection  
**Severity:** High–Medium  
**CWE:** CWE-598, CWE-200  
**OWASP:** A02:2021; A07:2021

**Why it matters:** URLs are stored in browser history, proxy and server logs and analytics, and are sent in Referer headers; a token placed there, or handed to a third-party origin, is exposed to everyone who can read those records.

**Detect:** Find redirects, hand-off flows and links that append tokens, codes or session identifiers to a URL (query string or fragment); return-URL handling that sends credentials to partner hosts; pages that carry a token in the URL and also load third-party resources; and tokens present in access logs.

**Evidence:** The code that builds the URL, the destination host policy, and the log or Referer exposure.

**Remediation:** Never place a session token in a URL; use an authorization-code flow or a one-time value exchanged by POST; allow-list destination hosts (see INPUT-006); set a restrictive Referrer-Policy; rotate tokens that may already sit in third-party logs.

**Regression test:** No credential appears in any URL, redirect or Referer; a hand-off to a partner works with a single-use code and the session token cannot be recovered from the URL.

**False-fix traps:** A shorter token lifetime does not remove the exposure window; stripping the token from the address bar after load does not remove the copies in history and logs; allow-listing the partner does not make the partner's logs safe.

**False positives:** Single-use, short-lived, audience-bound authorization codes (not session tokens) in redirect URLs; signed URLs for intentionally public static resources.

**Chains with:** INPUT-006, FE-002

**Provenance:** SRC-002, SRC-005

**Keywords:** token in URL, query string, Referer, redirect, third party, log exposure

**Version:** 2.1.0
