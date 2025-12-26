use anchor_lang::prelude::*;

#[error_code]
pub enum UrbaniumError {
    #[msg("Invalid vault PDA")]
    InvalidVaultPda,

    #[msg("Invalid vault authority PDA")]
    InvalidVaultAuthorityPda,

    #[msg("Invalid user position PDA")]
    InvalidUserPositionPda,

    #[msg("Invalid token program")]
    InvalidTokenProgram,

    #[msg("Invalid mint")]
    InvalidMint,

    #[msg("Invalid vault token account")]
    InvalidVaultTokenAccount,

    #[msg("Invalid yield token account")]
    InvalidYieldTokenAccount,

    #[msg("Arithmetic overflow")]
    MathOverflow,

    #[msg("Insufficient liquidity in vault")]
    InsufficientLiquidity,

    #[msg("Oracle feed account owner mismatch")]
    InvalidOracleOwner,

    #[msg("Oracle price unavailable")]
    OraclePriceUnavailable,

    #[msg("Oracle price is too stale")]
    OracleStale,

    #[msg("Oracle confidence interval too large")]
    OracleConfidenceTooHigh,

    #[msg("Oracle exponent mismatch")]
    OracleExponentMismatch,

    #[msg("Withdraw shares exceeds position shares")]
    InsufficientShares,

    #[msg("Deposit amount must be non-zero")]
    ZeroAmount,

    #[msg("Shares must be non-zero")]
    ZeroShares,
}
