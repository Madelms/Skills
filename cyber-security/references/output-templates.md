# Output Templates

## Executive summary
State review scope, source/deployed distinction, counts by status and severity, top root causes, and the most important next actions.

## Finding table
Use: ID, title, severity, status, evidence, root cause, remediation, retest.

## Tracker DeveloperNote
`STATUS — what is true now (evidence file:line). Remaining: what is not done. [Root cause RC-n] [Deploy: retest needed]`

## Root-cause section
Group repeated endpoint findings under a shared control failure. Keep the original finding IDs visible.

## Remediation plan
For each open/partial item: finding, exact control change, affected layer/files discovered, data/config impact, regression test, dependency and priority. Never invent file names.

## Regression plan
For every fix provide a positive test, negative/unauthenticated test, cross-user/role test where relevant, and a bypass test for sibling routes or lower layers.
