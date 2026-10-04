# Authentication Rules

## AUTHN-001 — Authentication is bypassable or absent on a protected operation
**Domain:** Authentication  
**Severity:** Critical–High  
**CWE:** CWE-306, CWE-287  
**OWASP:** A07:2021 Identification and Authentication Failures; API2:2023

**Why it matters:** Anonymous or improperly authenticated callers can reach operations intended for trusted users.

**Detect:** Inventory routes and effective authentication. Test missing, malformed, expired, invalid-signature and wrong-audience credentials. Inspect middleware/pipeline order and route metadata. For multi-step sign-in, verify that no usable token or session is issued before every required factor is verified server-side, and that alternate, legacy, debug and client-side shortcut paths enforce the same factors (see AUTHN-008). Call protected operations with no credential, a malformed one and an expired one: anything other than a clean 401, including a success status with an error body, means the authentication gate is not where it appears to be.

**Evidence:** Route/handler, effective policy, authentication pipeline, and negative test result.

**Remediation:** Enforce authentication centrally with explicit exceptions. Reject invalid credentials before business logic. Add automated unauthenticated tests.

**Regression test:** Anonymous request returns 401 and no business code executes; valid credentials succeed. Missing, malformed and expired credentials each return 401 on every non-anonymous operation, never a success status with an error body.

**False-fix traps:** An attribute on one action does not secure sibling actions; a frontend guard is not authentication.

**False positives:** Operations that are intentionally public (sign-in, health, public content) are acceptable when explicitly marked and justified by a public consumer.

**Provenance:** SRC-001, SRC-005

**Version:** 2.1.0

## AUTHN-002 — Token validation is incomplete
**Domain:** Authentication  
**Severity:** Critical–High  
**CWE:** CWE-347  
**OWASP:** A07:2021; API2:2023

**Why it matters:** Accepting forged, expired, wrong-issuer or wrong-audience tokens can become full authentication bypass.

**Detect:** Inspect JWT/OAuth validation for signature, algorithm, issuer, audience, lifetime and signing-key configuration. Test invalid signatures, expiry, issuer and audience. Check lifetime enforcement explicitly: an expired token must be rejected, not silently downgraded to anonymous access. Check the accepted credential format against the standard Authorization scheme (a scheme-less or non-standard token defeats gateway, WAF and log-redaction rules) and that rejections carry the standard challenge header.

**Evidence:** Validation configuration and negative test output.

**Remediation:** Use framework validation with explicit issuer/audience/signing keys and lifetime checks; reject algorithm/key confusion. Accept only the standard Bearer scheme, return 401 with a challenge header on missing, invalid and expired tokens, and make downstream services reject temporary or bootstrap tokens as full authentication.

**Regression test:** Each invalid token variant returns 401. Expired, wrong-scheme and scheme-less tokens return 401 with a challenge header on every operation; services that require a full session reject temporary tokens.

**False-fix traps:** Correct validation with an exposed signing key is only partial. An expired or invalid token treated as "no token" still reaches every anonymous operation and hides the failure from monitoring.

**False positives:** Tokens validated by an upstream gateway that is the only network path to the service are acceptable when that is verified, not assumed.

**Chains with:** SECRET-001, FILE-001

**Provenance:** SRC-001, SRC-002, SRC-005, SRC-006

**Version:** 2.1.0

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

**Detect:** Compare existing and unknown accounts, inspect response bodies, timing, email content, reset tokens and invalidation. Extend the comparison beyond recovery flows: sign-in, code-send, identity-lookup and user-search operations must not reveal whether an account exists, or return account attributes (a partial phone number, an e-mail address, a role), before authentication or to roles that do not need them. Compare known and unknown identifiers across all of them.

**Evidence:** Response differences and reset implementation.

**Remediation:** Generic responses, single-use short-lived reset tokens, no password disclosure, rate limiting and audit logging.

