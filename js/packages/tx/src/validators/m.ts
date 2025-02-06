import * as lucid from "@lucid-evolution/lucid";
import { MTwo } from "../blueprint";

export const label = "mre-delegate-fail";
export type Params = ConstructorParameters<MTwo>;
export type Red2 = MTwo["red"];
export const Red2 = MTwo["red"];

/////// DATA

export function mkScript() {
  const script = new MTwo();
  if (script === undefined || script == null) throw "no script at ref";
  return script;
}

export function mkAddress(
  network: lucid.Network,
  ownHash: string,
): lucid.Address {
  const ownCred: lucid.Credential = { type: "Script", hash: ownHash };
  return lucid.credentialToAddress(network, ownCred, ownCred);
}

export function red2Ser(x: Red2): string {
  return lucid.Data.to<Red2>(x, Red2);
}
