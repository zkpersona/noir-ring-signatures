use super::sag::{Signature, verify};
use std::embedded_curve_ops::EmbeddedCurvePoint as Point;

#[export]
fn bench_small_ring(
    signature: Signature<8>,
    hashed_message: Field,
    ring: BoundedVec<Point, 8>,
) -> bool {
    verify(signature, hashed_message, ring)
}

#[export]
fn bench_medium_ring(
    signature: Signature<32>,
    hashed_message: Field,
    ring: BoundedVec<Point, 32>,
) -> bool {
    verify(signature, hashed_message, ring)
}

#[export]
fn bench_large_ring(
    signature: Signature<128>,
    hashed_message: Field,
    ring: BoundedVec<Point, 128>,
) -> bool {
    verify(signature, hashed_message, ring)
}
