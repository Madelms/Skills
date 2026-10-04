# Rule Index

| ID | Title | Domain | Severity | Keywords |
|---|---|---|---|---|
| AUTHN-001 | Authentication is bypassable or absent on a protected operation | Authentication | Critical–High | anonymous, auth bypass, protected route |
| AUTHN-002 | Token validation is incomplete | Authentication | Critical–High | JWT, issuer, audience, signature, expiry |
| AUTHN-003 | Passwords are stored or handled in plaintext | Authentication | Critical | password, plaintext, credential |
| AUTHN-004 | Password reset or recovery reveals account state or credentials | Authentication | High–Medium | reset, enumeration, recovery |
| AUTHN-005 | OTP or verification code can be guessed, replayed or abused | Authentication | High–Medium | OTP, verification, replay |
| AUTHN-006 | Authentication endpoint lacks brute-force and abuse controls | Authentication | Medium–High | rate limit, lockout, credential stuffing |
| AUTHZ-001 | Protected operation lacks effective authorization | Authorization | High–Critical | role, policy, authorization |
| AUTHZ-002 | Broken object-level authorization / IDOR | Authorization | High–Critical | BOLA, IDOR, object ID |
| AUTHZ-003 | Function-level authorization is inconsistent across sibling endpoints | Authorization | High | sibling route, verb, delete |
| AUTHZ-004 | Ownership is checked against a client-supplied identifier | Authorization | High | owner ID, parent ID, BOLA |
| AUTHZ-005 | Authorization helper is broader than intended | Authorization | High | helper, tenant, admin |
| AUTHZ-006 | Default authorization policy is fail-open | Authorization | High | fallback, default deny |
| API-001 | Mass assignment binds client input to a privileged entity | API | High–Critical | mass assignment, DTO, entity |
| API-002 | Sensitive fields are exposed in API responses | API | Critical–Medium | password, PII, DTO, serialization |
| API-003 | Client controls security-sensitive workflow state | API | High | status, stage, approval |
| API-004 | API lacks an authoritative endpoint inventory and negative authorization tests | API | Medium–High | route inventory, regression |
| INPUT-001 | Injection sink receives untrusted input | Input Validation | Critical–High | SQL, command, LDAP, injection |
| INPUT-002 | Untrusted input reaches an unsafe HTML/JavaScript sink | Input Validation | High–Critical | XSS, DOM, HTML |
| INPUT-003 | Server-side request forgery or unsafe outbound URL handling | Input Validation | High | SSRF, webhook, URL |
| FILE-001 | Path traversal through a user-controlled path component | Files | Critical–High | traversal, filesystem, path |
| FILE-002 | File download lacks object-level authorization | Files | High | download, file ID, ownership |
| FILE-003 | File upload permits unsafe content or storage | Files | High | upload, MIME, executable |
| FILE-004 | Storage proxy or blob access bypasses application authorization | Files | High | blob, object key, SAS |
| FILE-005 | File listing endpoint returns content instead of metadata | Files | High | listing, bulk disclosure |
| SECRET-001 | Secret or credential committed to source/config | Secrets | Critical–High | password, key, connection string |
| SECRET-002 | Frontend bundle exposes a credential or unrestricted API key | Secrets | High–Medium | bundle, API key, frontend |
| SECRET-003 | Runtime configuration exposes unnecessary internal topology | Configuration | Low–Medium | config, topology, public |
| SECRET-004 | Environment flags enable insecure development shortcuts | Configuration | High | debug, dev shortcut, hard-coded token |
| DATA-001 | Sensitive data is logged, audited or emailed in plaintext | Data Protection | Critical–High | logs, audit, email |
| DATA-002 | Cryptography uses weak, reversible or misconfigured protection | Data Protection | High–Medium | crypto, encryption, keys |
| DATA-003 | Transport security is not enforced for sensitive communication | Data Protection | High–Medium | TLS, HTTPS, certificate |
| DB-001 | Database identity has excessive privileges | Database | High | least privilege, grants |
| DB-002 | Dynamic SQL or unsafe stored-procedure construction uses untrusted input | Database | Critical–High | SQL, stored procedure |
| DB-003 | Authorization is lost in a lower data-access layer | Database | High | repository, stored procedure, tenant |
| FE-001 | Client-side security check is treated as authoritative | Frontend | High | Angular, React, guard |
| FE-002 | Sensitive token storage exposes credentials to script compromise | Frontend | High–Medium | localStorage, cookie, token |
| FE-003 | Frontend build exposes privileged configuration or secrets | Frontend | High–Medium | bundle, environment |
| BIZ-001 | Sensitive workflow transition lacks server-side authorization | Business Logic | High | workflow, transition, approval |
| BIZ-002 | Business-critical setting can be changed without proper authorization | Business Logic | High | settings, admin |
| BIZ-003 | Security decision depends on attacker-controlled client state | Business Logic | High | isAdmin, eligibility, price |
| LOG-001 | Security-relevant failures are not auditable | Logging | Medium | audit, monitoring |
| LOG-002 | Error handling leaks sensitive implementation details | Logging | Medium–Low | stack trace, error |
| LOG-003 | Logs or audit records are vulnerable to injection or tampering | Logging | Medium | log injection, audit |
| PLAT-001 | Debug, diagnostic or sample endpoint is exposed | Platform | High–Informational | debug, diagnostic, sample |
| PLAT-002 | API documentation is unnecessarily exposed or overly permissive | Platform | Medium–Low | Swagger, OpenAPI |
| PLAT-003 | CORS policy is broader than required | Platform | Medium–High | CORS, origins |
| PLAT-004 | Security headers and browser protections are missing or inconsistent | Platform | Low–Medium | CSP, HSTS, headers |
| PLAT-005 | Deployment configuration differs materially from source without verification | Platform | High–Medium | pipeline, runtime config |
| PLAT-006 | TLS/certificate validation is disabled or weakened | Platform | High | certificate, TLS |
| PLAT-007 | Production contains framework/template artifacts | Platform | Informational–Low | WeatherForecast, scaffold |
