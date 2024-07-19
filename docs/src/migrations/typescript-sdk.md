# TypeScript SDK Migrations Guide

## Release [v0.92.0](https://github.com/FuelLabs/fuels-ts/releases/tag/v0.92.0) July 11, 2024

### Implement non-blocking contract call

  The `call` method in the `BaseInvocationScope` class no longer waits for transaction execution, making it non-blocking. This change affects how transaction responses are handled.

```ts
// before
const { logs, value, transactionResult } = await contract.functions.xyz().call()

// after
const { transactionId, waitForResult } = await contract.functions.xyz().call();

const { logs, value, transactionResult } = await waitForResult();
```

### Made `deployContract` a non-blocking call

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

### Implement pagination for `Account` methods

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

### `launchNode.cleanup` not killing node in last test of test group

  The `killNode` and `KillNodeParams` functionality has been internalized and the method and interface have been deleted so they're no longer exported.  It's marked as a breaking change for pedantic reasons and there shouldn't really be any affected users given that they kill nodes via `cleanup` which is unchanged, so no migration notes are necessary.

### Remove `InvocationResult` from `program` package

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
