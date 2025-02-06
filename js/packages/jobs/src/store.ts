import * as lucid from "@lucid-evolution/lucid";
import * as kio from "@mre-delegate-fail/kio";
import { sequence, WalletLabel, wallets } from "./dapp";
import { inOrder } from "./utils";

export async function setup(l: lucid.LucidEvolution) {
  let w = wallets(l.config().network!);
  await sequence(
    l,
    "admin",
    [
      () =>
        kio.txs.distribute.tx(
          l,
          Object.fromEntries([
            [w.uploader.address, { lovelace: 200_000_000n }],
          ]),
        ),
    ],
    "distribution",
  );
  return;
}

export async function teardown(l: lucid.LucidEvolution) {
  let w = wallets(l.config().network!);
  const users: WalletLabel[] = ["store", "uploader"];
  const fundedUsers = await Promise.all(
    users.map(async (user) => [
      user,
      kio.lucidExtras.sumUtxos(await l.utxosAt(w[user].address)).lovelace >
        2_000_000n,
    ]),
  ).then((res) =>
    res.filter(([user, pred]) => pred).map(([user, _]) => user as WalletLabel),
  );
  return await inOrder(
    fundedUsers.map(
      (user) => () =>
        sequence(
          l,
          user,
          [() => kio.txs.clear.tx(l, w.admin.address)],
          `clear:${user}`,
          (txb) => kio.txFinish.withChangeAddress(l, txb, w.admin.address),
        ),
    ),
  );
}
