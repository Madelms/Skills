# Node.js Stack Hints

## 1. Where to look
- Entry file (middleware order, routers, default/catch-all route, error handler), routes/, controllers/, middleware/.
- Models/ORM schemas (Sequelize, Mongoose, Prisma, TypeORM), file handling, child_process usage.
- Config modules, env handling, package.json scripts, NODE_ENV usage, lockfile.

## 2. Framework security controls (what 'correct' looks like)
- Authentication middleware registered before the routers it protects; registration order is security-relevant (AUTHN-001).
- Either an app-level default-deny guard with an explicit public allowlist, or a guard on every router; route-level guards on a subset leave siblings open (AUTHZ-003, AUTHZ-006).
- Bodies validated by schema and mapped field by field into models (API-001).
- jwt.verify with an explicit algorithms list, issuer and audience; never decode-only trust (AUTHN-002).
- Secure headers, explicit CORS origins, rate limiting on auth routes, central error handler hiding stack traces (PLAT-003, PLAT-004, AUTHN-006, LOG-002).
- trust proxy set deliberately to the real proxy hop count.

## 3. Enumerating operations (how to build the inventory for this framework, including how to resolve effective auth and detect IMPLICIT anonymous operations)
- Enumerate app.use/app.METHOD/router.* registrations, mounted prefixes and dynamically loaded route files; dump the route table where possible (Express router stack, Fastify printRoutes, Nest controllers).
- Resolve effective auth from registration order: a guard covers only routes mounted after it; per-route middleware arrays must be read individually.
- IMPLICIT anonymous: routes registered before the auth middleware, separately mounted apps/prefixes, static directories, the default/catch-all route, websocket handlers, health/debug routes.
- Nest: global guards vs controller/handler decorators and any Public decorator.
- Record ownership check, param/query/body use, response fields, consumers, anonymous justification.

## 4. High-yield searches (grep terms)
- app.use(, router.use(, app.all(, express.static, passport.authenticate, requireAuth.
- ...req.body, Object.assign(, findByIdAndUpdate(, update(req.body.
- path.join(, path.resolve(, sendFile, createReadStream, readFile with request-derived input.
- child_process, exec(, execSync, spawn( with shell, eval(, new Function(.
- jwt.verify, jwt.decode, algorithms, ignoreExpiration, fallback secret values.
- merge(, extend(, defaultsDeep, __proto__, constructor.prototype.
- trust proxy, cors(, origin: true, helmet.
- $where, sequelize.query, $queryRaw, template-string SQL.

## 5. Common bypasses and pitfalls
- path.join/resolve with user input does not prevent traversal; resolve then verify the base prefix (FILE-001).
- Spreading req.body into an ORM model lets clients set role, owner, status fields (API-001, API-003).
- Prototype pollution via recursive merge of user JSON can flip authorization flags.
- jwt.verify without an algorithms restriction, or a default-secret fallback.
- Middleware mounted after the router; async handler errors that skip authentication.
- trust proxy set too permissively makes client-IP headers spoofable and defeats rate limits.
- NoSQL operator injection when body objects reach query filters.
- exec with concatenated strings; spawn with shell enabled.

## 6. Evidence to collect
- Registration order with file:line for the guard and the affected router.
- The ORM write call showing spread input, plus the schema's writable fields.
- jwt.verify options; the exact path or command construction.

## 7. Common false positives
- Intentionally public routes mounted before auth (login, health) returning minimal data.
- req.body spread after a strict schema whitelist, or onto a DTO rather than a model.
- path.join with server-generated identifiers only.
- Dev/test scripts not packaged for deployment.

## 8. Regression-test notes
- HTTP-level test suites: every inventoried route unauthenticated, wrong-role and other-owner; expect denial.
- Snapshot the route table against an approved anonymous allowlist.
- Tests for extra privileged body fields ignored, traversal strings rejected, and polluted input having no effect.
