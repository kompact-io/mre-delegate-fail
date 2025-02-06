{
  description = "Kompact project";

  inputs = {
    flake-parts.url = "github:hercules-ci/flake-parts";
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    pre-commit-hooks-nix.url = "github:hercules-ci/pre-commit-hooks.nix/flakeModule";
    pre-commit-hooks-nix.inputs.nixpkgs.follows = "nixpkgs";
    aiken.url = "github:aiken-lang/aiken/v1.0.29-alpha";
    # aiken.url = "path:/home/waalge/clones/cardano/aiken";
    treefmt-nix.url = "github:numtide/treefmt-nix";
  };

  outputs = inputs@{ flake-parts, ... }:
    flake-parts.lib.mkFlake { inherit inputs; }
      {
        imports = [
          inputs.pre-commit-hooks-nix.flakeModule
          inputs.treefmt-nix.flakeModule
        ];
        systems = [ "x86_64-linux" "aarch64-darwin" ];
        perSystem = { config, self', inputs', pkgs, ... }: {
          treefmt = {
            projectRootFile = "flake.nix";
            flakeFormatter = true;
            programs = {
              prettier = {
                enable = true;
              };
            };
          };

          devShells.default = let 
            mk-blueprint = pkgs.writeShellScriptBin "mk-blueprint"
            ''
              #!/usr/bin/env bash

              ROOT=$(git rev-parse --show-toplevel)
              aiken build $@ $ROOT/aik
              node $ROOT/js/packages/mkBlueprint/dist/src/index.js \
                --input $ROOT/aik/plutus.json \
                --output $ROOT/js/packages/tx/src/blueprint.ts
            '';
          in
          pkgs.mkShell {
            nativeBuildInputs = [
              config.treefmt.build.wrapper
            ]
            ;
            shellHook = ''
              echo 1>&2 "Welcome to the development shell!"
            '';
            name = "hello-aiken";
            packages = with pkgs; [
              inputs'.aiken.packages.aiken
              deno
              nodejs_22
              pnpm 
              typescript-language-server
              pandoc
              mk-blueprint
            ];
          };
        };
        flake = { };
      };
}
