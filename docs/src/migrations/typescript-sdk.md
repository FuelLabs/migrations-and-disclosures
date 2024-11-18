# TypeScript SDK Migrations Guide

## November 15, 2024

[Release v0.97.0](https://github.com/FuelLabs/fuels-ts/releases/tag/v0.97.0)

### `onDeploy` fuels config supports all Sway program types - [#3383](https://github.com/FuelLabs/fuels-ts/pull/3383)

- Changed the outputted data from the `onDeploy` callback method for the `fuels.config.ts`. Instead of just emitting the deployed contracts (as an array), it will now emit an object with `contracts`, `predicates` and `scripts`.

```ts
// Before (fuels.config.ts)
import { createConfig, FuelsConfig, DeployedContract } from 'fuels';

export default createConfig({
  output: 'dir/out',
  onDeploy: (config: FuelsConfig, deployedContracts: DeployedContract[]) => {
    console.log('contracts', deployedContracts);
  }
});
```

```ts
// After (fuels.config.ts)
import { createConfig, FuelsConfig, DeployedData } from 'fuels';

export default createConfig({
  output: 'dir/out',
  onDeploy: (config: FuelsConfig, deployed: DeployedData[]) => {
    console.log('contracts', deployed.contracts);
    console.log('predicates', deployed.predicates);
    console.log('scripts', deployed.scripts);
  }
});
```

### Remove unnecessary nonce from message gql queries - [#3298](https://github.com/FuelLabs/fuels-ts/pull/3298)

- Removed the `nonce` property from `Provider.operations.getMessageByNonce()`. This can still be retrieved by `Provider.getMessageByNonce()`.

### Refactor predicate and script deployment - [#3389](https://github.com/FuelLabs/fuels-ts/pull/3389)

  `ContractFactory.deployAsBlobTxForScript` has been removed in favor of `Predicate.deploy` and `Script.deploy`:

```ts
// before
const factory = new ContractFactory(scriptBytecode, scriptAbi, wallet);
const { waitForResult } = await factory.deployAsBlobTxForScript();
const { loaderBytecode, configurableOffsetDiff } = await waitForResult();

// after
const script = new Script(scriptBytecode, scriptAbi, wallet);
const { blobId, waitForResult } = await script.deploy(deployerWallet);
const loaderScript = await waitForResult();

const predicate = new Predicate({ bytecode, abi, provider });
const { blobId, waitForResult } = await predicate.deploy(deployerWallet);
const loaderPredicate = await waitForResult();
```

### Mandate `abi` in `Predicate` constructor - [#3387](https://github.com/FuelLabs/fuels-ts/pull/3387)

- Instantiating a `Predicate` now requires providing its `abi`. If you want to use the `Predicate` as an `Account`, please instantiate it via the `Account` class

```ts
// before
const predicate = new Predicate({ provider, bytecode }); // worked even though abi is missing

// after
const predicate = new Predicate({ abi, provider, bytecode }); // abi is now mandatory

// predicate as account
const account = new Account(predicateAddress, provider);
```

### Optimize `getTransactions` query - [#3336](https://github.com/FuelLabs/fuels-ts/pull/3336)

- The response format for `Provider.getTransactions` remains the same. However, the response format for the query `Provider.operations.getTransactions` has been modified.

```graphql
// before
query getTransactions {
  id
  rawPayload
  status {
    ...
  }
}
```

```graphql
// after
query getTransactions {
  rawPayload
}
```

### Limit TX pagination number for `getTransactionsSummaries` - [#3400](https://github.com/FuelLabs/fuels-ts/pull/3400)

- The pagination number for `getTransactionsSummaries` is limited to `60` now

```ts
// before
const { transactions } = await getTransactionsSummaries({
  provider,
  filters: {
    owner: account.address.toB256(),
    first: 200,
  },
});
```

```ts
// after
const { transactions } = await getTransactionsSummaries({
  provider,
  filters: {
    owner: account.address.toB256(),
    first: 60, // Limit is 60 now. A higher value will result in an error
  },
});
```

### Remove `blockId` in transaction list responses - [#3379](https://github.com/FuelLabs/fuels-ts/pull/3379)

- The `blockId` property has been removed from the following GraphQL queries used to list past transactions:

```ts
const { transactions } = await getTransactionsSummaries({ ... });

const { transactionsByOwner } = await provider.operations.getTransactionsByOwner({ ... });
```

If the `blockId` is required for a given transaction, it needs to be queried separately with `getTransactionSummary` helper:

```ts
import { getTransactionSummary } from 'fuels';

const transaction = await getTransactionSummary({
  id,
  provider,
});
```

*Note: The `blockId` is still available in the result for a submitted transaction.*

### Optimize coin gql queries - [#3301](https://github.com/FuelLabs/fuels-ts/pull/3301)

- The `Provider.operations.getCoins()` and  `Provider.operations.getCoinsToSpend` function no longer return the owner. These methods shouldn't be called directly but are used internally to formulate responses from the SDK.

- Removed the property `owner` from the `Provider.operations.getCoinsToSpend()` function. Suggest to use the owner from the input parameters.

## October 13, 2024

[Release v0.96.0](https://github.com/FuelLabs/fuels-ts/releases/tag/v0.96.0)

### Checksum method to remove `0x` before hashing - [#3313](https://github.com/FuelLabs/fuels-ts/pull/3313)

  We fixed the checksum utilities:

- `Address.toChecksum()`
- `Address.isChecksumValid()`

Now, we correctly remove the leading `0x` before hashing the address.

Because of this, previous values were invalid, and the update is required.

## October 10, 2024

[Release v0.95.0](https://github.com/FuelLabs/fuels-ts/releases/tag/v0.95.0)

### Bump transaction pagination limit to 60 - [#3306](https://github.com/FuelLabs/fuels-ts/pull/3306)

- A limit was added of 60 transactions to the `provider.getTransactions()` method.

### Made Address `toString` and `valueOf` returns checksum - [#3310](https://github.com/FuelLabs/fuels-ts/pull/3310)

  The return of both `Address.toString()` and `Address.valueOf` was modified to return the address checksum instead of the Bech32 string

```ts
// before
const address = new Address('fuel1elnmzsav56dqnp95sx4e2pckq36cvae9ser44m5zlvgtwxw49fmqd7e42e');

address.toString()
// fuel1elnmzsav56dqnp95sx4e2pckq36cvae9ser44m5zlvgtwxw49fmqd7e42e

address.valueOf()
// fuel1elnmzsav56dqnp95sx4e2pckq36cvae9ser44m5zlvgtwxw49fmqd7e42e
```

```ts
// after
const address = new Address('fuel1elnmzsav56dqnp95sx4e2pckq36cvae9ser44m5zlvgtwxw49fmqd7e42e');

address.toString()
// 0xEf86aFa9696Cf0dc6385e2C407A6e159A1103cEfB7E2Ae0636FB33d3cb2A9E4A

address.valueOf()
// 0xEf86aFa9696Cf0dc6385e2C407A6e159A1103cEfB7E2Ae0636FB33d3cb2A9E4A
```

### Slim down `chainInfoFragment` and `GasCostsFragment` - [#3286](https://github.com/FuelLabs/fuels-ts/pull/3286)

- `latestBlock` is no longer part of the `ChainInfo` return of `provider.getChain()`. You can fetch it via `provider.getBlock('latest')`.
- `ChainInfo['consensusParameters']['gasCosts']` has been slimmed down to only contain data necessary for the operation of the SDK. Up until now, the SDK was fetching more than it needed. If this change affects you, you will have to create a custom graphql query for `gasCosts` for the additional data you need.

### Optimize balance queries - [#3296](https://github.com/FuelLabs/fuels-ts/pull/3296)

- Removed the `owner` and `assetId` properties from the response of `Provider.operations.getBalance()`. These properties are also required arguments to execute the function so are redundant in the response. Should you require these values, you should take them from the values that you passed to the function.
- Removed the `owner` property from the response of `Provider.operations.getBalances()`. This property is a required argument to execute the function so is redundant in the response. Should you require this value, you should take it from the value that you passed to the function.

## August 30, 2024

[Release v0.94.0](https://github.com/FuelLabs/fuels-ts/releases/tag/v0.94.0)

### Consider message on resources cache - [#2872](https://github.com/FuelLabs/fuels-ts/pull/2872)

  The provider option flag `cacheUtxo` was renamed to `resourceCacheTTL`

```ts
// before
const provider = await Provider.create(FUEL_NETWORK_URL, {
  cacheUtxo: 5000,
});


using launched = await launchTestNode({
  providerOptions: {
    cacheUtxo: 5000,
  },
});
```

```ts
// after
const provider = await Provider.create(FUEL_NETWORK_URL, {
  resourceCacheTTL: 5000,
});

using launched = await launchTestNode({
  providerOptions: {
    resourceCacheTTL: 5000,
  },
});
```

### Prettify `typegen` api - [#2824](https://github.com/FuelLabs/fuels-ts/pull/2824)

### `Predicate` class

- `Predicate` class constructor parameters renamed: `inputData` > `data`

```ts
// before
import { Predicate } from 'fuels';

const predicate = new Predicate({
  ...unchangedParameters,
  inputData,
});
```

```ts
// after
import { Predicate } from 'fuels';

const predicate = new Predicate({
  ...unchangedParameters,
  data,
});
```

- Typegen extended/generated `Predicate` now accepts a single parameter for initialization

```ts
// before
import { TestPredicateAbi__factory } from './typegend';

TestPredicateAbi__factory.createInstance(provider, data, configurableConstants);
```

```ts
// after
import { TestPredicate } from './typegen';

new TestPredicate({
  provider,
  data,
  configurableConstants
});
```

### `launchTestNode` utility

- Renamed `contractsConfigs[].deployer` to  `contractsConfigs[].factory`
- Removed `contractsConfigs[].bytecode` and `.hex.ts` file

The bytecode is now saved within the factory class, so you don't have to deal with it.

```ts
// before
import { TokenAbi__factory } from './typegend';
import TokenAbiHex from './typegend/contracts/TokenAbi.hex';

using launched = await launchTestNode({
  contractsConfigs: [{
    deployer: TokenAbi__factory,
    bytecode: TokenAbiHex
  }],
});
```

```ts
// after
import { TokenFactory } from './typegend';

using launched = await launchTestNode({
  contractsConfigs: [{
    factory: TokenFactory,
  }],
})
```

### Renamed method `deployContract` to `deploy`

Removed the redundant suffix on the `ContractFactory` class method name.

```ts
// before
import { ContractFactory } from 'fuels';

const factory = new ContractFactory(wallet);

factory.deployContract();
```

```ts
// after
import { ContractFactory } from 'fuels';

const factory = new ContractFactory(wallet);

factory.deploy();
```

### Typegen `Contract` template

- Removed `Abi__factory` suffix from class names
- The file `<name>.hex` was removed (access it via `<Name>.bytecode`)
- The files `<name>__factory.ts` and `<name>.d.dts` were merged into `<name>.ts`
- The class `<Name>` and the interface `<Name>Abi` are now just `<Name>`
- Method `<Name>Factory.deployContract()` renamed to `<Name>Factory.deploy()`
- You may need to remove the previously generated `<typegenDir>/contracts/factories` directory

```ts
// before
import { TestContractAbi, TestContract__factory } from './typegen'
import testContractBytecode from './typegen/contracts/TestContract.hex'

const instance = await TestContract__factory.connect(id, wallet);

const deploy = await TestContract__factory.deployContract(testContractBytecode, wallet);
const { contract } = await deploy.waitForResult();
```

```ts
// after
import { TestContract, TestContractFactory } from './typegen'

const instance = new TestContract(id, wallet);

const deploy = await TestContractFactory.deploy(wallet);
const { contract } = await deploy.waitForResult();
```

### Typegen `Predicate` template

- Removed `Abi__factory` suffix from class names
- Started accepting a single parameter object in constructor
- You may need to remove the previously generated `<typegenDir>/predicates/factories` directory

```ts
// before
import { TestPredicateAbi__factory } from './typegen'

const predicate = TestPredicateAbi__factory.createInstance(provider);
```

```ts
// after
import { TestPredicate } from './typegen'

const predicate = new TestPredicate({ provider });
```

### Typegen `Script` template

- Removed `Abi__factory` suffix from class names
- You may need to remove the previously generated `<typegenDir>/scripts/factories` directory

```ts
// before
import { TestPredicateAbi__factory } from './typegen'

const script = TestScriptAbi__factory.createInstance(wallet);
```

```ts
// after
import { TestPredicate } from './typegen'

const script = new TestScript(wallet);
```

### Non-blocking blob deployment - [#2929](https://github.com/FuelLabs/fuels-ts/pull/2929)

The transaction ID from a contract deployment is now returned as a promise.

```ts
// before
import { ContractFactory } from 'fuels';

const factory = new ContractFactory(bytecode, abi, wallet);
const { waitForResult, contractId, transactionId } = await factory.deploy();
console.log(transactionId); // 0x123....
```

```ts
// after
import { ContractFactory } from 'fuels';

const factory = new ContractFactory(bytecode, abi, wallet);
const { waitForResult, contractId, waitForTransactionId } = await factory.deploy();
const transactionId = await waitForTransactionId();
console.log(transactionId); // 0x123....
```

### Improve `()` and `Option<T>` type handling - [#2777](https://github.com/FuelLabs/fuels-ts/pull/2777)

- `()` and `Option<T>` Sway types are now either required or optional, dependent on where the argument appears in the function arguments.

Given these Sway functions:

```sway
fn type_then_void_then_type(x: u8, y: (), z: u8) -> ()
fn type_then_void_then_void(x: u8, y: (), z: ()) -> ()

fn type_then_option_then_type(x: u8, y: Option<u8>, z: u8) -> ()
fn type_then_option_then_option(x: u8, y: Option<u8>, z: Option<u8>) -> ()
```

This is what changes:

```ts
// before
contract.functions.type_then_void_then_type(42, 43)
contract.functions.type_then_void_then_void(42) // Unchanged

contract.functions.type_then_option_then_type(42, undefined, 43)
contract.functions.type_then_option_then_option(42, undefined, undefined)
```

```ts
// after
contract.functions.type_then_void_then_type(42, undefined, 43)
contract.functions.type_then_void_then_void(42) // Unchanged

contract.functions.type_then_option_then_type(42, undefined, 43)
contract.functions.type_then_option_then_option(42)
```

### `fuel-core@0.32.1` and large contract deployments - [#2827](https://github.com/FuelLabs/fuels-ts/pull/2827)

  `MAX_CONTRACT_SIZE` is no longer exported, it should now be fetched from the chain.

```ts
// before
import { MAX_CONTRACT_SIZE } from 'fuels';
```

```ts
// after
import { Provider, FUEL_NETWORK_URL } from 'fuels';

const provider = await Provider.create(FUEL_NETWORK_URL);
const { consensusParameters } = provider.getChain();
const maxContractSize = consensusParameters.contractParameters.contractMaxSize.toNumber();
```

### Deprecate `FUEL_NETWORK_URL` and `LOCAL_NETWORK_URL`- [#2915](https://github.com/FuelLabs/fuels-ts/pull/2915)

  Removed `FUEL_NETWORK_URL` constant.

```ts
// before
import { FUEL_NETWORK_URL } from 'fuels';

const provider = await Provider.create(FUEL_NETWORK_URL);
```

```ts
// after
const provider = await Provider.create('https://127.0.0.1:4000/v1/graphql');
```

Removed `LOCAL_NETWORK_URL` constant.

```ts
// before
import { LOCAL_NETWORK_URL } from 'fuels';

const provider = await Provider.create(LOCAL_NETWORK_URL);
```

```ts
// after
const provider = await Provider.create('https://127.0.0.1:4000/v1/graphql');
```

### Integrate `launchTestNode` in remaining packages - [#2811](https://github.com/FuelLabs/fuels-ts/pull/2811)

  Removed `generateTestWallet` and `seedTestWallet` utilities.

```ts
// before
import { bn } from "@fuel-ts/math";
import {
  seedTestWallet,
  generateTestWallet,
} from "@fuel-ts/account/test-utils";

const provider = await Provider.create("http://127.0.0.1:4000/v1/graphql");

// seeding
const walletA = Wallet.fromPrivateKey("0x...", provider);
const baseAssetId = provider.getBaseAssetId();
seedTestWallet(wallet, [{ assetId: baseAssetId, amount: bn(100_000) }]);

// generating
const walletB = await generateTestWallet(provider, [[1_000, baseAssetId]]);
```

```ts
// after
import { launchTestNode } from 'fuels/test-utils';

// create two wallets seeded with 100_000 units of the base asset
using launched = await launchTestNode({
  walletsConfig: {
    count: 2,
    amountPerCoin: 100_000,
  },
});

const {
  wallets: [walletA, walletB]
} = launched;

const balance = await walletA.getBalance() // 100_000
```

Removed `launchNodeAndGetWallets` utility.

```ts
// before
import { launchNodeAndGetWallets } from 'fuels/test-utils';

const { provider, wallets } = await launchNodeAndGetWallets();
```

```ts
// after
import { launchTestNode } from 'fuels/test-utils';

using launched = await launchTestNode();

const { provider, wallets } = launched;
```

### Renamed `AssetId` to `TestAssetId`- [#2905](https://github.com/FuelLabs/fuels-ts/pull/2905)

  Renamed testing class `AssetId` to `TestAssetId`.

```ts
// before
import { AssetId } from 'fuels/test-utils';

const [assetA] = AssetId.random();
```

```ts
// after
import { TestAssetId } from 'fuels/test-utils';

const [assetA] = TestAssetId.random();
```

### Adding abi transpiler - [#2856](https://github.com/FuelLabs/fuels-ts/pull/2856)

New ABI spec

The SDK now adheres to the new specs introduced via:

- https://github.com/FuelLabs/fuel-specs/pull/596
- https://github.com/FuelLabs/fuel-specs/pull/599

Check these out to understand all its changes.

The class `AbiCoder` is no longer exported, and the way to do encoding and decoding of specific types is now via the `Interface.encodeType` and `Interface.decodeType` methods:

```ts
// before
const abi = yourAbi;
const functionArg = abi.functions.inputs[0];

const encoded = AbiCoder.encode(abi, functionArg, valueToEncode);
const decoded = AbiCoder.decode(abi, functionArg, valueToDecode, 0);
```

```ts
// after
import { Interface } from 'fuels';

const abi = yourAbi;
const functionArg = abi.functions.inputs[0];

const abiInterface = new Interface(abi);

const encoded = abiInterface.encodeType(functionArg.concreteTypeId, valueToEncode);
const decoded = abiInterface.decodeType(functionArg.concreteTypeId, valueToDecode);
```

Previously, you could get a type from the ABI via the `Interface.findTypeById`. This method has been removed after introducing the new abi specification because the concept of a *type* has been split into concrete types and metadata types. If you want a specific type, you can get it directly from the ABI.

```ts
// before
const abiInterface = new Interface(abi);

// internally this method searched the abi types:
// abi.types.find(t => t.typeId === id);
const type = abiInterface.findTypeById(id);
```

```ts
// after
import { Interface } from 'fuels';

// search the types on the abi directly
const concreteType = abi.concreteTypes.find(ct => ct.concreteTypeId === id);
const metadataType = abiInterface.jsonAbi.metadataTypes.find(mt => mt.metadataTypeId === id);
```

The `JsonAbiArgument` type isn't part of the new ABI spec *([#596](https://github.com/FuelLabs/fuel-specs/pull/596), [#599](https://github.com/FuelLabs/fuel-specs/pull/599))* as such so we stopped exporting it. Its closest equivalent now would be a concrete type because it fully defines a type.

```ts
// before
const arg: JsonAbiArgument = {...};
```

```ts
// after
import { Interface } from 'fuels';

type ConcreteType = JsonAbi["concreteTypes"][number]
const arg: ConcreteType = {...};
```

### Read malleable fields from transaction status on subscription - [#2962](https://github.com/FuelLabs/fuels-ts/pull/2962)

Removed `TransactionResult.gqlTransaction`. You can use the `TransactionResult.transaction` field instead, which has all the data that `TransactionResult.gqlTransaction` has but already decoded.

```ts
// before
const { gqlTransaction } = await new TransactionResponse('your-tx-id').waitForResult();
```

```ts
// after
const { transaction } = await new TransactionResponse('your-tx-id').waitForResult();
```

### Fix assembly process for account transfer operation - [#2963](https://github.com/FuelLabs/fuels-ts/pull/2963)

The `getTransferOperations` helper function now requires an additional `baseAssetId` parameter.

```ts
// before
const transferOperations = getTransferOperations({ inputs, outputs, receipts })
```

```ts
// after
const transferOperations = getTransferOperations({ inputs, outputs, receipts, baseAssetId })
```

### Wrap subscriptions in promise - [#2964](https://github.com/FuelLabs/fuels-ts/pull/2964)

```ts
// before
const subscription = provider.operations.statusChange({ transactionId });
for await (const response of subscription) { ... }
```

```ts
// after
const subscription = await provider.operations.statusChange({ transactionId });
for await (const response of subscription) { ... }
```

## July 30, 2024

[Release v0.93.0](https://github.com/FuelLabs/fuels-ts/releases/tag/v0.93.0)

### Deploy contract validation - [#2796](https://github.com/FuelLabs/fuels-ts/pull/2796)

`ErrorCode.INVALID_TRANSACTION_TYPE` was migrated to `ErrorCode.UNSUPPORTED_TRANSACTION_TYPE`.

```ts
// before
const code = ErrorCode.INVALID_TRANSACTION_TYPE;
```

```ts
// after
const code = ErrorCode.UNSUPPORTED_TRANSACTION_TYPE;
```

### Remove `awaitExecution` functionality - [#2820](https://github.com/FuelLabs/fuels-ts/pull/2820)

  It is no longer possible to submit transactions using the `awaitExecution` flag and wait for the transaction to be processed at submission:

```ts
// before
const response = await account.sendTransaction(transactionRequest, { awaitExecution: true });
```

```ts
// after
const submit = await account.sendTransaction(transactionRequest);

const response = await submit.waitForResult();
```

### Refactored the `getTransactionCost` method - [#2643](https://github.com/FuelLabs/fuels-ts/pull/2643)

  Refactored functionality for `Provider.getTransactionCost` to `Account.getTransactionCost` **and** changed estimation parameter from `quantitiesToContract` to `quantities`.

```ts
// before
const provider = Provider.create(...);
const account = Wallet.generate({ ... }) || new Predicate(...);
const quantities: Array<CoinQuantityLike> = [
  { amount: 1000, assetId: provider.getBaseAssetId() }
];

const cost = provider.getTransactionCost(txRequest, {
  resourceOwner: account,
  quantitiesToContract: quantities,
})
```

```ts
// after
const provider = Provider.create(...);
const account = Wallet.generate({ ... }) || new Predicate(...);
const quantities: Array<CoinQuantityLike> = [
  { amount: 1000, assetId: provider.getBaseAssetId() }
];

const cost = account.getTransactionCost(txRequest, { quantities });
```

## July 11, 2024

Release [v0.92.0](https://github.com/FuelLabs/fuels-ts/releases/tag/v0.92.0)

### Implement non-blocking contract call - [#2692](https://github.com/FuelLabs/fuels-ts/pull/2692)

  The `call` method in the `BaseInvocationScope` class no longer waits for transaction execution, making it non-blocking. This change affects how transaction responses are handled.

```ts
// before
const { logs, value, transactionResult } = await contract.functions.xyz().call()
```

```ts
// after
const { transactionId, waitForResult } = await contract.functions.xyz().call();

const { logs, value, transactionResult } = await waitForResult();
```

### Made `deployContract` a non-blocking call - [#2597](https://github.com/FuelLabs/fuels-ts/pull/2597)

  The `deployContract` method no longer returns the contract instance directly. Instead, it returns an object containing the `transactionId` , the `contractId`, and a `waitForResult` function.

```ts
// before
const factory = new ContractFactory(contractByteCode, contractAbi, wallet);

const contract = await factory.deployContract();

const { value } = await contract.functions.xyz().call();

// after
const factory = new ContractFactory(contractByteCode, contractAbi, wallet);

const { waitForResult, transactionId, contractId } = await factory.deployContract();

const { contract, transactionResult } = await waitForResult();

const { value } = await contract.functions.xyz().call();
```

### Implement pagination for `Account` methods - [#2408](https://github.com/FuelLabs/fuels-ts/pull/2408)

```ts
// before
const coins = await myWallet.getCoins(baseAssetId);
const messages = await myWallet.getMessages();
const balances = await myWallet.getBalances();
const blocks = await provider.getBlocks();

// after
const { coins, pageInfo } = await myWallet.getCoins(baseAssetId);
const { messages, pageInfo } = await myWallet.getMessages();
const { balances } = await myWallet.getBalances();
const { blocks, pageInfo } = await provider.getBlocks();

/*
  The `pageInfo` object contains cursor pagination information one
  can use to fetch subsequent pages selectively and on demand.
*/
```

### `launchNode.cleanup` not killing node in last test of test group - [#2718](https://github.com/FuelLabs/fuels-ts/pull/2718)

  The `killNode` and `KillNodeParams` functionality has been internalized and the method and interface have been deleted so they're no longer exported.  It's marked as a breaking change for pedantic reasons and there shouldn't really be any affected users given that they kill nodes via `cleanup` which is unchanged, so no migration notes are necessary.

### Remove `InvocationResult` from `program` package - [#2652](https://github.com/FuelLabs/fuels-ts/pull/2652)

  The classes `FunctionInvocationResult`, `InvocationCallResult`, and `InvocationResult` have been removed. This change will not affect most users as the response for a contract call or script call remains the same; only the type name has changed.

```ts
// before
const callResult: FunctionInvocationResult = await contract.functions.xyz().call()

const dryRunResult: InvocationCallResult = await contract.functions.xyz().get()
const dryRunResult: InvocationCallResult = await contract.functions.xyz().dryRun()
const dryRunResult: InvocationCallResult = await contract.functions.xyz().simulate()


// after
const callResult: FunctionResult = await contract.functions.xyz().call()

const dryRunResult: DryRunResult = await contract.functions.xyz().get()
const dryRunResult: DryRunResult = await contract.functions.xyz().dryRun()
const dryRunResult: DryRunResult = await contract.functions.xyz().simulate()
```
