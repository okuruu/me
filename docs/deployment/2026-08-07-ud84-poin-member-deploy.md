# Deploy: UD84 Poin Member

**Date:** 2026-08-07
**What ships:** the loyalty rule becomes **1 point per Rp 1.000.000 of cash**, and the panel gains a **Poin** page for seeing member balances and adjusting them by hand.

**Repos:** `Marmyadose` (Laravel backend, manual upload) and `me` (SvelteKit frontend, Vercel).

---

## Read this first

**There is no SQL in this release.** Nothing to paste into phpMyAdmin. `ud84_member.POINT` has existed all along. The three releases before this one each had a SQL step; this one does not, and its absence is not a missing instruction.

**`php artisan config:clear` is the release.** The new rate lives in `config/ud84.php`. Laravel serves configuration from `bootstrap/cache/config.php` when that file exists, so **without clearing it the shop keeps granting a point per Rp 500.000** — with nothing on any screen to suggest anything is wrong. This is the one step that cannot be skipped.

**It needs the cancel-invoice release to be live already.** `config/ud84.php` ships with that release. If it is not on the server, `config('ud84.poin_per_rupiah')` reads null and a sale grants **no points at all**. Check for the file before starting.

| Depends on | Why |
|---|---|
| `config/ud84.php` | Holds the rate. From the **cancel-invoice** release. |

---

## Step 0 — Back up first

1. **Database.** phpMyAdmin → select the database → **Export → Custom** → tick `ud84_member` → export as SQL. It is the only table this release writes to. Keep the file.
2. **Backend files.** Download the current copies of what you are about to replace:
   - `config/ud84.php`
   - `routes/api.php`

---

## Step 1 — Upload the backend files

### Files to include

```
config/ud84.php                            (the rate: 500000 -> 1000000)
app/Http/Controllers/UD84/Poin.php         (NEW -- the two point endpoints)
routes/api.php                             (two new /UD84/Poin/* routes)
app/Http/Controllers/POS/EMoney.php        (see the note below -- required)
```

> **Why `EMoney.php` is on this list.** The committed `routes/api.php` includes `POS/Report/Delete-EMoney` and `POS/Report/Update-EMoney`, pointing at two methods that were added by appending to `POS\EMoney` — nothing existing in that file changed, and no live screen calls those routes yet. Uploading `routes/api.php` without it would leave two routes pointing at methods the server does not have. Ship them together. This is the same note the cancel-invoice runbook carries; if that release is already live, the file on the server is already correct and re-uploading it changes nothing.

Do **not** upload `tests/` — development only.

### How to build the zip

From `D:\Coedes\Production\Marmyadose`, in Git Bash:

```bash
git archive --format=zip --output=../ud84-poin-backend.zip main \
  config/ud84.php \
  app/Http/Controllers/UD84/Poin.php \
  routes/api.php \
  app/Http/Controllers/POS/EMoney.php
```

`git archive` reads from the committed branch, so uncommitted work cannot leak into the zip.

### Upload, extract, and clear the caches

1. cPanel → **File Manager** → the Laravel project root (the folder holding `app`, `routes`, `artisan`).
2. **Upload** `ud84-poin-backend.zip`, right-click → **Extract** into that same folder, confirm overwrite.
3. Delete the zip from the server.
4. **Clear the caches. `config:clear` is mandatory and is the point of this release; `route:clear` is mandatory for the two new routes.**

   With cPanel **Terminal**, from the project root:
   ```
   php artisan config:clear
   php artisan route:clear
   php artisan cache:clear
   ```

   Without Terminal, delete the contents of `bootstrap/cache/` **except** `.gitignore` — that includes `config.php` and `routes-v7.php`. Do not delete the folder. Laravel rebuilds them on the next request.

---

## Step 2 — Deploy the frontend

Vercel deploys automatically.

**Before pushing, confirm one line.** `src/library/resources/phraseBox.ts` must read:

```ts
const isProduction: boolean = true;
```

