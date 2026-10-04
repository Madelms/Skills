# Verify Workflow (re-check reported findings)

Goal: decide, finding by finding, what is *actually* true in the current code. The inputs are a VAPT report, a tracker, or an earlier review. Developers' claims, tracker statuses and the original report are all hypotheses. Verify each one against the code.

## 1. Load the findings

- Read the whole tracker or report. Keep every existing column; you will usually add a `DeveloperNote` (or similar) column rather than editing the others.
- If both a summary (tracker) and the detailed report exist, read the detailed one too. It often contains the exact payload, the tested environment and the proof, all of which change how you verify.
- Note the **tested environment and date** for each finding. Compare them with the repo history (`git log` around the security commits). If the test predates the fix commits, every code-level status still needs a redeploy and retest on that environment.

## 2. Find the shared controls first

Before looking at individual findings, read the authentication/authorization composition (pipeline order, schemes, policies, fallback, ownership helpers). One broken root control can keep many findings open. One correct control can close many. Record which findings depend on which control.

## 3. Verify each finding

For each finding:
1. **Locate** the code for the reported endpoint or behaviour. If it is gone, search for the logic (method names, SQL, repository calls) before calling it NOT APPLICABLE.
2. **Trace** route → handler → service → repository/DB → response → frontend consumer.
3. **Check each security question separately:**
   - Authentication: who are you?
   - Authorization: may your role do this?
   - Ownership: is this object yours?
   - Data exposure: what comes back?
   - Input control: which fields can the client set?
   - Business authorization: may you move this workflow?
4. **Apply the traps below.**
5. **Assign a status** (`status-and-severity.md`) and write the DeveloperNote with evidence.

## 4. Verification traps (lessons learned; Learn mode extends this list)

Each trap is a way a finding looks fixed but isn't, or looks open but isn't.

- **VT-01 Source fixed ≠ deployed fixed.** The report reproduced the issue on an environment built before the fix commit. Status reflects code, plus "redeploy + retest required".
- **VT-02 Endpoint retired, logic moved.** The reported route now returns 404/410, but the same vulnerable comparison or query now serves another route (e.g. a new login endpoint reusing a case-insensitive password query). Follow the logic, not the route.
- **VT-03 Secret still present = not rotated.** If the key or credential value named in a report is still in source or bundles, it was not rotated, whatever the tracker says.
- **VT-04 Attribute present, default still open.** `[Authorize]` on reported actions, but no fallback policy, so unattributed siblings in the same controller stay anonymous.
- **VT-05 Authenticated but mass-assignable.** Write endpoint now needs a token and checks ownership of the target id, but still binds the full entity. The client can still set workflow, audit or ownership fields.
- **VT-06 Ownership on the wrong id.** The check uses a client-supplied parent id (body `requestId`) while the update targets a child record by its own id. Cross-tenant writes still work.
- **VT-07 Ownership helper too permissive.** The helper returns `true` for any authenticated non-tenant principal. It is safe only behind an admin-only or tenant-or-admin policy; check every usage.
- **VT-08 Response DTO fixed, other channel leaks.** Password removed from API DTOs but still emailed, written to audit/log tables, or returned by an admin "logs" endpoint that serializes entities.
- **VT-09 Frontend depends on the insecure behaviour.** The fix cannot ship without a frontend change (e.g. UI reads file bytes from a listing endpoint). The finding stays OPEN until both sides change.
- **VT-10 Pipeline-injected config.** The repo file looks minimal but the deployed file contains more, because release-pipeline token replacement adds keys. Verify the pipeline variables, not just the repo file.
- **VT-11 Environment flag enables insecure code.** "Fixing" an environment label (isProduction=false on test) switches on a dev-only shortcut such as a hard-coded token. Remove the shortcut first.
- **VT-12 Validation proven, secret exposed.** Token validation is correct, but the signing key is committed or readable through a file-read bug, so tokens can be forged. The status is PARTIALLY FIXED until the key is rotated and moved to a secret store.

## 5. Look for new issues while you are there

Verification often reveals neighbours: the read endpoint is fixed but its write twin isn't, or a download endpoint has traversal. Report these as **additional findings** in their own section or sheet; never silently fold them into an existing finding. Then list any that represent a new generic pattern as Learn-mode candidates.

## 6. Deliverables

- An updated tracker (new column, original structure preserved) or a findings table.
- A report section per `output-templates.md`, including "Previously implemented fixes (verified)" with a verdict per fix, plus bypass paths found.
- A redeploy/retest checklist when tested environments predate fixes.
