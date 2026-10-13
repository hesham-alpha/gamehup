# GameHub

GameHub is a static game-discovery site with Supabase accounts and a private wishlist for each signed-in user. GitHub Pages hosts the site; Supabase provides authentication and the wishlist database.

## Supabase setup

1. In the Supabase dashboard for this project, open **SQL Editor** and run [`supabase/schema.sql`](supabase/schema.sql). This creates the wishlist table and row-level security policies.
2. Open **Authentication → URL Configuration** and set **Site URL** to:

   `https://hesham-alpha.github.io/gamehup/`

3. Add this **Redirect URL**:

   `https://hesham-alpha.github.io/gamehup/index.html`

4. In **Authentication → Providers → Email**, leave email confirmation enabled if you want users to verify their address. With confirmation enabled, new users must click the email link before signing in.

The browser uses the Supabase project URL and publishable key from `js/supabase-client.js`. Publishable keys are intended for browser use; wishlist data stays protected by the row-level security policies in `supabase/schema.sql`. Never put a Supabase secret or service-role key in this repository.

## Run locally

Open `index.html` through a local static web server, such as the Live Server extension in VS Code. Supabase authentication redirects back to the configured site URL, so local sign-up email confirmation requires adding your local URL (for example `http://127.0.0.1:5500/index.html`) to Supabase's Redirect URLs.

## Deploy

The repository is already served by GitHub Pages. After the pull request is merged into the Pages deployment branch, the new sign-in and wishlist functionality will be available at <https://hesham-alpha.github.io/gamehup/>. Game catalog information remains static demo data in `js/data.js`.
