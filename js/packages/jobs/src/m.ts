import * as lucid from "@lucid-evolution/lucid";
import * as kio from "@mre-delegate-fail/kio";
import * as tx from "@mre-delegate-fail/tx";
import { getRefByHash, putRef, sequence, wallets } from "./dapp";

export async function setup(l: lucid.LucidEvolution): Promise<string> {
  let w = wallets(l.config().network!);
  const label = tx.validators.m.label;
  const script = tx.validators.m.mkScript();
  let hash = await putRef(l, script, label);
  await sequence(
    l,
    "admin",
    [
      () =>
        kio.txs.register.tx(
          l,
          lucid.validatorToRewardAddress(l.config().network!, script),
        ),
    ],
    "mRegister",
  );
  return hash;
}

export async function delegateNoUplc(
  l: lucid.LucidEvolution,
  ownHash: string,
  poolId: lucid.PoolId,
) {
  const ref = await getRefByHash(l, ownHash);
  await sequence(
    l,
    "admin",
    [() => tx.txs.delegate.tx(l, ref, poolId)],
    "delegate",
    (t) => kio.txFinish.simpleNoUplcEval(l, t),
  );
}
export async function delegate(
  l: lucid.LucidEvolution,
  ownHash: string,
  poolId: lucid.PoolId,
) {
  const ref = await getRefByHash(l, ownHash);
  await sequence(
    l,
    "admin",
    [() => tx.txs.delegate.tx(l, ref, poolId)],
    "delegate",
  );
}
