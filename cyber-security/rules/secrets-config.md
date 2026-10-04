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

**Version:** 1.0.0

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

**Version:** 1.0.0

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

**Version:** 1.0.0

## SECRET-004 — Environment flags enable insecure development shortcuts
**Domain:** Configuration  
**Severity:** High  
**CWE:** CWE-489  
**OWASP:** A05:2021

**Why it matters:** A deployment label or flag can activate hard-coded tokens, debug endpoints or bypasses.

**Detect:** Search environment branches for bypasses, mock tokens, debug auth and test-only credentials.

**Evidence:** Branch condition and insecure branch.

**Remediation:** Remove security bypasses from production-capable code; isolate tests/mocks from deployable paths.

**Regression test:** Production-like build cannot activate a security bypass through configuration alone.

**False-fix traps:** Correcting the environment value while retaining the bypass code leaves a latent vulnerability.

**Version:** 1.0.0
