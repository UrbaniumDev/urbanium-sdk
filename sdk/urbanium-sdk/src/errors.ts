import type { Idl } from "@coral-xyz/anchor";

import { urbaniumIdl } from "./idl.js";

export class UrbaniumSdkError extends Error {
  readonly name = "UrbaniumSdkError";
  readonly cause: unknown;

  constructor(message: string, cause?: unknown) {
    super(message);
    this.cause = cause;
  }
}

export type UrbaniumProgramError = {
  kind: "anchor";
  code: number;
  name?: string;
  msg?: string;
};

export function parseAnchorCustomError(err: unknown, idl: Idl = urbaniumIdl): UrbaniumProgramError | null {
  const message = stringifyError(err);

  // Matches: "custom program error: 0x1770" (hex) or "custom program error: 6000" (decimal)
  const hexMatch = message.match(/custom program error: (0x[0-9a-fA-F]+)/);
  const decMatch = message.match(/custom program error: (\d+)/);

  let code: number | null = null;
  if (hexMatch?.[1]) code = Number.parseInt(hexMatch[1], 16);
  if (code === null && decMatch?.[1]) code = Number.parseInt(decMatch[1], 10);
  if (code === null || !Number.isFinite(code)) return null;

  const found = idl.errors?.find((e) => e.code === code);

  return {
    kind: "anchor",
    code,
    name: found?.name,
    msg: found?.msg,
  };
}

function stringifyError(err: unknown): string {
  if (typeof err === "string") return err;
  if (err instanceof Error) return `${err.name}: ${err.message}`;
  try {
    return JSON.stringify(err);
  } catch {
    return String(err);
  }
}
