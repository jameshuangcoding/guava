# Contributing to Guava

Thanks for helping out. This guide covers how work is tracked, how to set up, and how changes get from a branch to `main`.

## Issues first

Work is tracked in the [Guava project](https://github.com/users/jameshuangcoding/projects/3). Before starting anything bigger than a small fix, find or open an issue so the approach can be discussed first.

- **Feature**: something new, with what, why and when it's done.
- **Bug**: something broken, with steps to reproduce.
- **Idea**: a rough thought to sort out later.

Large work is a parent issue with sub-issues, one per pull request.

To report a security problem, don't open an issue. Follow [SECURITY.md](SECURITY.md).

## Setup

Follow [Getting started](README.md#getting-started) in the README. You'll need Node.js 20.9 or later, pnpm, a Neon project, and Docker for the integration and e2e tests.

Never point local development or tests at production data. The test suites use throwaway databases from `compose.test.yaml` (see [Testing](README.md#testing)).

## Branches

Branch from `main` and name the branch `<type>/<short-description>`, using the same types as PR titles:

```text
feat/sticky-expenses-header
fix/plaid-sync-duplicates
docs/readme
```

## Pull request titles

Pull requests are squash merged. The PR title becomes the one commit on `main`, so it must follow [Conventional Commits](https://www.conventionalcommits.org). CI checks it.

```text
<type>(<optional scope>): <summary>
```

- **Types:** `feat`, `fix`, `perf`, `refactor`, `style`, `docs`, `test`, `build`, `ci`, `chore`, `revert`.
- **Scopes** are the area of the app: `expenses`, `categories`, `plaid`, `auth`, `settings`, `dashboard`, `workspace`, `db`, `ui`, `release`.
- **Summary:** imperative and lowercase, with no trailing period. For example, `feat(expenses): add a date filter`.
- **Breaking changes:** add `!` after the type or scope (`feat(db)!: …`) and explain the change in the PR description.

[release-please](https://github.com/googleapis/release-please) reads these commits to bump the version and write `CHANGELOG.md`, so the title is what users see in the release notes.

Commits inside a branch don't have to follow the format, but clear messages make review easier.

## Before opening a pull request

Run the same checks as CI:

```bash
pnpm format:check
pnpm lint --max-warnings 0
pnpm typecheck
pnpm test:db:up && pnpm test:all
```

Add or update tests for behavior you change. Unit tests sit next to the code (`lib/**/*.test.ts`). Integration and e2e tests live in `tests/`.

### Database changes

- **App database** (`prisma/schema.prisma`): create a migration with `pnpm db:migrate` and commit it.
- **Workspace database** (`prisma/user/schema.prisma`): generate a migration with `pnpm user-db:migration <name>` and commit it. Users' databases are migrated by the app, so the migration has to work on existing data.

Point out any schema or environment variable changes in the PR description.

## Pull requests

- Keep each PR focused on one change. Split unrelated work into separate PRs.
- Fill in the pull request template.
- Link the issue the PR finishes with `Closes #N`.
- For UI changes, add before and after screenshots.
- If a PR is stacked on another, say so. After the parent merges, retarget the child to `main` before merging it.
- Open a draft PR early if you'd like feedback before it's done.

## Review and merge

A PR can merge when:

- the `lint`, `pr-title` and `tests` checks pass,
- every review conversation is resolved, and
- it's up to date with `main`.

PRs are squash merged, and the branch is deleted automatically afterwards.

## License

By contributing, you agree that your contributions are licensed under the [MIT License](LICENSE).
