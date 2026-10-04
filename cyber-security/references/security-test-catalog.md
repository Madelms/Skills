# Security Test Catalog

What a professional security reviewer tests on a web application or API. The rules in `rules/` describe vulnerabilities; this catalog describes the **test objectives and checks** that find them, grouped by area. It is technology-neutral: stack files in `references/stacks/` give framework-specific searches and pitfalls.

How to use it: build the operation inventory first (`workflow-review.md`, Phase 3), then walk each area below against the inventory. For every check, record the evidence layer it was answered at (Source, Repo config, Deployed, External). A check that can only be answered on a deployed or external layer becomes NEEDS VERIFICATION with the exact test to run.

## Structure: areas, techniques and rules are different things

- **Areas** (the numbered sections below) say what to test. An area does not have to be a rule.
- **Cross-cutting techniques** (next table) say how to test; they apply across areas.
- **Rules** (`rules/`) describe the vulnerabilities the tests can find. Each area lists the rules that serve it.

Some checks are deliberately catalog-only and have no rule of their own: "inverted authorization" (a privileged role denied data it must oversee, area 7) and third-party and service trust-boundary testing (area 26). They are covered by the checks, and by rules only where a vulnerability class already exists (for example AUTHZ-001, DATA-004, PLAT-005). Promote a check to a rule only when repeated evidence shows a reusable vulnerability that no existing rule can represent.

## Cross-cutting test techniques

| Technique | What to vary | What it reveals |
|---|---|---|
| **Role matrix** | Call every operation as anonymous, a normal user, each privileged role, and a second normal user. Compare outcomes. | Missing function-level authorization; privileged data reachable by lower roles; over-restriction of oversight roles. A business-rule error to a lower role means the gate was passed. |
| **Response differencing** | Compare responses across roles and users for the same request; identical bodies are a prompt to check the data class. | Shared lookups versus leaked configuration, policy or personal data. |
| **Identifier variation** | Own, foreign, sequential, sentinel (-1, 0, empty, "default"), and identifiers disclosed by other operations. | Object-level authorization, fall-through defaults, identifier-disclosure chains. |
| **Credential variation** | None, malformed, expired, wrong scheme, scheme-less, temporary or bootstrap token, token from another audience. | Token validation, lifetime enforcement, factor bypass, fail-open handling. |
| **Origin and header variation** | Absent, foreign and approved Origin; altered Authorization scheme; forged forwarding headers. | Origin used as an authentication gate; header-semantics defects. |
| **Error probing** | Malformed, oversized, type-confused and boundary inputs on every operation. | Verbose errors, success-status error masks, injection fingerprints, provider passthrough. |
| **Artifact scan** | Every file reachable from the public asset path and every response header and cookie. | Config variants, stale files, fingerprint and internal-host leaks. |
| **Concurrency** | Parallel identical requests against limited resources. | Races and missing idempotency. |

## Coverage summary

Status legend: **Covered** = rules already existed and fully serve the area; **Improved** = existing rules gained detection or test guidance in this release; **Added** = new rule or new catalog area.

| # | Area | Rules | Status |
|---|---|---|---|
| 1 | Authentication and authentication-factor lifecycle | AUTHN-001, AUTHN-003, AUTHN-006, AUTHN-008 | Improved + Added |
| 2 | Token issuance, validation, promotion, expiry and leakage | AUTHN-002, AUTHN-007, AUTHN-008, DATA-004 | Improved + Added |
| 3 | One-time codes and bypass paths | AUTHN-005, AUTHN-008, SECRET-004 | Improved + Added |
| 4 | HTTP authentication semantics and header handling | AUTHN-002, PLAT-003, LOG-002 | Improved |
| 5 | Authorization default-deny, anonymous discovery, endpoint inventory | AUTHZ-006, AUTHZ-001, API-004 | Covered |
| 6 | Object-level authorization and ownership | AUTHZ-002, AUTHZ-004, DB-003 | Improved |
| 7 | Function-level authorization and the role matrix | AUTHZ-001, AUTHZ-003, AUTHZ-005 | Improved |
| 8 | Property-level authorization and mass assignment | API-001, API-003 | Covered |
| 9 | Client-supplied identity and actor fields | AUTHZ-004, BIZ-003, LOG-001 | Improved |
| 10 | Debug, test, admin and API-documentation exposure | PLAT-001, PLAT-002, PLAT-007 | Covered |
| 11 | Data exposure, excessive retrieval and enumeration | API-002, AUTHN-004, FILE-005 | Improved |
| 12 | Injection: SQL, dynamic SQL, dynamic expressions, other interpreters | INPUT-001, INPUT-004, INPUT-005, DB-002 | Improved |
| 13 | Script and URL sinks | INPUT-002, INPUT-006, FE-001 | Covered |
| 14 | File access, download, upload, traversal | FILE-001 to FILE-006 | Improved |
| 15 | Cloud and blob storage access control | FILE-004, FILE-002 | Improved |
| 16 | Secrets and credentials | SECRET-001, SECRET-002, DATA-002 | Covered |
| 17 | Configuration, deployment artifacts, environment separation | SECRET-003, SECRET-004, PLAT-005, PLAT-007 | Improved |
| 18 | Client-side secrets and trust decisions | FE-001, FE-003, SECRET-002 | Covered |
| 19 | Browser credential storage: cookies and tokens | FE-002 | Improved |
| 20 | Error handling and information disclosure | LOG-002 | Improved |
| 21 | Security headers, CSP, CORS and Origin assumptions | PLAT-003, PLAT-004 | Improved |
| 22 | Framework, version and dependency exposure | PLAT-008, PLAT-004 | Covered |
| 23 | Business workflow authorization and sensitive flows | BIZ-001, BIZ-002, BIZ-003, BIZ-004 | Covered |
| 24 | Race conditions, atomicity, idempotency | BIZ-005 | Covered |
| 25 | Abuse and rate limiting | AUTHN-006, API-005 | Covered |
| 26 | Third-party and service trust boundaries | DATA-004, PLAT-005, SECRET-002, INPUT-003, BIZ-004 | Improved + Added |
| 27 | Logging, monitoring and security regression controls | LOG-001, LOG-003, API-004 | Covered |
| 28 | Cryptography and transport | DATA-001, DATA-002, DATA-003, PLAT-006, AUTHN-003 | Covered |
| 29 | Database privileges and data-access layer | DB-001, DB-002, DB-003 | Improved |

