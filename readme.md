# Noir Ring Signatures

This library provides implementations of Ring Signatures schemes in Noir. Ring Signatures are a type of cryptographic signature scheme that allow a member of a group to sign a message on behalf of the group without revealing which member actually created the signature. This provides anonymity for the signer while still proving that the signature came from a member of the specified group.

Currently, the library supports the following Ring Signature schemes:

- SAG (Signature of Anonymous Group)

Ring Signatures are over the [Grumpkin curve](https://aztecprotocol.github.io/aztec-connect/primitives.html#2-grumpkin---a-curve-on-top-of-bn-254-for-snark-efficient-group-operations) and use the Pedersen hash function to generate the challenges.

---

## Installation

In your _Nargo.toml_ file, add the version of this library you would like to install under dependency:

```toml
[dependencies]
noir_ring_signatures = { tag = "v0.1.0", git = "https://github.com/zkpersona/noir-ring-signatures" }
```

The noir library is accompanied by a typescript library that provides a set of functions for creating Ring Signatures.

#### Install the Library

```bash
npm install @zkpersona/noir-ring-signatures
# or
yarn add @zkpersona/noir-ring-signatures
# or
pnpm add @zkpersona/noir-ring-signatures
```

---

### Create a Ring Signature

```typescript
import { generateKeyPair } from '@zkpersona/noir-ring-signatures';
import { sagToNoirInputs, sign } from '@zkpersona/noir-ring-signatures/sag';

import { generateToml, toCircuitInputs } from '@zkpersona/noir-helpers';

import { Fr } from '@aztec/aztec.js';
import { pedersenHashBuffer } from '@aztec/foundation/crypto';

const message = new TextEncoder().encode('Confidential message');
const hashedMessage = await pedersenHashBuffer(Buffer.from(message));
const messageFr = Fr.fromBuffer(hashedMessage);

const ringSize = 16;
const signerIndex = 3;

const kps = Array.from({ length: 16 }, generateKeyPair);
const keyPairs = await Promise.all(kps);
const publicKeys = keyPairs.map((kp) => kp.publicKey);

const signature = await sign(
  messageFr,
  publicKeys,
  keyPairs[signerIndex]!.privateKey,
  signerIndex
);

const inputs = sagToNoirInputs(signature, messageFr, ringSize);

// To convert the inputs to a circuit input format, use the following function:
const circuitInputs = toCircuitInputs(inputs);

// To Generate a TOML file for the circuit inputs, use the following command:
generateToml(circuitInputs, '/abs/path/to/file.toml');
```

---

### Noir Circuit

```noir
use noir_ring_signatures::sag::{Signature, verify};
use std::embedded_curve_ops::EmbeddedCurvePoint;

pub global MAX_RING_SIZE: u32 = 16;

pub fn main(
    signature: Signature<MAX_RING_SIZE>,
    hashed_message: Field,
    ring: BoundedVec<EmbeddedCurvePoint, MAX_RING_SIZE>,
) -> pub bool {
    verify(signature, hashed_message, ring)
}
```

---

### Benchmarks

Benchmarks are generated using the `scripts/build-gates-report.sh` script. The benchmark will be generated at `./gates_report.json`.

1. Small Ring SAG (Ring Size=8)
    - ACIR opcodes: 1019
    - Circuit size: 23530

2. Medium Ring SAG (Ring Size=32)
    - ACIR opcodes: 5555
    - Circuit size: 92148

3. Large Ring SAG (Ring Size=128)
    - ACIR opcodes: 46739
    - Circuit size: 464540


To generate the benchmarks, run the following command:

```bash
noir export && bash ./scripts/build-gates-report.sh
```
---

### License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more details.

---

### Contributing

Contributions are welcome! Open an issue or submit a pull request.

---
