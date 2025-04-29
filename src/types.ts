import type { GrumpkinScalar, Point } from '@aztec/aztec.js';

export interface RingSignature {
  c0: GrumpkinScalar;
  s: GrumpkinScalar[];
  publicKeys: Point[];
}
