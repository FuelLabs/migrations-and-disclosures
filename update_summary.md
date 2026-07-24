# Documentation update summary

## Why this update was needed

The repository and published landing page presented the material as a current,
biweekly guide for migrating to the latest Fuel stack. In practice, coverage
stops before current Sway and SDK releases. The Sway guide also treated
Fuelup's `latest` network channel as the newest compiler and attempted to add
specific Forc versions to a distributed toolchain, which Fuelup rejects.

## What changed

- Marked the repository and published migration pages as an archived,
  incomplete historical snapshot.
- Recorded the actual highest represented releases: Sway `v0.67.0`, Fuel Rust
  SDK `v0.71.0`, and Fuel TypeScript SDK `v0.101.0`.
- Replaced "latest" and "full reference" claims with explicit coverage and
  release-note requirements.
- Corrected the Sway `v0.67.0` migration date to 2025.
- Explained that a migration must identify exact source and target compiler,
  SDK, node, network, and chain-ID versions.
- Replaced `fuelup default latest` with exact compiler selection.
- Added creation of a temporary custom Fuelup toolchain before installing
  `forc@0.66.10` and replacing it with `forc@0.67.0`.
- Added stateful migration checks for checkpoint interruption, retry, rollback,
  mixed-version reads, and restart safety.
- Aligned the automation cursor file with the highest releases actually
  represented in the documentation.

## Validation

- Repository Markdown lint passed.
- The stated coverage ceilings were checked against every linked migration
  release in the repository.
- Fuelup's custom/distributed component behavior was checked against its
  implementation.
- All committed changes pass `git diff --check`.
