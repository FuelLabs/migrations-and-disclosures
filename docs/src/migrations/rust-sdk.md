# Rust SDK Migrations Guide

## August 16, 2024

[Release v0.66.0](https://github.com/FuelLabs/fuels-rs/releases/tag/v0.66.0)

### Unfunded read only calls - [#1412](https://github.com/FuelLabs/fuels-rs/pull/1412)

`SizedAsciiString` no longer implements `AsRef<[u8]>`. To get the underlying bytes you can turn it into a `&str` via the new `AsRef<str>` and call `as_bytes()` on the `&str`: `sized_string.as_ref().as_bytes()``

```rust
// before
let bytes: &[u8] = sized_str.as_ref();
```

```rust
// after
let bytes: &[u8] = sized_str.as_ref().as_bytes();
```

`build_without_signatures` is now achieved by setting the build strategy to `BuildStrategy::NoSignatures` on the transaction builder before calling `build`

```rust
// before
let mut tx = tb.build_without_signatures(provider).await?;
```

```rust
// after
let mut tx = tb.with_build_strategy(ScriptBuildStrategy::NoSignatures).build(provider).await?;
```

`.simulate()` now accepts an `Execution` argument allowing for `Realistic` or `StateReadOnly` simulations.

```rust
// before
let stored = contract_methods.read().simulate().await?;
```

```rust
// after
let stored = contract_methods.read().simulate(Execution::StateReadOnly).await?;
```

### Accounts now cover max fee increase due to tolerance - [#1464](https://github.com/FuelLabs/fuels-rs/pull/1464)

`fee_checked_from_tx` is removed from all transaction builders. max fee can now be estimated using the new method `estimate_max_fee` which takes into account the max fee estimation tolerance set on the builders.

```rust
// before
let transaction_fee = tb.fee_checked_from_tx(provider)
    .await?
    .ok_or(error_transaction!(
        Other,
        "error calculating `TransactionFee`"
    ))?;

let total_used = transaction_fee.max_fee() + reserved_base_amount;
```

```rust
// after
let max_fee = tb.estimate_max_fee(provider).await?;

let total_used = max_fee + reserved_base_amount;
```

### Account impersonation - [#1473](https://github.com/FuelLabs/fuels-rs/pull/1473)

The SDK previously performed transaction validity checks, including signature verification, before sending a transaction to the network. This was problematic since the checks also included signature verification even when utxo validation was turned off. To enable this feature and prevent future issues like failed validation checks due to version mismatches between the network and the SDK's upstream dependencies, we decided to remove the check. Since the SDK already abstracts building transactions for common cases (contract calls, transfers, etc.), validity issues are unlikely. If needed, we can still expose the validity checks as part of the transaction builder or our transaction structs.

```rust
/*

A `ImpersonatedAccount` simulates ownership of assets held by an account with a given address.
`ImpersonatedAccount` will only succeed in unlocking assets if the network is setup with
utxo_validation set to false.

*/

let node_config = NodeConfig {
    utxo_validation: false,
    ..Default::default()
};
```

### Deploying large contracts (loader + blob support) - [#1472](https://github.com/FuelLabs/fuels-rs/pull/1472)

`Contract::new` is removed, replaced with `Contract::regular` with three states

First: A regular contract

What you're used to seeing. It is either initialized from raw code or loaded from a file:

```rust
let contract = Contract::regular(contract_binary, Salt::zeroed(), vec![]);
```

or

```rust
let contract = Contract::load_from(
    "sway/contracts/storage/out/release/storage.bin",
    LoadConfiguration::default(),
)?;
```

With the notable addition of being able to set `configurables` (previously possible only when using `load_from`):

```rust
let contract = Contract::regular(binary, Salt::zeroed(), vec![]).with_configurables(configurables);
```

a regular contract can be deployed via `deploy`, which hasn't changed, or via `smart_deploy` that will use blobs/loader if the contract is above what can be deployed in a create tx:

```rust
let contract_id = Contract::load_from(
    contract_binary,
    LoadConfiguration::default().with_salt(random_salt()),
)?
.smart_deploy(&wallet, TxPolicies::default(), max_words_per_blob)
.await?;
```

Second: Loader contract, blobs pending upload

You can turn a regular contract into a loader contract:

```rust
let contract = Contract::load_from(
    contract_binary,
    LoadConfiguration::default(),
)?
.convert_to_loader(max_words_per_blob)?
```

or, if you have the blobs, create it directly:

```rust
let contract = Contract::loader_for_blobs(blobs, random_salt(), vec![])?;
```

You can also revert back to the regular contract via `revert_to_regular`.

If you now call `deploy` the contract will first deploy the blobs and then the loader itself.

You can also split this into two parts by first calling `upload_blobs` and then `deploy`:

```rust
let contract_id = Contract::load_from(contract_binary, LoadConfiguration::default())?
    .convert_to_loader(1024)?
    .upload_blobs(&wallet, TxPolicies::default())
    .await?
    .deploy(&wallet, TxPolicies::default())
    .await?;
```

doing so will have `deploy` only submit the create tx while the uploading will be done in `upload_blobs`.

Third: Loader, with blobs deployed

You arrive at this contract type by either having the blob ids and creating it manually:

```rust
let contract = Contract::loader_for_blob_ids(all_blob_ids, random_salt(), vec![])?;
```

or by calling `upload_blobs` as in the previous case:

```rust
let contract = Contract::load_from(
    contract_binary,
    LoadConfiguration::default().with_salt(random_salt()),
)?
.convert_to_loader(max_words_per_blob)?
.upload_blobs(&wallet, TxPolicies::default())
.await?;
```

Calling deploy on this contract only deploys the loader.
