# Platform and Deployment Rules

## PLAT-001 — Debug, diagnostic or sample endpoint is exposed
**Domain:** Platform  
**Severity:** High–Informational  
**CWE:** CWE-489, CWE-200  
**OWASP:** A05:2021

**Why it matters:** Debug endpoints can expose secrets, cache values, environment data or privileged operations.

**Detect:** Search for debug/diagnostic/sample controllers, health details and template endpoints in production builds.

**Evidence:** Route and deployment exposure.

**Remediation:** Remove or isolate diagnostics; restrict operational endpoints and keep sample code out of production.

**Regression test:** Production route inventory contains no development/sample endpoints.

**False-fix traps:** Hiding the route in Swagger does not remove it.

**False positives:** Health endpoints that return only a status and are restricted by network scope.

**Provenance:** SRC-001

**Version:** 2.0.0

## PLAT-002 — API documentation is unnecessarily exposed or overly permissive
**Domain:** Platform  
**Severity:** Medium–Low  
**CWE:** CWE-200  
**OWASP:** API9:2023

**Why it matters:** Public documentation can expose internal operations and schemas.

**Detect:** Check Swagger/OpenAPI exposure by environment and whether it documents admin/internal endpoints.

**Evidence:** Route/config and deployment behavior.

**Remediation:** Restrict documentation to trusted environments/users or publish an intentionally reduced contract.

**Regression test:** Production documentation follows the approved exposure policy.

**False-fix traps:** Requiring login to Swagger while leaving the underlying API anonymous is not remediation.

**False positives:** API documentation that is intentionally public with a reduced contract.

**Provenance:** SRC-001, SRC-002

**Version:** 2.0.0

## PLAT-003 — CORS policy is broader than required
**Domain:** Platform  
**Severity:** Medium–High  
**CWE:** CWE-942  
**OWASP:** A05:2021

**Why it matters:** Broad origins, credentials and unsafe methods can expand browser attack surface.

**Detect:** Inspect allowed origins, credentials, methods and headers in deployed configuration. Check whether the Origin or Referer header is used as an authentication or authorization gate: test each operation with an absent, a foreign and an approved Origin. CORS governs browsers, not callers that omit or forge the header.

**Evidence:** Effective CORS policy and browser test.

**Remediation:** Explicit allowlist of trusted origins; avoid wildcard credentials and unnecessary methods.

**Regression test:** Untrusted origin is denied while approved origin works. Requests with an absent, foreign or approved Origin get the same authentication outcome.

**False-fix traps:** CORS is not an authorization mechanism and does not protect non-browser clients. An Origin-gated 401 is bypassed by any non-browser client; the check must be on the credential.

**False positives:** Wildcard origins on public, credential-free, non-sensitive read endpoints.

**Provenance:** SRC-002, SRC-003, SRC-005

**Version:** 2.1.0

## PLAT-004 — Security headers and browser protections are missing or inconsistent
**Domain:** Platform  
**Severity:** Low–Medium  
**CWE:** CWE-693  
**OWASP:** A05:2021

**Why it matters:** Missing browser controls can increase impact of XSS, framing and content-type attacks.

**Detect:** Inspect effective response headers for CSP, frame protections, content type, referrer policy and HSTS where appropriate. Parse the CSP rather than reading it: malformed directives are silently ignored, and unsafe-inline or unsafe-eval in script directives neutralise it as an XSS control. Also check responses and cookies for fingerprint and internal-host leaks (server and framework headers, load-balancer cookie domains).

**Evidence:** Actual HTTP responses in each environment.

**Remediation:** Apply a reviewed header baseline and test it in CI/deployment checks.

**Regression test:** Required headers and values are present on representative responses. The CSP parses without browser-console errors and has no unsafe-inline or unsafe-eval in script sources; fingerprint headers and internal host names are absent.

**False-fix traps:** Setting a header in source without verifying reverse proxy/CDN behavior is incomplete.

**False positives:** Headers set by a verified reverse proxy or CDN rather than the application; legacy headers deprecated by current standards.

**Provenance:** SRC-002, SRC-003, SRC-005, SRC-006

**Version:** 2.1.0

## PLAT-005 — Deployment configuration differs materially from source without verification
**Domain:** Platform  
**Severity:** High–Medium  
**CWE:** CWE-16  
**OWASP:** A05:2021

