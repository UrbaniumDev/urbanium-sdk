import { BorshAccountsCoder, type IdlAccounts } from "@coral-xyz/anchor";

import { urbaniumIdl, type UrbaniumIdl } from "./idl.js";

export type VaultAccount = IdlAccounts<UrbaniumIdl>["vault"];
export type UserPositionAccount = IdlAccounts<UrbaniumIdl>["userPosition"];

const coder = new BorshAccountsCoder(urbaniumIdl);

export function decodeVault(data: Buffer): VaultAccount {
  return coder.decode<VaultAccount>("vault", data);
}

export function decodeUserPosition(data: Buffer): UserPositionAccount {
  return coder.decode<UserPositionAccount>("userPosition", data);
}
