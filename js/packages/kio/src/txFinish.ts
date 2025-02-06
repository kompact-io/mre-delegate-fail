import * as lucid from "@lucid-evolution/lucid";

export type TxBuilder = lucid.TxBuilder | Promise<lucid.TxBuilder>;

function explorerSubdomain(n: lucid.Network) {
  if (n === "Preview") return "preview.";
  if (n === "Preprod") return "preprod.";
  return "";
}

function explorerLink(l: lucid.LucidEvolution, txHash: string) {
  const c = l.config();
  if ("log" in c.provider!) return `emulator:${txHash}`;
  return `https://${explorerSubdomain(c.network!)}cexplorer.io/tx/${txHash}`;
}

export async function simple(l: lucid.LucidEvolution, txb: TxBuilder) {
  const txHash = await Promise.resolve(txb)
    .then((res) => res.complete())
    .then((res) => res.sign.withWallet())
    .then((res) => res.complete())
    .then((res) => res.submit());
  console.log(explorerLink(l, txHash));
  const _res = await l.awaitTx(txHash);
  return txHash;
}

export async function withChangeAddress(
  l: lucid.LucidEvolution,
  txb: TxBuilder,
  address: string,
) {
  const txHash = await Promise.resolve(txb)
    .then((res) => res.complete({ changeAddress: address }))
    .then((res) => res.sign.withWallet())
    .then((res) => res.complete())
    .then((res) => res.submit());
  console.log(explorerLink(l, txHash));
  const _res = await l.awaitTx(txHash);
  return txHash;
}

export async function simpleNoUplcEval(
  l: lucid.LucidEvolution,
  txb: TxBuilder,
) {
  const txHash = await Promise.resolve(txb)
    .then((res) => res.complete({ localUPLCEval: false }))
    .then((res) => res.sign.withWallet())
    .then((res) => res.complete())
    .then((res) => res.submit());
  console.log(explorerLink(l, txHash));
  const _res = await l.awaitTx(txHash);
  return txHash;
}
