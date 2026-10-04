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

**Pass criteria.** Every important mechanism above is accounted for in both runs (see "Accounting and scoring"), at least 90% of previously known findings are reproduced or explicitly classified, zero broken skill references are reported as gaps, and the validator passes.

## Accounting and scoring (applies to layers B and C)

The reviewer does not have the answer key, so accounting is made against the skill's own structure:
1. The reviewer runs a normal Review **and** the baseline-compliance form (`SKILL.md`: "check this project against the skill"), so every rule has a disposition (Pass / Fail / Partial / N-A with evidence), and the inventory carries a Classification and Finding status on every row (`workflow-review.md`, classification contract).
2. The grader maps each answer-key mechanism to the inventory rows, findings, verified controls and rule dispositions that represent it.

Score each important mechanism separately on three questions, and report the counts per category:

| Outcome | Definition |
|---|---|
| **Detected as finding** | Represented by a finding with evidence (file:line). |
| **Detected, justified / no finding** | Explicitly represented (an inventory row, a verified control or a rule disposition) with evidence and a stated reason it is not a finding. Counts as detected. |
| **Detected, requires verification** | Explicitly represented with the exact deployed or external check. Counts as detected. |
| **Not applicable** | Explicit, with where the reviewer looked. Counts as accounted for. |
| **Missed** | Not mentioned anywhere in the inventory, findings, controls or rule dispositions, or only a vague mention without evidence. |

Detection, classification (the judgment) and promotion (becoming a finding) are graded separately. A mechanism that was detected and explicitly classified as justified is detected; one never mentioned is missed. Do not count vague mentions. Where the reviewer's classification looks wrong (for example "justified" for an unjustified exposure), record it as a judgment issue, not as a miss.

**Strict condition for a pass:** in every run, every important mechanism is accounted for (a finding, a justified/no-finding classification with evidence, requires verification, or not applicable) and none is silently omitted.

## Layer C: generalisation

Run the same protocol on a **different project** with no answer key. Judge only: the inventory is produced and complete, anonymous operations are classified, findings cite evidence and a verified-against layer, chains are considered, and no terms from the first project leak into the output. This detects overfitting to the project the skill learned from.

## Do not tune to the key

Never add a project's endpoint names, identifiers or finding numbers to the skill to make a run pass. If a mechanism is missed, improve the generic rule, workflow or stack hint, then re-run on fresh reviewers.