It is flipped to `false` during local testing and restored afterwards — check anyway. If `false` ships, the live panel points at `http://localhost` and nothing works.

```bash
cd "D:/Coedes/Production/me"
git checkout main
git merge ud84-poin-member
git push
```

---

## Step 3 — Verify on production

### 3a. The page

A new **Poin** entry appears in the panel navigation, between Member and Sales. Open it.

| Check | What you should see |
|---|---|
| The list loads | Every member, highest balance first. **An empty table means the route cache was not cleared** — go back to Step 1.4. |
| Total Poin Terbit | The figure at the top equals the balances below it added up. |
| Members at zero | Listed too. That is deliberate — otherwise nobody could ever be given their first point. |
| Tambah | Type `2` on a row and press **Tambah**. The balance and the total both rise by 2. |
| Kurang | Type `1` and press **Kurang**. Both fall by 1. |
| Too large a deduction | Type a number bigger than that member's balance and press **Kurang**. It is refused with a message naming what they actually have, and nothing changes. |
| Empty box | Pressing either button with the box empty is refused immediately, without contacting the server. |

Put back any points you moved while testing — there is no undo, and no record of the change.

### 3b. The rate

The real check needs a sale of at least Rp 1.000.000 in cash, attached to a member. If you have one to ring up:

- **Rp 1.000.000 cash → 1 point.** Under the old rate it would have been 2. If you see 2, the config cache was not cleared.
- Rp 2.500.000 → 2 points. The remainder does not round up.

If no such sale is due, the config value itself can be confirmed from the Poin page's own wording, which states the Rp 1.000.000 rule — but only an actual sale proves the cache was cleared.

---

## What to expect afterwards

**Nothing is recalculated.** Existing balances stay exactly as they are. They were earned under the old rate, and this release does not revisit them. From the moment it is live, a sale earns half what it used to.

**The page may look empty for a while.** On the development database no member had a single point — the rule has simply never had an occasion, because points need a cash payment of a million or more attached to a named member. A page of zeroes is the programme starting, not a fault.

**Cancelling or correcting an old sale still gives back exactly what it gave.** Each sale records the points it granted, so the rate change does not distort history. The one exception is a sale from before that recording began: those are recomputed from their cash at **today's** rate, so an old sale reversed now gives back half what it originally granted. It is a small imprecision on old data and it is deliberate — the alternative would be inventing a figure that was never stored.

**Manual adjustments are not recorded.** By decision, the system stores no note of who changed a balance, when, or why. If a customer disputes their points there will be nothing to check against, and a mistyped adjustment leaves no trace. Worth knowing before it happens rather than during.

---

## Rollback

Put `poin_per_rupiah` back to `500000` in `config/ud84.php`, re-upload the `routes/api.php` you saved in Step 0, delete `app/Http/Controllers/UD84/Poin.php`, and clear the caches again — **`config:clear` included, or the rollback will not take effect either.**

Points already granted at the new rate **stay granted**. Reverting the constant does not revisit past sales, and manual adjustments cannot be undone at all. Nothing in the database needs changing to roll back, and nothing about the rollback restores what the new rate did or did not award in the meantime.

For the frontend: Vercel dashboard → **Deployments** → the previous working deployment → **Promote to Production**.

---

## Known limits of this release

- **No redemption flow.** Points are taken off by hand when a customer claims something; the system holds no catalogue and no rules about what a point is worth.
- **No history.** `ud84_member.POINT` is a running balance. What a sale granted is on the sale; what a person adjusted is nowhere.
- **No expiry, no tiers.** Points accumulate indefinitely.
- **A balance cannot exceed 32.767**, the column's ceiling. Adding past it is refused with a message rather than failing obscurely. At one point per million, earning there is not reachable; a mistyped manual addition is.
- **The nota prints the member's balance at the moment of printing**, not the points that sale earned. With the rate halved, a customer comparing two receipts will see that number move by amounts that do not match their arithmetic. Unchanged by this release; worth knowing before someone asks.
