use anchor_lang::prelude::*;
use anchor_spl::associated_token::AssociatedToken;
use anchor_spl::token::{Mint, Token, TokenAccount};

use crate::errors::UrbaniumError;
use crate::oracle::{enforce_confidence_bps, read_pyth_price};
use crate::pda;
use crate::state::Vault;

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct InitializeVaultArgs {
    pub oracle_program: Pubkey,
    pub oracle_feed: Pubkey,
    pub max_staleness_seconds: u64,
    pub max_confidence_bps: u16,
    pub route_threshold_price: i64,
}

#[derive(Accounts)]
#[instruction(args: InitializeVaultArgs)]
pub struct InitializeVault<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

    pub mint: Account<'info, Mint>,

    #[account(
        init,
        payer = payer,
        space = 8 + Vault::LEN,
        seeds = [pda::VAULT_SEED, mint.key().as_ref()],
        bump
    )]
    pub vault: Account<'info, Vault>,

    /// CHECK: PDA authority for vault-controlled token accounts.
    #[account(
        seeds = [pda::VAULT_AUTHORITY_SEED, vault.key().as_ref()],
        bump
    )]
    pub vault_authority: UncheckedAccount<'info>,

    #[account(
        init,
        payer = payer,
        associated_token::mint = mint,
        associated_token::authority = vault_authority
    )]
    pub vault_token_account: Account<'info, TokenAccount>,

    #[account(
        init,
        payer = payer,
        associated_token::mint = mint,
        associated_token::authority = vault_authority
    )]
    pub yield_token_account_a: Account<'info, TokenAccount>,

    #[account(
        init,
        payer = payer,
        associated_token::mint = mint,
        associated_token::authority = vault_authority
    )]
    pub yield_token_account_b: Account<'info, TokenAccount>,

    /// CHECK: Oracle feed is validated by owner + deserialization.
    #[account(address = args.oracle_feed)]
    pub oracle_feed: UncheckedAccount<'info>,

    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
}

pub fn handler(ctx: Context<InitializeVault>, args: InitializeVaultArgs) -> Result<()> {
    if ctx.accounts.token_program.key() != anchor_spl::token::ID {
        return err!(UrbaniumError::InvalidTokenProgram);
    }

    let (expected_vault, vault_bump) = pda::vault_pda(&ctx.accounts.mint.key(), &crate::ID);
    if expected_vault != ctx.accounts.vault.key() {
        return err!(UrbaniumError::InvalidVaultPda);
    }

    let (expected_auth, auth_bump) = pda::vault_authority_pda(&ctx.accounts.vault.key(), &crate::ID);
    if expected_auth != ctx.accounts.vault_authority.key() {
        return err!(UrbaniumError::InvalidVaultAuthorityPda);
    }

    let oracle_price = read_pyth_price(
        &args.oracle_program,
        &ctx.accounts.oracle_feed.to_account_info(),
        args.max_staleness_seconds,
    )?;

    enforce_confidence_bps(oracle_price, args.max_confidence_bps)?;

    let vault = &mut ctx.accounts.vault;
    vault.version = Vault::VERSION;
    vault.bump = vault_bump;
    vault.authority_bump = auth_bump;

    vault.mint = ctx.accounts.mint.key();
    vault.vault_token_account = ctx.accounts.vault_token_account.key();
    vault.yield_token_account_a = ctx.accounts.yield_token_account_a.key();
    vault.yield_token_account_b = ctx.accounts.yield_token_account_b.key();

    vault.oracle_program = args.oracle_program;
    vault.oracle_feed = args.oracle_feed;
    vault.oracle_expo = oracle_price.expo;

    vault.max_staleness_seconds = args.max_staleness_seconds;
    vault.max_confidence_bps = args.max_confidence_bps;
    vault.route_threshold_price = args.route_threshold_price;

    vault.total_shares = 0;

    Ok(())
}
