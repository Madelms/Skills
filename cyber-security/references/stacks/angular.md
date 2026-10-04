# Angular Stack Hints

## 1. Where to look
- src/environments/*.ts, src/assets/config*.json (runtime config), angular.json (fileReplacements, sourceMap, optimization).
- app.module.ts / app.config.ts, HTTP interceptors, auth/token services, route guards, routing modules.
- Services calling the backend (source of the consumer map), components using innerHTML, iframes and anchors.
- Build output and source maps, if part of the deployable.

## 2. Framework security controls (what 'correct' looks like)
- Template bindings are sanitised by default; bypassSecurityTrust* is a deliberate exception that must receive only trusted constants (INPUT-002).
- Guards and role-based UI hiding are usability only; the server enforces every rule (FE-001).
- Interceptors attach credentials only to the application's own API origin, never to arbitrary URLs.
- Tokens preferably in HttpOnly cookies; script-readable storage requires a minimal XSS surface (FE-002).
- Nothing secret in environment*.ts, assets config JSON, app.module or bundles: all are public (SECRET-002, FE-003).

## 3. Enumerating operations (how to build the inventory for this framework, including how to resolve effective auth and detect IMPLICIT anonymous operations)
- Angular defines no server operations. Build the consumer map by tracing each service file's HTTP calls to server operations, then to the components and routes that use them.
- Join with the server inventory: an anonymous endpoint called only from an admin or authenticated UI is over-exposed (AUTHN-001, AUTHZ-001); an endpoint with no UI consumer is a removal candidate or a hidden sensitive operation.
- Record which routes have guards, noting that a guarded screen says nothing about the server's effective authorization.
- Record the response data class each call renders and compare with the server DTO.

## 4. High-yield searches (grep terms)
- bypassSecurityTrustHtml, bypassSecurityTrustUrl, bypassSecurityTrustResourceUrl, bypassSecurityTrustScript, bypassSecurityTrustStyle.
- [innerHTML], outerHTML, document.write, nativeElement.innerHTML, iframe [src], anchor [href] bound to data.
- localStorage, sessionStorage, setItem(, Authorization, HttpInterceptor.
- environment.production, isDevMode, apiKey, secret, password, Bearer.
- canActivate, CanActivateFn, assets/config, APP_INITIALIZER, sourceMap.

## 5. Common bypasses and pitfalls
- Sanitiser bypass applied to server- or user-supplied HTML/URLs; iframe [src] or anchor href bound to stored data enables script-scheme or phishing URLs.
- Privileged (admin) UIs rendering stored data written by lower-privileged users: stored XSS escalates to admin compromise.
- A dev-only branch keyed on an environment flag that injects a hard-coded token or user; the flag may be flipped by config or the bundle may ship both branches (SECRET-004).
- environment*.ts and assets config JSON are both public; keys or internal topology there are disclosed, and unrestricted API keys are reportable (SECRET-002, SECRET-003).
- Keys left in app.module, bundles or published source maps.
- Interceptor that adds the token to any URL, or scopes URLs by substring match.
- Guards that decode the token client-side to decide roles.

## 6. Evidence to collect
- Sink binding and the origin of the bound value (service call and server field).
- Config files actually included in the build output; fileReplacements per configuration.
- Interceptor URL-scoping logic and token storage calls.
- Consumer-map row: service method, server operation, component, route, guard.

## 7. Common false positives
- bypassSecurityTrust* on compile-time constants or developer-authored static markup.
- Public, restriction-scoped keys intended for browsers, with restrictions confirmed.
- Public identifiers or base paths exposing no sensitive topology.
- [innerHTML] receiving content that Angular sanitises and that is not bypassed.

## 8. Regression-test notes
- Unit-test that malicious markup in each rendered field is neutralised, especially in privileged views.
- Lint or CI grep failing on new bypassSecurityTrust* usage without review.
- Build check that output contains no secrets and production builds omit source maps.
- Prove authorization with server-side tests, not UI tests.
