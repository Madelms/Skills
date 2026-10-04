# Database Rules

## DB-001 — Database identity has excessive privileges
**Domain:** Database  
**Severity:** High  
**CWE:** CWE-250  
**OWASP:** A05:2021

**Why it matters:** SQL injection or application compromise gains unnecessary database control.

**Detect:** Inspect connection identities, grants and stored-procedure permissions.

**Evidence:** Effective DB privileges.

**Remediation:** Least-privilege application identities and separate migration/admin credentials.

**Regression test:** Application identity cannot perform administrative operations it does not need.

**False-fix traps:** Application-level authorization does not replace database least privilege.

**False positives:** Elevated identities used only by migration pipelines and not present at runtime.

**Provenance:** SRC-002, SRC-003

**Version:** 2.0.0

## DB-002 — Dynamic SQL or unsafe stored-procedure construction uses untrusted input
**Domain:** Database  
**Severity:** Critical–High  
**CWE:** CWE-89  
**OWASP:** A03:2021

**Why it matters:** Stored procedures can be injectable when they concatenate input into executable SQL.

**Detect:** Inspect procedure definitions, ORM raw SQL and string-built filters/order clauses.

**Evidence:** Procedure/query construction and parameter usage.

**Remediation:** Parameterize values; allowlist identifiers/order fields; avoid executing concatenated SQL.

**Regression test:** Injection payloads remain inert through the full API-to-DB path.

**False-fix traps:** A parameterized outer call does not make an internally concatenated procedure safe.

**False positives:** Dynamic SQL that interpolates only allow-listed identifiers and binds all values as parameters.

**Provenance:** SRC-001, SRC-002

**Version:** 2.0.0

## DB-003 — Authorization is lost in a lower data-access layer
**Domain:** Database  
**Severity:** High  
**CWE:** CWE-639, CWE-862  
**OWASP:** API1:2023

**Why it matters:** A secure controller can call a repository/procedure that accepts arbitrary IDs.

**Detect:** Trace authorization target through repository queries and stored procedures; inspect whether tenant/owner predicates are mandatory. Check that the tenant or owner predicate is a mandatory input of every data-access method, not an optional filter the caller may omit.

**Evidence:** Final SQL/procedure parameters and predicates.

**Remediation:** Keep authorization close to the resource decision and constrain data access with trusted context where practical. Make the tenant/owner predicate a required parameter, or enforce it with row-level security or a global query filter, so callers cannot omit it.

**Regression test:** Alternate entry points cannot bypass the ownership/tenant predicate. Calling the data-access layer with another tenant's identifier returns nothing or fails.

**False-fix traps:** Controller-only checks fail when another route calls the same lower layer.

**False positives:** Internal data-access methods reachable only through an already-authorised, tenant-scoped path that carries the trusted context.

**Provenance:** SRC-001, SRC-003, SRC-004

**Version:** 2.0.0
