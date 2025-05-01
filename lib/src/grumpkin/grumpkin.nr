use bignum::BigNum;
use noir_bigcurve::BigCurve;
use noir_bigcurve::CurveParamsTrait;
use noir_bigcurve::scalar_field::ScalarField;

use super::grumpkinFq::Grumpkin_Fq_Params;

pub type GrumpkinFq = BigNum<3, 254, Grumpkin_Fq_Params>;
pub struct GrumpkinParams {}

impl CurveParamsTrait<GrumpkinFq> for GrumpkinParams {
    fn a() -> GrumpkinFq {
        BigNum { limbs: [0, 0, 0] }
    }
    fn b() -> GrumpkinFq {
        BigNum {
            limbs: [
                269518400912893473352610297457672176,
                407329191355489184324853464957476136,
                12388,
            ],
        }
    }
    fn one() -> [GrumpkinFq; 2] {
        [
            BigNum { limbs: [1, 0, 0] },
            BigNum { limbs: [202768790165908562254715705687484204, 13264604670603086881581, 0] },
        ]
    }
    fn offset_generator() -> [GrumpkinFq; 2] {
        [
            BigNum {
                limbs: [
                    835395659591566535435110343764848281,
                    275941310329438927652938382454257793,
                    0,
                ],
            },
            BigNum {
                limbs: [
                    1312494576646409231074899541404131382,
                    1055882397444743861159789666101471581,
                    7662,
                ],
            },
        ]
    }
    fn offset_generator_final() -> [GrumpkinFq; 2] {
        [
            BigNum {
                limbs: [
                    1020541650199891800602895679944089565,
                    214669755791064171217256205121957688,
                    5813,
                ],
            },
            BigNum {
                limbs: [
                    934008532338280592372104972420205795,
                    281192556040395900064622551648355415,
                    8227,
                ],
            },
        ]
    }
}

global Grumpkin_SCALAR_SLICES: u32 = 64;
pub type Grumpkin = BigCurve<GrumpkinFq, GrumpkinParams>;
pub type GrumpkinScalar = ScalarField<Grumpkin_SCALAR_SLICES>;
