# Migrations and Disclosures

> **Archived coverage:** These pages are a historical, incomplete snapshot and are not a continuously maintained "latest version" guide. As verified on July 23, 2026, the highest releases represented are Sway `v0.67.0`, Fuel Rust SDK `v0.71.0`, and Fuel TypeScript SDK `v0.101.0`. Later and intervening releases can contain additional migration requirements.

## Audits

All public audits conducted on the Fuel network can be found [here](https://github.com/FuelLabs/audits)

## Breaking Changes

Throughout Fuel's development journey, numerous testnets have been created to ensure a seamless transition to the mainnet launch.
Given the dynamic nature of learning and adapting during these testing phases, it's common to encounter breaking changes.

Use the [archived migration notes](./migrations/index.md) for the covered version ranges. Before upgrading, also read the release notes for every version between your exact source and target:

- [Sway releases](https://github.com/FuelLabs/sway/releases)
- [Fuel Rust SDK releases](https://github.com/FuelLabs/fuels-rs/releases)
- [Fuel TypeScript SDK releases](https://github.com/FuelLabs/fuels-ts/releases)

Fuelup's `latest` channel is a network-distribution alias, not a pointer to the newest upstream compiler; resolve its current meaning with `fuelup show` before relying on it. Select `mainnet`, `testnet`, or an exact component version according to the network and release you intend to target.
