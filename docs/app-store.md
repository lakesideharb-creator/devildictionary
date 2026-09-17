# App Store submission kit

Everything needed to fill in App Store Connect. Copy the blocks verbatim — the
character counts have been checked against Apple's limits.

| Item | Value |
| --- | --- |
| Bundle ID | `com.devildictionary.app` |
| SKU | `DD-IOS-2026-001` (any unique string you like) |
| Version | `1.0` (build `1`) |
| Category | Primary **Games › Word** · Secondary **Games › Puzzle** |
| Device family | iPhone only (`TARGETED_DEVICE_FAMILY = 1`) — no iPad screenshots needed |
| Minimum OS | iOS 15.0 |
| Price | Free · no in-app purchases |
| Age rating | Expected **9+** |
| Signing | Automatic, Team `754YBZ3UJ42` |

---

## 1. App Name — 22 / 30

```
The Devil's Dictionary
```

## 2. Subtitle — 24 / 30

```
Find the word. Doubt it.
```

Alternates if Apple objects to the period: `A cynical word hunt` (18) ·
`100 words that bite back` (23)

## 3. Promotional Text — 166 / 170

Shown above the description and can be changed without a release.

```
One hundred cynical definitions hidden in grids of letters. All of it free: no unlock, no ads, no account, no sign-in. Four stages, and the book gets worse as you go.
```

## 4. Keywords — 98 / 100

No spaces after commas; do not repeat words already in the name or subtitle.

```
word,search,puzzle,dictionary,cynical,vocabulary,definition,quote,bierce,letters,grid,brain,trivia
```

## 5. Description — 1,679 / 4,000

```
A dictionary that does not like you.

One hundred entries are hidden in grids of letters. Swipe through them in any direction — across, down, or diagonally — and when you find the word, the dictionary defines you back.

“Sleep, n. A rehearsal for death, interrupted daily by invoices.”

That is the tone of the whole book. Ambrose Bierce published The Devil's Dictionary in 1911 and it has not mellowed since. This game uses his public-domain definitions alongside new ones written in the same voice, and it lets the book get worse the further you read.

FOUR STAGES, EACH LESS IMPRESSED WITH YOU

• Stage I · The Literate — a 5×5 board. Just find the word.
• Stage II · The Doubter — a 6×6 board. Sometimes you are handed three definitions and asked which one is honest. All three are real entries; only one belongs to the word you found.
• Stage III · The Accomplice — a 7×7 board. The definitions have started watching back.
• Stage IV · The Author — an 8×8 board, and a second judgment.

Twenty-five entries per stage. Every five entries you complete strikes one Devil Coin — twenty coins in the full book.

WHAT YOU WILL NOT FIND HERE

No in-app purchases. No subscription. No unlock waiting at the end of a free tier. No advertising, no analytics, no account, no sign-in, no email address, no cloud sync. The game plays entirely offline, and your progress stays on your device because it is never sent anywhere.

All one hundred entries are available from the first launch. Nothing is withheld to be sold back to you later.

If you enjoy crosswords, word searches, anagrams, trivia, or reading a sentence twice because it was cleverer than it looked, this was made for you.
```

## 6. What's New in This Version — 94 / 4,000

```
First release. One hundred entries across four stages, twenty Devil Coins, and nothing to buy.
```

## 7. URLs

| Field | Value |
| --- | --- |
| Support URL | `https://devildictionary.com/support` |
| Marketing URL | `https://devildictionary.com` |
| Privacy Policy URL | `https://devildictionary.com/privacy` |
| Copyright | `2026 Bob Liang` |

The support page already exists in the repo (`support.html`) and is linked from
the footer of every page. Push to `main` first so the URL is live before you
submit — App Review does click these links.

One caveat worth knowing: Cloudflare's email obfuscation rewrites `mailto:`
links into `/cdn-cgi/l/email-protection#…`, so the served HTML no longer
contains a plain-text address and anything without the decoding script renders
it as `[email protected]`. The page therefore also spells the address out in words
("support at devildictionary dot com"), so a reviewer can always read a working
contact address. If you ever turn that Cloudflare feature off, the plain link
renders normally again.

---

## 8. Age Rating questionnaire

Answer these literally; the resulting rating is computed by Apple.

| Question | Answer | Why |
| --- | --- | --- |
| Cartoon or fantasy violence | **None** | No depiction of violence at all |
| Realistic violence | **None** | A handful of definitions mention death or war metaphorically |
| Sexual content | **None** | Nothing sexual; three entries touch on marriage, all chaste |
| Nudity | **None** | — |
| Profanity or crude humour | **None** | Satire, not swearing. No expletives appear anywhere |
| Alcohol, tobacco, drugs | **None** | One economic metaphor, no encouragement to use |
| Mature or suggestive themes | **Infrequent / Mild** | Sustained social and political satire; honest answer |
| Horror or fear themes | **None** | "Devil" is a literary device, never frightening |
| Simulated gambling | **No** | Money words are figurative; no wagering of any kind |
| Medical or treatment information | **None** | One satirical definition of medicine, not guidance |
| Unrestricted web access | **No** | Bundled in the binary; no external pages are loaded |
| User-generated content / messaging | **No** | No sharing, no posting, no contact with other users |
| Third-party advertising | **No** | No ad SDK is linked |

Expected result: **9+**. If you answer *None* to mature themes as well, it drops
to **4+** — but the satire is the product, so Mild is the defensible answer and
9+ costs you nothing.

