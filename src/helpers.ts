import { Grumpkin, GrumpkinScalar } from '@aztec/aztec.js';
import { pedersenHash } from '@aztec/foundation/crypto';
import type { Fieldable } from '@aztec/foundation/serialize';

export const mod = (
  value: bigint,
  modulus = GrumpkinScalar.MODULUS
): bigint => {
  const result = value % modulus;
  return result >= 0n ? result : result + modulus;
};

export const randomScalar = () => GrumpkinScalar.random();

export const generateKeyPair = async () => {
  const privateKey = GrumpkinScalar.random();
  const Curve = new Grumpkin();
  const publicKey = await Curve.mul(Grumpkin.generator, privateKey);
  return { privateKey, publicKey };
};

export const hashToScalar = async (
  input: Fieldable[]
): Promise<GrumpkinScalar> => {
  const hash = await pedersenHash(input);
  return GrumpkinScalar.fromBuffer(hash.toBuffer());
};
