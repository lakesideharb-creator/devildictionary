# Community Edition — production handoff

Status: deployed to production on 2026-09-27 with owner authorization.

Community: https://devildictionary.com/community
Editor: https://devildictionary.com/editor
Deployment: dpl_FP8G2yDfGa5fbnNUBBZUYcVKNybV

Verified cloud flow: submit → pending hidden → editor approve → public read → report → resolve → remove → logout/session revoked. Test entry is removed. Canonical home/community/editor return 200; unauthenticated editor API returns 401.

## Local review

Requires Node 24 (SQLite is used only for local development/tests).

1. `npm ci`
2. `npm run dev:community`
3. Open http://127.0.0.1:4176/community.html and http://127.0.0.1:4176/editor.html.
4. The development server writes a random local-only editor password to `.community-editor-password`. This file, the SQLite database and all real environment files are gitignored. Read the password locally; do not upload it.
5. Submit a test entry; sign in as editor; approve it; refresh the community page; play and save a card. Reports appear in the desk. Unpublish removes the entry from public reads immediately. Local test entries never get copied to the online database.

## Preview hosting prerequisites

Use Vercel Marketplace Neon, a separate preview database, and server-only environment variables:

- DATABASE_URL or database_DATABASE_URL: database connection supplied by integration. Production uses the latter Neon integration variable.
- COMMUNITY_ORIGIN: exact origin of the preview URL, without trailing slash. Production will use https://devildictionary.com. The deployment’s exact VERCEL_URL origin is also accepted. Other origins are rejected; do not use wildcard origins.
- COMMUNITY_SESSION_SECRET: randomly generated secret, at least 32 characters.
- COMMUNITY_ADMIN_HASH: scrypt verifier (`salt:hex`). Set a unique password of at least 16 characters locally and pass it on stdin to `node scripts/community-password.mjs`; store only the verifier in Vercel. Do not send credentials through chat or commit them.

Use `node --env-file=.env.local scripts/community-migrate.mjs` once against the preview database, then redeploy the preview after configuration. Never use the production database for preview testing. The API fails closed with 503 if database configuration is absent; it never silently saves a production submission locally.

Production uses the connected Neon Free database. Vercel CLI OAuth authorization completed. Build initializes the schema idempotently within Vercel, where sensitive environment variables are available. Production was verified before promoting its domain alias.

## Boundaries

- Only approved rows are returned publicly, with an explicit public-field allowlist.
- No contributor login. Editor login uses scrypt verification and a random server-stored session; cookie is HttpOnly/SameSite=Strict and Secure outside localhost. Sessions expire after one hour and logout revokes the session server-side.
- POST operations require the configured origin and JSON. Rate limits are atomic database increments using HMAC-derived hourly IP buckets: 5 submissions/reports, 8 login attempts per hour.
- Public content is rendered using textContent, never injected HTML.
- SQL values are parameterized. PostgreSQL flows were verified against the actual provisioned Neon instance.
- Pending entries expire after 90 days, rejected/removed entries and resolved reports after 30 days. Cleanup happens on requests. Published entries remain until removed.
- Original offline progress is unchanged. Community links in Capacitor open the online edition; native navigation/share behavior needs device verification before a new App Store build.
- Local functional tests cover submit → approve → public read → report → resolve → remove; auth, origin validation, rate limits, escaping and puzzle reveal. Existing original-game and standalone tests also pass.

## Owner operations

Use the local editor-access.txt handoff for the generated editor password. Keep it private. Verify that the support mailbox is monitored. Keep database credentials and editor access scoped to this project.

GitHub upload was not completed: automatic approval rejected the tree upload because it exceeded the 200,000-byte review limit. Source is retained locally on codex/community-edition.
Dependency audit: npm reports moderate advisories in the pre-existing Capacitor CLI → xcode → uuid development/build chain. No high/critical advisory remains after refreshing the happy-dom lockfile. Native dependency upgrades were not forced in this community feature.

This release was deployed directly through Vercel. Sync source before any future GitHub deployment to avoid replacing it with the older branch.
