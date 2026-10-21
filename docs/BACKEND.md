# Backend (Supabase)

The app talks to the Supabase project **rankea-pilot** (region São Paulo, `sa-east-1`, free plan) for sign-in, rankings, "Quiero ir", places, friends and the friends feed.

- Project URL and publishable key are in `.env`. Both are public by design: they ship inside the app, and row level security decides what each user can read or write. Never put the secret (`service_role`) key in the repo.
- The schema is in [`supabase/migrations/20261021180000_initial_schema.sql`](../supabase/migrations/20261021180000_initial_schema.sql). It is already applied. Add later changes as new files in that folder.

## Tables

| Table | What it holds | Who can read | Who can write |
| --- | --- | --- | --- |
| `profiles` | name and @usuario | signed-in users | the owner |
| `places` | venues (20 seeded from `src/lib/venues.ts`) | everyone | signed-in users can add, unverified |
| `rankings` | one row per user per place: bucket, position, score, note | signed-in users | the owner |
| `saved` | "Quiero ir" list | the owner | the owner |
| `follows` | who follows whom | signed-in users | the follower |
| `invites` | invite codes (not used by the app yet) | the owner | the owner |
| `friend_feed` (view) | rankings by people you follow | runs with the caller's permissions | |

Rankings are public to signed-in users, which fits a "see what your friends rank" app. Tighten to followers only if pilot users ask for privacy.

## Sign-in

The app signs people in with a 6-digit code sent by email (Supabase email OTP, on by default). Two settings in the Supabase dashboard are needed before pilot users can sign in, in this order (Supabase only lets you edit templates once a custom sender is set):

1. **Email sender.** Authentication → Emails → SMTP Settings. Supabase's built-in email only delivers to members of your Supabase organization and only a few per hour. Without a domain, Gmail works for the pilot: host `smtp.gmail.com`, port `465`, your Gmail address as username and sender, and a Google app password (about 500 emails a day). With a domain, use Resend or Brevo.
2. **Email template.** Authentication → Emails → Templates → "Magic link or OTP": replace the body with something that shows `{{ .Token }}`, for example `<p>Tu código de Rankea: <strong>{{ .Token }}</strong></p>`.

Google or phone (SMS) sign-in can be added later. Phone needs a paid SMS provider such as Twilio.

## Known gaps

- Photos are stored as a path on the phone that took them, so friends do not see them yet. Next step: upload to Supabase Storage.
- Invite codes exist in the schema but the app shares your @usuario instead; friends follow you by @usuario.
