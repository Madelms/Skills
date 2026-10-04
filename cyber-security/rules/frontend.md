# Frontend Rules

## FE-001 — Client-side security check is treated as authoritative
**Domain:** Frontend  
**Severity:** High  
**CWE:** CWE-602  
**OWASP:** A01:2021

**Why it matters:** Attackers can call APIs directly and bypass UI guards.

**Detect:** Identify role/ownership decisions made only by guards, hidden buttons or client state.

**Evidence:** Frontend check and missing server control.

**Remediation:** Treat frontend checks as UX only; enforce authorization on the server.

**Regression test:** Direct API requests reproduce the same authorization boundary as the UI.

**False-fix traps:** Hiding a menu item does not secure the endpoint.

**Version:** 1.0.0

## FE-002 — Sensitive token storage exposes credentials to script compromise
**Domain:** Frontend  
**Severity:** High–Medium  
**CWE:** CWE-922  
**OWASP:** A07:2021

**Why it matters:** Long-lived bearer tokens in script-accessible storage can be stolen through XSS or malicious extensions.

**Detect:** Inspect localStorage/sessionStorage, cookies, token lifetime and XSS posture.

**Evidence:** Storage mechanism and token scope/lifetime.

**Remediation:** Prefer secure, HttpOnly, appropriately scoped cookies where architecture permits; minimize token lifetime and exposure.

**Regression test:** Authentication artifacts follow the approved storage policy and are not exposed to arbitrary script.

**False-fix traps:** Encrypting a token with a key also delivered to JavaScript does not meaningfully protect it.

**Version:** 1.0.0

## FE-003 — Frontend build exposes privileged configuration or secrets
**Domain:** Frontend  
**Severity:** High–Medium  
**CWE:** CWE-798  
**OWASP:** A02:2021

**Why it matters:** Everything shipped to the browser is public.

**Detect:** Inspect source, environment files, generated bundles and source maps.

**Evidence:** Exposed value and its privilege.

**Remediation:** Move privileged operations server-side and restrict unavoidable public keys.

**Regression test:** Production bundle scanning finds no privileged secrets.

**False-fix traps:** Runtime JSON loaded by the SPA is still public if the browser can fetch it.

**Version:** 1.0.0
