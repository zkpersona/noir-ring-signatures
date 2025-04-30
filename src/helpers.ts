import { Grumpkin, GrumpkinScalar } from '@aztec/aztec.js';
import { pedersenHash } from '@aztec/foundation/crypto';
import type { Fieldable } from '@aztec/foundation/serialize';

/**
 * Computes the modulo operation on a bigint value with a specified modulus.
 * Ensures the result is always non-negative and within the range [0, modulus).
 *
 * @param value - The value to compute modulo on
 * @param modulus - The modulus to use (defaults to GrumpkinScalar.MODULUS)
 * @returns The result of value mod modulus, guaranteed to be non-negative
 */
export const mod = (
  value: bigint,
  modulus = GrumpkinScalar.MODULUS
): bigint => {
  const result = value % modulus;
  return result >= 0n ? result : result + modulus;
};

/**
 * Generates a random scalar value on the Grumpkin curve.
 * This is useful for creating private keys and random values in cryptographic operations.
 *
 * @returns A random GrumpkinScalar value
 */
export const randomScalar = () => GrumpkinScalar.random();

/**
 * Generates a new key pair for the Grumpkin curve.
 * The key pair consists of a private key (scalar) and its corresponding public key (point).
 *
 * @returns A Promise that resolves to an object containing:
 *   - privateKey: A random GrumpkinScalar value
 *   - publicKey: The corresponding public key point on the Grumpkin curve
 */
export const generateKeyPair = async () => {
  const privateKey = GrumpkinScalar.random();
  const Curve = new Grumpkin();
  const publicKey = await Curve.mul(Grumpkin.generator, privateKey);
  return { privateKey, publicKey };
};

/**
 * Hashes an array of field elements to a scalar value on the Grumpkin curve.
 * This is useful for converting arbitrary data into a scalar value for cryptographic operations.
 *
 * @param input - An array of field elements to hash
 * @returns A Promise that resolves to a GrumpkinScalar value
 */
export const hashToScalar = async (
  input: Fieldable[]
): Promise<GrumpkinScalar> => {
  const hash = await pedersenHash(input);
  return GrumpkinScalar.fromBuffer(hash.toBuffer());
};
