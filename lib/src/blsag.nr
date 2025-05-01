//! Implementation of the SAG (Signature of Anonymous Group) ring signature scheme
//! using the Grumpkin curve and Pedersen hash function.
//!
//! Ring signatures allow a member of a group to sign a message on behalf of the group
//! without revealing which member actually created the signature. This provides
//! anonymity for the signer while still proving that the signature came from a member
//! of the specified group.

use std::embedded_curve_ops::{
    EmbeddedCurvePoint, EmbeddedCurvePoint as Point, EmbeddedCurveScalar as Scalar,
    multi_scalar_mul,
};

use super::grumpkin::utils::hash_to_curve;
use std::hash::pedersen_hash;

pub global G: EmbeddedCurvePoint = EmbeddedCurvePoint {
    x: 0x01,
    y: 0x02cf135e7506a45d632d270d45f1181294833fc48d823f272c,
    is_infinite: false,
};

pub struct Signature<let MaxRingSize: u32> {
    /// The initial challenge value c0
    c0: Field,
    /// Vector of response values s_i for each ring member
    s: BoundedVec<Field, MaxRingSize>,
    /// Key Image used to sign the message
    key_image: Point,
}

pub fn verify<let MaxRingSize: u32>(
    signature: Signature<MaxRingSize>,
    hashed_message: Field,
    ring: BoundedVec<Point, MaxRingSize>,
    key_image: Point,
) -> bool {
    let mut C: BoundedVec<Field, MaxRingSize> = BoundedVec::from_array([0; MaxRingSize]);
    C.set(0, signature.c0);

    let I = key_image;

    for i in 0..MaxRingSize {
        if (i < ring.len()) {
            let K = ring.get(i);
            let r = Scalar::from_field(signature.s.get(i));
            let c = Scalar::from_field(C.get(i));

            let rG_cK = multi_scalar_mul([G, K], [r, c]);
            let seed: [u8; 32] = pedersen_hash([rG_cK.x, rG_cK.y, hashed_message]).to_be_bytes();
            let HK = hash_to_curve(seed);
            let rHK_cI = multi_scalar_mul([HK, I], [r, c]);
            C.set(
                (i + 1) % ring.len(),
                pedersen_hash([hashed_message, rG_cK.x, rG_cK.y, rHK_cI.x, rHK_cI.y]),
            );
        }
    }

    C.get(0) == signature.c0
}
