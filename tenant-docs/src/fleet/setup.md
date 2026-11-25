---
title: Set up a fleet
description: Make one Tenant a fleet master, give a new machine a one-time code, confirm it with the six digits it shows, and choose how your machines reach the master.
area: Fleet
area-url: /tenant/docs/fleet/overview
---

Setting up a fleet takes three steps: make a master once, then for each machine make a code on the master, paste one line on the machine, and confirm the machine on the master.

## 1. Make a master

```bash
tenant fleet init [--listen ADDR] [--address HOST:PORT]...
```

| Flag | Effect |
|---|---|
| `--listen ADDR` | where the fleet port binds; saved as `fleet.listen` in `config.json`. Default `0.0.0.0:9777`, every interface |
| `--address HOST:PORT` | an address the machines dial to reach this master (repeatable; replaces the list). Without it, `init` uses this computer's name and its IPv4 addresses |
| `--wait` | how long to wait for a running Tenant to take the fleet |

`init` makes the master's certificate, the fleet key (which encrypts the machines' memory) and the **recovery identity**. Run again on a master, it keeps the certificate and the keys it already has.

Nothing restarts. A running `tenant serve` (or terminal app) sees the new master within a few seconds, takes the fleet and starts listening. Run the master as its service (`tenant service install`) so its machines stay connected.

On a Windows master, Windows Firewall may ask about the first listener on an address that is not loopback. Allow it for the networks your machines are on.

### The recovery identity

At a terminal, `init` shows the fleet's recovery identity once and asks you to type or paste it back. It is recorded only after you have given it back correctly. Tenant does not keep it and will not show it again.

Save it away from the master: a password manager, or paper. With it, and only with it, a master rebuilt from nothing can read its machines' memory again ([A machine's memory](/tenant/docs/fleet/memory)). Then clear the terminal's scrollback.

Without a terminal, `init` sets up everything else, shows no secret and exits 1. Run it again at a terminal.

### From the terminal app or the dashboard

A running Tenant can make itself a master from its own screens. Both run the same `init`.

```text
/fleet init [--listen ADDR] [--address HOST:PORT]...
```

In the terminal app, `/fleet init` takes the same two flags. The app steps aside while the recovery identity is shown on the terminal and typed back, then returns and says what `init` says. The identity is never in the app's chat, its transcript or a log. If you cancel, the fleet is made without a recovery key and `/fleet init` offers the step again. Like every change to the fleet, type it yourself: a line the app submits for you does not run it.

On the dashboard, the **Fleet** page of a Tenant with no fleet has **Set up the fleet**: the address the fleet port listens on and the addresses machines dial, filled in as `init` would choose them, and **Make this Tenant a fleet master**. It takes a signed-in browser; the API key cannot make a fleet. It makes everything but the recovery key, because the recovery identity is not shown in a browser. Until you run `tenant fleet init` or `/fleet init` at a terminal, the page says the fleet has no recovery key and no machine's memory is kept.

An address that is not a `host:port` is refused before anything is made, on all three.

## 2. Make a code for a machine

```bash
tenant fleet enroll <name> [--ttl 15m] [--adopt ID]
```

| Flag | Effect |
|---|---|
| `--ttl` | how long the code can be spent; default 15 minutes, at most 24 hours |
| `--adopt ID` | give the new machine the id of a revoked one, and with it the approval scheme kept under that id |
| `--wait` | how long to wait for a running Tenant to take the fleet |

`enroll` runs `init` first if this Tenant is not a master yet, but that does not make the recovery key: until you run `tenant fleet init` (or `/fleet init`) at a terminal, no machine's memory is kept, and `enroll` says so. It prints the code alone on standard output, then on standard error: when the code expires, the addresses it carries, and one line to paste for each kind of machine. The code works once.

The same output is `/fleet enroll <name>` in the terminal app. On the dashboard's Fleet page, **Add machine** takes a name and whether the machine runs as you or from boot, and shows the lines with a Copy button, in that one answer only: not in the address bar, not after a reload, not in any log. Making a code there takes a signed-in browser; the API key cannot make one.

### The line to paste on the machine

