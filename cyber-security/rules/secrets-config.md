# Secrets and Configuration Rules

## SECRET-001 — Secret or credential committed to source/config
**Domain:** Secrets  
**Severity:** Critical–High  
**CWE:** CWE-798, CWE-321  
**OWASP:** A02:2021

**Why it matters:** Repository access becomes credential access and compromise persists through history.

**Detect:** Scan current files and history for passwords, private keys, connection strings, signing keys and access tokens.

**Evidence:** Exact file and secret type; never copy the secret into reports.

**Remediation:** Revoke/rotate, remove from history where required, and use a secret manager or protected runtime configuration.

**Regression test:** Secret scanning blocks new credentials and runtime startup requires secure configuration.

**False-fix traps:** Moving a value to another committed config file is not remediation; rotation matters.

**False positives:** Placeholders, example configuration, clearly test-scoped keys, and public identifiers that are not secrets.

**Chains with:** AUTHN-002, FILE-001

**Provenance:** SRC-001, SRC-002

**Version:** 2.0.0

## SECRET-002 — Frontend bundle exposes a credential or unrestricted API key
**Domain:** Secrets  
**Severity:** High–Medium  
**CWE:** CWE-798  
**OWASP:** A02:2021

**Why it matters:** Browser-delivered values are public and can be abused at scale.

**Detect:** Inspect built bundles and source maps as well as environment files. Classify whether the key is designed for public use and whether restrictions exist.

**Evidence:** Bundle reference and provider restrictions.

**Remediation:** Move privileged operations server-side; rotate exposed keys; restrict public keys by origin/API/quota.

**Regression test:** Build artifacts contain no privileged secrets and provider restrictions reject unauthorized use.

**False-fix traps:** Hiding a key in an environment variable still exposes it after bundling.

**False positives:** Keys designed for public use whose origin, API and quota restrictions are verified at the provider.

**Provenance:** SRC-001

**Version:** 2.0.0

## SECRET-003 — Runtime configuration exposes unnecessary internal topology
**Domain:** Configuration  
**Severity:** Low–Medium  
**CWE:** CWE-200  
**OWASP:** A05:2021

**Why it matters:** Public configuration can reveal internal endpoints, feature flags or deployment details useful for attack planning.

**Detect:** Inspect static config assets, deployment-generated files and client-readable settings.

**Evidence:** Public response/file and fields exposed.

**Remediation:** Keep only non-sensitive client configuration public; inject server-only values at runtime.

**Regression test:** Public config contains only approved keys and environment values.

**False-fix traps:** Removing a repo file is insufficient if the pipeline regenerates it with sensitive values.

**False positives:** Intentionally public client configuration with no security-relevant or internal values.

**Provenance:** SRC-001

**Version:** 2.0.0

## SECRET-004 — Environment flags enable insecure development shortcuts
**Domain:** Configuration  
**Severity:** High  
**CWE:** CWE-489  
**OWASP:** A05:2021

**Why it matters:** A deployment label or flag can activate hard-coded tokens, debug endpoints or bypasses.

**Detect:** Search environment branches for bypasses, mock tokens, debug auth and test-only credentials. Include server-side hosting and runtime configuration committed to the repository (hosting config files, launch profiles, container or orchestrator environment settings) that select a development or debug runtime mode.

**Evidence:** Branch condition and insecure branch. Also the file that selects the runtime mode and what is known about the effective mode on the deployed host.

**Remediation:** Remove security bypasses from production-capable code; isolate tests/mocks from deployable paths. Do not commit hosting configuration that selects a development mode; set the mode only in the deployment environment.

**Regression test:** Production-like build cannot activate a security bypass through configuration alone. The deployed host reports a non-development mode and development-only pages and errors are unavailable.

**False-fix traps:** Correcting the environment value while retaining the bypass code leaves a latent vulnerability. A committed hosting file that selects a development mode is a repository finding even if the deployed host is believed to override it; the deployed effect needs separate verification.

**False positives:** Debug features that are compiled out or absent from deployed artifacts; test-only code confined to test projects.

**Chains with:** PLAT-005

**Provenance:** SRC-001, SRC-002, SRC-004

**Version:** 2.0.0
