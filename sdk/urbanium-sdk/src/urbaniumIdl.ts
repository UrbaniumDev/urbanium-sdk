import type { Idl } from "@coral-xyz/anchor";

export const urbaniumIdl = {
  address: "7XzKxpTmsiTevyC9KYaFZbpGp9NnJ2VwK6ie7RdKZXBW",
  metadata: {
    name: "urbanium",
    version: "0.1.0",
    spec: "0.1.0",
  },
  instructions: [
    {
      name: "initializeVault",
      discriminator: [48, 191, 163, 44, 71, 129, 63, 164],
      accounts: [
        { name: "payer", writable: true, signer: true },
        { name: "mint" },
        { name: "vault", writable: true },
        { name: "vaultAuthority" },
        { name: "vaultTokenAccount", writable: true },
        { name: "yieldTokenAccountA", writable: true },
        { name: "yieldTokenAccountB", writable: true },
        { name: "oracleFeed" },
        { name: "systemProgram" },
        { name: "tokenProgram" },
        { name: "associatedTokenProgram" },
      ],
      args: [
        {
          name: "args",
          type: { defined: { name: "InitializeVaultArgs" } },
        },
      ],
    },
    {
      name: "deposit",
      discriminator: [242, 35, 198, 137, 82, 225, 242, 182],
      accounts: [
        { name: "depositor", writable: true, signer: true },
        { name: "mint" },
        { name: "vault", writable: true },
        { name: "vaultAuthority" },
        { name: "userPosition", writable: true },
        { name: "userTokenAccount", writable: true },
        { name: "vaultTokenAccount", writable: true },
        { name: "yieldTokenAccountA", writable: true },
        { name: "yieldTokenAccountB", writable: true },
        { name: "systemProgram" },
        { name: "tokenProgram" },
        { name: "associatedTokenProgram" },
      ],
      args: [{ name: "amount", type: "u64" }],
    },
    {
      name: "withdraw",
      discriminator: [183, 18, 70, 156, 148, 109, 161, 34],
      accounts: [
        { name: "withdrawer", writable: true, signer: true },
        { name: "mint" },
        { name: "vault", writable: true },
        { name: "vaultAuthority" },
        { name: "userPosition", writable: true },
        { name: "userTokenAccount", writable: true },
        { name: "vaultTokenAccount", writable: true },
        { name: "yieldTokenAccountA", writable: true },
        { name: "yieldTokenAccountB", writable: true },
        { name: "systemProgram" },
        { name: "tokenProgram" },
        { name: "associatedTokenProgram" },
      ],
      args: [{ name: "shares", type: "u64" }],
    },
    {
      name: "routeYield",
      discriminator: [30, 120, 157, 134, 19, 72, 147, 2],
      accounts: [
        { name: "executor", signer: true },
        { name: "mint" },
        { name: "vault", writable: true },
        { name: "vaultAuthority" },
        { name: "vaultTokenAccount", writable: true },
        { name: "yieldTokenAccountA", writable: true },
        { name: "yieldTokenAccountB", writable: true },
        { name: "oracleFeed" },
        { name: "tokenProgram" },
      ],
      args: [{ name: "amount", type: "u64" }],
    },
  ],
  accounts: [
    { name: "vault", discriminator: [211, 8, 232, 43, 2, 152, 117, 119] },
    {
      name: "userPosition",
      discriminator: [251, 248, 209, 245, 83, 234, 17, 27],
    },
  ],
  types: [
    {
      name: "vault",
      type: {
        kind: "struct",
        fields: [
          { name: "version", type: "u8" },
          { name: "bump", type: "u8" },
          { name: "authorityBump", type: "u8" },
          { name: "mint", type: "pubkey" },
          { name: "vaultTokenAccount", type: "pubkey" },
          { name: "yieldTokenAccountA", type: "pubkey" },
          { name: "yieldTokenAccountB", type: "pubkey" },
          { name: "oracleProgram", type: "pubkey" },
          { name: "oracleFeed", type: "pubkey" },
          { name: "oracleExpo", type: "i32" },
          { name: "maxStalenessSeconds", type: "u64" },
          { name: "maxConfidenceBps", type: "u16" },
          { name: "routeThresholdPrice", type: "i64" },
          { name: "totalShares", type: "u64" },
        ],
      },
    },
    {
      name: "userPosition",
      type: {
        kind: "struct",
        fields: [
          { name: "bump", type: "u8" },
          { name: "vault", type: "pubkey" },
          { name: "owner", type: "pubkey" },
          { name: "shares", type: "u64" },
        ],
      },
    },
    {
      name: "InitializeVaultArgs",
      type: {
        kind: "struct",
        fields: [
          { name: "oracleProgram", type: "pubkey" },
          { name: "oracleFeed", type: "pubkey" },
          { name: "maxStalenessSeconds", type: "u64" },
          { name: "maxConfidenceBps", type: "u16" },
          { name: "routeThresholdPrice", type: "i64" },
        ],
      },
    },
  ],
  errors: [
    { code: 6000, name: "InvalidVaultPda", msg: "Invalid vault PDA" },
    {
      code: 6001,
      name: "InvalidVaultAuthorityPda",
      msg: "Invalid vault authority PDA",
    },
    {
      code: 6002,
      name: "InvalidUserPositionPda",
      msg: "Invalid user position PDA",
    },
    { code: 6003, name: "InvalidTokenProgram", msg: "Invalid token program" },
    { code: 6004, name: "InvalidMint", msg: "Invalid mint" },
    {
      code: 6005,
      name: "InvalidVaultTokenAccount",
      msg: "Invalid vault token account",
    },
    {
      code: 6006,
      name: "InvalidYieldTokenAccount",
      msg: "Invalid yield token account",
    },
    { code: 6007, name: "MathOverflow", msg: "Arithmetic overflow" },
    {
      code: 6008,
      name: "InsufficientLiquidity",
      msg: "Insufficient liquidity in vault",
    },
    {
      code: 6009,
      name: "InvalidOracleOwner",
      msg: "Oracle feed account owner mismatch",
    },
    {
      code: 6010,
      name: "OraclePriceUnavailable",
      msg: "Oracle price unavailable",
    },
    { code: 6011, name: "OracleStale", msg: "Oracle price is too stale" },
    {
      code: 6012,
      name: "OracleConfidenceTooHigh",
      msg: "Oracle confidence interval too large",
    },
    {
      code: 6013,
      name: "OracleExponentMismatch",
      msg: "Oracle exponent mismatch",
    },
    {
      code: 6014,
      name: "InsufficientShares",
      msg: "Withdraw shares exceeds position shares",
    },
    { code: 6015, name: "ZeroAmount", msg: "Deposit amount must be non-zero" },
    { code: 6016, name: "ZeroShares", msg: "Shares must be non-zero" },
  ],
} as const satisfies Idl;

export type UrbaniumIdl = typeof urbaniumIdl;
