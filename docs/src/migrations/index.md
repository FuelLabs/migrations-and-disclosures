# Migrations

This section preserves selected historical breaking changes. It is not complete through the newest releases: Sway coverage reaches `v0.67.0`, Rust SDK coverage reaches `v0.71.0`, and TypeScript SDK coverage reaches `v0.101.0`.

For a migration outside those documented entries, or across more than one release, read the GitHub release notes for every intervening version. Record an explicit source version, target version, Fuel Core version, network channel, and chain ID before changing dependencies.

For a stateful contract migration, test interruption immediately before and after checkpoint persistence, idempotent retry, rollback, and mixed-version reads in an SDK/node harness. A successful one-call unit test does not establish restart or multi-transaction crash safety.

Never reuse an initialization entrypoint as an upgrade migration: add an owner-gated migration step for new roles or state, and test fresh deployments separately from upgraded legacy state. When a stored type gains fields, version and migrate the persisted values first — new zero-filled fields do not migrate legacy data, so keep unmigrated records out of decisions that treat the new fields or zero totals as authoritative.

## Sway

Archived Sway migration notes can be found [here](./sway.md).

## Rust SDK

Archived Rust SDK migration notes can be found [here](./rust-sdk.md).

## Typescript SDK

Archived TypeScript SDK migration notes can be found [here](./typescript-sdk.md).
