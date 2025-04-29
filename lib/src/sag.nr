use std::{
    embedded_curve_ops::{
        embedded_curve_add, EmbeddedCurvePoint, EmbeddedCurvePoint as Point,
        EmbeddedCurveScalar as Scalar, fixed_base_scalar_mul, multi_scalar_mul,
    },
    hash::pedersen_hash,
};

pub struct Signature<let MaxRingSize: u32> {
    c0: Field,
    s: BoundedVec<Field, MaxRingSize>,
}

pub fn verify<let MaxMessageLen: u32, let MaxRingSize: u32>(
    signature: Signature<MaxRingSize>,
    hashed_message: Field,
    ring: BoundedVec<Point, MaxRingSize>,
) -> bool {
    let mut C: BoundedVec<Field, MaxRingSize> = BoundedVec::new();

    for _ in 0..MaxRingSize {
        C.push(0);
    }

    C.set(0, signature.c0);

    for i in 0..MaxRingSize {
        if (i < ring.len()) {
            let K = ring.get(i);
            let s: Scalar = Scalar::from_field(signature.s.get(i));
            let sG = fixed_base_scalar_mul(s);

            let c: Scalar = Scalar::from_field(C.get(i));
            let cK = multi_scalar_mul([K], [c]);

            let sG_cK = embedded_curve_add(sG, cK);

            let hash = pedersen_hash([sG_cK.x, sG_cK.y, hashed_message]);

            C.set((i + 1) % ring.len(), hash);
        }
    }

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
