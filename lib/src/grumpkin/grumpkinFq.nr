use bignum::BigNum;
use bignum::params::BigNumParams;
use bignum::params::BigNumParamsGetter;

pub struct Grumpkin_Fq_Params {}

pub type Grumpkin_Fq = BigNum<3, 254, Grumpkin_Fq_Params>;

impl BigNumParamsGetter<3, 254> for Grumpkin_Fq_Params {
    fn get_params() -> BigNumParams<3, 254> {
        Grumpkin_Fq_PARAMS
    }
}

pub global Grumpkin_Fq_PARAMS: BigNumParams<3, 254> = BigNumParams {
    has_multiplicative_inverse: true,
    modulus: [0x33e84879b9709143e1f593f0000001, 0x4e72e131a029b85045b68181585d28, 0x3064],
    double_modulus: [
        0x0167d090f372e12287c3eb27e0000002,
        0x019ce5c263405370a08b6d0302b0ba4f,
        0x60c7,
    ],
    redc_param: [0x4852009e880ae620703a6be1de9259, 0x462623a04a7ab074a5868073014714, 0x054a47],
};
