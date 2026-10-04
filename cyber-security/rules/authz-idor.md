# Authorization and Object-Level Rules

## AUTHZ-001 — Protected operation lacks effective authorization
**Domain:** Authorization  
**Severity:** High–Critical  
**CWE:** CWE-862  
**OWASP:** A01:2021 Broken Access Control; API5:2023

**Why it matters:** Authentication alone does not establish permission.

**Detect:** Map role/policy requirements for every route and compare them with global defaults and exceptions.

**Evidence:** Effective policy and handler path.

**Remediation:** Enforce least-privilege authorization centrally and explicitly for sensitive operations.

**Regression test:** Correct role succeeds; insufficient role gets 403; anonymous gets 401.

**False-fix traps:** Frontend hiding is not authorization; an action attribute may be overridden by routing or middleware mistakes.

**Version:** 1.0.0

## AUTHZ-002 — Broken object-level authorization / IDOR
**Domain:** Authorization  
**Severity:** High–Critical  
**CWE:** CWE-639  
**OWASP:** API1:2023 BOLA

**Why it matters:** A caller can access another user's object by changing an identifier.

**Detect:** For every object ID from the client, trace authorization to the stored target record. Test another user's sequential/random ID.

**Evidence:** Query/update path and cross-user negative test.

**Remediation:** Resolve the object server-side and authorize against its persisted owner/tenant; return 403 without unnecessary existence leakage.

**Regression test:** User A cannot read/update/delete User B's object.

**False-fix traps:** Checking a client-supplied parent ID while updating a different child ID is not ownership.

**Version:** 1.0.0

## AUTHZ-003 — Function-level authorization is inconsistent across sibling endpoints
**Domain:** Authorization  
**Severity:** High  
**CWE:** CWE-862  
**OWASP:** API5:2023

**Why it matters:** Attackers use an overlooked read/write/delete twin or alternate route.

**Detect:** Group routes by controller/service capability and compare effective policies.

**Evidence:** Sibling route matrix.

**Remediation:** Apply shared policies at controller/router/group level where appropriate and test every verb/path.

**Regression test:** Every sibling route enforces the same intended authorization boundary.

**False-fix traps:** Fixing only the reported URL leaves aliases or alternate verbs open.

**Version:** 1.0.0

## AUTHZ-004 — Ownership is checked against a client-supplied identifier
**Domain:** Authorization  
**Severity:** High  
**CWE:** CWE-639  
**OWASP:** API1:2023

**Why it matters:** The attacker can change the identifier used by the ownership check while targeting another record.

**Detect:** Compare the ID used for authorization with the ID used by the final read/write/delete query.

**Evidence:** Both query predicates and the authorization decision.

**Remediation:** Derive the authorization target from the persisted record or trusted route binding; never trust a parallel body ID.

**Regression test:** Alter every redundant parent/owner ID and confirm access remains denied.

**False-fix traps:** A helper named `IsOwner` is not proof; inspect its implementation and every argument.

**Version:** 1.0.0

## AUTHZ-005 — Authorization helper is broader than intended
**Domain:** Authorization  
**Severity:** High  
**CWE:** CWE-863  
**OWASP:** A01:2021

**Why it matters:** A permissive shared helper can silently grant access to every caller using it.

**Detect:** Inspect helper return conditions and all call sites, including tenant/admin branches.

**Evidence:** Helper logic and caller policies.

**Remediation:** Make helpers explicit about role, tenant and ownership requirements; avoid boolean helpers whose context changes their meaning.

**Regression test:** Exercise each principal class against each caller.

**False-fix traps:** An authenticated-user shortcut can accidentally bypass tenant/ownership checks.

**Version:** 1.0.0

## AUTHZ-006 — Default authorization policy is fail-open
**Domain:** Authorization  
**Severity:** High  
**CWE:** CWE-862  
**OWASP:** A01:2021

**Why it matters:** New endpoints can become anonymous by omission.

**Detect:** Inspect global/fallback authorization and explicit anonymous exceptions.

**Evidence:** Composition-root configuration.

**Remediation:** Use a default-deny/fallback policy and explicitly mark public endpoints.

**Regression test:** A newly added unannotated route is protected by default.

**False-fix traps:** Individual `[Authorize]` attributes do not establish default deny.

**Version:** 1.0.0
