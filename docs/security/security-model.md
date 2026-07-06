# Security Model

Scenario Workbench should use explicit authorization and strong audit controls.

## Future RBAC Concepts

- Viewer
- Analyst
- Scenario Owner
- Approver
- Administrator
- Auditor

## Access Control Principles

- Read access does not imply execution access.
- Drafting access does not imply approval access.
- Approval access does not imply administrative access.
- Production execution should require explicit entitlement.

## Audit Events

Future audit events should include:

- scenario created
- assumption added, edited, accepted, or rejected
- AI suggestion generated
- evidence attached
- shock proposal generated
- override applied
- scenario approved
- risk engine execution requested
- report exported

