# desu-deploy

small script and github action to deploy stuff over ssh

## server setup (nixos)

```nix
{
  inputs.desu-deploy.url = "github:teidesu/desu-deploy";
  inputs.desu-deploy.inputs.nixpkgs.follows = "nixpkgs";

  outputs = { desu-deploy, ...}: {
    nixosConfigurations.servername = nixpkgs.lib.nixosSystem {
      modules = [
        desu-deploy.nixosModules.x86_64-linux.default
        {
          services.desu-deploy = {
            enable = true;
            key = "ssh-ed25519 ...";
          };
        }
        ...
      ];
    }
  }
}
```

## action usage

```yaml
uses: teidesu/desu-deploy@main
with:
  key: ${{ secrets.DEPLOY_KEY }}
  server: ${{ secrets.DEPLOY_SERVER }}
  wireguard: ${{ secrets.DEPLOY_WG }} # optional
  service: service-name
```

## security considerations

as long as the ssh private key is securely stored - everything should be safe.

but even in case it gets leaked, there are a few hardening steps in place:
- the deploy key can only be used to log in as the `desu-deploy` user
- that user can only run the deploy script (via openssh `command=`)
- that user can only use sudo for the deploy script (via sudoers)
