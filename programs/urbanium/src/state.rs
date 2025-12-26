use anchor_lang::prelude::*;

#[account]
pub struct Vault {
    pub version: u8,
    pub bump: u8,
    pub authority_bump: u8,

    pub mint: Pubkey,

    pub vault_token_account: Pubkey,
    pub yield_token_account_a: Pubkey,
    pub yield_token_account_b: Pubkey,

    pub oracle_program: Pubkey,
    pub oracle_feed: Pubkey,
    pub oracle_expo: i32,

    pub max_staleness_seconds: u64,
    pub max_confidence_bps: u16,

    pub route_threshold_price: i64,

    pub total_shares: u64,
}

impl Vault {
    pub const VERSION: u8 = 1;

    pub const LEN: usize =
        1 + 1 + 1 + 32 + 32 + 32 + 32 + 32 + 32 + 4 + 8 + 2 + 8 + 8;
}

#[account]
pub struct UserPosition {
    pub bump: u8,
    pub vault: Pubkey,
    pub owner: Pubkey,
    pub shares: u64,
}

impl UserPosition {
    pub const LEN: usize = 1 + 32 + 32 + 8;
}
