# Python Stack Hints

## 1. Where to look
- Django: settings modules, urls.py, views, serializers, middleware, admin registrations. DRF: REST_FRAMEWORK settings, viewsets, permission classes.
- FastAPI: routers, dependencies, Pydantic models. Flask: blueprints, decorators, before_request hooks.
- Models and ORM queries, file storage and upload handling, subprocess/serialisation code, environment-driven settings.

## 2. Framework security controls (what 'correct' looks like)
- DRF DEFAULT_PERMISSION_CLASSES set to IsAuthenticated (or stricter); the framework default is AllowAny, so an unset value is fail-open (AUTHZ-006).
- Per-view permission classes plus object-level checks (get_queryset filtered by owner/tenant, has_object_permission).
- Serializers list explicit fields and mark privileged ones read-only; no fields = '__all__' on writable serializers (API-001, API-002).
- Django: DEBUG off, SECRET_KEY from a secret store, restrictive ALLOWED_HOSTS, secure cookie and HTTPS settings (PLAT-001, SECRET-001).
- FastAPI: auth dependency on every router or app-level dependencies; Flask: login/permission decorator or before_request default deny.
- Safe loaders: yaml.safe_load; no pickle on untrusted data; parameterised queries.

## 3. Enumerating operations (how to build the inventory for this framework, including how to resolve effective auth and detect IMPLICIT anonymous operations)
- Django: walk urls.py includes recursively; list view classes/functions, viewset routers (all actions incl. extra @action), admin site, static/media serving.
- Resolve effective auth: settings default (DEFAULT_AUTHENTICATION_CLASSES / DEFAULT_PERMISSION_CLASSES) overridden by class attributes, then by per-action get_permissions; middleware or decorators (login_required) for plain views.
- FastAPI: include_router dependencies + route dependencies; an endpoint lacking Depends(auth) is IMPLICITLY anonymous. Flask: routes without a decorator and not covered by before_request are anonymous.
- Record ownership filtering of querysets, serializer fields, response data class, consumers, anonymous justification.

## 4. High-yield searches (grep terms)
- DEFAULT_PERMISSION_CLASSES, AllowAny, permission_classes, IsAuthenticated, authentication_classes = [].
- fields = '__all__', exclude =, read_only_fields, ModelSerializer.
- objects.get(, objects.filter(, get_object_or_404, queryset = with no owner filter.
- DEBUG = True, ALLOWED_HOSTS, SECRET_KEY, CORS_ALLOW_ALL_ORIGINS, csrf_exempt.
- pickle.loads, yaml.load(, marshal, eval(, exec(, subprocess with shell=True, os.system.
- raw(, extra(, cursor.execute( with f-strings or %, text( with concatenation.
- Depends(, APIRouter(, @app.route, @login_required, before_request.
- os.path.join, send_file, open( with request-derived input.

## 5. Common bypasses and pitfalls
- Unset DRF default permissions (AllowAny) with views that omit permission_classes.
- get_queryset returning all objects, or detail routes using the global queryset, giving IDOR (AUTHZ-002).
- ModelSerializer with __all__ allowing mass assignment of is_staff, owner, status (API-001).
- os.path.join discards the base for an absolute second argument; use resolved-path prefix checks (FILE-001).
- yaml.load without a safe loader and pickle on untrusted data lead to code execution.
- DEBUG enabled via environment variable defaults; settings chosen by DJANGO_SETTINGS_MODULE; report repo-config, deployed effect needs verification (PLAT-005).
- Flask/FastAPI routes added without the decorator/dependency; csrf_exempt on state-changing views.
- raw()/extra()/execute with formatted strings (INPUT-001).

## 6. Evidence to collect
- Settings values (permissions, DEBUG, hosts) with file:line and which settings module is used.
- View/viewset class showing the queryset and permission attributes; serializer fields.
- Exact sink expression for SQL, path, deserialisation.

## 7. Common false positives
- AllowAny on login, registration with controls, health, or public read-only reference data.
- Querysets filtered in a base class or mixin not visible in the leaf view.
- DEBUG = True in a separate local settings file never selected in deployment.
- fields = '__all__' on read-only serializers returning non-sensitive models.

## 8. Regression-test notes
- Test client per inventoried route: unauthenticated, wrong-role, other-owner expect denial.
- Test that listing and detail endpoints return only owned objects.
- Test that writable privileged fields are ignored; add a check that settings in the deploy profile have DEBUG off and secure defaults.
