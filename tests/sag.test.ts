import { beforeAll, describe, expect, it } from 'vitest';

import { Prover, toCircuitInputs } from '@zkpersona/noir-helpers';

import circuit from '../target/sag_example.json' assert { type: 'json' };

import { type Fq, Fr, type Point } from '@aztec/aztec.js';
import { pedersenHashBuffer } from '@aztec/foundation/crypto';
import type { CompiledCircuit } from '@noir-lang/noir_js';
import { generateKeyPair } from '../src';
import { sagToNoirInputs, sign } from '../src/sag';

describe('SAG Ring Signature Verification', () => {
  let prover: Prover;
  let messageFr: Fr;
  let keyPairs: {
    publicKey: Point;
    privateKey: Fq;
  }[];
  let publicKeys: Point[];

  beforeAll(async () => {
    prover = new Prover(circuit as CompiledCircuit, { type: 'honk' });
    const message = new TextEncoder().encode('Confidential message');
    const hashedMessage = await pedersenHashBuffer(Buffer.from(message));
    messageFr = Fr.fromBuffer(hashedMessage);
    const kps = Array.from({ length: 16 }, generateKeyPair);
    keyPairs = await Promise.all(kps);
    publicKeys = keyPairs.map((kp) => kp.publicKey);
  });

  it('should verify a valid signature', async () => {
    const signerIndex = 3;

    const signature = await sign(
      messageFr,
      publicKeys,
      keyPairs[signerIndex]!.privateKey,
      signerIndex
    );

    const inputs = sagToNoirInputs(signature, messageFr, 16);
    const proof = await prover.fullProve(toCircuitInputs(inputs), {
      type: 'honk',
    });
    const isVerified = await prover.verify(proof, { type: 'honk' });

    expect(isVerified).toBe(true);
  });

  it('should throw on wrong signer', async () => {
    const wrongSigner = await generateKeyPair();

    const signerIndex = 3;

    const signature = await sign(
      messageFr,
      publicKeys,
      wrongSigner.privateKey,
      signerIndex
    );

    const inputs = sagToNoirInputs(signature, messageFr, 16);

    const { returnValue } = await prover.simulateWitness(
      toCircuitInputs(inputs)
    );

    expect(returnValue).toBe(false);
  });

  it('should throw on malformed ring', async () => {
    const wrongSigner = await generateKeyPair();

    const signerIndex = 3;

    const signature = await sign(
      messageFr,
      [...publicKeys.slice(1), wrongSigner.publicKey],
      keyPairs[signerIndex]!.privateKey,
      signerIndex
    );

    const inputs = sagToNoirInputs(signature, messageFr, 16);

    const { returnValue } = await prover.simulateWitness(
      toCircuitInputs(inputs)
    );

    expect(returnValue).toBe(false);
  });
});