For a machine with nothing on it, the line fetches the install script from the master's own release, so the new machine gets the version the master runs, a prerelease included. The script checks the download and goes straight on to `tenant child install`. (A development build of Tenant is no release, and its lines fetch the latest one.)

```bash
# Linux, macOS: the child runs as you, from logon
curl -fsSL https://github.com/<owner>/<repo>/releases/download/v<version>/install.sh | TENANT_CHILD=user TENANT_ENROLL_CODE='<code>' sh

# Linux, macOS: a service that runs as root from boot (sudo asks for your password)
curl -fsSL https://github.com/<owner>/<repo>/releases/download/v<version>/install.sh | TENANT_CHILD=system TENANT_ENROLL_CODE='<code>' sudo --preserve-env=TENANT_CHILD,TENANT_ENROLL_CODE sh
```

```powershell
# Windows: as you (PowerShell); for SYSTEM from boot, use 'system' in a PowerShell run as administrator
$env:TENANT_CHILD='user'; $env:TENANT_ENROLL_CODE='<code>'; irm https://github.com/<owner>/<repo>/releases/download/v<version>/install.ps1 | iex
```

For a machine that has Tenant already (0.2.0 or later: 0.1.0 has no `tenant child`):

```bash
printf '%s\n' '<code>' | tenant child install            # Linux, macOS
printf '%s\n' '<code>' | tenant child install --system   # in a root shell: a service from boot
```

```powershell
'<code>' | tenant child install            # PowerShell
'<code>' | tenant child install --system   # PowerShell run as administrator
```

`enroll` prints these lines with the real code, repository and version filled in. A build of Tenant that names no release repository cannot print the install-script lines: it says so, and prints the others.

**The code never travels as an argument.** `tenant child install` reads it from standard input or from `TENANT_ENROLL_CODE`, and refuses a code given on the command line (exit 2), because an argument shows in the process list and stays in the shell's history. The boot-time line for Linux and macOS keeps it off sudo's command line with `--preserve-env`.

`tenant child install` also takes `--ceiling full|no-exec|read-only` and `--updates release|master`; [On a fleet machine](/tenant/docs/fleet/machines) and [Update, move and recover](/tenant/docs/fleet/updates) explain them.

## 3. Confirm the machine

The machine makes its own key, prints **six digits**, and shows as `pending` on the master. Until you confirm it, the master sends it nothing.

```bash
tenant fleet confirm <name> [--set category=mode]...
```

`confirm` shows what the machine reported about itself (OS, account, version, sandbox, ceiling: its own words, not checked) and the approval scheme it will start with, then asks for the six digits. `--set exec=allow` sets a category for this machine alone. Each line of the scheme says where its value came from when it is not the master's own: `set by you`, `fleet default`, `fleet rule`, `group <name>`, or `(this master: allow)` for a category the copy made stricter. [Approvals on fleet machines](/tenant/docs/fleet/approvals) explains the starting scheme.

Compare the digits with the ones on the machine's own screen. They tie the record on the master to that machine, and to no other machine that got hold of its code.

What is confirmed is what the screen showed. If one of the fleet's defaults, its rules or one of the machine's groups is edited between the screen and the digits, `tenant fleet confirm` and the dashboard's form confirm nothing and say to read the screen again. `/fleet confirm <name> <six digits>` in the terminal app is one line with no screen before it, so it is not held to one: read `/fleet confirm <name>` just before.

Confirming takes a person. It is accepted from:

