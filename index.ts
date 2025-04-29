import { Fr } from '@aztec/aztec.js';
import { pedersenHashBuffer } from '@aztec/foundation/crypto';
import { generateKeyPair, sign, verify } from '~/sag';

// Generate key pairs for ring members
const ringSize = 2;
const kps = Array.from({ length: ringSize }, async () => {
  const kp = await generateKeyPair();
  return kp;
});

const keyPairs = await Promise.all(kps);

const publicKeys = keyPairs.map((kp) => kp.publicKey);

console.log(
  publicKeys.map((p) => {
    return {
      x: p.x.toString(),
      y: p.y.toString(),
    };
  })
);

// Choose a signer
const signerIndex = 1;
const message = new TextEncoder().encode('Confidential message');
const hashedMessage = await pedersenHashBuffer(Buffer.from(message));
const messageFr = Fr.fromBuffer(hashedMessage);

console.log('Message: ', messageFr.toString());

// Sign the message
const signature = await sign(
  messageFr,
  publicKeys,
  keyPairs[signerIndex]!.privateKey,
  signerIndex
);

console.log('c0: ', signature.c0.toString());
console.log(
  's: ',
  signature.s.map((x) => x.toString())
);

// Verify the signature
const isValid = await verify(messageFr, signature);
console.log('Signature valid:', isValid);
