import { BorshInstructionCoder, type Idl } from "@coral-xyz/anchor";
import BN from "bn.js";
import {
  type AccountMeta,
  type PublicKey,
  TransactionInstruction,
} from "@solana/web3.js";

import { urbaniumIdl } from "./idl.js";

function coder(idl: Idl = urbaniumIdl): BorshInstructionCoder {
  return new BorshInstructionCoder(idl);
}

function u64(x: bigint): BN {
  if (x < 0n) throw new Error("u64 must be non-negative");
  return new BN(x.toString(10), 10);
}

function i64(x: bigint): BN {
  return new BN(x.toString(10), 10);
}

export type InitializeVaultArgs = {
  oracleProgram: PublicKey;
  oracleFeed: PublicKey;
  maxStalenessSeconds: bigint;
  maxConfidenceBps: number;
  routeThresholdPrice: bigint;
};

export type InitializeVaultAccounts = {
  payer: PublicKey;
  mint: PublicKey;
  vault: PublicKey;
  vaultAuthority: PublicKey;
  vaultTokenAccount: PublicKey;
  yieldTokenAccountA: PublicKey;
  yieldTokenAccountB: PublicKey;
  oracleFeed: PublicKey;
  systemProgram: PublicKey;
  tokenProgram: PublicKey;
  associatedTokenProgram: PublicKey;
};

export function buildInitializeVaultIx(
  programId: PublicKey,
  accounts: InitializeVaultAccounts,
  args: InitializeVaultArgs,
  idl: Idl = urbaniumIdl,
): TransactionInstruction {
  const data = coder(idl).encode("initializeVault", {
    args: {
      oracleProgram: args.oracleProgram,
      oracleFeed: args.oracleFeed,
      maxStalenessSeconds: u64(args.maxStalenessSeconds),
      maxConfidenceBps: args.maxConfidenceBps,
      routeThresholdPrice: i64(args.routeThresholdPrice),
    },
  });

  const keys: AccountMeta[] = [
    { pubkey: accounts.payer, isSigner: true, isWritable: true },
    { pubkey: accounts.mint, isSigner: false, isWritable: false },
    { pubkey: accounts.vault, isSigner: false, isWritable: true },
    { pubkey: accounts.vaultAuthority, isSigner: false, isWritable: false },
    { pubkey: accounts.vaultTokenAccount, isSigner: false, isWritable: true },
    { pubkey: accounts.yieldTokenAccountA, isSigner: false, isWritable: true },
    { pubkey: accounts.yieldTokenAccountB, isSigner: false, isWritable: true },
    { pubkey: accounts.oracleFeed, isSigner: false, isWritable: false },
    { pubkey: accounts.systemProgram, isSigner: false, isWritable: false },
    { pubkey: accounts.tokenProgram, isSigner: false, isWritable: false },
    { pubkey: accounts.associatedTokenProgram, isSigner: false, isWritable: false },
  ];

  return new TransactionInstruction({ programId, keys, data });
}

export type DepositAccounts = {
  depositor: PublicKey;
  mint: PublicKey;
  vault: PublicKey;
  vaultAuthority: PublicKey;
  userPosition: PublicKey;
  userTokenAccount: PublicKey;
  vaultTokenAccount: PublicKey;
  yieldTokenAccountA: PublicKey;
  yieldTokenAccountB: PublicKey;
  systemProgram: PublicKey;
  tokenProgram: PublicKey;
  associatedTokenProgram: PublicKey;
};

