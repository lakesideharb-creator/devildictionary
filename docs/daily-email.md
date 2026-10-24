# Daily letter

One letter each morning to the Resend segment in `RESEND_AUDIENCE_ID`. The word is the same UTC day as [https://devildictionary.com/daily](https://devildictionary.com/daily): days since 2026-01-01, from `dailyEntry()` in `lib/landing.mjs`.

The subject teases (`Today’s word awaits`). The body includes the word, the definition, a play link (`/?word=…`), and `/daily`. Subscribers who never open the grid still get the entry.

## Schedule

`vercel.json` cron:

```json
{ "path": "/api/send-daily", "schedule": "0 15 * * *" }
```

Vercel cron expressions are UTC and do not follow daylight saving. `0 15 * * *` is **08:00 Pacific Daylight Time** and **07:00 Pacific Standard Time**. America/Los_Angeles is the chosen morning: summer delivery is 8:00am PT, winter delivery is 7:00am PT.

Cron jobs run on the **production** deployment only. Vercel calls `GET /api/send-daily`.

## Auth

Set an environment variable named `CRON_SECRET` (at least 16 random characters, no spaces or newlines). Vercel then sends:

```http
Authorization: Bearer <CRON_SECRET>
```

That is the current recommended check for Vercel Cron on serverless. The route compares the header to `CRON_SECRET` with a constant-time equality check. These are **not** accepted as proof:

- `x-vercel-cron`
- `x-vercel-cron-schedule`
- `User-Agent: vercel-cron/1.0`

A missing or wrong bearer returns `401` and does not call Resend. The same bearer is how you trigger a dry run or a one-address proof send.

## Environment variables

| Name | Required | Purpose |
| --- | --- | --- |
| `RESEND_API_KEY` | yes, to send | Resend API key. Never commit it. |
| `RESEND_AUDIENCE_ID` | yes, for the segment send | Segment UUID (Audiences were renamed to Segments). Already set on Vercel. |
| `RESEND_FROM` | no | From header. Default: `The Devil’s Dictionary <daily@devildictionary.com>`. An invalid value fails the send instead of falling back. |
| `CRON_SECRET` | yes | Bearer token Vercel attaches to the cron request, and the token you send for a manual trigger. |

There is no Vercel KV in this project. Do not add the API key to the client, the repo, or logs.

Mail is not delivered until the Resend domain `devildictionary.com` is verified (DNS). The code can accept the API call before that; Resend will reject the send until the domain is verified.

## Idempotency

The marker for “already sent today” is a Resend broadcast named `daily-letter-YYYY-MM-DD`, using the UTC date. Before creating one, the route lists broadcasts:

- Any copy of that name whose status is not `draft` or `failed` (sent, queued, scheduled, canceled, or anything else) returns **200** `{ "status": "already_sent" }` and does not send again.
- A `draft` or `failed` copy is sent with `POST /broadcasts/:id/send` instead of creating a second broadcast.
- Otherwise the route creates a draft, and if that broadcast is already past draft (for example an idempotent replay), it skips the send.

`Idempotency-Key` is also sent (`daily-letter-YYYY-MM-DD` on create, `daily-letter-YYYY-MM-DD-send` on send). Resend documents that header for the Emails API, not for Broadcasts. The named broadcast is the durable check; the header is there so a retry collapses if Resend honors it.

Unsubscribed contacts are not mailed. A segment broadcast goes only to subscribed contacts. The route never lists addresses. A `?to=` proof send is a single transactional email to an address you choose; it does not write the day’s broadcast and it can be repeated. It still sets `List-Unsubscribe`.

## Dry run

No Resend call. Prints the letter that today’s segment send would use.

```bash
curl -sS \
  -H "Authorization: Bearer $CRON_SECRET" \
  "https://devildictionary.com/api/send-daily?dry_run=1"
```

`dry_run=1` ignores `to`. A successful body has `"status": "dry_run"`, `subject`, `html`, and `text`. The subject does not contain the word.

## One-address proof send

Sends today’s letter to one address. Requires `RESEND_API_KEY` and a valid from address. Does not require the segment, and does not mark the day as sent.

```bash
curl -sS \
  -H "Authorization: Bearer $CRON_SECRET" \
  "https://devildictionary.com/api/send-daily?to=you@example.com"
```

Success:

```json
{
  "ok": true,
  "status": "test_sent",
  "date": "2026-10-24",
  "word": "HOPE",
  "email_id": "4ef9a417-02e9-4d39-ad75-9611e0fcc33c"
}
```

The response does not include the recipient. `email_id` is the Resend email id.

## Send the segment once

```bash
curl -sS \
  -H "Authorization: Bearer $CRON_SECRET" \
  "https://devildictionary.com/api/send-daily"
```

Or, against the production deployment:

```bash
vercel crons run /api/send-daily
```

Success from this route (Resend’s create call itself returns `201` with `{ "id", "object": "broadcast" }`; this route folds that into 200):

```json
{
  "ok": true,
  "status": "sent",
  "date": "2026-10-24",
  "word": "HOPE",
  "broadcast_id": "559ac32e-9ef5-46fb-82a1-b76b840c0f7b"
}
```

A second call the same UTC day:

```json
{
  "ok": true,
  "status": "already_sent",
  "date": "2026-10-24",
  "word": "HOPE",
  "broadcast_id": "559ac32e-9ef5-46fb-82a1-b76b840c0f7b"
}
```

`502` with `"status": "upstream_error"` means Resend refused or did not answer. `"step"` is `list_broadcasts`, `create_broadcast`, `send_broadcast`, or `test_send`. No address and no API key are included. Fix the domain verification or the from address, then call again: a draft left behind is sent instead of creating another letter.

## Set `CRON_SECRET` on Vercel

1. Project → Settings → Environment Variables.
2. Name: `CRON_SECRET`. Value: a random string of at least 16 characters, with no spaces or newlines.
3. Enable it for Production (and Preview, if you want to trigger a preview URL by hand). Cron itself runs only in production.
4. Redeploy production after saving the variable. Vercel reads `CRON_SECRET` from the deployment that serves the cron.
5. Confirm `RESEND_API_KEY`, `RESEND_AUDIENCE_ID`, and, if you want a non-default sender, `RESEND_FROM` are on that same production environment.
