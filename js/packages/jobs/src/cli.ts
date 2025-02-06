import * as lucid from "@lucid-evolution/lucid";
import * as kio from "@mre-delegate-fail/kio";
import { Command } from "commander";

import * as m from "./m";
import * as store from "./store";
import { Config, readConfig, updateConfig, writeConfig } from "./config";
import { sequence, wallets } from "./dapp";

async function mkLucid() {
  return await kio.mkLucid.mkLucidWithBlockfrost();
}

function addSimpleJob(
  cmd: Command,
  name: string,
  job: (l: lucid.LucidEvolution) => Promise<Partial<Config>>,
  description = "",
) {
  cmd
    .command(name)
    .description(description)
    .action(async (args, ctx) => {
      console.log(ctx.parent.opts());
      const configPath = ctx.parent.opts().c;
      const config = readConfig(configPath);
      const l = await mkLucid();
      const uConfig = await job(l);
      writeConfig(configPath, updateConfig(config, uConfig));
    });
}

function addJobWithConfig(
  cmd: Command,
  name: string,
  job: (
    l: lucid.LucidEvolution,
    c: Partial<Config>,
  ) => Promise<Partial<Config>>,
  description = "",
) {
  cmd
    .command(name)
    .description(description)
    .action(async (args, ctx) => {
      console.log(ctx.parent.opts());
      const configPath = ctx.parent.opts().c;
      const config = readConfig(configPath);
      const l = await mkLucid();
      const uConfig = await job(l, config);
      writeConfig(configPath, updateConfig(config, uConfig));
    });
}

function parseOutRefs(s: string): lucid.OutRef[] {
  console.log(s);
  return s.split(",").map((ss) => {
    const [txHash, idx] = ss.split("#");
    if (idx == undefined) throw new Error("Cannot parse out ref");
    return { txHash, outputIndex: Number(idx) };
  });
}

function addRemoveScripts(cmd: Command) {
  cmd
    .command("removeScripts")
    .description("Remove script from store. Will send ada back to uploader")
    .option("--hashes <hashes>", "The utxos by script hash (comma separated)")
    .option(
      "--outRefs <outRefs>",
      "The utxos out refs hash (comma separated) '<txid>#<idx>,...",
      parseOutRefs,
    )
    .action(async (args, ctx) => {
      const hashes: string[] = args.hashes?.split(",") || [];
      const outRefs = args.outRefs || [];
      console.log("out refs", outRefs);
      const l = await mkLucid();
      const w = wallets(l.config().network!);
      const allUtxos = await l.utxosAt(w.store.address);
      const utxos = allUtxos.filter(
        (u) =>
          outRefs.some(
            ({ txHash, outputIndex }) =>
              u.txHash == txHash && u.outputIndex == outputIndex,
          ) ||
          (u.scriptRef &&
            hashes.includes(lucid.validatorToScriptHash(u.scriptRef!))),
      );
      utxos.forEach((u) => {
        if (u == undefined) throw new Error("Some hashes not found");
      });
      if (utxos.length == 0) throw new Error("No utxos found");
      await sequence(
        l,
        "store",
        [() => l.newTx().collectFrom(utxos)],
        `removeScripts`,
        (txb) => kio.txFinish.withChangeAddress(l, txb, w.uploader.address),
      );
    });
}

function addDelegate(cmd: Command) {
  cmd
    .command("delegate")
    .description("delegate main script to poolid")
    .argument("poolId", "The pool-id which to delegate")
    .action(async (args, _opts, ctx) => {
      const configPath = ctx.parent.opts().c;
      const config = readConfig(configPath);
      const ownHash = config.mHash;
      if (ownHash == undefined) throw new Error("no mHash found");
      const l = await mkLucid();
      await m.delegateNoUplc(l, ownHash, args);
    });
}

async function distributeAda(l: lucid.LucidEvolution, amt = 100_000_000n) {
  const w = wallets(l.config().network!);
  await sequence(
    l,
    "admin",
    [
      () =>
        kio.txs.distribute.tx(
          l,
          Object.fromEntries([[w.uploader.address, { lovelace: amt }]]),
        ),
    ],
    "distribute",
  );
  return {};
}

async function purgeAdmin(l: lucid.LucidEvolution) {
  await sequence(l, "admin", [() => kio.txs.purge.tx(l)], "purge");
  return {};
}

function cmds() {
  const cmd = new Command().name("jobs");
  const job = cmd
    .command("job")
    .requiredOption("-c <config>, --config <config>", "Path to the config");

  addSimpleJob(
    job,
    "distributeAda",
    distributeAda,
    "Send ada from admin to some other wallets",
  );

  addJobWithConfig(
    job,
    "setupM",
    async (l, c) => {
      const res = await m.setup(l);
      return { mHash: res };
    },
    "Setup m (main) script. Done by admin",
  );
  addDelegate(job);

  addRemoveScripts(job);

  addSimpleJob(
    job,
    "teardownStore",
    store.teardown,
    "Send all store and uploader value to admin",
  );
  addSimpleJob(
    job,
    "purgeAdmin",
    purgeAdmin,
    "Send all non-ada tokens into the void",
  );

  const show = cmd
    .command("show")
    .description("Show dapp info")
    .option("-c <config>, --config <config>", "Path to the config");
  show
    .command("wallets")
    .description("Show state of wallets ")
    .action(async (args, opts) => {
      const configPath = opts.opts().config;
      if (configPath) {
      }
      const l = await mkLucid();
      const w = wallets(l.config().network!);
      Object.entries(w).forEach(async ([key, val]) => {
        let tot = await l
          .utxosAt(val.address)
          .then((r) => kio.lucidExtras.sumUtxos(r));
        console.log(key, "\n", w[key].address, "\n", tot);
      });
    });

  return cmd;
}

function main() {
  cmds().parse();
}

main();
