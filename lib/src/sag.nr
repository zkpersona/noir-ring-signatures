//! Implementation of the SAG (Signature of Anonymous Group) ring signature scheme
//! using the Grumpkin curve and Pedersen hash function.
//!
//! Ring signatures allow a member of a group to sign a message on behalf of the group
//! without revealing which member actually created the signature. This provides
//! anonymity for the signer while still proving that the signature came from a member
//! of the specified group.

use std::embedded_curve_ops::{
    embedded_curve_add, EmbeddedCurvePoint, EmbeddedCurvePoint as Point,
    EmbeddedCurveScalar as Scalar, fixed_base_scalar_mul, multi_scalar_mul,
};

use std::hash::pedersen_hash;

/// Represents a SAG ring signature
///
/// # Type Parameters
/// * `MaxRingSize`: The maximum number of public keys that can be in the ring
pub struct Signature<let MaxRingSize: u32> {
    /// The initial challenge value c0
    c0: Field,
    /// Vector of response values s_i for each ring member
    s: BoundedVec<Field, MaxRingSize>,
}

/// Verifies a SAG ring signature
///
/// # Arguments
/// * `signature`: The ring signature to verify
/// * `hashed_message`: The hash of the message being signed
/// * `ring`: The set of public keys forming the ring
///
/// # Returns
/// * `true` if the signature is valid, `false` otherwise
///
/// # Algorithm Steps
/// 1. Initialize the challenge vector C with c0
/// 2. For each public key K_i in the ring:
///    a. Compute s_iG (scalar multiplication of response s_i with generator G)
///    b. Compute c_iK_i (scalar multiplication of challenge c_i with public key K_i)
///    c. Add s_iG and c_iK_i to get a point on the curve
///    d. Hash the resulting point coordinates with the message to get next challenge
/// 3. Verify that the final challenge matches the initial c0
pub fn verify<let MaxRingSize: u32>(
    signature: Signature<MaxRingSize>,
    hashed_message: Field,
    ring: BoundedVec<Point, MaxRingSize>,
) -> bool {
    // Initialize challenge vector with c0
    let mut C: BoundedVec<Field, MaxRingSize> = BoundedVec::from_array([0; MaxRingSize]);
    C.set(0, signature.c0);

    // Process each public key in the ring
    for i in 0..MaxRingSize {
        if (i < ring.len()) {
            // Get the current public key
            let K = ring.get(i);

            // Convert response s_i to scalar and compute s_iG
            let s: Scalar = Scalar::from_field(signature.s.get(i));
            let sG = fixed_base_scalar_mul(s);

            // Convert challenge c_i to scalar and compute c_iK_i
            let c: Scalar = Scalar::from_field(C.get(i));
            let cK = multi_scalar_mul([K], [c]);

            // Add s_iG and c_iK_i
            let sG_cK = embedded_curve_add(sG, cK);

            // Hash the result with the message to get next challenge
            let hash = pedersen_hash([sG_cK.x, sG_cK.y, hashed_message]);

            // Set the next challenge value
            C.set((i + 1) % ring.len(), hash);
        }
    }

    // Verify the final challenge matches the initial c0
    C.get(0) == signature.c0
}

#[test]
fn test_verify_ring_signature() {
    let pub_1: Point = Point {
        x: 0x22c8217d4b526f2c721b32074e7151576aa3a579497c0800134e0a3ece8e7035,
        y: 0x1e6dc2ce95e96fe93708b56eaa6d2a7d464f95c93e01dc90a47e730442c8cc79,
        is_infinite: false,
    };

    let pub_2: Point = Point {
        x: 0x0bc5b4722e091a1cf7b2f83538dd49eecaab880f94ae4896827db49ed5192338,
        y: 0x2982b8e604e3aab3aef8c0c734729821dcc0a2e07d6e7143cbd4046e9b9d38be,
        is_infinite: false,
    };

    let hashed_message: Field = 0x02a01608cf87d67da4d795a3fdf13d8bbd61892145a973de448fa67f9234dbcf;

    let c0: Field = 0x15245dc24971c6b1f18309594b32d8b46bca105aa3a0420baccda838887a9fae;

    let s: BoundedVec<Field, 2> = BoundedVec::from_array([
        0x1091edb9186a35a7fe3a63cf56510a75b572be07832e26f071fa7c98da8aa7e7,
        0x27c73e80fb7996af327ee1cbc6fd9167c5d03e79d8d6f75ad6d1b8923df611c1,
    ]);

    let signature: Signature<2> = Signature { c0, s };
    let ring: BoundedVec<EmbeddedCurvePoint, 2> = BoundedVec::from_array([pub_1, pub_2]);

    let res: bool = verify(signature, hashed_message, ring);

    assert(res == true);
}
