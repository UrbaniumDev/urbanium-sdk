# Urbanium Protocol — Technical Whitepaper (Solana)

## 1. Scope

Urbanium is a Solana-native, non-custodial vault protocol for a single SPL mint per vault. All vault authority is delegated to deterministic Program Derived Addresses (PDAs). The protocol does not introduce an admin custody role and does not rely on any mutable superuser.

This whitepaper documents the on-chain invariants, PDA model, and execution surfaces required for audit and due diligence.

## 2. System Model

A vault is defined for exactly one SPL token mint (the **vault mint**). Users deposit that mint and receive **shares** tracked by a `UserPosition` PDA.

Key properties:

- **Single-asset accounting**: all balances are denominated in the vault mint.
- **Share-based claims**: users own a pro-rata claim on vault total assets across all vault-controlled token accounts.
- **Deterministic authority**: token accounts are owned by the vault authority PDA, never an EOA.

## 3. State

Urbanium uses two program-owned accounts:

- `Vault`: global state for a given mint.
- `UserPosition`: per-(vault, user) share ledger.

`Vault.total_shares` is the total supply of shares across all positions.

## 4. Share Math

Let:

- $A$ = total assets (sum of all vault-controlled token accounts in the vault mint)
- $S$ = total shares outstanding
- $d$ = deposit amount

Then:

- Initial deposit (when $S = 0$): shares minted = $d$
- Otherwise: shares minted = $\left\lfloor d \cdot S / A \right\rfloor$

Withdraw for $w$ shares computes:

- amount out = $\left\lfloor w \cdot A / S \right\rfloor$

All arithmetic is performed with checked conversions and intermediate $u128$ math on-chain.

## 5. Oracle Constraints

Urbanium uses an on-chain oracle feed account to validate price freshness and confidence. The `Vault` stores:

- oracle program id
- oracle feed account
- expected exponent
- maximum staleness window
- maximum confidence ratio (basis points)

The program enforces:

- oracle feed owner == configured oracle program id
- price is available and not stale
- confidence interval is below configured basis-point threshold

## 6. Yield Routing

Urbanium supports deterministic routing between vault-controlled sub-accounts:

- `vault_token_account` (primary liquidity)
- `yield_token_account_a`
- `yield_token_account_b`

The `route_yield` instruction is permissionless and uses oracle-validated price data to choose a routing destination using a configured threshold.

## 7. Non-custodial Guarantees

- Users never relinquish custody to an admin.
- Only PDAs can move assets from vault-owned token accounts.
- No instruction grants arbitrary authority to externally owned accounts.

## 8. Upgrades

The program contains no on-chain governance. Upgradeability is governed strictly by Solana’s BPF upgrade authority mechanics and is treated as an operational risk (see investor appendix).