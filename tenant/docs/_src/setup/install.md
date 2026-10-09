---
title: Install
description: One line on macOS, Linux or Windows. No sudo, no toolchain, a verified download.
area: Setup &amp; install
area-url: /tenant/docs/setup/install
---

## One-line install

macOS or Linux:

```bash
curl -fsSL https://github.com/Dog279/TENANT/releases/latest/download/install.sh | sh
```

Windows (PowerShell):

```powershell
irm https://github.com/Dog279/TENANT/releases/latest/download/install.ps1 | iex
```

The script downloads the release archive for your OS and CPU, checks its SHA-256 against the release's `checksums.txt`, and installs the binary for the current user:

| | macOS and Linux | Windows |
|---|---|---|
| Binary | `~/.local/bin/tenant` | `%LOCALAPPDATA%\Programs\tenant\tenant.exe` |
| Rights needed | none (no sudo) | none (no administrator) |
| Quarantine | none: a `curl` download carries no Gatekeeper mark | none: no SmartScreen prompt |

If the directory is not on your `PATH`, the script prints the line to add. Confirm with:

```bash
tenant version
```

### Script options

Set these in the environment before running the script.

| Variable | Default | Effect |
|---|---|---|
| `TENANT_VERSION` | the latest release | Install this version, written without the leading `v` (`0.2.0`). |
| `TENANT_INSTALL_DIR` | `~/.local/bin` or `%LOCALAPPDATA%\Programs\tenant` | Where the binary goes. |
| `TENANT_REPO` | `Dog279/TENANT` | The GitHub repository asked for the latest release. |
| `TENANT_BASE_URL` | the release's download URL | A directory URL that holds the archive and `checksums.txt` (a mirror). |

```bash
TENANT_VERSION=0.1.0 TENANT_INSTALL_DIR=/opt/tenant/bin sh -c "$(curl -fsSL https://github.com/Dog279/TENANT/releases/latest/download/install.sh)"
```

## Manual install

Every release on the [Releases page](https://github.com/Dog279/TENANT/releases/latest) carries:

| File | What |
|---|---|
| `tenant_<version>_<os>_<cpu>.tar.gz` (`.zip` on Windows) | the binary, `README.md` and `LICENSE`; `os` is `darwin`, `linux` or `windows`, `cpu` is `x86_64` or `aarch64` |
| `checksums.txt` | SHA-256 of every archive |
| `checksums.txt.sigstore.json` | a keyless cosign signature of the checksums, made by the release workflow through GitHub OIDC |
| `*.spdx.json` | an SBOM per archive |
| `install.sh`, `install.ps1` | the scripts above |

Download the archive, verify it, and put `tenant` (`tenant.exe`) on your `PATH`:

```bash
shasum -a 256 -c --ignore-missing checksums.txt
tar -xzf tenant_0.1.0_darwin_aarch64.tar.gz tenant
mv tenant ~/.local/bin/
```

A browser download on macOS carries a quarantine mark; `xattr -d com.apple.quarantine ~/.local/bin/tenant` clears it.

## Build from source

```bash
git clone https://github.com/Dog279/TENANT.git
cd TENANT
go build ./cmd/tenant        # needs Go 1.26+; produces ./tenant
go test ./...                # optional
```

A build without release stamping reports itself as a dev build, and `tenant update` refuses to replace a dev build.

## After installing

1. `tenant setup` writes `config.json` and your keys. See [The setup wizard](/tenant/docs/first-launch/setup-wizard).
2. `tenant doctor` checks the setup.
3. `tenant tui` opens the terminal UI, or `tenant service install` runs Tenant in the background. See [Run in the background](/tenant/docs/setup/service).

Tab completion:

```bash
source <(tenant completion bash)      # ~/.bashrc
source <(tenant completion zsh)       # ~/.zshrc, after compinit
tenant completion fish | source       # or save to ~/.config/fish/completions/tenant.fish
```

```powershell
tenant completion powershell | Out-String | Invoke-Expression   # in $PROFILE
```

## Uninstall

```bash
tenant service uninstall     # if you installed the background service
rm ~/.local/bin/tenant       # the binary (and tenant.prev, if an update left one)
```

Your config and data stay where [Files &amp; directories](/tenant/docs/setup/directories) says. `tenant privacy export --out DIR` writes everything as readable files first if you want to keep it; delete the two directories to remove it.