**Why it matters:** Pipeline token replacement, environment variables or manual changes can reintroduce vulnerabilities.

**Detect:** Compare repository config, build artifacts, pipeline templates and runtime configuration. Record which layer each claim was verified against (source, repo config, deployed, external). Check environment separation: production configuration that points to demo, staging, test or shared-tenant hosted endpoints (including identity or verification services), mislabelled environment names, and internal hostnames leaking through responses. A hosted-service hostname can expire or be re-registered by another party.

**Evidence:** Diff and deployment mechanism.

**Remediation:** Treat deployment configuration as code, validate generated artifacts and add environment security checks. Verify the deployed state directly (request the live endpoint, read effective configuration) rather than inferring it from the repository.

**Regression test:** CI/CD produces an auditable, expected security configuration. Production configuration references only owned, production-grade endpoints, and the environment label matches the deployment.

**False-fix traps:** Reviewing only repository config misses pipeline-injected settings. A setting committed to the repository is OPEN (repo config) and its deployed effect is NEEDS VERIFICATION until observed; see "Verified against" in `references/status-and-severity.md`.

**False positives:** Differences in non-security settings (scaling, log level) that are documented and intended.

**Chains with:** SECRET-004

**Provenance:** SRC-001, SRC-002, SRC-004, SRC-005, SRC-006

**Version:** 2.1.0

## PLAT-006 — TLS/certificate validation is disabled or weakened
**Domain:** Platform  
**Severity:** High  
**CWE:** CWE-295  
**OWASP:** A02:2021

**Why it matters:** MITM attacks can steal credentials or alter API traffic.

**Detect:** Search for certificate validation callbacks, disabled verification and insecure HTTP endpoints.

**Evidence:** Client/server TLS configuration.

**Remediation:** Use platform certificate validation; fix trust-chain/name issues rather than disabling validation.

**Regression test:** Invalid/incorrect certificates fail connection establishment.

**False-fix traps:** A development-only bypass in deployable code can leak into production.

**False positives:** Custom trust anchors for a verified private CA with name validation intact.

**Provenance:** SRC-002, SRC-003

**Version:** 2.0.0

## PLAT-007 — Production contains framework/template artifacts
**Domain:** Platform  
**Severity:** Informational–Low  
**CWE:** CWE-489  
**OWASP:** A05:2021

**Why it matters:** Sample endpoints and template files increase attack surface and indicate weak deployment hygiene.

**Detect:** Search for default sample controllers, placeholder routes and scaffold artifacts.

**Evidence:** Build/source inventory.

**Remediation:** Remove artifacts and add CI checks for known template signatures.

**Regression test:** Production artifact scan returns no sample/template endpoints.

**False-fix traps:** Commenting out a route is weaker than removing the artifact from the production build.

**False positives:** Scaffold files present in source but excluded from every build artifact.

**Provenance:** SRC-002, SRC-003

**Version:** 2.0.0

## PLAT-008 — Vulnerable or end-of-life frameworks and dependencies are in use
**Domain:** Platform  
**Severity:** Medium–High  
**CWE:** CWE-1104, CWE-937  
**OWASP:** A06:2021 Vulnerable and Outdated Components

**Why it matters:** Known vulnerabilities and unsupported runtimes remain exploitable no matter how well the application code is written.

**Detect:** Inventory framework, runtime and package versions for server and client; check vendor support status and known-vulnerability data; include transitive and build-time dependencies and base images.

**Evidence:** Version, support status and the advisory or end-of-life notice, plus whether the vulnerable code is reachable.

**Remediation:** Upgrade or replace unsupported components, pin and scan dependencies in CI, and set an update policy with owners and deadlines.

**Regression test:** CI fails on known-vulnerable or end-of-life components above an agreed severity.

**False-fix traps:** Updating the direct dependency while a vulnerable transitive copy remains; suppressing the scanner finding without a reachability or backport justification.

**False positives:** Vulnerable packages that are present but unreachable and documented, or fixed by a vendor-confirmed backport.

**Provenance:** SRC-002, SRC-004

**Keywords:** dependency, outdated, end-of-life, SCA, framework version

**Version:** 2.0.0
