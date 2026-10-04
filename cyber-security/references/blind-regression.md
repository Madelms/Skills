# Blind Regression Protocol (validation layers B and C)

A passing `validate-kb.js` proves only that the knowledge base is internally consistent (layer A). It does not prove that the skill finds vulnerabilities. Run this protocol after any change that can affect detection behaviour.

## Layer B: security-detection regression

**Isolation.**
1. Use a fresh subagent with no prior context, given only: the skill path, the project path, the standard prompt ("Run Cyber Security review on this project; do not modify application code") and the list of forbidden files.
2. Forbidden files: every earlier report, tracker, review output, answer key and the source reports the skill learned from. Also forbid reading git history of those files.
3. The reviewer writes all output outside the repository.
4. Run **twice** with the same prompt to measure run-to-run variance.

**Answer key.** Keep it outside the skill repository. Grade mechanisms, not endpoint names.

*Methodology checks*
- An inventory exists and every row has an effective-authentication class (explicit anonymous, implicit anonymous, authenticated, role/policy).
- The anonymous-operation count matches an independent count (explicit anonymous markers plus unattributed operations under an open default).
- Every anonymous row has a verdict and a data-class/consumer note.
- Chains are reported as chains.
- Every finding has a Verified-against layer; no FIXED is claimed for unobserved deployment state.

*Mechanism checks* (described as mechanisms)
- An anonymous operation returns file content.
- Anonymous reference or workflow operations are consumed only by a privileged UI.
- Path traversal on a download operation, ownership checked on a client-supplied id, whole-entity writes with client-controlled workflow state, committed secrets and signing keys, plaintext password lifecycle, committed runtime-mode config, debug/template endpoints.
- Chains: traversal to secret read to token forge; mass assignment of a URL/HTML-bearing field to script execution in a privileged UI.

**Pass criteria.** Each important mechanism above is caught in both runs, at least 90% of previously known findings are reproduced, zero broken skill references are reported as gaps, and the validator passes.

## Layer C: generalisation

Run the same protocol on a **different project** with no answer key. Judge only: the inventory is produced and complete, anonymous operations are classified, findings cite evidence and a verified-against layer, chains are considered, and no terms from the first project leak into the output. This detects overfitting to the project the skill learned from.

## Do not tune to the key

Never add a project's endpoint names, identifiers or finding numbers to the skill to make a run pass. If a mechanism is missed, improve the generic rule, workflow or stack hint, then re-run on fresh reviewers.
