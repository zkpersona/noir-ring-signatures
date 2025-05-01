use std::{embedded_curve_ops::EmbeddedCurvePoint, field::bytes32_to_field};

use bignum::BigNumTrait;
use noir_bigcurve::CurveParamsTrait;
use noir_bigcurve::utils::hash_to_curve::hash_to_curve as hash_to_curve_abstract;

use super::grumpkin::{GrumpkinFq, GrumpkinParams};

pub fn hash_to_curve<let SeedBytes: u32>(hash: [u8; SeedBytes]) -> EmbeddedCurvePoint {
    let (x, y): (GrumpkinFq, GrumpkinFq) =
        hash_to_curve_abstract(hash, GrumpkinParams::a(), GrumpkinParams::b());

    let _x = bytes32_to_field(x.to_le_bytes());
    let _y = bytes32_to_field(y.to_le_bytes());

    EmbeddedCurvePoint { x: _x, y: _y, is_infinite: false }
}

#[export]
fn bench_hash_to_curve(hash: [u8; 32]) -> EmbeddedCurvePoint {
    let p = hash_to_curve(hash);
    p
}
