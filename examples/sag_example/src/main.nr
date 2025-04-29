use noir_ring_signatures::sag::{Signature, verify};
use std::embedded_curve_ops::EmbeddedCurvePoint;

pub global MAX_RING_SIZE: u32 = 16;

pub fn main(
    signature: Signature<MAX_RING_SIZE>,
    hashed_message: Field,
    ring: BoundedVec<EmbeddedCurvePoint, MAX_RING_SIZE>,
) -> pub bool {
    verify(signature, hashed_message, ring)
}
