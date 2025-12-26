use anchor_lang::prelude::*;

pub const VAULT_SEED: &[u8] = b"urbanium_vault";
pub const VAULT_AUTHORITY_SEED: &[u8] = b"urbanium_vault_authority";
pub const USER_POSITION_SEED: &[u8] = b"urbanium_user_position";

pub fn vault_pda(mint: &Pubkey, program_id: &Pubkey) -> (Pubkey, u8) {
    Pubkey::find_program_address(&[VAULT_SEED, mint.as_ref()], program_id)
}

pub fn vault_authority_pda(vault: &Pubkey, program_id: &Pubkey) -> (Pubkey, u8) {
    Pubkey::find_program_address(&[VAULT_AUTHORITY_SEED, vault.as_ref()], program_id)
}

pub fn user_position_pda(vault: &Pubkey, owner: &Pubkey, program_id: &Pubkey) -> (Pubkey, u8) {
    Pubkey::find_program_address(
        &[USER_POSITION_SEED, vault.as_ref(), owner.as_ref()],
        program_id,
    )
}
