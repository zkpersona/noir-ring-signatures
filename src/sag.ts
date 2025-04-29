import { type Fr, Grumpkin, GrumpkinScalar, type Point } from '@aztec/aztec.js';
import { pedersenHash } from '@aztec/foundation/crypto';
import type { Fieldable } from '@aztec/foundation/serialize';

export type PrivateKey = GrumpkinScalar;
export type PublicKey = Point;

const G = Grumpkin.generator;

export interface RingSignature {
  c0: GrumpkinScalar;
  s: GrumpkinScalar[];
  publicKeys: PublicKey[];
}

const mod = (value: bigint, modulus = GrumpkinScalar.MODULUS): bigint => {
  const result = value % modulus;
  return result >= 0n ? result : result + modulus;
};

export const randomScalar = () => GrumpkinScalar.random();

export const generateKeyPair = async () => {
  const privateKey = GrumpkinScalar.random();
  const Curve = new Grumpkin();
  const publicKey = await Curve.mul(G, privateKey);
  return { privateKey, publicKey };
};

async function hashToScalar(input: Fieldable[]): Promise<GrumpkinScalar> {
  const hash = await pedersenHash(input);
  return GrumpkinScalar.fromBuffer(hash.toBuffer());
}

export async function sign(
  message: Fr,
  publicKeys: PublicKey[],
  privateKey: PrivateKey,
  signerIndex: number
): Promise<RingSignature> {
  const Curve = new Grumpkin();
  const ringSize = publicKeys.length;
  const s: GrumpkinScalar[] = new Array(ringSize);
  const c: GrumpkinScalar[] = new Array(ringSize);

  const u = randomScalar();
  const uPoint = await Curve.mul(G, u);
  c[(signerIndex + 1) % ringSize] = await hashToScalar([
    uPoint.x,
    uPoint.y,
    message,
  ]);

  for (
    let i = (signerIndex + 1) % ringSize;
    i !== signerIndex;
    i = (i + 1) % ringSize
  ) {
    s[i] = randomScalar();
    const z1 = await Curve.mul(G, s[i]!);
    const z2 = await Curve.mul(publicKeys[i]!, c[i]!);
    const z = await Curve.add(z1, z2);
    c[(i + 1) % ringSize] = await hashToScalar([z.x, z.y, message]);
  }

  const res = mod(
    u.toBigInt() - privateKey.toBigInt() * c[signerIndex]!.toBigInt()
  );

  s[signerIndex] = GrumpkinScalar.fromString(res.toString());

  return {
    c0: c[0]!,
    s,
    publicKeys,
  };
}

export async function verify(
  message: Fr,
  signature: RingSignature
): Promise<boolean> {
  const Curve = new Grumpkin();
  const { c0, s, publicKeys } = signature;
  const ringSize = publicKeys.length;
  const c: GrumpkinScalar[] = new Array(ringSize);
  c[0] = c0;

  for (let i = 0; i < ringSize; i++) {
    const z1 = await Curve.mul(G, s[i]!);
    const z2 = await Curve.mul(publicKeys[i]!, c[i]!);
    const z = await Curve.add(z1, z2);
    c[(i + 1) % ringSize] = await hashToScalar([z.x, z.y, message]);
  }

  return c0.equals(c[0]);
}