## Areas

### 1. Authentication and authentication-factor lifecycle
- Can a session or token be obtained without completing every required factor?
- Can a temporary or bootstrap token be promoted to, or accepted as, a full session? By which services?
- Can authentication be bypassed through alternate endpoints, legacy or mobile flows, debug flags or client-side shortcuts?
- Does the first step reveal account existence or attributes? Is a successful first-step response treated by the client as being logged in?
- Are failed attempts throttled per account and per source without creating an enumeration oracle?
- Are passwords stored as salted adaptive hashes and never returned, logged or sent?

### 2. Token issuance, validation, promotion, expiry and leakage
- Are signature, algorithm, issuer, audience and lifetime all validated? Is an expired token rejected or silently treated as anonymous?
- Do tokens carry a purpose or scope that stops a token for one use being accepted for another?
- Is there revocation, logout, rotation and invalidation on credential or role change?
- Does a token ever appear in a URL, redirect, Referer, log, error body or a third-party request?
- Is the signing key exposed (repository, bundle, file-read bug, public config)?

### 3. One-time codes and bypass paths
- Are codes generated with a cryptographic source, short-lived, attempt-limited, single-use and bound to purpose and user?
- Is there any hard-coded identity, fixed code, client-side acceptance or runtime flag that skips sending or verification? Where does the flag live and who can edit it?
- Does the server independently enforce what the client claims to enforce?

### 4. HTTP authentication semantics and header handling
- Is the standard Authorization scheme required, and are non-standard formats rejected? Does every 401 carry a challenge header?
- Do missing, invalid and expired credentials all yield 401 and not a success status with an error body?
- Does any security decision depend on a client-controlled header (Origin, Referer, forwarding headers)?

### 5. Authorization default-deny, anonymous discovery and endpoint inventory
- What is the effective default for an operation with no marker? List every implicit-anonymous operation.
- For each anonymous operation: what data class does it return, does it change state, who calls it, is it justified?
- Does the framework's own route enumeration match the inventory? Are debug, sample and documentation endpoints included?

### 6. Object-level authorization and ownership
- Can another user's object be read, changed or deleted by changing an identifier? Do sentinel identifiers (-1, 0, empty) fall through to a real record?
- Is ownership resolved from the stored record, not from a client-supplied parent or owner identifier?
- Is the tenant or owner predicate mandatory in the data-access layer, so alternate entry points cannot skip it?

### 7. Function-level authorization and the role matrix
- What happens with anonymous, normal, privileged and cross-user requests on every operation?
- Can a lower role invoke operations that are named or documented for a higher role? Does a business-rule error (instead of 401/403) show the gate was passed?
- Do shared-looking responses hide configuration, policy or report data from the wrong role? Is the matrix right in both directions?
- Are checks applied to every sibling route, verb and older version?

### 8. Property-level authorization and mass assignment
- Which fields can the client set on create and update? Are workflow, ownership, audit and URL/HTML-bearing fields server-controlled?
- Is the whole entity bound and saved, so omitted fields are overwritten?

