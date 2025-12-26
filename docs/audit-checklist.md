# Urbanium Protocol — Audit Checklist

## Smart Contract

- PDA collision safety
  - Confirm canonical seeds exactly match: `urbanium_vault`, `urbanium_vault_authority`, `urbanium_user_position`.
  - Confirm all PDAs are derived with domain separation (seed prefix + relevant pubkeys).

- Authority separation
  - Confirm vault authority is a PDA and never an EOA.
  - Confirm token accounts are owned by vault authority PDA.
  - Confirm no hidden admin fields or privileged instruction branches.

- Oracle manipulation resistance
  - Confirm oracle feed owner is validated against configured oracle program.
  - Confirm freshness is enforced via max staleness window.
  - Confirm confidence bounds are enforced via basis-point threshold.
  - Confirm exponent consistency checks prevent mixed-unit comparisons.

- CPI constraints
  - Confirm SPL Token program id is enforced.
  - Confirm CPI calls use `transfer_checked` and correct signer seeds.
  - Confirm no arbitrary external CPI is performed.

- Arithmetic safety
  - Confirm share math uses checked operations and safe intermediates.
  - Confirm rounding behavior is conservative (floor).

## SDK

- Instruction determinism
  - PDAs are derived using canonical seeds.
  - Instruction builders set account metas explicitly.
  - Instruction data encoding uses IDL coder only (no hand-rolled layouts).

- PDA consistency
  - Ensure SDK PDA utilities match on-chain derivation exactly.

- Wallet compatibility
  - Ensure SDK uses `wallet.signTransaction` and does not assume private key access.
  - Ensure Node.js >= 18 compatibility.

- Error correctness
  - Ensure program custom errors are decoded from IDL and surfaced with code/name/msg.

## Protocol

- Non-custodial guarantees
  - Confirm no instruction can transfer assets to a program-controlled address without PDA signer.

- Vault isolation
  - Confirm vault is per-mint and token accounts are bound to stored pubkeys.

- Yield routing safety
  - Confirm routing only moves funds between vault-controlled token accounts.
  - Confirm routing decision is oracle-validated and deterministic from vault state.