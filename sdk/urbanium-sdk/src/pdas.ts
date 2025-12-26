import { PublicKey } from "@solana/web3.js";

import { USER_POSITION_SEED, VAULT_AUTHORITY_SEED, VAULT_SEED } from "./constants.js";

export function deriveVaultPda(programId: PublicKey, mint: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from(VAULT_SEED, "utf8"), mint.toBuffer()],
    programId,
  );
}

export function deriveVaultAuthorityPda(
  programId: PublicKey,
  vault: PublicKey,
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from(VAULT_AUTHORITY_SEED, "utf8"), vault.toBuffer()],
    programId,
  );
}

export function deriveUserPositionPda(
  programId: PublicKey,
  vault: PublicKey,
  owner: PublicKey,
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from(USER_POSITION_SEED, "utf8"), vault.toBuffer(), owner.toBuffer()],
    programId,
  );
}
