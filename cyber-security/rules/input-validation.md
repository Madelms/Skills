# Input Validation Rules

## INPUT-001 — Injection sink receives untrusted input
**Domain:** Input Validation  
**Severity:** Critical–High  
**CWE:** CWE-89, CWE-78, CWE-90, CWE-943  
**OWASP:** A03:2021 Injection

**Why it matters:** SQL, NoSQL, command, LDAP, expression-language and similar injection can cross trust boundaries.

**Detect:** Trace untrusted input to string-built queries, commands, interpreters or expression evaluators. Include NoSQL query or operator objects built from request bodies, LDAP filters, template or expression engines, and ORM raw-SQL fragments or dynamic filter/order clauses.

**Evidence:** Sink and missing parameterization/encoding.

**Remediation:** Parameterized APIs, safe builders and allowlists; avoid string concatenation into executable syntax.

**Regression test:** Injection payloads remain data and cannot alter query/command semantics. Operator-object and filter-syntax payloads sent to document-store and directory queries remain plain data.

**False-fix traps:** Input validation alone is weaker than parameterization at the sink.

**False positives:** Values bound as parameters; identifiers chosen from a fixed server-side allow-list; ORM query builders with no raw fragments.

**Provenance:** SRC-002, SRC-003, SRC-004

**Version:** 2.0.0

## INPUT-002 — Untrusted input reaches an unsafe HTML/JavaScript sink
**Domain:** Input Validation  
**Severity:** High–Critical  
**CWE:** CWE-79  
**OWASP:** A03:2021 Injection

**Why it matters:** Stored/reflected XSS can execute with another user's privileges.

**Detect:** Trace user input into raw HTML, DOM APIs, templates, unsafe URL bindings or HTML rendering libraries. Treat framework sanitizer-bypass APIs (the "trust this value" helpers) and URL-bearing attributes (frame/embed/object source, link targets, form actions, media sources) as sinks, including when the value was stored earlier by another actor.

**Evidence:** Source and sink plus context.

**Remediation:** Contextual output encoding, safe framework bindings and sanitization only where raw HTML is genuinely required.

**Regression test:** Script payloads render inert in every output context. Stored values containing script-scheme URLs or foreign hosts render inert in every privileged view that displays them.

**False-fix traps:** Encoding for HTML is not equivalent to JavaScript or URL-context encoding. Calling a sanitizer-bypass API on data that was merely "checked" at input time is still a sink; validate scheme and host at write time and avoid the bypass where possible (see INPUT-006).

**False positives:** Framework auto-encoding bindings with no raw-HTML or sanitizer-bypass call; bypass applied only to constant server-authored markup.

**Chains with:** API-001, FE-001, INPUT-006

**Provenance:** SRC-002, SRC-003, SRC-004

**Version:** 2.0.0

## INPUT-003 — Server-side request forgery or unsafe outbound URL handling
**Domain:** Input Validation  
**Severity:** High  
**CWE:** CWE-918  
**OWASP:** A10:2021 SSRF

**Why it matters:** Attackers may make the server access internal services or cloud metadata.

**Detect:** Find HTTP clients using user-controlled URLs, redirects or webhooks; inspect DNS/IP validation.

**Evidence:** URL source, sink and network controls.

**Remediation:** Prefer allowlists of destinations; validate resolved addresses, schemes and redirects; isolate outbound networking.

**Regression test:** Internal/private/link-local addresses and unexpected schemes are rejected.

**False-fix traps:** Blocking one hostname does not prevent DNS rebinding or alternate IP representations.

**False positives:** Outbound calls to fixed, server-configured destinations where the caller cannot influence host, scheme or redirect target.

**Provenance:** SRC-002, SRC-003

**Version:** 2.0.0

## INPUT-004 — Untrusted data reaches an unsafe deserializer
**Domain:** Input Validation  
**Severity:** Critical–High  
**CWE:** CWE-502  
**OWASP:** A08:2021 Software and Data Integrity Failures

**Why it matters:** Native or type-aware deserializers can instantiate attacker-chosen types and run code or alter logic.

**Detect:** Find native object serializers, polymorphic type-name handling driven by the payload, unsafe YAML/object loaders, and message or cache consumers that deserialize data an attacker can influence.

**Evidence:** Deserializer call, the type-resolution settings and the origin of the data.

**Remediation:** Use data-only formats parsed into fixed types; disable payload-driven type resolution or allow-list types; sign and verify payloads that must carry objects.

**Regression test:** A payload naming an unexpected type is rejected without instantiating it.

**False-fix traps:** Wrapping the deserializer in a try/catch or filtering strings in the payload does not restrict which types are created.

**False positives:** Deserialization of trusted, signed data from the same system; data-only formats parsed into fixed, known types.

**Provenance:** SRC-002

**Keywords:** deserialization, serializer, type name, YAML, object loader

**Version:** 2.0.0

## INPUT-005 — XML parser configuration allows external entities or expansion
**Domain:** Input Validation  
**Severity:** High–Medium  
**CWE:** CWE-611, CWE-776  
**OWASP:** A05:2021 Security Misconfiguration

**Why it matters:** Permissive XML parsers can read local files, call internal services or exhaust memory through entity expansion.

**Detect:** Find XML, SOAP, SVG, Office-document and feed parsing; inspect DTD, external-entity and entity-expansion settings and the resolver used.

**Evidence:** Parser construction and its security settings.

**Remediation:** Disable DTD processing and external resolution, limit entity expansion, and prefer data formats that need no DTD.

**Regression test:** A document with an external entity or an expansion bomb is rejected.

**False-fix traps:** Disabling entity resolution on one parser class does not cover other parsers in the same code base or in libraries that parse documents.

**False positives:** Parsers configured with DTD processing disabled or prohibited, or documents that come only from trusted internal producers.

**Provenance:** SRC-002

**Keywords:** XXE, XML, DTD, entity, SOAP, SVG

**Version:** 2.0.0

## INPUT-006 — Untrusted URL is used in navigation, redirect or embedding without an allow-list
**Domain:** Input Validation  
**Severity:** Medium–High  
**CWE:** CWE-601, CWE-79  
**OWASP:** A01:2021 Broken Access Control

**Why it matters:** Attacker-supplied URLs can redirect users to hostile sites, run script through dangerous schemes, or embed attacker content inside a trusted, possibly privileged, page.

**Detect:** Find redirects, post-login return URLs, link and form targets, frame/embed/object sources and window-navigation calls built from request, stored or configurable data; check whether scheme and host are validated, and whether validation happens when the value is written as well as when it is used.

**Evidence:** Source of the URL, the sink and the validation (scheme, host, relative-only).

**Remediation:** Allow-list scheme and host (or restrict to relative internal paths), validate URL fields at write time, and map redirect targets from server-side identifiers.

**Regression test:** Script-scheme, foreign-host and protocol-relative URLs are rejected at write time and at use time.

**False-fix traps:** Checking only that the URL starts with an expected string is bypassable; validating at use time but not at write time leaves stored values dangerous for other consumers.

**False positives:** Redirects to fixed internal routes chosen from a server-side map; links to constant, server-authored destinations.

**Chains with:** INPUT-002, API-001

**Provenance:** SRC-002, SRC-004

**Keywords:** open redirect, URL, redirect, iframe, scheme, allow-list

**Version:** 2.0.0
