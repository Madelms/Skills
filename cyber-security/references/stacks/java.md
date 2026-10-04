# Java Stack Hints

## 1. Where to look
- Security configuration classes (SecurityFilterChain beans, legacy WebSecurityConfigurerAdapter), controllers, services, repositories.
- application*.yml/properties, actuator settings, profiles (spring.profiles.active), servlet filters and web.xml.
- JPA entities and DTOs, native queries, JDBC code, file APIs, XML/YAML/serialization code.

## 2. Framework security controls (what 'correct' looks like)
- A SecurityFilterChain ending with anyRequest().authenticated() (or denyAll) and an explicit permitAll allowlist (AUTHZ-006).
- Method security enabled (EnableMethodSecurity / EnableGlobalMethodSecurity) wherever @PreAuthorize/@Secured are relied on; otherwise they are silently inert (AUTHZ-001).
- Actuator limited to health, exposure list explicit, endpoints authenticated; no env/heapdump/beans for anonymous users (PLAT-001).
- DTOs for input and output; entities never bound or serialised directly (API-001, API-002).
- Parameterised JPQL/native queries and named parameters (INPUT-001).
- Safe XML parser factories and safe YAML loading (below).

## 3. Enumerating operations (how to build the inventory for this framework, including how to resolve effective auth and detect IMPLICIT anonymous operations)
- List all @RequestMapping/@GetMapping etc. (also JAX-RS, servlets, WebFlux router functions, actuator and framework endpoints).
- Resolve effective auth by combining: filter-chain rules (ordered; first match wins, so a broad permitAll above a narrow rule wins) + method annotations + class annotations. Check whether multiple chains exist with different securityMatchers.
- IMPLICIT anonymous: paths matched by permitAll patterns (wildcards), paths excluded by ignoring()/web security customisers, paths no chain matches, anyRequest() missing or permitAll.
- Check path-matching differences (trailing slash, suffix, case, matrix params) between the matcher and the mapping.
- Record ownership check, binding, response data class, consumers, anonymous justification.

## 4. High-yield searches (grep terms)
- anyRequest, permitAll, requestMatchers, antMatchers, mvcMatchers, ignoring(, csrf().disable, securityMatcher.
- EnableMethodSecurity, EnableGlobalMethodSecurity, PreAuthorize, Secured, RolesAllowed.
- management.endpoints, exposure.include, actuator, show-details.
- @RequestBody with entity classes, BeanUtils.copyProperties, setAllowedFields, ModelAttribute.
- createNativeQuery, nativeQuery = true, createQuery( with concatenation, Statement, JdbcTemplate with +.
- ObjectInputStream, readObject, enableDefaultTyping, DocumentBuilderFactory, SAXParserFactory, XMLInputFactory, TransformerFactory.
- new Yaml(, SnakeYAML, File(, Paths.get(, Runtime.exec, ProcessBuilder.

## 5. Common bypasses and pitfalls
- Method security annotations present but not enabled; annotations on private or self-invoked methods are not applied by proxies.
- Matcher order and wildcard mistakes; an ignoring() path skips all security filters.
- Entity binding allows changing id, owner, role or status fields; BeanUtils copying whole objects (API-001).
- ObjectInputStream or default typing on untrusted data (gadget chains).
- XML factories without disabling DTDs/external entities (XXE); SnakeYAML default constructor loading arbitrary types (use a safe constructor).
- Actuator endpoints exposing environment values, heap dumps or loggers.
- Profile selection via properties/environment variable enabling dev configuration or permissive security; report repo-config, deployed effect needs verification (PLAT-005).

## 6. Evidence to collect
- The full ordered filter-chain rules with file:line; presence of the method-security enablement annotation.
- Actuator exposure properties per profile.
- Entity class fields vs request binding; the exact query construction or parser factory configuration.

## 7. Common false positives
- permitAll on login, static assets, and health with no sensitive output.
- Native queries using bound parameters; constant SQL.
- ObjectInputStream over trusted, signed or internal-only data with a class filter.
- Disabled-by-default features whose enabling property is absent in every profile.

## 8. Regression-test notes
- MockMvc/WebTestClient tests per inventoried route with no credentials, wrong role and other-owner users.
- Test that an unmapped-by-rule path is denied and that actuator paths require authentication.
- Test extra privileged fields in bodies are ignored and XML with external entities is rejected.
