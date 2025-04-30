import type { Fr } from '@aztec/aztec.js';
import { Bool, BoundedVec, Field } from '@zkpersona/noir-helpers';
import type { RingSignature } from '../types';

/**
 * Converts a SAG (Signature of Anonymous Group) ring signature to the format required
 * by the Noir circuit for verification.
 *
 * This function handles the conversion of:
 * - The initial challenge value (c0)
 * - The response values (s) for each ring member
 * - The public keys forming the ring
 * - The hashed message
 *
 * @param signature - The SAG ring signature to convert, containing:
 *   - c0: The initial challenge value
 *   - s: Array of response values for each ring member
 *   - publicKeys: Array of public keys forming the ring
 * @param messageFr - The hashed message as a field element
 * @param maxRingSize - The maximum number of public keys that can be in the ring
 *
 * @returns An object containing the converted inputs for the Noir circuit:
 *   - signature: The converted signature with c0 and s values
 *   - hashed_message: The converted hashed message
 *   - ring: The converted array of public keys
 */
export const sagToNoirInputs = (
  signature: RingSignature,
  messageFr: Fr,
  maxRingSize: number
) => {
  // Convert the initial challenge value to a Noir Field
  const c0 = new Field(signature.c0.toBigInt());

  // Convert the response values to a Noir BoundedVec of Fields
  const s = new BoundedVec(
    maxRingSize,
    new Field(0),
    signature.s.map((x) => new Field(x.toBigInt()))
  );

  // Define the default point structure for the ring
  const Default = {
    x: new Field(0),
    y: new Field(0),
    is_infinite: new Bool(false),
  };

  // Convert the public keys to a Noir BoundedVec of points
  const ring = new BoundedVec(
    maxRingSize,
    Default,
    signature.publicKeys.map((p) => ({
      x: new Field(p.x.toBigInt()),
      y: new Field(p.y.toBigInt()),
      is_infinite: new Bool(false),
    }))
  );

  // Create the signature object with converted values
  const sig = { c0, s };

  // Convert the hashed message to a Noir Field
  const hashedMessage = new Field(messageFr.toBigInt());

  return {
    signature: sig,
    hashed_message: hashedMessage,
    ring,
  };
};