**Regression test:** Existing and unknown accounts produce indistinguishable responses; old reset tokens fail after use/expiry. Known and unknown identifiers give indistinguishable responses on every pre-authentication operation, and lookup and search operations are restricted to the roles that need them.

**False-fix traps:** Hiding the UI message while the API still differs is not sufficient.

**False positives:** Responses that are the same for existing and unknown accounts, with only negligible timing noise and no practical oracle.

**Provenance:** SRC-001, SRC-005, SRC-006

**Keywords:** reset, enumeration, recovery, login response, user search, account existence

**Version:** 2.1.0

## AUTHN-005 — OTP or verification code can be guessed, replayed or abused
**Domain:** Authentication  
**Severity:** High–Medium  
**CWE:** CWE-307, CWE-640  
**OWASP:** A07:2021

**Why it matters:** Weak randomness, unlimited attempts or reusable codes enable account takeover.

**Detect:** Inspect RNG, entropy, TTL, attempt count, binding, consumption and rate limits. Look for bypass paths: hard-coded identities or fixed codes, client-side validators that accept a code without a server call, and flags that disable code sending or verification (especially when read from a publicly served or runtime-editable source). Verify that the server enforces the same rule independently of the client.

**Evidence:** Generation and validation code plus state transitions.

**Remediation:** Cryptographic randomness, short TTL, attempt limits, purpose/user binding, one-time consumption and throttling. Remove bypass branches from production builds; if a non-production bypass is unavoidable, source it from secured server-side configuration and fail startup when it is enabled in a production-like environment.

**Regression test:** Expired/reused/wrong-purpose codes fail and repeated attempts are blocked. No identity, code or flag lets a code be skipped or accepted without server-side verification in any production-like environment.

**False-fix traps:** A random-looking code without expiry or consumption remains weak. Removing the bypass from the client while the server-side validator still honours it (shared DTOs and procedures make this common) leaves the backdoor open.

**False positives:** Short numeric codes are acceptable when they are cryptographically random, short-lived, attempt-limited and single-use.

**Provenance:** SRC-002, SRC-003, SRC-005

**Version:** 2.1.0

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

## AUTHN-008 — An authentication factor can be skipped, or a pre-authentication token is accepted as a full session
**Domain:** Authentication  
**Severity:** Critical–High  
**CWE:** CWE-287, CWE-288, CWE-306  
**OWASP:** A07:2021; API2:2023

**Why it matters:** A sign-in flow that issues a usable token before every required factor is verified, or lets a temporary token stand in for a full session, turns any known identifier into an account takeover.

**Detect:** Trace every step of each sign-in flow, including legacy, mobile, single-sign-on and recovery variants: what is issued after the identifier step and after each factor; whether a token issued early is accepted as full authentication by any service; whether a hard-coded identity, fixed code or runtime flag short-circuits a factor; and whether the client treats a successful first-step response as being logged in. Test by calling the first step with only an identifier and by presenting the early token to protected operations.

**Evidence:** Token issuance code at each step, the validation each service applies (audience, purpose or scope claims) and the observed use of the early token.

**Remediation:** Issue no usable credential until every required factor is verified server-side; give temporary tokens a distinct purpose or scope that protected services reject; remove factor-bypass branches; return a generic first-step response that discloses neither the token nor account details.

**Regression test:** The first step with only an identifier yields no usable token; a temporary token returns 401 on every protected operation; promotion to a full session requires a valid factor and is single-use.

**False-fix traps:** A short lifetime on the early token does not make it safe; client-side checks do not enforce the factor; fixing one sign-in endpoint leaves alternate or legacy flows open.

**False positives:** Single-factor sign-in that is intentional, documented and backed by compensating controls; tokens that carry no authority beyond completing the next step and are rejected by every other operation.

**Chains with:** AUTHN-002, AUTHN-005, AUTHZ-001

**Provenance:** SRC-002, SRC-005

**Keywords:** authentication flow, factor bypass, temporary token, token promotion, OTP, credentialless

**Version:** 2.1.0
