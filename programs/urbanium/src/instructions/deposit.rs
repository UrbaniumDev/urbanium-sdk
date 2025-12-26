use anchor_lang::prelude::*;
use anchor_spl::associated_token::AssociatedToken;
use anchor_spl::token::{transfer_checked, Mint, Token, TokenAccount, TransferChecked};

use crate::errors::UrbaniumError;
use crate::pda;
use crate::state::{UserPosition, Vault};

#[derive(Accounts)]
pub struct Deposit<'info> {
    #[account(mut)]
    pub depositor: Signer<'info>,

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
        init_if_needed,
        payer = depositor,
        space = 8 + UserPosition::LEN,
        seeds = [pda::USER_POSITION_SEED, vault.key().as_ref(), depositor.key().as_ref()],
        bump
    )]
    pub user_position: Account<'info, UserPosition>,

    #[account(
        mut,
        associated_token::mint = mint,
        associated_token::authority = depositor
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

pub fn handler(ctx: Context<Deposit>, amount: u64) -> Result<()> {
    if amount == 0 {
        return err!(UrbaniumError::ZeroAmount);
    }

    if ctx.accounts.token_program.key() != anchor_spl::token::ID {
        return err!(UrbaniumError::InvalidTokenProgram);
    }

    let decimals = ctx.accounts.mint.decimals;

    let total_assets: u128 = u128::from(ctx.accounts.vault_token_account.amount)
        .checked_add(u128::from(ctx.accounts.yield_token_account_a.amount))
        .ok_or_else(|| error!(UrbaniumError::MathOverflow))?
        .checked_add(u128::from(ctx.accounts.yield_token_account_b.amount))
        .ok_or_else(|| error!(UrbaniumError::MathOverflow))?;

    let total_shares: u128 = u128::from(ctx.accounts.vault.total_shares);
    let amount_u128: u128 = u128::from(amount);

    let shares_to_mint: u64 = if total_shares == 0 || total_assets == 0 {
        amount
    } else {
        let s = amount_u128
            .checked_mul(total_shares)
            .ok_or_else(|| error!(UrbaniumError::MathOverflow))?
            .checked_div(total_assets)
            .ok_or_else(|| error!(UrbaniumError::MathOverflow))?;
        u64::try_from(s).map_err(|_| error!(UrbaniumError::MathOverflow))?
    };

    if shares_to_mint == 0 {
        return err!(UrbaniumError::MathOverflow);
    }

    transfer_checked(
        CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            TransferChecked {
                from: ctx.accounts.user_token_account.to_account_info(),
                mint: ctx.accounts.mint.to_account_info(),
                to: ctx.accounts.vault_token_account.to_account_info(),
                authority: ctx.accounts.depositor.to_account_info(),
            },
        ),
        amount,
        decimals,
    )?;

    let user_position = &mut ctx.accounts.user_position;
    if user_position.shares == 0 {
        let (_expected, bump) = pda::user_position_pda(
            &ctx.accounts.vault.key(),
            &ctx.accounts.depositor.key(),
            &crate::ID,
        );
        user_position.bump = bump;
        user_position.vault = ctx.accounts.vault.key();
        user_position.owner = ctx.accounts.depositor.key();
    }

    user_position.shares = user_position
        .shares
        .checked_add(shares_to_mint)
        .ok_or_else(|| error!(UrbaniumError::MathOverflow))?;

    ctx.accounts.vault.total_shares = ctx
        .accounts
        .vault
        .total_shares
        .checked_add(shares_to_mint)
        .ok_or_else(|| error!(UrbaniumError::MathOverflow))?;

    Ok(())
}