- `tenant fleet confirm` at a terminal (there is no flag for the digits);
- `/fleet confirm <name> <six digits>` typed in the terminal app;
- the dashboard's machine page (**Confirm this machine**), from a browser signed in on the computer running Tenant, at its 127.0.0.1 or localhost address;
- a signed-in browser on another computer, only once you have turned on [remote confirmation](/tenant/docs/fleet/setup#confirming-from-another-computer).

A request that carries only the API key is refused, whatever the setting. No tool, relay command or approval card can confirm a machine.

The enroll endpoint takes five attempts a minute from one address. A code presented a second time is refused and raises an alert.

### Confirming from another computer

A browser that reaches the dashboard over the local network, by a Tailscale name or through a proxy is not on the master: its Fleet page shows the pending machine and says where to confirm it. On a master with no screen (Windows Server Core, a headless box) that means a console for every machine. You can let a signed-in browser elsewhere confirm instead. It is off until you turn it on, at the master's terminal:

```bash
tenant fleet remote-confirm [on|off]
```

| Command | Does |
|---|---|
| `tenant fleet remote-confirm` | says whether it is on |
| `tenant fleet remote-confirm on` | says what it allows and asks you to type `on`; it refuses when its input is not a terminal |
| `tenant fleet remote-confirm off` | turns it off; it asks nothing |

In the terminal app the same is `/fleet remote-confirm [on|off]`, and only a line you type yourself changes it. A script or the agent cannot turn it on with either. There is no switch for it on the dashboard. The setting is `fleet.remote_confirm` in `config.json` ([config.json](/tenant/docs/reference/config)); the running Tenant reads it at each confirmation, so nothing restarts.

While it is on:

- the pending machine's page offers the confirm form to a signed-in browser elsewhere, with one more field: **the dashboard's sign-in key, again**. A wrong key changes nothing, counts against that address as a wrong sign-in does, and leaves a Security record;
- a request that carries only the API key is still refused, and the wait after wrong digits is the same;
- the Security log records the confirmation and every refusal with the surface `dashboard-remote`, and the session and address that asked; the fleet log has the confirmation and refused digits too. Behind `tailscale serve` or a proxy that address is always this computer's own, so the record also quotes what the proxy said of who it passed on (the tailnet login), marked as not checked. Turning the setting on or off is a Security record too.

What you give up:

- At the master, the digits show that the person typing them can see both screens. From elsewhere they show only the machine. Read them from the machine's own screen yourself, or have someone you trust at it read them to you.
- **Whoever holds the sign-in key can confirm a machine from anywhere the dashboard is reached.** The key again stops a session that leaked or a browser left signed in. It does not stop the key's holder, and the API key that scripts use is the same key: a script that signs in with it looks like a browser. Do not turn this on while a script or a log shipper on another machine holds the key.

Leave it off on a master you can sit at.

## Joining is by code only

There is no discovery and no request to join. A machine joins with its one-time code and nothing else. The code carries the master's certificate fingerprint, so the machine knows which master it is talking to before it sends anything.

## The addresses a code carries

```bash
tenant fleet address [list | add HOST:PORT | remove HOST:PORT]
```

This changes the list one address at a time (`init --address` replaces it whole). A connected machine is told the new list over its link.

When every IP address on the list is private, link-local or loopback, `init`, `enroll`, `address` and Add machine warn that a machine at another site cannot dial any of them. A host name is not judged. On one LAN the warning is expected and can be ignored.

## Three ways for machines to reach the master

Only the master must be reachable, on its one fleet port.

| Route | What to do | What is exposed |
|---|---|---|
| One LAN | nothing: the LAN address `init` offers (such as `192.168.1.5:9777`) is enough | the fleet port, on your LAN |
| An overlay network (WireGuard, Tailscale) | make the master listen on its overlay address and give that address to the machines | the fleet port, on the overlay only; the overlay is only a route and is not trusted for anything |
| A public address or a forwarded port | add that address with `tenant fleet address add` | the fleet port to the internet: its TLS 1.3 handshake, and the enroll endpoint's check of a code |

For an overlay network, with the master's overlay address `100.101.102.103`:

```bash
tenant fleet init --listen 100.101.102.103:9777
tenant fleet address add 100.101.102.103:9777
tenant fleet address remove 192.168.1.5:9777
```

A public address is a workable route: both ends are pinned by certificate, so someone who learns the address can do nothing with it but reach the handshake and the code check (five attempts a minute per address, refusals in the Security log). Because the default `--listen` is every interface, set `--listen` to the one interface you mean on a master with a public address.

## Other fleet commands

```bash
tenant fleet list | show <name>       # the machines and which process holds the fleet; one machine in full
tenant fleet rename <name> <new-name> # relabel; its id and what is kept under it stay
tenant fleet revoke <name> [--keep-scheme | --delete-scheme]
```

`tenant fleet list` in another process cannot tell online from offline: only the process that holds the fleet knows (`/fleet` there, or the dashboard's Fleet page). Revoking is described in [On a fleet machine](/tenant/docs/fleet/machines#when-a-machine-is-revoked).