---

## 9. App Privacy ("nutrition label")

Select **"No, we do not collect data from this app"** once, which sets every
category below to *Not Collected* in one step.

| Data type | Declared as |
| --- | --- |
| Name, email, phone, address | Not collected |
| Identifiers (User ID, Device ID) | Not collected |
| Purchases | Not collected (there are none) |
| Usage data, diagnostics | Not collected |
| Location, contacts, photos, health | Not collected |
| Tracking via App Tracking Transparency | **No** — no `NSUserTrackingUsageDescription` is needed and none is present |

Supporting answers: no third-party SDKs are linked; there is no server; progress
lives in `UserDefaults`/web local storage on the device only.

---

## 10. Review Notes — 1,250 / 4,000

Paste this into the **Notes** field. It pre-answers the questions a reviewer
would otherwise have to investigate.

```
This is a complete, self-contained word game. All content is bundled inside the app binary and the game plays fully offline — please try it in airplane mode if that helps.

- No sign-in, no account, and no demo credentials needed. Launch the app and the first board is immediately playable.
- There are no in-app purchases of any kind. All 100 entries are available from the first launch, so there is no restore-purchases flow and nothing to unlock.
- No third-party SDKs are linked: no advertising, no analytics, no attribution, no crash reporting.
- Native integration beyond the web view: haptic feedback on every swipe, solve, judgment and coin; dark status bar styling; safe-area insets for notched devices; scroll and magnifier disabled on the board; portrait locked; custom launch screen.
- Content provenance: 55 definitions are from Ambrose Bierce's "The Devil's Dictionary" (1911), which is in the public domain. The other 45 were written for this game in the same voice. Entries relying on racial or gender stereotypes were deliberately excluded.
- The tone is satirical throughout and is never directed at any real, named individual.
- Support and privacy pages: https://devildictionary.com/support and https://devildictionary.com/privacy
```

---

## 11. Screenshots

Generated art lives in `store/screenshots/`, rendered from the real entries in
`app.js` so the copy can never drift from what ships. Regenerate with:

```bash
node scripts/generate-store-screenshots.mjs
```

| File | Caption shown on the art | Size |
| --- | --- | --- |
| `01-find-the-word.png` | Every entry is hidden in plain sight, one letter at a time. | 1320×2868 |
| `02-four-stages.png` | 25 + 25 + 25 + 25 entries, from a 5×5 board to the 8×8 of Stage IV. | 1320×2868 |
| `03-definition-judgment.png` | Every decoy is a real definition too — just borrowed from another word. | 1320×2868 |
| `04-devil-coins.png` | 20 coins in the complete book. They cannot be bought, only earned. | 1320×2868 |
| `05-nothing-to-buy.png` | 100 entries · plays offline · nothing ever leaves your device | 1320×2868 |

A `*-65.png` variant of each is written at 1242×2688 for the 6.5" slot.
Upload the 6.9" set; App Store Connect accepts it alone.

**These are vector mockups, not device captures.** Apple does not require real
captures, but real ones look better and are trivially defensible. To replace
them, run the app in the simulator and take these five shots on an
iPhone 17 Pro Max (or 16 Pro Max) target:

1. Opening board, mid-swipe with a word highlighted
2. The stage curtain after the 25th entry
3. A definition judgment with all three options visible
4. A coin celebration
5. Any board, to be captioned by App Store Connect — or the free-edition art

Save as PNG, no transparency, no browser chrome, no status bar overrides.

**App icon**: upload `assets/icon.png` — 1024×1024, no alpha channel, no
pre-applied corner radius (Apple masks it). Already installed into
`ios/App/App/Assets.xcassets/AppIcon.appiconset/` by `npx capacitor-assets generate`.

---

## 12. Pre-submission checklist

- [ ] Push to `main`; confirm `https://devildictionary.com/support` returns 200
- [ ] Apple Developer: create an explicit App ID `com.devildictionary.app`
- [ ] Xcode: `Cmd+R` on a device or simulator, confirm the board renders and a swipe registers
- [ ] Xcode: Product › Archive, then distribute to TestFlight
- [ ] TestFlight: install on a real iPhone, play in airplane mode for two minutes
- [ ] App Store Connect: fill name, subtitle, description, keywords, URLs
- [ ] Upload screenshots and the 1024 icon
- [ ] Complete the age rating and privacy questionnaires above
- [ ] Paste the review notes
- [ ] Submit

Skipped because the app is free: **Paid Apps Agreement, tax and banking forms,
IAP product setup, sandbox testers, and a Restore Purchases button.** This is
the single biggest saving from dropping the paywall.

---

## 13. Known risk: guideline 4.2

The app is a Capacitor shell around the same bundle the website serves. Reviewers
reject under 4.2 when an app is "a repackaged website" with no native substance.

What works in our favour: it is a game rather than a content reader, it runs
fully offline, and it uses haptics, safe-area insets, status bar styling, a
launch screen, and a locked portrait orientation.

If it is nonetheless rejected, the strongest fix is a genuinely native feature
rather than an argument. The cheapest one is a system share sheet on the
definition card — `@capacitor/share`, one plugin, about thirty lines — which
lets a player send a definition to Messages or save it as an image. It doubles
as distribution: every shared definition carries the app with it. Say the word
and I will wire it up.

If you would rather argue than add code, reply in Resolution Center with: the
app runs offline in airplane mode, lists the specific native APIs it uses, and
notes that the entire game is playable without a network request.
