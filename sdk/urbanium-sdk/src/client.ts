import {
  AnchorProvider,
  BorshAccountsCoder,
  type Idl,
} from "@coral-xyz/anchor";
import {
  Connection,
  type PublicKey,
  Transaction,
  type TransactionInstruction,
  sendAndConfirmTransaction,
} from "@solana/web3.js";

import { urbaniumIdl } from "./idl.js";
import { parseAnchorCustomError, UrbaniumSdkError } from "./errors.js";

export type UrbaniumClientOptions = {
  connection: Connection;
  wallet: AnchorProvider["wallet"];
  programId: PublicKey;
  idl?: Idl;
};

export class UrbaniumClient {
  readonly connection: Connection;
  readonly wallet: AnchorProvider["wallet"];
  readonly programId: PublicKey;
  readonly idl: Idl;

  private readonly accountsCoder: BorshAccountsCoder;

  constructor(opts: UrbaniumClientOptions) {
    this.connection = opts.connection;
    this.wallet = opts.wallet;
    this.programId = opts.programId;
    this.idl = opts.idl ?? urbaniumIdl;

    this.accountsCoder = new BorshAccountsCoder(this.idl);
  }

  decodeAccount<T>(accountName: string, data: Buffer): T {
    return this.accountsCoder.decode<T>(accountName, data);
  }

  async sendIxs(ixs: TransactionInstruction[], signers: never[] = []): Promise<string> {
    const payer = this.wallet.publicKey;
    if (!payer) throw new UrbaniumSdkError("Wallet has no publicKey");

    const latest = await this.connection.getLatestBlockhash("finalized");

    const tx = new Transaction({
      feePayer: payer,
      blockhash: latest.blockhash,
      lastValidBlockHeight: latest.lastValidBlockHeight,
    }).add(...ixs);

    const signed = await this.wallet.signTransaction(tx);

    try {
      return await sendAndConfirmTransaction(this.connection, signed, signers as never[], {
        commitment: "confirmed",
        maxRetries: 3,
      });
    } catch (e: unknown) {
      const parsed = parseAnchorCustomError(e, this.idl);
      if (parsed) {
        throw new UrbaniumSdkError(
          `Urbanium program error ${parsed.code}${parsed.name ? ` (${parsed.name})` : ""}${parsed.msg ? `: ${parsed.msg}` : ""}`,
          e,
        );
      }
      throw new UrbaniumSdkError("Transaction failed", e);
    }
  }
}
