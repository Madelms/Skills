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

**False positives:** Server-generated opaque identifiers mapped to paths server-side; paths built only from constants.

**Chains with:** SECRET-001, AUTHN-002

**Provenance:** SRC-001

**Version:** 2.0.0

## FILE-002 — File download lacks object-level authorization
**Domain:** Files  
**Severity:** High  
**CWE:** CWE-639, CWE-862  
**OWASP:** API1:2023

**Why it matters:** A valid file identifier can expose another user's document.

**Detect:** Trace file ID to owner/tenant/parent and test cross-user access. Treat unguessable identifiers and file URLs as secrets that other operations may disclose (listings, detail views, expanded queries): check whether any other endpoint returns the identifier and whether the download works without credentials.

**Evidence:** File lookup and authorization path.

**Remediation:** Authorize the stored file record before opening bytes; avoid direct public paths. Do not rely on unguessable names: authorise every download against the stored record, and rotate identifiers that have been exposed.

**Regression test:** Cross-user file download returns 403/404 as designed.

**False-fix traps:** Authorization on the listing endpoint does not protect a direct download endpoint. A random identifier is not authorization; once any endpoint discloses it, the file is public if the download is unauthenticated.

**False positives:** Intentionally public assets that carry no sensitive content and are served from a separate public location.

**Chains with:** AUTHZ-002, API-002, FILE-005

**Provenance:** SRC-001, SRC-006

**Version:** 2.1.0

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

**False positives:** Uploads stored in non-executable, non-public storage with generated names and content-type re-validation.

**Provenance:** SRC-002, SRC-003

**Version:** 2.0.0

## FILE-004 — Storage proxy or blob access bypasses application authorization
**Domain:** Files  
**Severity:** High  
**CWE:** CWE-639  
**OWASP:** API1:2023

**Why it matters:** A storage URL or proxy may expose objects independently of application permissions.

**Detect:** Trace object key generation, SAS/pre-signed URLs, container ACLs and proxy authorization. Trace caller-supplied file names or URL-shaped values into storage SDK calls and URI builders, and check what the caller sees on failure: raw provider exceptions or response headers reveal the backend and invite further probing.

**Evidence:** Storage policy and authorization before token/URL issuance.

**Remediation:** Private storage, short-lived scoped URLs and authorization against the stored object. Accept opaque identifiers, resolve them server-side, return a stable generic error and strip provider headers from any forwarded response.

**Regression test:** Alter object keys and verify access remains denied. Malformed, URL-shaped and out-of-range names return a generic error with no provider text or headers.

**False-fix traps:** A private container is not sufficient if the proxy accepts arbitrary keys.

**False positives:** Pre-signed URLs that are short-lived, scoped to one object and issued only after an authorisation check.

**Provenance:** SRC-001, SRC-005

**Version:** 2.1.0

## FILE-005 — File listing endpoint returns content instead of metadata
**Domain:** Files  
**Severity:** High  
**CWE:** CWE-200  
**OWASP:** API3:2023

**Why it matters:** Broad listing operations can become bulk file exfiltration.

**Detect:** Check whether list/search endpoints return file bytes, base64 or sensitive content for many records. Check anonymous and implicit-anonymous list/search operations first: an unauthenticated operation that returns file content is bulk exfiltration. Use the inventory's response data class to find them, and check whether a frontend consumer depends on the content being in the listing.

**Evidence:** Response DTO and query shape.

**Remediation:** Return metadata only; fetch content through separately authorized, bounded operations. Change the backend and the consuming frontend together: the client then fetches content through a separate, authorised download by identifier.

**Regression test:** List response contains no file bytes and content retrieval requires object authorization. Anonymous callers receive 401/403 on content-bearing listings.

**False-fix traps:** Pagination does not fix unauthorized content exposure.

**False positives:** Listings that return only metadata (name, size, hash, identifier) or small public icons by design.

**Chains with:** AUTHZ-006

**Provenance:** SRC-001, SRC-004

**Version:** 2.0.0

## FILE-006 — A shared server-side file or template is modified per request
**Domain:** Files  
**Severity:** Medium–High  
**CWE:** CWE-362, CWE-668  
**OWASP:** A04:2021 Insecure Design

**Why it matters:** Writing request or tenant data into a file shared by all requests leaks one caller's data to another, corrupts output under concurrency and can persist the data.

**Detect:** Find document, report or template generation that opens, edits or saves a shared master file; fixed temporary file names; shared caches or working directories written inside request handlers; and update operations on a shared template record that also receive tenant data.

**Evidence:** File path, the write operation and any locking or per-request copy.

**Remediation:** Generate from a read-only template into a unique per-request private location or in memory, delete the temporary artifact, and never write tenant data back into the shared template.

**Regression test:** Two concurrent requests for different tenants produce independent outputs and the shared file is byte-identical afterwards.

**False-fix traps:** A lock around the shared file serialises requests but still writes one tenant's data where the next request reads it.

**False positives:** Shared files that are read-only at request time; per-request work done on a unique private copy that is cleaned up.

**Chains with:** FILE-002

**Provenance:** SRC-001, SRC-004

**Keywords:** shared file, template, concurrency, cross-tenant, temp file

**Version:** 2.0.0
