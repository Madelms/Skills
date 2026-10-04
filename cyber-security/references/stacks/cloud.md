# Cloud Stack Hints

## 1. Where to look
- Pipeline definitions and variable groups, deployment/release steps, token-replacement or config-transform tasks.
- Storage accounts/buckets and containers, access policies, signed-URL (SAS or equivalent) generation code.
- Secret store configuration, managed identity assignments, role assignments, gateway/WAF settings, app service settings.

## 2. Framework security controls (what 'correct' looks like)
- Storage private by default; no public container/bucket access; access via short-lived, narrowly scoped signed URLs issued after application authorization (FILE-004).
- Secrets live in a secret store referenced at runtime, not in repo files or plain pipeline variables (SECRET-001).
- Managed identities with least-privilege, resource-scoped roles; no subscription-wide contributor/owner for workloads.
- WAF in prevention mode in front of public endpoints; TLS enforced with current minimum version (DATA-003).
- Logging and diagnostic settings enabled without capturing secrets (LOG-001, DATA-001).

## 3. Enumerating operations (how to build the inventory for this framework, including how to resolve effective auth and detect IMPLICIT anonymous operations)
- Inventory every public entry point: app endpoints, API gateway routes, storage endpoints, function triggers, queues, admin consoles, health/diagnostic endpoints.
- Resolve effective access by combining: network exposure + platform authentication setting (for example built-in auth that allows unauthenticated requests) + gateway policy + application authorization.
- IMPLICIT anonymous: resources reachable without credentials because a platform auth option is set to allow anonymous, a container is public, or a signed URL is long-lived and widely scoped.
- Record the application operations behind each entry point and the data class they serve.

## 4. High-yield searches (grep terms)
- sas, shared access signature, expiry, permissions=, ExpiryTime, GenerateSasUri, presigned, publicAccess, ACL.
- blob/container public, allowBlobPublicAccess, AllowAnonymous at platform level, authLevel.
- Key vault references vs plain variable, secret in variables, ##{...}##/__token__ style placeholders.
- Token replacement, replacetokens, transform tasks, variable groups, environment-specific overrides.
- Managed identity, role assignment, Contributor, Owner, wildcard scopes.
- waf mode (Detection vs Prevention), minimum TLS version, httpsOnly.

## 5. Common bypasses and pitfalls
- Long-lived or write-capable signed URLs, account-level keys used where scoped delegation would do, signed URLs handed out without an ownership check (FILE-004, FILE-002).
- Public containers or listing enabled; storage keys exposed to the frontend.
- Pipeline token replacement injecting configuration: the deployed config may differ from source, including debug flags, environment name, URLs and keys. Source is evidence of intent; the effective deployed configuration needs verification (PLAT-005).
- Secrets as pipeline variables echoed in logs or written to artefacts.
- WAF in detection-only mode, or bypassed by direct origin access.
- Managed identity with excessive scope turns any app bug into broad cloud access.

## 6. Evidence to collect
- Role assignments with scope and role names; storage access level and policy settings.
- SAS/signed-URL generation code showing lifetime, permissions and caller checks.
- Pipeline steps that rewrite config and the variables they inject (names only, never values).
- Gateway/WAF mode and rule set; platform auth settings.

## 7. Common false positives
- Intentionally public static assets in a dedicated, content-reviewed container.
- Short-lived read-only signed URLs issued after an authorization check.
- Detection-mode WAF in non-production environments.
- Variables that hold non-secret settings.

## 8. Regression-test notes
- Post-deployment checks: anonymous request to storage and to each endpoint expects denial; verify effective config (environment name, debug off) against an approved baseline.
- Policy checks in CI for public storage, wildcard roles and plaintext secrets in variables.
- Test that signed URLs expire and cannot be used for other objects or write operations.
