import { parsePriceData } from "@pythnetwork/client";
import { Connection, PublicKey } from "@solana/web3.js";

export type PythPrice = {
  price: bigint;
  conf: bigint;
  expo: number;
  publishTime: number;
};

export async function readPythPrice(
  connection: Connection,
  priceAccount: PublicKey,
): Promise<PythPrice> {
  const info = await connection.getAccountInfo(priceAccount, {
    commitment: "confirmed",
  });
  if (!info) throw new Error("Pyth price account not found");

  const parsed = parsePriceData(info.data);
  if (parsed.price === undefined) throw new Error("Pyth price unavailable");
  if (parsed.confidence === undefined) throw new Error("Pyth confidence unavailable");

  const price = BigInt(Math.trunc(parsed.price));
  const conf = BigInt(Math.trunc(parsed.confidence));

  return {
    price,
    conf,
    expo: parsed.exponent,
    publishTime: Number(parsed.timestamp),
  };
}
