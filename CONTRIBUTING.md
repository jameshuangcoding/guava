# Contributing

## Before you start

Open or find an [issue](https://github.com/jameshuangcoding/guava/issues/new/choose) first, unless the change is small. Report security problems through [SECURITY.md](SECURITY.md), not in an issue.

For setup, see [Getting started](README.md#getting-started).

## Branches

Branch from `main` and name it `<type>/<short-description>`, for example `feat/date-filter`.

## Pull requests

PRs are squash merged, so **the PR title becomes the commit on `main`**. It must follow [Conventional Commits](https://www.conventionalcommits.org):

```text
feat(expenses): add a date filter
fix(plaid): skip duplicate transactions
```

The types are `feat`, `fix`, `perf`, `refactor`, `style`, `docs`, `test`, `build`, `ci`, `chore` and `revert`. Add `!` for a breaking change, as in `feat(db)!: …`.

Before opening a PR, run:

```bash
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test:unit
pnpm test:db:up && pnpm test:integration && pnpm test:e2e
```

Then:

- Fill in the PR template.
- Link the issue with `Closes #N`.
- Add screenshots for UI changes.
- Keep each PR to one change.

To merge, `lint`, `pr-title`, `unit`, `integration` and `e2e` must pass, every review conversation must be resolved, and the branch must be up to date with `main`.

## License

Contributions are licensed under the [MIT License](LICENSE).
