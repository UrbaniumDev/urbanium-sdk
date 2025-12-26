use anchor_lang::prelude::*;
use anchor_spl::token::{transfer_checked, Mint, Token, TokenAccount, TransferChecked};

use crate::errors::UrbaniumError;
use crate::oracle::{enforce_confidence_bps, read_pyth_price};
use crate::pda;
use crate::state::Vault;

#[derive(Accounts)]
pub struct RouteYield<'info> {
    pub executor: Signer<'info>,

    pub mint: Account<'info, Mint>,

    #[account(
        mut,
        seeds = [pda::VAULT_SEED, mint.key().as_ref()],
        bump = vault.bump,
        has_one = mint
    )]
    pub vault: Account<'info, Vault>,

    /// CHECK: PDA authority for vault-controlled token accounts.
    #[account(
        seeds = [pda::VAULT_AUTHORITY_SEED, vault.key().as_ref()],
        bump = vault.authority_bump
    )]
    pub vault_authority: UncheckedAccount<'info>,

    #[account(mut, address = vault.vault_token_account)]
    pub vault_token_account: Account<'info, TokenAccount>,

    #[account(mut, address = vault.yield_token_account_a)]
    pub yield_token_account_a: Account<'info, TokenAccount>,

    #[account(mut, address = vault.yield_token_account_b)]
    pub yield_token_account_b: Account<'info, TokenAccount>,

    /// CHECK: Validated by owner and deserialization.
    #[account(address = vault.oracle_feed)]
    pub oracle_feed: UncheckedAccount<'info>,

    pub token_program: Program<'info, Token>,
}

pub fn handler(ctx: Context<RouteYield>, amount: u64) -> Result<()> {
    if amount == 0 {
        return err!(UrbaniumError::ZeroAmount);
    }

    if ctx.accounts.token_program.key() != anchor_spl::token::ID {
        return err!(UrbaniumError::InvalidTokenProgram);
    }

    let oracle_price = read_pyth_price(
        &ctx.accounts.vault.oracle_program,
        &ctx.accounts.oracle_feed.to_account_info(),
        ctx.accounts.vault.max_staleness_seconds,
    )?;

    enforce_confidence_bps(oracle_price, ctx.accounts.vault.max_confidence_bps)?;

    if oracle_price.expo != ctx.accounts.vault.oracle_expo {
        return err!(UrbaniumError::OracleExponentMismatch);
    }

    let destination_is_a = oracle_price.price >= ctx.accounts.vault.route_threshold_price;
    let destination = if destination_is_a {
        &ctx.accounts.yield_token_account_a
    } else {
        &ctx.accounts.yield_token_account_b
    };

    if ctx.accounts.vault_token_account.amount < amount {
        return err!(UrbaniumError::InsufficientLiquidity);
    }

    let decimals = ctx.accounts.mint.decimals;
    let auth_seeds: &[&[u8]] = &[
        pda::VAULT_AUTHORITY_SEED,
        ctx.accounts.vault.key().as_ref(),
        &[ctx.accounts.vault.authority_bump],
    ];

    transfer_checked(
        CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            TransferChecked {
                from: ctx.accounts.vault_token_account.to_account_info(),
                mint: ctx.accounts.mint.to_account_info(),
                to: destination.to_account_info(),
                authority: ctx.accounts.vault_authority.to_account_info(),
            },
            &[auth_seeds],
        ),
        amount,
        decimals,
    )?;

    Ok(())
}
