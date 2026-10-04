# Authentication Rules

## AUTHN-001 — Authentication is bypassable or absent on a protected operation
**Domain:** Authentication  
**Severity:** Critical–High  
**CWE:** CWE-306, CWE-287  
**OWASP:** A07:2021 Identification and Authentication Failures; API2:2023

**Why it matters:** Anonymous or improperly authenticated callers can reach operations intended for trusted users.

**Detect:** Inventory routes and effective authentication. Test missing, malformed, expired, invalid-signature and wrong-audience credentials. Inspect middleware/pipeline order and route metadata.

**Evidence:** Route/handler, effective policy, authentication pipeline, and negative test result.

**Remediation:** Enforce authentication centrally with explicit exceptions. Reject invalid credentials before business logic. Add automated unauthenticated tests.

**Regression test:** Anonymous request returns 401 and no business code executes; valid credentials succeed.

**False-fix traps:** An attribute on one action does not secure sibling actions; a frontend guard is not authentication.

**False positives:** Operations that are intentionally public (sign-in, health, public content) are acceptable when explicitly marked and justified by a public consumer.

**Provenance:** SRC-001

**Version:** 2.0.0

## AUTHN-002 — Token validation is incomplete
**Domain:** Authentication  
**Severity:** Critical–High  
**CWE:** CWE-347  
**OWASP:** A07:2021; API2:2023

**Why it matters:** Accepting forged, expired, wrong-issuer or wrong-audience tokens can become full authentication bypass.

**Detect:** Inspect JWT/OAuth validation for signature, algorithm, issuer, audience, lifetime and signing-key configuration. Test invalid signatures, expiry, issuer and audience.

**Evidence:** Validation configuration and negative test output.

**Remediation:** Use framework validation with explicit issuer/audience/signing keys and lifetime checks; reject algorithm/key confusion.

**Regression test:** Each invalid token variant returns 401.

**False-fix traps:** Correct validation with an exposed signing key is only partial.

**False positives:** Tokens validated by an upstream gateway that is the only network path to the service are acceptable when that is verified, not assumed.

**Chains with:** SECRET-001, FILE-001

**Provenance:** SRC-001, SRC-002

**Version:** 2.0.0

## AUTHN-003 — Passwords are stored or handled in plaintext
**Domain:** Authentication  
**Severity:** Critical  
**CWE:** CWE-256, CWE-312  
**OWASP:** A02:2021 Cryptographic Failures

**Why it matters:** Database, log or email compromise becomes direct account compromise.

**Detect:** Search schema, entities, SQL, logs, emails, DTOs and reset flows for plaintext password reads/writes.

**Evidence:** Storage field and every code path that reads or emits it.

**Remediation:** Store salted adaptive password hashes; reset by issuing a one-time reset mechanism, never by retrieving the old password. Remove legacy plaintext safely.

**Regression test:** Password never appears in API responses, logs, email bodies or audit records; database contains only verifier material.

**False-fix traps:** Removing the password from one DTO does not fix email, logs or alternate endpoints.

**False positives:** Columns that hold a salted adaptive hash or an opaque token despite a "password" name; fixtures confined to test projects.

**Provenance:** SRC-001

**Version:** 2.0.0

## AUTHN-004 — Password reset or recovery reveals account state or credentials
**Domain:** Authentication  
**Severity:** High–Medium  
**CWE:** CWE-640, CWE-204  
**OWASP:** A07:2021

**Why it matters:** Recovery endpoints can enumerate users or directly disclose credentials.

**Detect:** Compare existing and unknown accounts, inspect response bodies, timing, email content, reset tokens and invalidation.

**Evidence:** Response differences and reset implementation.

**Remediation:** Generic responses, single-use short-lived reset tokens, no password disclosure, rate limiting and audit logging.

**Regression test:** Existing and unknown accounts produce indistinguishable responses; old reset tokens fail after use/expiry.

**False-fix traps:** Hiding the UI message while the API still differs is not sufficient.

**False positives:** Responses that are the same for existing and unknown accounts, with only negligible timing noise and no practical oracle.

**Provenance:** SRC-001

**Version:** 2.0.0

## AUTHN-005 — OTP or verification code can be guessed, replayed or abused
**Domain:** Authentication  
**Severity:** High–Medium  
**CWE:** CWE-307, CWE-640  
**OWASP:** A07:2021

**Why it matters:** Weak randomness, unlimited attempts or reusable codes enable account takeover.

**Detect:** Inspect RNG, entropy, TTL, attempt count, binding, consumption and rate limits.

**Evidence:** Generation and validation code plus state transitions.

**Remediation:** Cryptographic randomness, short TTL, attempt limits, purpose/user binding, one-time consumption and throttling.

**Regression test:** Expired/reused/wrong-purpose codes fail and repeated attempts are blocked.

**False-fix traps:** A random-looking code without expiry or consumption remains weak.

**False positives:** Short numeric codes are acceptable when they are cryptographically random, short-lived, attempt-limited and single-use.

**Provenance:** SRC-002, SRC-003

**Version:** 2.0.0

## AUTHN-006 — Authentication endpoint lacks brute-force and abuse controls
**Domain:** Authentication  
**Severity:** Medium–High  
**CWE:** CWE-307  
**OWASP:** A07:2021

**Why it matters:** Unlimited login/reset/OTP attempts enable credential stuffing and abuse.

**Detect:** Trace rate limits by account, source, device or token; inspect lockout/backoff and monitoring.

**Evidence:** Middleware/config and test showing throttling.

**Remediation:** Add proportionate throttling and alerting without creating a user-enumeration oracle.

**Regression test:** Repeated failures trigger throttling while legitimate recovery remains possible.

**False-fix traps:** Client-side timers or CAPTCHA alone are not a server-side rate limit.

**False positives:** Throttling enforced by a verified gateway or WAF in front of every route; authentication endpoints reachable only from a trusted network.

**Provenance:** SRC-002, SRC-003

**Version:** 2.0.0

## AUTHN-007 — Session or token lifecycle is not enforced
**Domain:** Authentication  
**Severity:** Medium–High  
**CWE:** CWE-613, CWE-384, CWE-308  
**OWASP:** A07:2021; API2:2023

**Why it matters:** Stolen, stale or leaked credentials stay usable when tokens never expire or cannot be revoked, and privileged accounts that rely on a single factor are easy to take over.

**Detect:** Inspect token and session lifetimes, refresh and rotation, server-side revocation, logout behaviour, idle and absolute expiry, invalidation on password or role change, session regeneration on login, and multi-factor authentication for privileged roles.

**Evidence:** Issuance and validation code, lifetime configuration, revocation store or token-version check, and the logout and password-change handlers.

**Remediation:** Use short access-token lifetimes with rotated refresh tokens; support server-side revocation or token versioning; invalidate sessions on password reset and role change; regenerate the session at login; require a second factor for privileged roles.

**Regression test:** After logout, password change or role change the old token is rejected; expired and reused refresh tokens fail; a privileged login without the second factor is refused.

**False-fix traps:** Deleting the token in the browser is not logout; a short lifetime without revocation still leaves a usable window; MFA on the UI but not on the API proves nothing.

**False positives:** Short-lived stateless tokens with a documented, accepted revocation window; MFA enforced upstream by an identity provider that is verified for the privileged roles.

**Chains with:** AUTHN-002

**Provenance:** SRC-002

**Keywords:** session, logout, refresh, revocation, expiry, MFA

**Version:** 2.0.0
