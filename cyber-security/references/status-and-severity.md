# Status and Severity

Every finding gets exactly one **status** and one **severity**. The two are independent. A FIXED finding keeps its original severity for history, and an OPEN finding's severity can be re-rated when the code shows a different blast radius than the report claimed. Say so when you re-rate.

## Status taxonomy

| Status | Use when | Minimum evidence |
|---|---|---|
| **FIXED** | The vulnerable behaviour is gone and the control that replaced it is enforced on every path you could find. | The enforcing code (file:line), proof it sits on the request path (pipeline order, attribute, policy, middleware), and a note that sibling routes and lower layers were checked. |
| **PARTIALLY FIXED** | Part of the requirement holds, but a sub-issue remains (e.g. authentication added but no ownership check; auth added but mass assignment remains; endpoint closed but the same logic is still reachable elsewhere). | Evidence for the fixed part **and** evidence for what remains. |
| **OPEN** | The vulnerability is still present in the reviewed code. | The vulnerable code path (file:line), and why no control stops it. |
| **NEEDS VERIFICATION** | The code suggests a fix but you cannot prove effectiveness from what you can see: deployment config, cloud console settings, key rotation, DB collation, WAF, pipeline-injected values, a fix in a repo you don't have. | What you saw, what is missing, and exactly how to verify it (command, console page, test request). |
| **NOT APPLICABLE** | The affected functionality no longer exists, or the rule's preconditions are absent (e.g. no file upload feature). | Where you looked to establish absence. "Endpoint deleted" needs a search showing no route or handler remains and the logic wasn't moved. |

Tracker files sometimes say "STILL OPEN". Treat it as a synonym of OPEN, and match whatever wording the user's tracker already uses.

**Decision rules**

- "Looks different" is not FIXED. "Tracker says Not Started" is not OPEN. Prove both from code.
- A control that is enforced in code, but whose secret, key or config is exposed (e.g. signing key committed to the repo), is PARTIALLY FIXED. The control is only as strong as its secret.
- Retired endpoint + same logic now behind another route = the finding moved, so it is not fixed. Keep it OPEN or PARTIALLY FIXED and name the new location.
- A report proven on a deployed environment that predates the fix: code status can be FIXED, but state explicitly that the deployed environment still needs redeploy and retest.
- If confidence is low, choose the less favourable status and say what would upgrade it.

## Verified against (second axis, mandatory)

Every finding also states the layer its status was verified against. A status without a layer is incomplete.

| Layer | Meaning | Can support |
|---|---|---|
| **Source** | The code paths were read. | FIXED / OPEN / PARTIALLY FIXED for the code. |
| **Repo config** | A config file committed to the repository. | OPEN (repo config) or FIXED (repo config). |
| **Deployed** | A running environment was observed (live request, deployed file, effective settings). | Any status for the deployed state. |
| **External** | Cloud console, key management, DB server settings, pipeline variables. | Any status for that external state. |

Rules:
- FIXED and OPEN are claimed only for the layer actually verified. **Never claim FIXED for an unverified deployment state.**
- A claim about deployed or external state that you could not observe is NEEDS VERIFICATION, with the exact check to run.
- Insecure config committed to the repo is **OPEN (repo config)**; its deployed effect is NEEDS VERIFICATION.
- Key or secret rotation cannot be FIXED from source alone: value still present is OPEN; value absent is NEEDS VERIFICATION until rotation is confirmed.

**NEEDS VERIFICATION severity.** Rate the finding "if confirmed" and label it that way. In summaries, count NEEDS VERIFICATION on its own line; do not merge it into OPEN.

## Severity rubric

Severity uses CVSS-style reasoning in plain language. Score the **realistic** worst case given the controls actually present.

| Severity | Typical shape |
|---|---|
| **Critical** | Unauthenticated (or any-user) access to bulk sensitive data, credential disclosure, account takeover, remote code execution, arbitrary file read of secrets, write access to other users' records at scale. |
| **High** | Authenticated user reaches other users' data or actions (BOLA), anonymous change of business-critical settings, auth bypass of a whole surface, secrets in source, stored XSS in admin context, path traversal limited to app files. |
| **Medium** | Enumeration oracles, weak OTP/reset hardening, sensitive config readable, missing rate limits on auth, exposed internal workflow data, unrestricted third-party API keys with latent cost. |
| **Low** | Information disclosure with limited use (version banners, public config with non-secret URLs), missing hardening headers, verbose errors without secrets. |
| **Informational** | Hygiene: template/sample endpoints, dead code, missing CI guardrails. |

**Escalators:** unauthenticated, at scale/enumerable, credentials or PII involved, chains into takeover, admin context, regulatory data.
**De-escalators:** requires admin, requires unguessable secret, read-only non-sensitive, compensating control proven in code.

Write the reason for any severity that differs from the rule's default or from the report.

## DeveloperNote format (for trackers)

One cell, short, scannable, in this order:

`STATUS (Verified against: <layer>) — what is true now (evidence file:line). Remaining: what is not done. [Root cause RC-n] [Chain C-nn] [Deploy: retest needed]`

Example:
`PARTIALLY FIXED (Verified against: Source) — endpoint now requires the client token plus ownership of the route id (OrdersController.cs:88-93). Remaining: binds the full entity, so the client can set status/approvedBy (OrderRepository.cs:40). RC-3 mass assignment.`
