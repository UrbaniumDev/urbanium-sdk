# Urbanium Protocol — Architecture

## Overview

Urbanium is implemented as:

- An Anchor program (`programs/urbanium`) that owns vault state and enforces all invariants.
- A TypeScript SDK (`sdk/urbanium-sdk`) that derives PDAs deterministically and builds instructions explicitly using the program IDL.

## Accounts

### `Vault`

One vault exists per SPL mint.

- PDA: derived from `VAULT_SEED` and the vault mint.
- Contains:
  - mint identity
  - vault-controlled token accounts
  - oracle configuration
  - routing threshold
  - share supply

### `UserPosition`

One user position exists per (vault, user).

- PDA: derived from `USER_POSITION_SEED`, `vault`, and user pubkey.
- Contains:
  - shares
  - owner and vault references

## PDA Model (Canonical)

Seeds are fixed and must match exactly:

- `VAULT_SEED = "urbanium_vault"`
- `VAULT_AUTHORITY_SEED = "urbanium_vault_authority"`
- `USER_POSITION_SEED = "urbanium_user_position"`

Derivations:

- Vault PDA: `PDA([VAULT_SEED, mint])`
- Vault authority PDA: `PDA([VAULT_AUTHORITY_SEED, vault])`
- User position PDA: `PDA([USER_POSITION_SEED, vault, user])`

The vault authority PDA owns all vault token accounts.

## Instruction Surfaces

### initialize_vault

Creates:

- the `Vault` PDA
- the vault authority PDA
- vault-owned associated token accounts

Persists oracle configuration and routing threshold.

### deposit

- Transfers tokens from the user to the primary vault token account.
- Mints shares into the user position based on current vault equity.

### withdraw

- Burns shares from the user position.
- Transfers underlying tokens to the user using deterministic liquidity ordering across vault-controlled accounts.

### route_yield

- Permissionless.
- Reads and validates oracle price.
- Routes a specified token amount from the primary vault token account into one of two vault-controlled yield sub-accounts based on an on-chain threshold.

## Determinism and CPI

- All token movements use SPL Token `transfer_checked` with PDA signer seeds.
- No instruction performs arbitrary CPI into external protocols.
- Routing is deterministic from on-chain state and oracle data.

This design intentionally minimizes the CPI surface to reduce attack complexity and audit scope while maintaining a deterministic routing primitive.