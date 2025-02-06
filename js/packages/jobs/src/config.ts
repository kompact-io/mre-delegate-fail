import * as lucid from "@lucid-evolution/lucid";
import { readFileSync, writeFileSync } from "node:fs";

export type Config = {
  mHash: lucid.ScriptHash;
};

export function readConfig(fp: string): Partial<Config> {
  const data = readFileSync(fp, "utf8");
  return JSON.parse(data);
}

export function writeConfig(fp: string, config: Partial<Config>) {
  writeFileSync(fp, JSON.stringify(config, null, 2), "utf8");
}

export function updateConfig(
  oldConfig: Partial<Config>,
  newConfig: Partial<Config>,
) {
  return {
    ...oldConfig,
    ...newConfig,
  };
}
