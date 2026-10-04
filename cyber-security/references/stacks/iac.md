# Infrastructure-as-Code Hints

## 1. Where to look
- Terraform, Bicep/ARM, CloudFormation, Pulumi, Helm charts, Kubernetes manifests, Dockerfiles, compose files.
- Variable files, state backends, CI deployment definitions, ConfigMaps/Secrets, ingress and network policy definitions.

## 2. Framework security controls (what 'correct' looks like)
- No public exposure by default: private networking, restricted ingress rules, no 0.0.0.0/0 on admin or data ports (SECRET-003, PLAT-001).
- IAM/role policies least-privilege: no wildcard actions or resources, no broad owner/admin roles for workloads.
- Secrets supplied from a secret manager at runtime; no plaintext secrets in variable defaults, tfvars, manifests, images or state; state backend encrypted and access-controlled (SECRET-001).
- Containers run as non-root, with pinned base images, read-only filesystems where feasible, and no secrets baked into layers.
- Policy-as-code checks run in CI and block merges on violations.

## 3. Enumerating operations (how to build the inventory for this framework, including how to resolve effective auth and detect IMPLICIT anonymous operations)
- Inventory every externally reachable endpoint declared in IaC: load balancers, ingress rules, public IPs, API gateway routes, storage endpoints, serverless triggers.
- Resolve effective exposure: resource-level public flag + security group/firewall rules + ingress/network policy + gateway authentication settings. Anonymous exposure can be IMPLICIT, such as an ingress with no auth annotation, a gateway route with auth set to none, or a default-allow security group.
- Map each exposed endpoint to the application operation it fronts using the application inventory.

## 4. High-yield searches (grep terms)
- 0.0.0.0/0, ::/0, public_network_access, publicly_accessible, allow_blob_public_access, acl = "public.
- "Action": "*", "Resource": "*", actions = ["*"], Owner, Contributor, cluster-admin, privileged: true.
- password, secret, token, key in variable defaults, tfvars, values.yaml, ConfigMap data.
- ENV in Dockerfile, env: and envFrom: in manifests, ASPNETCORE_ENVIRONMENT, NODE_ENV, DEBUG, FLASK_ENV.
- runAsUser: 0, USER root, hostNetwork, hostPath, allowPrivilegeEscalation.
- backend, tfstate, terraform.tfstate, encryption settings, versioning.

## 5. Common bypasses and pitfalls
- Dockerfile ENV and Kubernetes env/ConfigMaps can select runtime mode (development, debug) or inject permissive settings; the image or manifest, not the app code, may decide behaviour. Report as repo-config; deployed effect needs verification (PLAT-005, SECRET-004).
- Plaintext secrets in variables, tfvars, rendered manifests or Terraform state, even when the source file looks clean.
- Environment drift: the deployed resources differ from IaC due to manual changes or per-environment overrides; compare against real state where possible.
- Wildcard IAM and broad network rules justified as temporary and left in place.
- Modules and chart defaults that open public access unless overridden.
- Secrets baked into image layers or build arguments.

## 6. Evidence to collect
- Resource block or manifest with file:line; the effective value after variables and overrides.
- Which environments consume the file; policy-as-code results and exceptions.
- State backend configuration and access controls (never secret values).

## 7. Common false positives
- Public ingress for an intentionally public, authenticated application with WAF and TLS.
- Wildcard resource scopes on read-only, non-sensitive actions with a documented rationale.
- Development-only IaC clearly separated and never applied to shared or production environments.
- Placeholder or example values that are not real secrets.

## 8. Regression-test notes
- Policy-as-code in CI (for example rule sets for public exposure, wildcard IAM, plaintext secrets, root containers) failing the pipeline.
- Scheduled drift detection comparing deployed resources to IaC.
- Plan-time checks that production variables set runtime mode to production and disable debug.
