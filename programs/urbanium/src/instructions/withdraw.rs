use anchor_lang::prelude::*;
use anchor_spl::associated_token::AssociatedToken;
use anchor_spl::token::{transfer_checked, Mint, Token, TokenAccount, TransferChecked};

use crate::errors::UrbaniumError;
use crate::pda;
use crate::state::{UserPosition, Vault};

#[derive(Accounts)]
pub struct Withdraw<'info> {
    #[account(mut)]
    pub withdrawer: Signer<'info>,

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

    #[account(
        mut,
        seeds = [pda::USER_POSITION_SEED, vault.key().as_ref(), withdrawer.key().as_ref()],
        bump = user_position.bump,
        constraint = user_position.vault == vault.key() @ UrbaniumError::InvalidUserPositionPda,
        constraint = user_position.owner == withdrawer.key() @ UrbaniumError::InvalidUserPositionPda,
    )]
    pub user_position: Account<'info, UserPosition>,

    #[account(
        mut,
        associated_token::mint = mint,
        associated_token::authority = withdrawer
    )]
    pub user_token_account: Account<'info, TokenAccount>,

    #[account(mut, address = vault.vault_token_account)]
    pub vault_token_account: Account<'info, TokenAccount>,

    #[account(mut, address = vault.yield_token_account_a)]
    pub yield_token_account_a: Account<'info, TokenAccount>,

    #[account(mut, address = vault.yield_token_account_b)]
    pub yield_token_account_b: Account<'info, TokenAccount>,

    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
}

pub fn handler(ctx: Context<Withdraw>, shares: u64) -> Result<()> {
    if shares == 0 {
        return err!(UrbaniumError::ZeroShares);
    }

    if ctx.accounts.token_program.key() != anchor_spl::token::ID {
        return err!(UrbaniumError::InvalidTokenProgram);
    }

    if ctx.accounts.user_position.shares < shares {
        return err!(UrbaniumError::InsufficientShares);
    }

    let total_assets: u128 = u128::from(ctx.accounts.vault_token_account.amount)
        .checked_add(u128::from(ctx.accounts.yield_token_account_a.amount))
        .ok_or_else(|| error!(UrbaniumError::MathOverflow))?
        .checked_add(u128::from(ctx.accounts.yield_token_account_b.amount))
        .ok_or_else(|| error!(UrbaniumError::MathOverflow))?;

    let total_shares: u128 = u128::from(ctx.accounts.vault.total_shares);
    if total_shares == 0 {
        return err!(UrbaniumError::InsufficientLiquidity);
    }

    let amount_out_u128: u128 = u128::from(shares)
        .checked_mul(total_assets)
        .ok_or_else(|| error!(UrbaniumError::MathOverflow))?
        .checked_div(total_shares)
        .ok_or_else(|| error!(UrbaniumError::MathOverflow))?;

    let mut remaining: u64 = u64::try_from(amount_out_u128)
        .map_err(|_| error!(UrbaniumError::MathOverflow))?;

    let decimals = ctx.accounts.mint.decimals;

    let auth_seeds: &[&[u8]] = &[
        pda::VAULT_AUTHORITY_SEED,
        ctx.accounts.vault.key().as_ref(),
        &[ctx.accounts.vault.authority_bump],
    ];

    // Deterministic liquidity order: main vault account -> yield A -> yield B.
    remaining = transfer_up_to(
        &ctx,
        &ctx.accounts.vault_token_account,
        remaining,
        decimals,
        auth_seeds,
    )?;

    remaining = transfer_up_to(
        &ctx,
        &ctx.accounts.yield_token_account_a,
        remaining,
        decimals,
        auth_seeds,
    )?;

    remaining = transfer_up_to(
        &ctx,
        &ctx.accounts.yield_token_account_b,
        remaining,
        decimals,
        auth_seeds,
    )?;

    if remaining != 0 {
        return err!(UrbaniumError::InsufficientLiquidity);
    }

    ctx.accounts.user_position.shares = ctx
        .accounts
        .user_position
        .shares
        .checked_sub(shares)
        .ok_or_else(|| error!(UrbaniumError::MathOverflow))?;

    ctx.accounts.vault.total_shares = ctx
        .accounts
        .vault
        .total_shares
        .checked_sub(shares)
        .ok_or_else(|| error!(UrbaniumError::MathOverflow))?;

    Ok(())
}

fn transfer_up_to<'info>(
    ctx: &Context<'_, '_, '_, 'info, Withdraw<'info>>,
    from: &Account<'info, TokenAccount>,
    remaining: u64,
    decimals: u8,
    auth_seeds: &[&[u8]],
) -> Result<u64> {
    if remaining == 0 {
        return Ok(0);
    }

    let available = from.amount;
    if available == 0 {
        return Ok(remaining);
    }

    let to_send = core::cmp::min(available, remaining);

    transfer_checked(
        CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            TransferChecked {
                from: from.to_account_info(),
                mint: ctx.accounts.mint.to_account_info(),
                to: ctx.accounts.user_token_account.to_account_info(),
                authority: ctx.accounts.vault_authority.to_account_info(),
            },
            &[auth_seeds],
        ),
        to_send,
        decimals,
    )?;

    Ok(remaining
        .checked_sub(to_send)
        .ok_or_else(|| error!(UrbaniumError::MathOverflow))?)
}
