# React Stack Hints

## 1. Where to look
- src/ API client modules (axios/fetch wrappers), hooks and stores, router configuration, components rendering rich text.
- .env*, REACT_APP_*, VITE_*, NEXT_PUBLIC_* usage, bundler/framework config, build output and source maps.
- Auth context/providers, token storage, protected-route wrappers.

## 2. Framework security controls (what 'correct' looks like)
- JSX escapes by default; dangerouslySetInnerHTML only with sanitised, trusted content (INPUT-002).
- URLs from data validated against an allowlist of schemes before use in href/src (javascript: and data: URLs are script sinks).
- Router guards and conditional rendering are UX only; the server enforces authorization (FE-001).
- Only non-secret values in REACT_APP_*, VITE_*, NEXT_PUBLIC_*: they are inlined into the public bundle (SECRET-002, FE-003).
- Tokens in HttpOnly cookies where possible; client storage justified (FE-002).
- Server-side code (route handlers, server actions) is an API surface and is authorised like any endpoint.

## 3. Enumerating operations (how to build the inventory for this framework, including how to resolve effective auth and detect IMPLICIT anonymous operations)
- Build the consumer map from API client modules: each exported function maps to a server operation, then to the components and routes using it.
- Join with the server inventory: an anonymous or weakly authorised endpoint reached only from authenticated/admin screens is over-exposed.
- For Next.js-style frameworks, enumerate app/ and pages/api route files and server actions. Middleware matchers define coverage; any route outside the matcher is IMPLICITLY unauthenticated unless handler code checks.
- Record guard presence but never count it as authorization.

## 4. High-yield searches (grep terms)
- dangerouslySetInnerHTML, innerHTML, insertAdjacentHTML, document.write, DOMPurify.
- href={, src={, location.href, window.open( with data-derived values.
- REACT_APP_, VITE_, NEXT_PUBLIC_, process.env, import.meta.env.
- localStorage, sessionStorage, Authorization, axios.create, interceptors, fetch(.
- ProtectedRoute, RequireAuth, useAuth, middleware, matcher, "use server".
- GENERATE_SOURCEMAP, sourcemap, productionBrowserSourceMaps.

## 5. Common bypasses and pitfalls
- Rich text from the API rendered through dangerouslySetInnerHTML without sanitisation, especially in admin views (stored XSS).
- href/src built from user or stored data accepting javascript: URLs.
- Secrets placed in public-prefixed variables; published source maps exposing original code and embedded keys.
- Client-only role checks (isAdmin from local state or a decoded token) deciding what is shown or sent (BIZ-003).
- Interceptor attaching credentials to arbitrary URLs.
- Server components/actions assumed private but directly callable.

## 6. Evidence to collect
- Sink line and the data source feeding it; sanitiser configuration if any.
- Build-artefact search results for secrets; which env vars are inlined.
- Source-map presence in the deployed artefact (if verifiable) versus repo config.
- Consumer-map rows: client function, server operation, component, route.

## 7. Common false positives
- dangerouslySetInnerHTML with constants or content sanitised by a maintained sanitiser.
- Public client identifiers (analytics, restricted keys) in public env vars.
- Router guards used only for navigation, with server enforcement confirmed.

## 8. Regression-test notes
- Component tests with markup and script-scheme URL fixtures confirming neutralisation.
- CI step scanning build output for secret patterns and unexpected source maps.
- Lint rule restricting dangerouslySetInnerHTML; API-level negative authorization tests for each consumed endpoint.
