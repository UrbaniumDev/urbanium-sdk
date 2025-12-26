# Urbanium Protocol — STRIDE Threat Model

This STRIDE model focuses on the on-chain program and the SDK surfaces that can affect deterministic execution.

## Spoofing

- Attack vector: attacker supplies a forged oracle feed account.
  - Exploit scenario: initializer points vault to an account with non-oracle layout that returns arbitrary bytes.
  - Impact: routing decisions based on invalid pricing, potential misallocation between sub-accounts.
  - Mitigation: vault stores `oracle_program` and validates `oracle_feed.owner == oracle_program`; on-chain deserialization is performed via Pyth SDK which fails on invalid layout.

- Attack vector: attacker supplies wrong token program.
  - Exploit scenario: pass a malicious program as token program for CPI.
  - Impact: unauthorized movement or minting.
  - Mitigation: program enforces `token_program == spl_token::ID`.

## Tampering

- Attack vector: mutate token accounts not owned by the vault authority.
  - Exploit scenario: attempt to route/withdraw using attacker-controlled token accounts.
  - Impact: theft or incorrect accounting.
  - Mitigation: token accounts are passed by address constraints matching the stored pubkeys in `Vault`.

- Attack vector: share inflation via arithmetic overflow.
  - Exploit scenario: extreme inputs cause wraparound in share calculations.
  - Impact: share supply corruption, insolvency.
  - Mitigation: all critical operations use checked math with intermediate `u128` and explicit overflow errors.

## Repudiation

- Attack vector: disputes around routing/withdraw execution.
  - Exploit scenario: executor claims transaction behaved differently.
  - Impact: operational dispute rather than direct fund loss.
  - Mitigation: all state transitions are deterministic and recorded on-chain; instruction data + logs provide auditability.

## Information Disclosure

- Attack vector: inference of user balances.
  - Exploit scenario: observers read user positions.
  - Impact: privacy loss.
  - Mitigation: Solana is transparent; protocol does not claim confidentiality. SDK avoids leaking secrets.

## Denial of Service

- Attack vector: oracle staleness prevents routing.
  - Exploit scenario: oracle feed stops publishing; `route_yield` fails staleness checks.
  - Impact: routing halted; deposits/withdrawals still function.
  - Mitigation: routing is permissionless but gated by `max_staleness_seconds`; this prevents using stale pricing. Vault can be initialized with conservative staleness and confidence bounds.

- Attack vector: congestion / compute limits.
  - Exploit scenario: large accounts or heavy CPI causes compute exhaustion.
  - Impact: failed transactions.
  - Mitigation: program avoids external CPI and keeps instruction compute bounded.

## Elevation of Privilege

- Attack vector: attacker attempts to become vault authority.
  - Exploit scenario: provide signer that can authorize transfers.
  - Impact: fund theft.
  - Mitigation: only PDA signer seeds are accepted; no instruction accepts an arbitrary authority. Token account owner is the vault authority PDA.

- Attack vector: malicious initializer introduces admin backdoor.
  - Exploit scenario: store an admin key in state and grant privileged instruction paths.
  - Impact: custody risk.
  - Mitigation: program contains no admin fields and no privileged instructions beyond PDA-controlled logic.

## Residual Risks

- Oracle dependency risk: oracle correctness and availability are external assumptions.
- Upgrade authority risk: if the program is deployed as upgradeable, upgrade authority compromise can alter behavior.

These residual risks are addressed in the investor appendix and operational controls.