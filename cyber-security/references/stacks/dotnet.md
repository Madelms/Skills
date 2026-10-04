# .NET Stack Hints

## 1. Where to look
- Program.cs / Startup.cs (middleware order, auth, CORS, exception handling, Swagger), Controllers/, minimal-API endpoint files, Filters/, Hubs/.
- appsettings*.json, web.config, Properties/launchSettings.json, publish profiles, pipeline steps that transform config.
- Services/Repositories/Helpers (ownership and permission helpers), AutoMapper profiles, DbContext, raw SQL call sites.
- Scaffold leftovers, Office/COM interop code, file and template handling code.

## 2. Framework security controls (what 'correct' looks like)
- UseAuthentication before UseAuthorization; a FallbackPolicy requiring an authenticated user so unannotated endpoints fail closed (AUTHZ-006).
- [AllowAnonymous] only on justified endpoints; policies/roles on controllers or actions; minimal APIs use RequireAuthorization per endpoint or group.
- JWT: TokenValidationParameters validates issuer, audience, lifetime and signing key; small ClockSkew; no custom handler skipping validation (AUTHN-002).
- Dedicated request/response DTOs; entities never bound or returned directly (API-001, API-002).
- EF queries parameterised: FromSqlInterpolated or explicit parameters, not string-built FromSqlRaw (INPUT-001).
- Production: UseExceptionHandler, no UseDeveloperExceptionPage, Swagger gated, CORS with explicit origins (PLAT-002, PLAT-003, LOG-002).

## 3. Enumerating operations (how to build the inventory for this framework, including how to resolve effective auth and detect IMPLICIT anonymous operations)
- List every controller action and minimal-API route (MapGet/MapPost/MapGroup), hubs, gRPC services, health checks, static/file endpoints.
- Resolve effective auth per action by combining: global default (FallbackPolicy / DefaultPolicy / global filters) + class attributes + action attributes. [AllowAnonymous] at either level overrides [Authorize] at the other; a class-level [AllowAnonymous] cannot be re-secured by an action-level [Authorize].
- DefaultPolicy applies only where [Authorize] exists; only FallbackPolicy covers endpoints with no authorization metadata. A controller with no attribute and no FallbackPolicy is IMPLICITLY anonymous.
- Minimal APIs: check RequireAuthorization/AllowAnonymous on the endpoint, its group and any app-wide convention.
- For each operation record: ownership check (where, against which identifier), binding source (route/query/body), response data class, consumers, anonymous justification.

## 4. High-yield searches (grep terms)
- AllowAnonymous, Authorize(, FallbackPolicy, DefaultPolicy, RequireAuthorization, MapGroup, AddPolicy.
- FromSqlRaw, ExecuteSqlRaw, SqlCommand, string concatenation near SELECT/EXEC.
- Path.Combine, File.ReadAllBytes, PhysicalFile, FileStream, Directory.GetFiles.
- ReverseMap, EntityState.Modified, Update(, TryUpdateModelAsync, entity types in [FromBody].
- UseDeveloperExceptionPage, UseSwagger, AllowAnyOrigin, AllowCredentials, UseExceptionHandler.
- TokenValidationParameters, ValidateIssuer, ValidateAudience, ValidateLifetime.
- new Random(, BinaryFormatter, TypeNameHandling, DtdProcessing, XmlResolver, Microsoft.Office, Interop.
- WeatherForecast, ASPNETCORE_ENVIRONMENT, IsDevelopment().

## 5. Common bypasses and pitfalls
- Ownership/permission helper that returns true for any principal that is not a tenant/regular user (AUTHZ-005); trace every caller.
- Path.Combine discards the base path when the second argument is rooted; route values decode encoded separators, so traversal survives routing (FILE-001). Use GetFullPath plus a base-prefix check.
- AutoMapper ReverseMap plus EntityState.Modified (or Update) writes the whole entity from client input, including privileged columns (API-001).
- Runtime mode is chosen by web.config, launchSettings.json, ASPNETCORE_ENVIRONMENT or environment variables. A committed hosting config that sets Development enables developer pages and dev shortcuts: report as repo-config; deployed effect needs verification (PLAT-005, SECRET-004).
- System.Random for OTP/reset codes (AUTHN-005, DATA-002); BinaryFormatter or TypeNameHandling other than None on untrusted data.
- XmlReader/XmlDocument with DtdProcessing enabled or a resolver set (XXE).
- Office/COM interop on servers (unsupported, process leaks, content-borne attacks); a shared template file edited in place per request (race conditions, cross-user data leakage).
- Scaffold WeatherForecast artifacts left in production (PLAT-007).

## 6. Evidence to collect
- Attributes at each level plus the fallback/default policy lines, with file:line.
- Helper body and every call site; mapping profile and the save call; exact sink expression for path/SQL.
- Hosting config values (environment name, transforms), which file wins, and any pipeline override.

## 7. Common false positives
- [AllowAnonymous] on login, token refresh, health probes, or public metadata carrying no sensitive data.
- FromSqlRaw with constant SQL or properly parameterised arguments.
- Development-only settings behind a real environment check and absent from deployed config.
- Path.Combine on server-generated names with no user segment.

## 8. Regression-test notes
- WebApplicationFactory integration tests: unauthenticated, wrong-role and other-owner requests expect 401/403/404 for every inventoried operation.
- Test that an unannotated route returns 401 and diff the endpoint list against an approved anonymous allowlist.
- Test that encoded-separator and rooted-path inputs are rejected and that extra privileged fields in a body are ignored.
