---
title: Turn it on &amp; sign in
description: The dashboard is the agent's control panel in a browser. Where it listens, the sign-in key, reaching it from your phone, and the rules that keep it private.
area: Dashboard
area-url: /tenant/docs/dashboard/overview
---

From the dashboard you watch what the agent does, answer its requests, chat with it, and change what it may do on its own. It is server-rendered (no JavaScript build step) and lives inside the Tenant binary.

## Turn it on

- Under `tenant serve` (the [background service](/tenant/docs/setup/service)) it is always on: it is the only control surface.
- In the terminal UI it launches by default; `/dashboard off` stops it and persists the choice (`dashboard.enabled: false`), `/dashboard on` brings it back, `/dashboard status` shows the address. `tenant tui --dashboard=false` for one launch.
- The address is **http://127.0.0.1:9770** on the machine running Tenant (`dashboard.addr`, or `--dashboard-addr`). `http://localhost:9770` works too.

## Sign in

The first visit shows a **Sign in** page asking for the key. The key is one long line in `<config>/dashboard-auth-token`, created on first start:

```bash
cat ~/Library/Application\ Support/tenant/dashboard-auth-token   # macOS
cat ~/.config/tenant/dashboard-auth-token                        # Linux
```

```powershell
Get-Content -LiteralPath "$env:APPDATA\tenant\dashboard-auth-token"   # Windows, as you
```

`tenant serve` prints the key at start-up only when stdout is a terminal; under launchd or systemd it writes "the auth token is in <path>" to the `system` log instead. Paste it into the form, never into the address bar: a key in a URL is refused, because browsers keep addresses in their history.

- The browser gets a random session id in a cookie, not the key. A session lasts 7 days, ends on **Log out** (bottom of the menu), and every session ends when Tenant restarts.
- Five wrong keys from one address and that address waits before it may try again (the wait doubles each time, up to a minute).
- `GET /healthz` is the one path that needs no key, for an uptime monitor. `HEAD /healthz` needs it like everything else.

**Your own key:** set `dashboard.auth` in `config.json` to 32 or more random characters and restart; `tenant doctor` warns when it is shorter. **Rotate the key:** stop Tenant, delete `dashboard-auth-token` (or change `dashboard.auth`), start Tenant. Every browser then signs in again.

**On a Windows service** the key is in the service account's folder (`C:\Windows\System32\config\systemprofile\AppData\Roaming\tenant` for SYSTEM, `C:\Windows\ServiceProfiles\LocalService\AppData\Roaming\tenant` for LOCAL SERVICE); read it from an administrator PowerShell with `Get-Content -LiteralPath`. If access is denied, `icacls` on the folder must list `BUILTIN\Administrators` and `tenant doctor` run as administrator must report the DACL as shared with administrators; otherwise upgrade.

## Where it can be reached

| | How |
|---|---|
| This computer only (default) | `http://127.0.0.1:9770` |
| Your phone or another device | Tailscale: `/tailscale serve` in the terminal UI, or `"tailscale": {"serve": true}` in `config.json` so the background service publishes it at every start. Tenant trusts the Tailscale name on its own and the tailnet carries HTTPS. |
| Another computer on your network, with no VPN | `/dashboard serve lan` in the terminal UI: a second listener over HTTPS, off until you turn it on ([below](#on-your-local-network)) |
| Behind a reverse proxy on the same computer | add the name the proxy uses to `dashboard.allowed_hosts` |
| On a network address (`--dashboard-addr 0.0.0.0:9770`) | refused at start unless **both** `dashboard.tls_cert` + `dashboard.tls_key` and `dashboard.auth` are set |
| The internet | never forward the port |

```json
"dashboard": { "addr": "127.0.0.1:9770", "allowed_hosts": ["tenant.internal"], "tls_cert": "", "tls_key": "", "auth": "" }
```

### On your local network

For a site that cannot run Tailscale or any VPN, Tenant can serve the dashboard a second time, to the local network. It is off by default.

```text
/dashboard serve lan [HOST:PORT]     turn it on (default 0.0.0.0:9771, every interface)
/dashboard serve off                 turn it off
```

Type it yourself: a line the app submits for you does not change who can reach the dashboard. The same is `tenant serve --dashboard-lan` (or `--dashboard-lan=HOST:PORT`) for one run, and `"dashboard": {"lan": {"enabled": true}}` in `config.json`. Nothing restarts, and `http://127.0.0.1:9770` keeps working beside it. There is no page and no API for turning it on.

```text
dashboard: also serving the local network at https://192.168.1.5:9771 (listening on 0.0.0.0:9771)
  certificate: self-signed, SHA-256 fingerprint 7C:32:6C:…
```

| | |
|---|---|
| Encryption | HTTPS always; plain HTTP is refused on this listener |
| The certificate | Tenant makes one and keeps it in the config directory, owner-only, good for two years. No authority signed it, so the browser warns the first time: compare the SHA-256 fingerprint in that warning with the one Tenant printed (`/dashboard` prints it again). `dashboard.tls_cert` and `tls_key` put your own in its place |
| Sign-in | the same key as on this computer |
| Who may connect | this computer, and private or link-local addresses; other networks only if listed in `dashboard.lan.allow`. Anything else gets 403 before sign-in, and a Security record |
| The address you type | the address you connect to, or this computer's own name; another name must be in `allowed_hosts` |
| Stays at this computer | turning this listener on or off; [confirming a fleet machine](/tenant/docs/fleet/setup), unless you turned [remote confirmation](/tenant/docs/fleet/setup#confirming-from-another-computer) on at this computer's terminal |

On macOS and Windows the firewall may ask about the first listener that is not loopback. To serve one interface only, give its address: `/dashboard serve lan 192.168.1.5:9771`.

| Page says | Meaning | Do |
|---|---|---|
| the dashboard is served to the local network only | you reached the LAN listener from an address that is not private | use a computer on the local network, or list your network in `dashboard.lan.allow` |
| unrecognized dashboard host | the address you typed is not one Tenant trusts | use 127.0.0.1, localhost, your Tailscale name, or add the name to `allowed_hosts` |
| cross-origin request rejected | the request came from another site, tab or port | use the dashboard's own buttons |
| CSRF validation failed | an extension or privacy setting removed the header that proves the request came from the dashboard | turn it off for this address |
| Nothing changed: that needs a second click to confirm | a change that asks first was sent without its second step | open the step again and press **Yes** |

## Keep the sign-in to itself

Browsers do not keep a sign-in apart by port: every other web service on this computer's address (or your Tailscale name) receives the dashboard's cookie when that browser opens it. So in the browser you use for the dashboard, do not open links to other services on 127.0.0.1 or your Tailscale name, above all ones the agent suggests. The dashboard itself never links there: a research source on your own network shows as plain text.

## What is recorded

The Security log (**Logs** → Security; `tenant logs query "log:security"`) records every sign-in, sign-out, failed sign-in and refused request with the time and the address; every request for your OK, who answered it and what; every change to what the agent may do and where it was made; every reveal of a hidden value, export and clear of a log; every key stored or removed, by name only. It can never be cleared or switched off.
