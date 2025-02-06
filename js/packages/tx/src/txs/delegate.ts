import * as lucid from "@lucid-evolution/lucid";
import { m } from "../validators";

export async function tx(
  l: lucid.LucidEvolution,
  ref: lucid.UTxO,
  poolId: lucid.PoolId,
): Promise<lucid.TxBuilder> {
  const script = ref.scriptRef!;
  const ownRewardAddress = lucid.validatorToRewardAddress(
    l.config().network!,
    script,
  );
  const red = m.red2Ser(lucid.fromText("oops"));
  const tx = l
    .newTx()
    .readFrom([ref])
    .delegate.ToPool(ownRewardAddress, poolId, red);
  return tx;
}
