# Sway Migrations Guide

## August 14, 2024

[Release TODO](TODO)

### `#[namespace()]` attribute is no longer supported - [#6279](https://github.com/FuelLabs/sway/pull/6279)

We no longer support the `#[namespace()]` attribute.  If you use it, notably with SRC14, you should migrate to using the `in` keyword if you want backwards compatibility.  If you just care about namespacing, you should use the new namespacing syntax.

```rust
// before
#[namespace(example_namespace)]
storage {
    foo: u64 = 0,
}
```

```rust
// after
storage {
    example_namespace {
        foo: u64 = 0,
    },
}
```

### Configurables are no longer allowed in pattern matching and shadowing - [#6289](https://github.com/FuelLabs/sway/pull/6289)

The code below does not compile any more.

```rust
configurable {
    X: u8 = 10,
}

fn main() {
    let X = 101u8; // ERROR: Variable "X" shadows configurable of the same name.
}
```

```rust
configurable {
    X: u8 = 10,
}

fn main() {
    match var {
        (0, X) => true // ERROR: "X" is a configurable and configurables cannot be matched against.
    }
}
```

### New ABI specification format - [#6254](https://github.com/FuelLabs/sway/pull/6254)

The new ABI specification format is hash based to improve support for indexing.  There were also updates to support the latest VM features.

### Added variable length message suport when verifying ed signatures - [#6419](https://github.com/FuelLabs/sway/pull/6419)

`ed_verify` was changed to use `Bytes` for the message instead of `b256` for a message hash.

```rust
// before
pub fn ed_verify(public_key: b256, signature: B512, msg_hash: b256)
```

```rust
// after
pub fn ed_verify(public_key: b256, signature: B512, msg: Bytes)
```

### Some STD functions now return an `Option` instead of reverting - [#6405](https://github.com/FuelLabs/sway/pull/6405)

Some functions in the STD now return an `Option` instead of reverting.  This allows developers to fail gracefully.  More functions will do this in the future.

```rust
// before
let my_predicate_address: Address = predicate_address();
```

```rust
// after
let my_predicate_address: Address = predicate_address().unwrap();
```

### Non-breaking Changes

New partial support for slices.

Automated proxy creation and deployment with forc.

Soon the contract chunking tool will be merged.
