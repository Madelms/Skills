# Authorization and Object-Level Rules

## AUTHZ-001 — Protected operation lacks effective authorization
**Domain:** Authorization  
**Severity:** High–Critical  
**CWE:** CWE-862  
**OWASP:** A01:2021 Broken Access Control; API5:2023

**Why it matters:** Authentication alone does not establish permission.

**Detect:** Map role/policy requirements for every route and compare them with global defaults and exceptions. Include operations that return internal workflow, state-transition or reference data: if only a privileged UI consumes them they should not be anonymous or open to every authenticated user. Run a role matrix: call every operation as anonymous, as a normal user, as each privileged role and as a different user, and compare the outcomes. A business-rule error (not a 401/403) returned to a lower role proves the authorization gate was passed and the handler ran. Treat operations whose names or routes imply a privileged role (admin, coordinator, staff) as high-yield, and byte-identical responses across roles as a prompt to check, because shared lookups are legitimate but configuration, policy and report data are not. Verify the intended matrix in both directions: a privileged role blocked from data it must oversee is also a defect.

**Evidence:** Effective policy and handler path. Also the consumer(s) of the operation, from the inventory.

**Remediation:** Enforce least-privilege authorization centrally and explicitly for sensitive operations.

**Regression test:** Correct role succeeds; insufficient role gets 403; anonymous gets 401. A role-matrix test walks every operation with each role and asserts the intended outcome (401, 403 or success), never a business-logic error.

**False-fix traps:** Frontend hiding is not authorization; an action attribute may be overridden by routing or middleware mistakes.

**False positives:** Operations deliberately open to any authenticated user that return only non-sensitive, documented data. Identical responses across roles are expected for genuinely shared, non-sensitive lookup data; decide by data class and the operation's intent, not by response equality alone.

**Chains with:** AUTHN-008

**Provenance:** SRC-001, SRC-002, SRC-004, SRC-005, SRC-006

**Version:** 2.1.0

## AUTHZ-002 — Broken object-level authorization / IDOR
**Domain:** Authorization  
**Severity:** High–Critical  
**CWE:** CWE-639  
**OWASP:** API1:2023 BOLA

**Why it matters:** A caller can access another user's object by changing an identifier.

**Detect:** For every object ID from the client, trace authorization to the stored target record. Test another user's sequential/random ID. Note sequential or otherwise predictable identifiers; they make enumeration cheap. Test sentinel and boundary identifiers: -1, 0, empty or "default" values must be rejected or return nothing, never fall through to "the first matching row" or a default record that belongs to someone else. Run each get-by-identifier operation with the caller's own, a foreign and a sentinel identifier and compare.

**Evidence:** Query/update path and cross-user negative test.

**Remediation:** Resolve the object server-side and authorize against its persisted owner/tenant; return 403 without unnecessary existence leakage. As defence in depth only, prefer non-sequential identifiers where practical.

**Regression test:** User A cannot read/update/delete User B's object. Sentinel identifiers (negative, zero, empty) return an explicit client error or an empty result on every get-by-identifier operation.

**False-fix traps:** Checking a client-supplied parent ID while updating a different child ID is not ownership. Unpredictable identifiers reduce enumeration but never replace the ownership check. Rejecting foreign real identifiers does not help if a sentinel value bypasses the lookup entirely.

**False positives:** Identifiers that are public by design and return only public data.

**Chains with:** API-002, FILE-002

**Provenance:** SRC-001, SRC-002, SRC-004, SRC-005, SRC-006

**Version:** 2.1.0

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

**False positives:** Sibling routes whose policies differ for a documented reason, such as read open to members and write limited to administrators.

**Provenance:** SRC-001

**Version:** 2.0.0

## AUTHZ-004 — Ownership is checked against a client-supplied identifier
**Domain:** Authorization  
**Severity:** High  
**CWE:** CWE-639  
**OWASP:** API1:2023

**Why it matters:** The attacker can change the identifier used by the ownership check while targeting another record.

**Detect:** Compare the ID used for authorization with the ID used by the final read/write/delete query. Include actor and identity parameters supplied in the query string or body (modified-by, created-by, user identifier): the acting identity must come from the validated token, and a request whose supplied value disagrees with it must be rejected.

**Evidence:** Both query predicates and the authorization decision.

**Remediation:** Derive the authorization target from the persisted record or trusted route binding; never trust a parallel body ID.

**Regression test:** Alter every redundant parent/owner ID and confirm access remains denied.

**False-fix traps:** A helper named `IsOwner` is not proof; inspect its implementation and every argument.

**False positives:** Redundant body identifiers that the server ignores and overrides with the persisted or trusted value before the check.

**Provenance:** SRC-001, SRC-005

**Version:** 2.1.0

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

**False positives:** Permissive helpers that are only called behind an equal or stricter policy; verify every call site before dismissing.

**Provenance:** SRC-001

**Version:** 2.0.0

## AUTHZ-006 — Default authorization policy is fail-open
**Domain:** Authorization  
**Severity:** High  
**CWE:** CWE-862  
**OWASP:** A01:2021

**Why it matters:** New endpoints can become anonymous by omission.

**Detect:** Inspect global/fallback authorization and explicit anonymous exceptions. Enumerate every operation with no explicit authentication or authorization marker. When the default is open they are implicitly anonymous and must be classified as "Anonymous (implicit)" in the inventory and justified by a public consumer.

**Evidence:** Composition-root configuration.

**Remediation:** Use a default-deny/fallback policy and explicitly mark public endpoints.

**Regression test:** A newly added unannotated route is protected by default. The inventory contains no implicit-anonymous operation unless it is justified by a public consumer.

**False-fix traps:** Individual `[Authorize]` attributes do not establish default deny.

**False positives:** Operations explicitly marked anonymous with a justified public consumer; deny-by-default enforced at a verified gateway.

**Chains with:** FILE-005, API-002

**Provenance:** SRC-001, SRC-002, SRC-004

**Version:** 2.0.0