### 9. Client-supplied identity and actor fields
- Does any operation take the acting user, owner or approver from the query string, body or a client-decryptable cookie?
- Is a supplied value that disagrees with the token claim rejected? Is the audit actor taken from the authenticated principal?

### 10. Debug, test, admin and API-documentation exposure
- Are debug, diagnostic, sample and scaffold endpoints present in the deployable artifact? Is API documentation reachable in production?
- Does a CI check fail the build on routes whose names match debug, test or sample patterns?

### 11. Data exposure, excessive retrieval and enumeration
- Which roles can list, search or look up other users' personal data? Are bulk directory and audience operations restricted?
- Do responses carry sensitive fields, infrastructure identifiers or operational detail?
- Do sign-in, code-send, lookup and search operations reveal account existence or attributes?

### 12. Injection
- Does any input reach a query, command, expression evaluator or statement text by concatenation? Is the caller's outer statement composed from input even when the procedure is safe?
- Are client-supplied filter, order or include strings evaluated by a dynamic expression library? Can a predicate act as a side channel to read fields the response omits?
- Do quote, delay and type-conversion probes behave differently from normal input? Do database errors reach the client?
- Are deserializers and XML parsers configured safely?

### 13. Script and URL sinks
- Does stored or reflected data reach a raw-HTML, sanitizer-bypass or URL-bearing sink, especially in a privileged view?
- Are redirect, return and embed URLs validated by scheme and host at write time and at use time?

### 14. File access, download, upload and traversal
- Can a file be fetched anonymously, or by another user? Can a path or file name escape the intended root (encoded separators, rooted paths)?
- Can a storage identifier or file URL disclosed by another operation be chained into a download?
- Are uploads restricted by type, size and name, stored outside executable roots, and never written into a shared template?

### 15. Cloud and blob storage access control
- Are containers private, URLs short-lived and scoped, and any proxy authorising against the stored object?
- What does the caller see when the storage SDK fails: provider text, headers or identifiers?

### 16. Secrets and credentials
- Are credentials, keys or signing material in source, history, bundles, public config or logs? Was rotation done, not just relocation?

### 17. Configuration, deployment artifacts and environment separation
- Which files are reachable from the public asset path? Are there config variants for other environments or projects, development files, or stale artifacts?
- Does production point to demo, staging, test or shared-tenant endpoints? Does the environment label match the deployment? Does committed hosting config select a development mode?
- Is the deployed configuration different from the repository (pipeline injection)?

### 18. Client-side secrets and trust decisions
- Is any role, ownership, eligibility or factor decision made only in the client? Are keys or privileged values shipped to the browser?
- Does the client special-case an identity or treat a first-step response as success?

### 19. Browser credential storage
- Where does a credential live (cookie, local or session storage, memory)? For cookies: HttpOnly, Secure, SameSite, and Domain scope. Is one credential shared across every application under a parent domain?

### 20. Error handling and information disclosure
- Do errors return a success status? Do they reveal stack traces, source paths, framework or SDK text, or provider headers? Do global handlers cover every content type?

### 21. Security headers, CSP, CORS and Origin assumptions
- Does the CSP parse cleanly and avoid unsafe-inline and unsafe-eval in script sources? Are framing, content-type, referrer and transport headers set at the point users reach?
- Is CORS limited to approved origins, and is Origin never an authorization gate?
- Do server, framework or load-balancer headers and cookies leak the stack or internal host names?

### 22. Framework, version and dependency exposure
- Which framework, runtime and package versions are in use (server and client)? Are they supported? Are known-vulnerable or end-of-life components reachable?

### 23. Business workflow authorization and sensitive flows
- Who may move each workflow state? Is the actor required to be the assigned owner or reviewer, not just a role?
- Can settings, eligibility or price be changed or forged by the client? Can configurable content turn outbound messages into phishing?

### 24. Race conditions, atomicity and idempotency
- Do parallel requests pass the same check before the state changes (quotas, balances, one-time codes, money, seats)? Are retries idempotent?

### 25. Abuse and rate limiting
- Which operations send messages, trigger paid calls, or take unbounded size or page parameters? Are there per-account and per-source limits?

### 26. Third-party and service trust boundaries
- Which tokens or identifiers leave the system for partners or hosted services? Are they exchanged by authorization code, not placed in URLs?
- Are service credentials used from the browser? Are hosted-service hostnames owned and stable?

### 27. Logging, monitoring and security regression controls
- Are authentication failures, privilege changes and sensitive access logged with the real actor? Can log content be forged?
- Is there an automated role-matrix, default-deny and sentinel-identifier test in CI?

### 28. Cryptography and transport
- Is sensitive data protected with approved primitives, and is transport enforced and certificate validation intact?

### 29. Database privileges and data-access layer
- What can the application's database login do (roles, ownership, write access)? Would an injection become full read and write?
- Is authorization preserved in the lower layer for every entry point?
