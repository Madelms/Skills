# File and Storage Rules

## FILE-001 — Path traversal through a user-controlled path component
**Domain:** Files  
**Severity:** Critical–High  
**CWE:** CWE-22  
**OWASP:** A01:2021

**Why it matters:** Attackers can read or overwrite files outside the intended directory.

**Detect:** Trace filename/path input to filesystem APIs. Test traversal and alternate separators/encoding. Check canonical path containment.

**Evidence:** Path construction and authorization.

**Remediation:** Use opaque file IDs; canonicalize and enforce containment; reject unexpected path syntax.

**Regression test:** Traversal cannot escape the intended root.

**False-fix traps:** Checking for `..` alone is bypassable through encoding, separators or symlinks.

**Version:** 1.0.0

## FILE-002 — File download lacks object-level authorization
**Domain:** Files  
**Severity:** High  
**CWE:** CWE-639, CWE-862  
**OWASP:** API1:2023

**Why it matters:** A valid file identifier can expose another user's document.

**Detect:** Trace file ID to owner/tenant/parent and test cross-user access.

**Evidence:** File lookup and authorization path.

**Remediation:** Authorize the stored file record before opening bytes; avoid direct public paths.

**Regression test:** Cross-user file download returns 403/404 as designed.

**False-fix traps:** Authorization on the listing endpoint does not protect a direct download endpoint.

**Version:** 1.0.0

## FILE-003 — File upload permits unsafe content or storage
**Domain:** Files  
**Severity:** High  
**CWE:** CWE-434  
**OWASP:** A04:2021 Insecure Design

**Why it matters:** Uploaded content can become executable, persistent XSS or a malware delivery path.

**Detect:** Inspect extension/MIME/content validation, size limits, storage location, generated names and execution permissions.

**Evidence:** Upload validation and storage configuration.

**Remediation:** Allowlist file types, inspect content, generate names, store outside executable/public roots and scan where appropriate.

**Regression test:** Disallowed types, polyglots and oversized files fail.

**False-fix traps:** Client-side extension checks are not security controls.

**Version:** 1.0.0

## FILE-004 — Storage proxy or blob access bypasses application authorization
**Domain:** Files  
**Severity:** High  
**CWE:** CWE-639  
**OWASP:** API1:2023

**Why it matters:** A storage URL or proxy may expose objects independently of application permissions.

**Detect:** Trace object key generation, SAS/pre-signed URLs, container ACLs and proxy authorization.

**Evidence:** Storage policy and authorization before token/URL issuance.

**Remediation:** Private storage, short-lived scoped URLs and authorization against the stored object.

**Regression test:** Alter object keys and verify access remains denied.

**False-fix traps:** A private container is not sufficient if the proxy accepts arbitrary keys.

**Version:** 1.0.0

## FILE-005 — File listing endpoint returns content instead of metadata
**Domain:** Files  
**Severity:** High  
**CWE:** CWE-200  
**OWASP:** API3:2023

**Why it matters:** Broad listing operations can become bulk file exfiltration.

**Detect:** Check whether list/search endpoints return file bytes, base64 or sensitive content for many records.

**Evidence:** Response DTO and query shape.

**Remediation:** Return metadata only; fetch content through separately authorized, bounded operations.

**Regression test:** List response contains no file bytes and content retrieval requires object authorization.

**False-fix traps:** Pagination does not fix unauthorized content exposure.

**Version:** 1.0.0
