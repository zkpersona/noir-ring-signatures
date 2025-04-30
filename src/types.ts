import type { GrumpkinScalar, Point } from '@aztec/aztec.js';

/**
 * Represents a SAG (Signature of Anonymous Group) ring signature.
 *
 * A ring signature allows a member of a group to sign a message on behalf of the group
 * without revealing which member actually created the signature. This provides
 * anonymity for the signer while still proving that the signature came from a member
 * of the specified group.
 *
 * @property c0 - The initial challenge value in the signature scheme. This is a scalar
 *                value on the Grumpkin curve that serves as the starting point for
 *                the verification process.
 * @property s - Array of response values for each ring member. Each value is a scalar
 *               on the Grumpkin curve that proves knowledge of the corresponding
 *               private key without revealing which one it is.
 * @property publicKeys - Array of public keys forming the ring. These are points on
 *                       the Grumpkin curve that represent the possible signers of the
 *                       message.
 */
export interface RingSignature {
  c0: GrumpkinScalar;
  s: GrumpkinScalar[];
  publicKeys: Point[];
}
