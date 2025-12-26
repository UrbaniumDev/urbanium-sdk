import assert from "node:assert/strict";
import { describe, it } from "mocha";
import { PublicKey, SystemProgram } from "@solana/web3.js";

import {
  buildDepositIx,
  buildInitializeVaultIx,
  buildRouteYieldIx,
  buildWithdrawIx,
  deriveUserPositionPda,
  deriveVaultAuthorityPda,
  deriveVaultPda,
} from "@urbanium/sdk";

// Deterministic, real pubkeys (no random test vectors).
const programId = new PublicKey("7XzKxpTmsiTevyC9KYaFZbpGp9NnJ2VwK6ie7RdKZXBW");
const mint = new PublicKey("So11111111111111111111111111111111111111112");
const user = new PublicKey("11111111111111111111111111111111");

describe("urbanium-sdk", () => {
  it("derives vault + authority PDAs deterministically", () => {
    const [vault] = deriveVaultPda(programId, mint);
    const [vaultAuth] = deriveVaultAuthorityPda(programId, vault);
    const [pos] = deriveUserPositionPda(programId, vault, user);

    assert.equal(PublicKey.isOnCurve(vault.toBytes()), false);
    assert.equal(PublicKey.isOnCurve(vaultAuth.toBytes()), false);
    assert.equal(PublicKey.isOnCurve(pos.toBytes()), false);
  });

  it("builds instructions with explicit metas", () => {
    const [vault] = deriveVaultPda(programId, mint);
    const [vaultAuthority] = deriveVaultAuthorityPda(programId, vault);
    const [userPosition] = deriveUserPositionPda(programId, vault, user);

    const payer = user;
    const vaultTokenAccount = new PublicKey("So11111111111111111111111111111111111111112");
    const yieldA = new PublicKey("So11111111111111111111111111111111111111112");
    const yieldB = new PublicKey("So11111111111111111111111111111111111111112");
    const oracleFeed = new PublicKey("So11111111111111111111111111111111111111112");
    const oracleProgram = new PublicKey("So11111111111111111111111111111111111111112");

    const initIx = buildInitializeVaultIx(
      programId,
      {
        payer,
        mint,
        vault,
        vaultAuthority,
        vaultTokenAccount,
        yieldTokenAccountA: yieldA,
        yieldTokenAccountB: yieldB,
        oracleFeed,
        systemProgram: SystemProgram.programId,
        tokenProgram: new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"),
        associatedTokenProgram: new PublicKey("ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"),
      },
      {
        oracleProgram,
        oracleFeed,
        maxStalenessSeconds: 60n,
        maxConfidenceBps: 200,
        routeThresholdPrice: 0n,
      },
    );

    assert.equal(initIx.programId.toBase58(), programId.toBase58());
    assert.equal(initIx.keys.length, 11);

    const depositIx = buildDepositIx(
      programId,
      {
        depositor: user,
        mint,
        vault,
        vaultAuthority,
        userPosition,
        userTokenAccount: vaultTokenAccount,
        vaultTokenAccount,
        yieldTokenAccountA: yieldA,
        yieldTokenAccountB: yieldB,
        systemProgram: SystemProgram.programId,
        tokenProgram: new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"),
        associatedTokenProgram: new PublicKey("ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"),
      },
      1n,
    );

    assert.equal(depositIx.keys[0]?.isSigner, true);

    const withdrawIx = buildWithdrawIx(
      programId,
      {
        withdrawer: user,
        mint,
        vault,
        vaultAuthority,
        userPosition,
        userTokenAccount: vaultTokenAccount,
        vaultTokenAccount,
        yieldTokenAccountA: yieldA,
        yieldTokenAccountB: yieldB,
        systemProgram: SystemProgram.programId,
        tokenProgram: new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"),
        associatedTokenProgram: new PublicKey("ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"),
      },
      1n,
    );

    assert.equal(withdrawIx.keys[0]?.isSigner, true);

    const routeIx = buildRouteYieldIx(
      programId,
      {
        executor: user,
        mint,
        vault,
        vaultAuthority,
        vaultTokenAccount,
        yieldTokenAccountA: yieldA,
        yieldTokenAccountB: yieldB,
        oracleFeed,
        tokenProgram: new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"),
      },
      1n,
    );

    assert.equal(routeIx.keys[0]?.isSigner, true);
  });
});
