# SQL Stack Hints

## 1. Where to look
- Stored procedures, functions, views, triggers, scheduled jobs, migration scripts, seed data.
- Login/user/role grants, schema permissions, application connection identity.
- Audit, log and history tables; export/reporting procedures; password and credential columns.

## 2. Framework security controls (what 'correct' looks like)
- Procedures take typed parameters and use static SQL; where dynamic SQL is unavoidable it uses sp_executesql with bound parameters and QUOTENAME for identifiers (DB-002, INPUT-001).
- The application identity has only the needed object-level grants (execute on specific procedures, no db_owner/sysadmin) (DB-001).
- Every procedure that returns or changes tenant/owner data enforces the tenant/owner predicate itself; do not rely on the caller (DB-003).
- Passwords stored as salted slow hashes, compared in the application or with a case-sensitive, binary-safe comparison (AUTHN-003, DATA-002).
- Audit/log tables do not copy sensitive columns in plaintext (DATA-001).

## 3. Enumerating operations (how to build the inventory for this framework, including how to resolve effective auth and detect IMPLICIT anonymous operations)
- List every procedure/function the application can call (from app code and from grants). Map each to the API operation that invokes it.
- A procedure has no authentication of its own: effective auth is the calling endpoint's. Flag procedures called by anonymous endpoints, and procedures that accept an identity or tenant parameter from the client instead of deriving it.
- Check EXECUTE grants and ownership chaining: a procedure may reach tables the caller cannot, so its internal predicates are the only control.
- Record parameters that identify owner/tenant, the predicate applied, columns returned (data class), consumers.

## 4. High-yield searches (grep terms)
- EXEC(@, EXEC (@, sp_executesql, concatenation with + near @ parameters, EXECUTE(.
- ORDER BY with @ variable, dynamic column or table names, QUOTENAME absence.
- Password, Pwd, Salt, OTP columns; comparisons like WHERE Password = @.
- GRANT, db_owner, sysadmin, EXECUTE AS, WITH GRANT OPTION, TRUSTWORTHY.
- INSERT INTO ...Log/Audit/History selecting password or token columns; triggers copying rows.
- xp_cmdshell, OPENROWSET, OPENQUERY, BULK INSERT, CLR assemblies.
- SELECT * returned from procedures backing public endpoints.
- `EXEC (@sql)`, `sp_executesql` with concatenated strings, and caller code that builds `EXEC procName ...` text by concatenation.
- Application-login privileges: `IS_MEMBER`, `sys.database_role_members`, `HAS_PERMS_BY_NAME`, mapping to `dbo`.

## 5. Common bypasses and pitfalls
- Dynamic SQL built by concatenating parameters, including search filters, ORDER BY direction or column names, and table names; ORDER BY cannot be parameterised so it needs an allowlist.
- A default case-insensitive collation makes password or token comparison case-insensitive, weakening secrets; plaintext password columns are worse (AUTHN-003).
- Procedures accepting an ID and returning the row without checking tenant/owner (DB-003, AUTHZ-002); tenant predicates must be mandatory, not optional parameters defaulting to NULL.
- Optional filters written as OR @p IS NULL that return all rows when the client omits the value.
- Over-privileged connection identity, so any injection becomes full compromise (DB-001).
- Audit/log tables copying sensitive columns or whole rows including secrets (DATA-001).
- Type-conversion and syntax errors that echo values to the client turn an injection into a fast read channel.
- A managed platform that blocks dangerous procedures is defence in depth, not a fix: read and write on every table remains.
- Write access to a role or permission table through an injection is a database-level privilege escalation that bypasses every application check.

## 6. Evidence to collect
- Procedure text with the dynamic statement and how each variable reaches it.
- Grant listing for the application identity; collation of relevant columns/database.
- Column definitions for password/secret fields; trigger or audit insert statements.
- The calling endpoint(s) for each procedure.

## 7. Common false positives
- sp_executesql with fully parameterised values and QUOTENAME/allowlisted identifiers.
- Dynamic SQL built only from constants or internal-only inputs in maintenance scripts not callable by the application.
- Administrative scripts under restricted DBA roles, not reachable from the application identity.

## 8. Regression-test notes
- Procedure-level tests with other-tenant IDs expecting no rows; tests with quote/comment characters in every string and sort parameter expecting safe handling.
- Grant-drift check comparing the application identity's permissions to an approved list.
- Test that password comparison is case-sensitive and that hashes (not plaintext) are stored.
