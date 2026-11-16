# Security Policy

Guava handles login credentials, encrypted connection strings to users' own databases, and Plaid access tokens, so security reports are taken seriously.

## Supported versions

Only the latest release, deployed from `main`, gets security fixes.

## Reporting a vulnerability

**Please don't report vulnerabilities in public issues, pull requests or discussions.**

Report them privately through GitHub instead:

1. Go to the repository's [Security tab](https://github.com/jameshuangcoding/guava/security).
2. Click **Report a vulnerability**.
3. Include:
   - what the issue is and what an attacker could do with it,
   - steps to reproduce it, or a proof of concept,
   - the affected pages, routes or files, if you know them.

## What to expect

- An acknowledgement within a few days.
- Updates while the issue is investigated and fixed.
- Credit in the advisory once a fix is released, unless you'd rather stay anonymous.

## Scope

In scope:

- authentication and session handling,
- one user being able to reach another user's data or database,
- exposure of stored secrets (connection strings, Plaid tokens, encryption keys),
- injection, XSS, CSRF and similar flaws in the app.

Out of scope:

- vulnerabilities in Neon, Plaid, Vercel or other third-party services themselves (report those to the vendor),
- problems that need an already compromised device or account,
- missing best-practice headers with no demonstrated impact,
- denial-of-service and automated scanner output without a working exploit.

Please test only against your own account and data, never other users' accounts or production data.
