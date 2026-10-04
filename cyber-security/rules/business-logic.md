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

**Version:** 1.0.0

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

**Version:** 1.0.0

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

**Version:** 1.0.0
