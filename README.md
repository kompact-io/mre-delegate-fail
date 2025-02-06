# MRE delegate fail

A Kompact.io project 

## Errors:

Running on testnet with no native uplc (ie using ogmios for tx eval):

```
'{ Complete: Error: Could not evaluate the transaction: {"type":"jsonwsp/fault","version":"1.0","servicename":"ogmios","fault":{"code":"client","string":"Invalid request: failed to decode payload from base64 or base16."},"reflection":{"id":"3600d88d-1f35-444c-a103-e23187c9cdbd"}}. Transaction: 84a600d90102818258204c1e0a2b63428b2830b9dd4ddfefaf29f2e554d59981bc93dce937534454215800018182581d603733d7d199215d9e181e4a9282d5b347cbc98f828d0ff3b3b52a9e1c821b000000052071cd7aa3581c3d6a3f64d54f4f863f95febc99b3d9844ba105f6cd9c2b71389d6801a14443424c501b00038d7bd9850800581c79eeeb371068f6dac33663fc12ac0ac90d05935a4876c320947c042fa144000643b001581cf271c99bedc07882cb92a740273937ce7b3637cb54b5a89e8195292da1437573641b00038d7bd9850800021a0002c5e004d901028183028201581cfeb5206663e5048c55191eb3aa9a370eac6396adf6f6c04ce5fc7b89581c24d3394028c590692542c932784632147319b6c50e1c17805de044c60b5820000000000000000000000000000000000000000000000000000000000000000012d9010281825820bc8e1b2d48d6d057c3d34fac7f61fe8575fe17d68307f3f84f5f3a6e17af315700a200d9010281825820000000003733d7d199215d9e181e4a9282d5b347cbc98f828d0ff3b3b52a9e1c584000f899d39b17fd5d66c192c4b50d343e42f7235b30504c8ae7619f93c828dc6dce4568dd69177c551828492d777a6727fd66c2fbccbda8c2aeed92032c99790a0581840200446f6f7073820000f5f6 }'
```

With native uplc: 

```
 TxBuilderError: { Complete: "failed script execution Publish[0] the validator crashed / exited prematurely Trace d87b9fd87a9f581c75e9e55dad3cdd588a360ee8f7451a517f6f3605365fefd7cf2f5bc1ff581c24d3394028c590692542c932784632147319b6c50e1c17805de044c6ff Trace ZZZZ Trace Pointer Trace d87a9f581c75e9e55dad3cdd588a360ee8f7451a517f6f3605365fefd7cf2f5bc1ff Trace Other" }
```

It suggests that the certificate has a script credential encoded as a pointer, not `Inline` in aiken speak.

## About / setup

This repo uses nix flakes and has a devshell. 
For non nix users, its key dependencies are `aiken` and `pnpm`, `nodejs`.

## Repo structure 

The top level repo structure is as follows
```sample 
.
├── aik         # on-chain code written in aiken 
├── docs        # spec and other documentation 
├── flake.lock   
├── flake.nix   # Use of nix flakes is optional, but ymmv
├── js          # off-chain tx building code w/lucid evolution
└── README.md
```

## Running code

There is a shell command available via the flake `mk-blueprint`. 
This will run `aiken build` along with any flags passed through, eg `mk-blueprint -f all -t verbose`. 
Then it will convert the `plutus.json` to `blueprint.ts` file located in the `tx` package. 
(Specifically `./js/packages/tx/src/blueprint.ts`). 

From inside `./js`: 

- install dependencies with `pnpm -w install`. 
- build with `pnpm -w build`

From inside the `jobs` package (ie `js/packages/jobs`):

- test with `pnpm test`
- run the cli `pnpm start --help` for options/ help message
