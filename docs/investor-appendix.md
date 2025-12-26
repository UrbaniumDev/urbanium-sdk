# Urbanium Protocol — Investor Technical Appendix

## Deterministic Execution Model

Urbanium constrains authority and state transitions to deterministic PDAs and validated oracle inputs.

- Every vault is uniquely identified by `(program_id, mint)`.
- All asset movement is authorized exclusively by the vault authority PDA.
- No instruction requires or accepts an administrative signature.

This model reduces governance and key-management risk compared to protocols with mutable admin roles.

## Capital Efficiency Analysis

Urbanium’s share-based accounting ensures that each depositor’s claim remains proportional to the vault’s total assets.

- Deposits mint shares proportional to the vault equity.
- Withdrawals burn shares for a proportional claim on total assets.

Efficiency considerations:

- When funds are routed into sub-accounts, they remain part of total assets for share pricing.
- Routing does not alter ownership; it only changes internal liquidity distribution.

## Oracle Dependency & Risk

Urbanium relies on a configured oracle feed for:

- freshness validation
- confidence-bound validation
- deterministic routing decisions based on a configured threshold

Risks:

- Oracle downtime: routing may be paused due to staleness checks.
- Oracle manipulation: if the oracle is compromised, routing decisions could be misdirected.

Mitigations implemented:

- Owner validation: the oracle feed must be owned by the configured oracle program id.
- Staleness constraint: on-chain enforcement prevents use of outdated prices.
- Confidence constraint: on-chain enforcement bounds uncertainty relative to price.
- Exponent pinning: the exponent is pinned at initialization to prevent mixed-unit comparisons.

## Vault Isolation Guarantees

Vault isolation is enforced by:

- per-mint vault PDA derivation
- vault-owned token account pubkeys stored in `Vault` and enforced via address constraints
- separate per-user position PDAs

A bug or misconfiguration in one vault does not grant authority over another vault.

## Yield Routing Logic (Technical)

Urbanium’s routing primitive is intentionally bounded:

- `route_yield(amount)` moves funds from the primary vault token account to one of two vault-controlled yield sub-accounts.
- Destination selection uses oracle-validated price and a vault-configured threshold.

This design is deterministic:

- For a given on-chain vault configuration and oracle price, routing destination is uniquely determined.
- The instruction does not perform arbitrary CPI into external yield venues, limiting attack surface.

## Failure Modes & Mitigations

- Oracle stale
  - Symptom: routing fails.
  - Mitigation: staleness checks protect against use of outdated pricing.

- Insufficient primary liquidity
  - Symptom: routing fails when primary balance < requested amount.
  - Mitigation: routing is bounded by available balance.

- Withdraw under sub-account distribution
  - Symptom: primary account may not hold enough liquidity.
  - Mitigation: withdrawals source liquidity deterministically across all vault-controlled token accounts.

- Arithmetic edge cases
  - Symptom: overflow or zero-share mint.
  - Mitigation: checked math; explicit error on zero-share mint.

## Upgrade & Governance Philosophy

Urbanium’s on-chain program contains no governance logic and no privileged administration.

Governance and upgrades are treated as an operational layer:

- If deployed as upgradeable, the upgrade authority must be protected with strong operational security.
- If immutability is desired, deployment should be finalized by disabling upgrades.

Investors should evaluate upgrade authority controls as a key operational risk parameter.

## Long-term Protocol Sustainability

Sustainability depends on maintaining:

- strict invariant enforcement on-chain
- conservative oracle configuration for supported assets
- minimized CPI surface to reduce exploit complexity

The SDK is designed to be deterministic and IDL-driven to reduce integration mistakes and keep client-side logic aligned with audited on-chain interfaces.