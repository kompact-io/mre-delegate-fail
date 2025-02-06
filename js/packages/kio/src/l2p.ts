/// Lucid to Plutus types

import * as lucid from "@lucid-evolution/lucid";
import * as plutusTypes from "./plutusTypes";

export function outputReference(x: lucid.OutRef): plutusTypes.OutputReference {
  return {
    transactionId: { hash: x.txHash },
    outputIndex: BigInt(x.outputIndex),
  };
}
export function credential(x: lucid.Credential): plutusTypes.Credential {
  if (x.type == "Key") {
    return { VerificationKeyCredential: [x.hash] };
  }
  if (x.type == "Script") {
    return { ScriptCredential: [x.hash] };
  }
  throw new Error("impossible!");
}
