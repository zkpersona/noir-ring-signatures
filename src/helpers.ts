import type { Fr } from '@aztec/aztec.js';
import { Bool, BoundedVec, Field } from '@zkpersona/noir-helpers';
import type { RingSignature } from './sag';

export const sagToNoirInputs = (
  signature: RingSignature,
  messageFr: Fr,
  maxRingSize: number
) => {
  const c0 = new Field(signature.c0.toBigInt());
  const s = new BoundedVec(
    maxRingSize,
    new Field(0),
    signature.s.map((x) => new Field(x.toBigInt()))
  );

  const _default = {
    x: new Field(0),
    y: new Field(0),
    is_infinite: new Bool(false),
  };

  const ring = new BoundedVec(
    maxRingSize,
    _default,
    signature.publicKeys.map((p) => ({
      x: new Field(p.x.toBigInt()),
      y: new Field(p.y.toBigInt()),
      is_infinite: new Bool(false),
    }))
  );

  const sig = { c0, s };
  const hashed_message = new Field(messageFr.toBigInt());

  return {
    signature: sig,
    hashed_message,
    ring,
  };
};
