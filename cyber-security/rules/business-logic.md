# Business Logic Rules

## BIZ-001 — Sensitive workflow transition lacks server-side authorization
**Domain:** Business Logic  
**Severity:** High  
**CWE:** CWE-841  
**OWASP:** A01:2021

**Why it matters:** Attackers can skip required review, approval or validation steps.

**Detect:** Map allowed state transitions and required actors; compare with API inputs.

**Evidence:** State transition code and trusted actor source.

**Remediation:** Implement server-side transition rules using persisted state and authenticated actor context.

**Regression test:** Invalid transitions and unauthorized actors fail.

**False-fix traps:** A status allowlist without transition authorization is insufficient.

**False positives:** Transitions that are fully derived and authorised on the server, where the client only requests an action.

**Provenance:** SRC-001

**Version:** 2.0.0

## BIZ-002 — Business-critical setting can be changed without proper authorization
**Domain:** Business Logic  
**Severity:** High  
**CWE:** CWE-862  
**OWASP:** A01:2021

**Why it matters:** Anonymous or ordinary-user changes to system settings can affect every user.

**Detect:** Inventory settings/configuration write operations and their roles.

**Evidence:** Endpoint policy and write path.

**Remediation:** Admin-only authorization, validation, audit trail and safe change procedures.

**Regression test:** Unauthorized callers cannot read/write protected settings beyond intended public values.

**False-fix traps:** Hiding an admin page does not secure the settings API.

**False positives:** Settings that are intentionally public-read and non-sensitive while writes are restricted.

**Chains with:** BIZ-004

**Provenance:** SRC-001

**Version:** 2.0.0

## BIZ-003 — Security decision depends on attacker-controlled client state
**Domain:** Business Logic  
**Severity:** High  
**CWE:** CWE-602  
**OWASP:** A01:2021

**Why it matters:** Flags such as `isAdmin`, price, approval, eligibility or ownership can be forged.

**Detect:** Identify security/business decisions using request fields not derived from trusted server state.

**Evidence:** Decision point and input origin.

**Remediation:** Derive decisions from authenticated identity, persisted records and server-side policy.

**Regression test:** Forged client state cannot alter the decision.

**False-fix traps:** Signing data with a client-held key does not create trust.

**False positives:** Client-supplied values treated as hints and re-derived from trusted server state.

**Provenance:** SRC-001

**Version:** 2.0.0

## BIZ-004 — Outbound message content or recipients are built from untrusted or unvalidated data
**Domain:** Business Logic  
**Severity:** Medium–High  
**CWE:** CWE-74, CWE-93  
**OWASP:** A03:2021 Injection

**Why it matters:** Email, SMS and webhook content that embeds configurable or client-supplied values (links, text, recipients, headers) can be turned into phishing, spam or injection delivered from the organisation's own identity.

**Detect:** Trace values from settings, request fields and stored records into message bodies, subjects, headers, links and recipient lists; check URL and host validation, header-injection handling and who may change the source values.

**Evidence:** Message builder, the value origin and the validation.

**Remediation:** Use fixed templates, validate links against an allow-list of hosts, encode values for the message format, restrict recipients to the authenticated actor or verified records, and protect and audit the settings that feed messages.

**Regression test:** A configured value containing a foreign link, a newline or an extra recipient is rejected or neutralised in the outgoing message.

**False-fix traps:** Restricting who can edit the setting does not remove the injection; fixing the email path leaves SMS and webhook builders open.

**False positives:** Messages whose content and recipients are fixed server-side templates or validated against an allow-list.

**Chains with:** BIZ-002

**Provenance:** SRC-001, SRC-004

**Keywords:** email, SMS, webhook, phishing, template, recipients, header injection

**Version:** 2.0.0

## BIZ-005 — Race condition or check-then-act on a limited resource
**Domain:** Business Logic  
**Severity:** Medium–High  
**CWE:** CWE-362, CWE-367  
**OWASP:** A04:2021 Insecure Design; API6:2023

**Why it matters:** Parallel requests can pass the same check before any of them updates the state, bypassing quotas, balances, one-time tokens and single-use limits.

**Detect:** Find read-then-write sequences on counters, balances, stock, quotas, one-time codes and unique records that are not atomic, and idempotency gaps on retried operations.

**Evidence:** The check, the update and the absence of a transaction, lock or unique constraint.

**Remediation:** Use atomic conditional updates, unique constraints, row locks or serializable transactions, and idempotency keys for retried operations.

**Regression test:** N parallel requests against a limit of one succeed exactly once.

**False-fix traps:** A check in application memory or a cache does not protect multiple instances; a transaction without the right isolation or constraint still races.

**False positives:** Operations made atomic by the datastore (unique constraints, conditional updates, row locks) and proven under concurrency.

**Provenance:** SRC-002

**Keywords:** race condition, TOCTOU, quota, concurrency, idempotency

**Version:** 2.0.0
