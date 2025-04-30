/**
 * Implementation of the SAG (Spontaneous Anonymous Group) ring signature scheme
 * using the Grumpkin curve and Pedersen hash function.
 *
 * This implementation provides a way to create and verify ring signatures,
 * which allow a member of a group to sign a message on behalf of the group
 * without revealing which specific member created the signature.
 *
 * @module sag
 */

import { type Fr, Grumpkin, GrumpkinScalar, type Point } from '@aztec/aztec.js';
import { hashToScalar, mod, randomScalar } from '../helpers';
import type { RingSignature } from '../types';

/** Generator point of the Grumpkin curve */
const G = Grumpkin.generator;

/**
 * Creates a ring signature for a given message using the SAG scheme.
 *
 * The signing process involves:
 * 1. Generating a random scalar 'a' and computing aG
 * 2. Creating a chain of commitments using the public keys in the ring
 * 3. Computing the signature components (s values) for each ring member
 * 4. Using the signer's private key to close the ring
 *
 * @param hashedMessage - The message to be signed, already hashed to a field element
 * @param publicKeys - Array of public keys forming the ring
 * @param privateKey - Private key of the actual signer
 * @param signerIndex - Index of the signer's public key in the ring
 * @returns A ring signature containing the challenge c0, signature components s, and public keys
 */
export const sign = async (
  hashedMessage: Fr,
  publicKeys: Point[],
  privateKey: GrumpkinScalar,
  signerIndex: number
): Promise<RingSignature> => {
  const Curve = new Grumpkin();
  const ringSize = publicKeys.length;
  const s: GrumpkinScalar[] = new Array(ringSize);
  const c: GrumpkinScalar[] = new Array(ringSize);

  // Step 1: Generate random scalar 'a' and compute aG
  const a = randomScalar();
  const aG = await Curve.mul(G, a);

  // Step 2: Compute first challenge after signer's position
  c[(signerIndex + 1) % ringSize] = await hashToScalar([
    aG.x,
    aG.y,
    hashedMessage,
  ]);

  // Step 3: Create chain of commitments for all ring members except the signer
  for (
    let i = (signerIndex + 1) % ringSize;
    i !== signerIndex;
    i = (i + 1) % ringSize
  ) {
    const K = publicKeys[i]!;
    const r = randomScalar();
    const rG = await Curve.mul(G, r);
    const cK = await Curve.mul(K, c[i]!);
    const rG_cK = await Curve.add(cK, rG);
    s[i] = r;
    c[(i + 1) % ringSize] = await hashToScalar([
      rG_cK.x,
      rG_cK.y,
      hashedMessage,
    ]);
  }

  // Step 4: Compute signer's signature component using private key
  const res = mod(
    a.toBigInt() - privateKey.toBigInt() * c[signerIndex]!.toBigInt()
  );

  s[signerIndex] = GrumpkinScalar.fromString(res.toString());

  return {
    c0: c[0]!,
    s,
    publicKeys,
  };
};

/**
 * Verifies a ring signature against a given message.
 *
 * The verification process involves:
 * 1. Reconstructing the chain of commitments using the signature components
 * 2. Checking if the final challenge matches the initial challenge (c0)
 *
 * @param hashedMessage - The message to verify, already hashed to a field element
 * @param signature - The ring signature to verify
 * @returns True if the signature is valid, false otherwise
 */
export const verify = async (
  hashedMessage: Fr,
  signature: RingSignature
): Promise<boolean> => {
  const Curve = new Grumpkin();
  const { c0, s, publicKeys } = signature;
  const ringSize = publicKeys.length;
  const C: GrumpkinScalar[] = new Array(ringSize);

  C[0] = c0;

  // Reconstruct the chain of commitments
  for (let i = 0; i < ringSize; i++) {
    const K = publicKeys[i]!;
    const r = s[i]!;
    const c = C[i]!;
    const rG = await Curve.mul(G, r);
    const cK = await Curve.mul(K, c);
    const cK_rG = await Curve.add(cK, rG);
    C[(i + 1) % ringSize] = await hashToScalar([
      cK_rG.x,
      cK_rG.y,
      hashedMessage,
    ]);
  }

  // Verify that the chain closes correctly
  return c0.equals(C[0]);
};

export * from './helpers';
