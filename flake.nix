{
  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = nixpkgs.legacyPackages.${system};
      in rec {
        packages.desu-deploy = pkgs.writeShellScriptBin "desu-deploy" ''
          exec '${pkgs.bun}/bin/bun' run '${./src/deploy.ts}' $SSH_ORIGINAL_COMMAND
        '';

        nixosModules.default = { config, lib, pkgs, ... }:
          with lib;
          let cfg = config.services.desu-deploy;
          in
          {
            options.services.desu-deploy = {
              enable = mkEnableOption "enable desu-deploy integration";
              key = mkOption {
                type = types.singleLineStr;
                description = "ssh key for the deployment user";
              };
            };

            config = mkIf cfg.enable {
              users.users.desu-deploy = {
                group = "nogroup";
                isNormalUser = true;
                openssh.authorizedKeys.keys = [ 
                  "command=\"sudo -E desu-deploy\" ${cfg.key}"
                ];
              };
              environment.systemPackages = [ packages.desu-deploy ];
              security.sudo.extraRules = [
                {
                  users = [ "desu-deploy" ];
                  commands = [
                    {
                      command = "/run/current-system/sw/bin/desu-deploy";
                      options = [ "NOPASSWD" "SETENV" ];
                    }
                  ];
                }
              ];
            };
          };
      }
    );
}