export function buildDepositIx(
  programId: PublicKey,
  accounts: DepositAccounts,
  amount: bigint,
  idl: Idl = urbaniumIdl,
): TransactionInstruction {
  const data = coder(idl).encode("deposit", { amount: u64(amount) });

  const keys: AccountMeta[] = [
    { pubkey: accounts.depositor, isSigner: true, isWritable: true },
    { pubkey: accounts.mint, isSigner: false, isWritable: false },
    { pubkey: accounts.vault, isSigner: false, isWritable: true },
    { pubkey: accounts.vaultAuthority, isSigner: false, isWritable: false },
    { pubkey: accounts.userPosition, isSigner: false, isWritable: true },
    { pubkey: accounts.userTokenAccount, isSigner: false, isWritable: true },
    { pubkey: accounts.vaultTokenAccount, isSigner: false, isWritable: true },
    { pubkey: accounts.yieldTokenAccountA, isSigner: false, isWritable: true },
    { pubkey: accounts.yieldTokenAccountB, isSigner: false, isWritable: true },
    { pubkey: accounts.systemProgram, isSigner: false, isWritable: false },
    { pubkey: accounts.tokenProgram, isSigner: false, isWritable: false },
    { pubkey: accounts.associatedTokenProgram, isSigner: false, isWritable: false },
  ];

  return new TransactionInstruction({ programId, keys, data });
}

export type WithdrawAccounts = {
  withdrawer: PublicKey;
  mint: PublicKey;
  vault: PublicKey;
  vaultAuthority: PublicKey;
  userPosition: PublicKey;
  userTokenAccount: PublicKey;
  vaultTokenAccount: PublicKey;
  yieldTokenAccountA: PublicKey;
  yieldTokenAccountB: PublicKey;
  systemProgram: PublicKey;
  tokenProgram: PublicKey;
  associatedTokenProgram: PublicKey;
};

export function buildWithdrawIx(
  programId: PublicKey,
  accounts: WithdrawAccounts,
  shares: bigint,
  idl: Idl = urbaniumIdl,
): TransactionInstruction {
  const data = coder(idl).encode("withdraw", { shares: u64(shares) });

  const keys: AccountMeta[] = [
    { pubkey: accounts.withdrawer, isSigner: true, isWritable: true },
    { pubkey: accounts.mint, isSigner: false, isWritable: false },
    { pubkey: accounts.vault, isSigner: false, isWritable: true },
    { pubkey: accounts.vaultAuthority, isSigner: false, isWritable: false },
    { pubkey: accounts.userPosition, isSigner: false, isWritable: true },
    { pubkey: accounts.userTokenAccount, isSigner: false, isWritable: true },
    { pubkey: accounts.vaultTokenAccount, isSigner: false, isWritable: true },
    { pubkey: accounts.yieldTokenAccountA, isSigner: false, isWritable: true },
    { pubkey: accounts.yieldTokenAccountB, isSigner: false, isWritable: true },
    { pubkey: accounts.systemProgram, isSigner: false, isWritable: false },
    { pubkey: accounts.tokenProgram, isSigner: false, isWritable: false },
    { pubkey: accounts.associatedTokenProgram, isSigner: false, isWritable: false },
  ];

  return new TransactionInstruction({ programId, keys, data });
}

export type RouteYieldAccounts = {
  executor: PublicKey;
  mint: PublicKey;
  vault: PublicKey;
  vaultAuthority: PublicKey;
  vaultTokenAccount: PublicKey;
  yieldTokenAccountA: PublicKey;
  yieldTokenAccountB: PublicKey;
  oracleFeed: PublicKey;
  tokenProgram: PublicKey;
};

export function buildRouteYieldIx(
  programId: PublicKey,
  accounts: RouteYieldAccounts,
  amount: bigint,
  idl: Idl = urbaniumIdl,
): TransactionInstruction {
  const data = coder(idl).encode("routeYield", { amount: u64(amount) });

  const keys: AccountMeta[] = [
    { pubkey: accounts.executor, isSigner: true, isWritable: false },
    { pubkey: accounts.mint, isSigner: false, isWritable: false },
    { pubkey: accounts.vault, isSigner: false, isWritable: true },
    { pubkey: accounts.vaultAuthority, isSigner: false, isWritable: false },
    { pubkey: accounts.vaultTokenAccount, isSigner: false, isWritable: true },
    { pubkey: accounts.yieldTokenAccountA, isSigner: false, isWritable: true },
    { pubkey: accounts.yieldTokenAccountB, isSigner: false, isWritable: true },
    { pubkey: accounts.oracleFeed, isSigner: false, isWritable: false },
    { pubkey: accounts.tokenProgram, isSigner: false, isWritable: false },
  ];

  return new TransactionInstruction({ programId, keys, data });
}
