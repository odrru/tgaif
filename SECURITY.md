# Security policy

## Reporting a vulnerability

Use this repository's **Security → Report a vulnerability** flow to report a
security issue privately. Please include the affected component, reproduction
steps, impact, and any suggested mitigation.

Do not disclose an unpatched vulnerability, credential, access token, or user
data in a public issue or discussion.

## Supported version

Security fixes are made on the default branch. Deployments should track the
latest release and apply all Supabase migrations in timestamp order.

## Deployment secrets

Only variables prefixed with `NEXT_PUBLIC_` may be exposed to the browser.
`SUPABASE_SECRET_KEY` and `SUPABASE_SERVICE_ROLE_KEY` are server-only credentials
and must be stored in the deployment platform's encrypted environment settings.
