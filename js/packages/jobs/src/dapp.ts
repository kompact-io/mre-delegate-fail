/// Expected config

import * as lucid from "@lucid-evolution/lucid";
import * as kio from "@mre-delegate-fail/kio";

export const walletLabels = ["admin", "store", "uploader"] as const;
export type WalletLabel = (typeof walletLabels)[number];

export function wallets(
  n: lucid.Network,
): Record<WalletLabel, kio.wallets.WalletInfo> {
  let w = kio.wallets.wallets(n);
  return Object.fromEntries(
    walletLabels.map((x) => [x as WalletLabel, w[x]]),
  ) as Record<WalletLabel, kio.wallets.WalletInfo>;
}

export async function sequence(
  l: lucid.LucidEvolution,
  walletLabel: WalletLabel,
  txbs: (() => kio.txFinish.TxBuilder)[],
  txLabel: string = "",
  finish?: (_: kio.txFinish.TxBuilder) => Promise<string>,
) {
  if (finish) {
    return kio.jobs.queues.sequence(l, walletLabel, txbs, txLabel, finish);
  } else {
    return kio.jobs.queues.sequence(l, walletLabel, txbs, txLabel);
  }
}

export async function putRef(
  l: lucid.LucidEvolution,
  script: lucid.Script,
  label?: string,
) {
  let w = wallets(l.config().network!);
  await sequence(
    l,
    "uploader",
    [() => kio.txs.upload.tx(l, script, w.store.address, label || "")],
    `put:${label}`,
  );
  return lucid.validatorToScriptHash(script)!;
}

export async function getRefByHash(l: lucid.LucidEvolution, hash: string) {
  return kio.refs.getRefByHash(
    l,
    wallets(l.config().network!).store.address,
    hash,
  );
}
