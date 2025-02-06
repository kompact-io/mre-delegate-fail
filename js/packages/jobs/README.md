# jobs

## Build 

To build the entire workspace

```
pnpm -w build
```

To build local package 

```
pnpm build
```

## Test 

Test in the emulator 

```
pnpm test
```

## Use

Requires `.env` file. 
See `.env.example` for expected variables and form.

Run the cli, and get help

```
pnpm start --help
```

The cli tool can be used to execute jobs. 

The provider is blockfrost by default. 

TODO. Add providers. 

Each time a job is run it either requires a config, produces a config, or both. 

There are two route commands: 

```
pnpm start <config> do <job> 
pnpm start <config> show
```
