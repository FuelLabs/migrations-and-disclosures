# Sepolia Testnet Breaking Change Guide

## May 14, 2024 (Testnet)

### Sway

Release: [Sway v0.57.0](https://github.com/FuelLabs/sway/releases/tag/v0.57.0)

`fuel-core` was bumped to v0.26.0 making `forc-client` incompatible with previous networks.

A name clash in star imports now results in an error when the name is used.  For example:

```rust
// a.sw
struct X = ...

// b.sw
struct X = ...

// main.sw
use a::*;
use b::*;

let x = X {...} // Error
```

The asm printing options in the `forc` cli have changed.

| Before | After |
| - | - |
|`--intermediate-asm`|`--asm abstract`|
|`--finalized-asm`|`--asm final`|
|`--intermediate-asm --finalized-asm`|`--asm all`|

### TS-SDK

Release: [v0.85.0](https://github.com/FuelLabs/fuels-ts/releases/tag/v0.85.0)

The `__typename` property was removed from all GraphQL types.

The `__typename` property was renamed to `type` on the `CoinFragment` and `MessageCoinFragment` types.

Release [v0.84.0](https://github.com/FuelLabs/fuels-ts/releases/tag/v0.84.0)

`getNetwork` was removed from `account`.

The type `ConsensusParameters` was modified to match the new GraphQL schema.

```ts
/* BEFORE */
type ConsensusParameters = {
  contractMaxSize: BN;
  maxInputs: BN;
  maxOutputs: BN;
  maxWitnesses: BN;
  maxGasPerTx: BN;
  maxScriptLength: BN;
  maxScriptDataLength: BN;
  maxStorageSlots: BN;
  maxPredicateLength: BN;
  maxPredicateDataLength: BN;
  maxGasPerPredicate: BN;
  gasPriceFactor: BN;
  gasPerByte: BN;
  maxMessageDataLength: BN;
  chainId: BN;
  gasCosts: GqlGasCosts;
  baseAssetId: string;
}

/* AFTER */
type ConsensusParameters = {
  version: GqlConsensusParametersVersion;
  chainId: BN;
  baseAssetId: string;
  feeParameters: ModifyStringToBN<FeeParameters>;
  contractParameters: ModifyStringToBN<ContractParameters>;
  predicateParameters: ModifyStringToBN<PredicateParameters>;
  scriptParameters: ModifyStringToBN<ScriptParameters>;
  txParameters: ModifyStringToBN<TxParameters>;
  gasCosts: GasCosts;
};
```

### Rust SDK

Release [v0.61.0](https://github.com/FuelLabs/fuels-rs/releases/tag/v0.61.0)

Instead of the `fuels::core::fn_selector!` macro you now use `fuels::core::encode_fn_selector` to construct an encoded function selector.

```rust
/* BEFORE */
let function_selector = fn_selector!(my_contract_function(MyArgType));

/* AFTER */
let function_selector = encode_fn_selector("my_contract_function");
```

Release [v0.60.0](https://github.com/FuelLabs/fuels-rs/releases/tag/v0.60.0)

The SDK now expects `release` paths in order to work.

```rust
/* BEFORE */
let contract_id = Contract::load_from(
    "my_path/my_contract/out/debug/contract_test.bin",
    LoadConfiguration::default(),
)?

/* AFTER */
let contract_id = Contract::load_from(
    "my_path/my_contract/out/release/contract_test.bin",
    LoadConfiguration::default(),
)?
```
