use anchor_lang::prelude::*;

pub mod errors;
pub mod instructions;
pub mod oracle;
pub mod pda;
pub mod state;

use instructions::*;

declare_id!("7XzKxpTmsiTevyC9KYaFZbpGp9NnJ2VwK6ie7RdKZXBW");

#[program]
pub mod urbanium {
    use super::*;

    pub fn initialize_vault(
        ctx: Context<InitializeVault>,
        args: InitializeVaultArgs,
    ) -> Result<()> {
        instructions::initialize_vault::handler(ctx, args)
    }

    pub fn deposit(ctx: Context<Deposit>, amount: u64) -> Result<()> {
        instructions::deposit::handler(ctx, amount)
    }

    pub fn withdraw(ctx: Context<Withdraw>, shares: u64) -> Result<()> {
        instructions::withdraw::handler(ctx, shares)
    }

    pub fn route_yield(ctx: Context<RouteYield>, amount: u64) -> Result<()> {
        instructions::route_yield::handler(ctx, amount)
    }
}
