use crate::blsag::{Signature, verify};
use std::embedded_curve_ops::EmbeddedCurvePoint as Point;

#[export]
fn bench_small_ring_blsag(
    signature: Signature<8>,
    hashed_message: Field,
    ring: BoundedVec<Point, 8>,
    key_image: Point,
) -> bool {
    verify(signature, hashed_message, ring, key_image)
}

#[export]
fn bench_medium_ring_blsag(
    signature: Signature<32>,
    hashed_message: Field,
    ring: BoundedVec<Point, 32>,
    key_image: Point,
) -> bool {
    verify(signature, hashed_message, ring, key_image)
}

#[export]
fn bench_large_ring_blsag(
    signature: Signature<128>,
    hashed_message: Field,
    ring: BoundedVec<Point, 128>,
    key_image: Point,
) -> bool {
    verify(signature, hashed_message, ring, key_image)
}
