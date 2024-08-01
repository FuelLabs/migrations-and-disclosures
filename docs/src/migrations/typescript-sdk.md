# TypeScript SDK Migrations Guide
## July 30, 2024

[Release v0.93.0](https://github.com/FuelLabs/fuels-ts/releases/tag/v0.93.0)

### [#2796 - Deploy contract validation](https://github.com/FuelLabs/fuels-ts/pull/2796)

  `ErrorCode.INVALID_TRANSACTION_TYPE` was migrated to `ErrorCode.UNSUPPORTED_TRANSACTION_TYPE`.

```ts
// before
const code = ErrorCode.INVALID_TRANSACTION_TYPE;
```

```ts
// after
const code = ErrorCode.UNSUPPORTED_TRANSACTION_TYPE;
```

### [#2820 - Remove `awaitExecution` functionality](https://github.com/FuelLabs/fuels-ts/pull/2820)

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
### [#2643 - Refactored the `getTransactionCost` method](https://github.com/FuelLabs/fuels-ts/pull/2643)

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
