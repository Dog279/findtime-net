---
title: The Judge
description: A decision model that checks the agent's work before an answer reaches you. What it checks, how to set it up with /judge use clef or the Model page, what you see, and what it never does.
area: Models &amp; helpers
area-url: /tenant/docs/models/providers
---

The judge sits in front of your model and checks that a task was actually done before the answer reaches you. It is a **decision model**, not a chat model: it doesn't write text, it answers yes/no questions with probabilities, so it is fast and can't be argued with. Cloudflare's [Clef-flash](https://huggingface.co/Cloudflare/clef-flash) on your own server is the kind Tenant knows today (`clef`); any server with the System One API (`POST /v1/systemone`) answers the same way, and a hosted one needs only its address and key.

The judge is off until you set it up. It is not the [Quality model](/tenant/docs/models/eval#the-quality-model), which grades eval answers, and not the [goal's check](/tenant/docs/models/teams#goals), which decides when `/goal` is finished.

## What it does

- **Triage.** When a prompt comes in, the judge decides whether it is a task (do, change, look up or check something), a question or chat. This runs while the model is already working, so it adds no wait. Only tasks are checked.
- **Check.** When the model answers a task, the judge asks four questions: is it fully done, did it cover every part, does it claim actions no tool call shows, and did it hand the work back instead of doing it. If any check fails, the work goes back to the model with a short note saying which, and the model continues. A send-back doesn't count against the step limit.
- **Bounded rounds.** By default an answer may be sent back three times (`/judge rounds` sets 1 to 5). An answer the judge still can't confirm goes out marked `— judge: not confirmed (done 0.31, …)`, so you know to look closer. Answers that hit the step limit or the repeat guard are checked too and get the same mark.
- **Your "no" is final.** If a safety setting or you refused an action during the turn, the judge never sends the work back to ask again.
- **Not checked:** `/goal` turns (the goal has its own check), helper and peer agents, and research.
- **If the judge is down,** answers go out unchecked, the outage is logged once, and judging pauses for a minute before trying again.

## Set it up

```text
/judge use clef [model]       prompts for the server's address, then its key (hidden; blank for none);
                              asks the server once, saves, switches on (model defaults to clef-flash)
```

The prompt asks for the server's address first, like `http://host:30000`, then for its key, which is hidden as you type; leave it blank if the server takes none. Tenant then asks the server one triage question **with that key**, and only when the server answers does it save anything: the server, model and switch in `config.json`, the key in `credentials.json`. A wrong address or a refused key saves nothing, so you can try again. `/cancel` leaves the prompt with nothing changed.

The **Model** page of the dashboard has the same settings in its Judge card: the kind, the address, the model, a key box that is never shown filled (blank keeps the saved key), the rounds, and the switch. It follows the same rule: the server is asked with the key you typed before anything is saved.

```text
/judge                        kind, model, server, whether a key is saved, on or off, rounds
/judge on | off               switch it (on asks the server one question first)
/judge rounds <1-5>           how many times an answer may be sent back (default 3)
```

## What you see

Each triage and check shows in the activity feed as a `⚖ judge …` line, and a send-back says which check failed. `/model` names the judge while it is on. In the logs, the **turns** source carries one event per check (`Judge`), one when an answer went out unconfirmed (`judge could not confirm an answer`) and one when the server was unreachable (`judge unavailable`). The judge's tokens count toward the session's totals.

## Where it is saved

The settings live under `judge` in `config.json` (`enabled`, `kind`, `endpoint`, `model`, `rounds`; see the [reference](/tenant/docs/reference/config)); the key, if the server wants one, lives in `credentials.json` under `judge` and is never written to `config.json`, a log or a page. A saved `judge_loop` from an earlier build migrates on load.
