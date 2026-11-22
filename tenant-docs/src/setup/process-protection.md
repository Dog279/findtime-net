---
title: Process protection
description: At every start Tenant asks the operating system to keep your other programs out of its running process. What that refuses on each system, what it leaves open, and what happens when a protection cannot be applied.
area: Setup &amp; install
area-url: /tenant/docs/setup/install
---

While Tenant runs, its keys are in its memory. At every start, before anything else, every Tenant command (the service included) asks the operating system to refuse other programs that run as your user access to that process. There is nothing to turn on.

## What each system refuses

| System | Refused to your other programs | Still readable |
|---|---|---|
| Linux | a debugger (`ptrace`), `/proc/<pid>/mem`, `/proc/<pid>/environ`, `process_vm_readv`, `pidfd_getfd`, `perf_event_open`; a crash leaves no memory dump, in a file or with a crash collector | the command line, `/proc/<pid>/status` |
| Windows | reading the memory, writing a dump (Task Manager's "Create dump file" says access is denied), attaching a debugger, reading, suspending or redirecting any of its threads, and rewriting the access list that says so; Tenant also puts its file name on your Windows Error Reporting exclusion list | the command line, the program's path, the account |
| macOS | a later debugger attach, and core files; with the hardened-runtime flag on the installed binary, macOS refuses a debugger outright | the command line, and the environment Tenant started with |

## What it does not do

This is one layer, and it is narrow.

- It protects the running process, not the files on disk. The credentials file, the dashboard token, memory and logs are files a program running as you can read, and such a program can also stop Tenant and run its own copy against them.
- It does not stop an administrator or root, a program that starts Tenant itself, or one that gets in during the instant between Tenant's start and these controls.
- On Windows a program running as you can still end Tenant, and end, wait for and resume each of its threads, which stops work and reads nothing. It can read details such as times, counters, module paths and the process's handles by number and kind, but not the content of the memory.

Two ways in are not closed on Windows in this version:

- **The starter's handle.** Whoever started Tenant holds a handle to it from before these controls, with full access, for as long as it keeps it, and a program running as you can copy that handle out of the starter. A shell that waits for `tenant serve` is such a starter.
- **A program already running.** The Windows controls refuse a program that starts after Tenant has finished starting. A program already running when Tenant starts (and so one that ends Tenant and waits for it to be started again) can still get in, through the instant before the controls or through the full-access handle the console host holds until Tenant has joined its console again, and what it takes then keeps working.

A program running as you can also make the Windows Error Reporting exclusion fail at start, which puts Tenant in the case below.

## When a protection cannot be applied

A control the system refuses has to be acknowledged by a person. `tenant tui` and `tenant serve` check before they read the config, a secret or a store.

| How Tenant starts | What happens |
|---|---|
| `tenant tui` or `tenant serve` at a terminal | It prints which control is missing, the system's reason and what that leaves open, and asks `Continue without it? [y/N]`. `y` or `yes` goes on and is recorded; anything else exits. |
| the service, a scheduled start, `serve --hidden`, no terminal | It does not start. The reason is in the log book (system 3030) and in the system's own log: the Application event log on Windows, the journal or syslog elsewhere. |
| either, once acknowledged | It starts, and says so at every start: system 2030, and a line in the status feed. |
| any other command that opens Tenant's data | It is not asked. It leaves system 2030 in the log book at every start, with the command, the control and the reason, and a line on stderr at a terminal. `help`, `version`, `completion`, and `doctor` or `security audit` without `--fix` write nothing. |

When the log book cannot take the record, the command says so on stderr and the record goes to the system's own log. The log book is your file: a program running as you can delete a record from it.

A yes is recorded under `protection_acknowledged` in `settings.<agent>.json` (`main` for the service): the control, the reason, the version and the time. A different control, a different reason or a new version asks again. Because the service has nobody to ask, `tenant service install`, `start` and `restart`, `tenant setup` when it installs the service, and `tenant update` ask at the terminal you typed them in. See [Run in the background](/tenant/docs/setup/service) and [Update &amp; roll back](/tenant/docs/setup/update).

## Checking it

```bash
tenant doctor            # the "process protection" check
tenant security audit    # a finding for each control that is off
```

Doctor shows each control as on or off, what the system says about itself (`kernel.yama.ptrace_scope` on Linux, whether the process is elevated on Windows, System Integrity Protection and FileVault on macOS), what stays readable and what a program running as you can still do. When a Tenant is running, doctor reports that process and says so in the first line; a control undone while it runs shows as OFF until a restart. With no Tenant running, it shows what a start would get. The audit's findings are `process.<control>` (such as `process.linux.dumpable`), `process.debugattach`, `process.darwin.hardened-runtime` and `process.secret-env`.

## No switch, and debugging

There is no setting to turn the protection off: a program running as you could restart Tenant with it set. To attach a debugger, build with the `debugattach` tag; that build has no protection, and `tenant version`, doctor and the audit say so.

```bash
go build -tags debugattach ./cmd/tenant
```

With `GOTRACEBACK=crash` (or `wer` on Windows) in its environment, the Go runtime asks for a memory dump at a crash, and Tenant cannot lower that from inside. Doctor points it out, and warns on Windows or when no control in force stops the dump.

## What changes for you

- **Debuggers and dump tools are refused to you too**: `gdb -p`, `dlv attach`, `strace -p`, `gcore`, Task Manager's "Create dump file" and `procdump` fail unless run as root or from an elevated prompt.
- **Stopping Tenant still works.** `kill`, `systemctl stop` and `tenant service stop` are not affected. On Windows `taskkill /F` and `Stop-Process -Force` end it; plain `Stop-Process` and Python's `os.kill` ask for more and are refused.
- **Windows: a second `tenant.exe` under serve.** `tenant __session-watch` is a small helper that owns the window Windows sends a logoff or a shutdown to; it has none of serve's environment. If it is ended alone, serve runs on, but a logoff, a shutdown or `tenant service stop` then ends serve without a clean stop; restart Tenant to get it back.
- **Windows: one registry value stays.** `HKCU\Software\Microsoft\Windows\Windows Error Reporting\ExcludedApplications`, a value named `tenant.exe`, stays after an uninstall. Delete it to undo it.
- **macOS: keys in environment variables are reported**, because macOS shows your programs each other's starting environment: system 5020 at start and the `process.secret-env` finding. Save keys with `/configure <plugin>` or the dashboard's keys page instead.
- **macOS: the installed binary is signed on your machine.** The install script, `tenant service install` and `tenant update` sign a copy with `codesign --force --sign - --options runtime` (ad hoc, no entitlements), check the flag, and only then move it into place. Doctor shows the flag and the kind of signature.
- **Commands the agent runs are ordinary processes**, not protected.
