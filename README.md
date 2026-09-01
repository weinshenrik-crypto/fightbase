# Fightbase

Track boxing, MMA and Muay Thai events in one place.

## Run locally

```bash
npm install
npm run dev
```

Then open http://localhost:3000

## Deploy to the internet (free) and connect fightbase.io

### 1. Push this project to GitHub
- Create a new repo on github.com (e.g. "fightbase")
- In this folder, run:
```bash
git init
git add .
git commit -m "Fightbase MVP"
git branch -M main
git remote add origin https://github.com/<your-username>/fightbase.git
git push -u origin main
```

### 2. Deploy on Vercel (free tier is enough for this)
1. Go to vercel.com, sign up/log in with your GitHub account
2. Click "Add New… → Project"
3. Select your "fightbase" repo → click "Deploy"
4. Wait ~1 minute — you'll get a live URL like `fightbase.vercel.app`

### 3. Connect your fightbase.io domain
1. In your Vercel project → Settings → Domains
2. Enter `fightbase.io` → Add
3. Vercel will show you DNS records to set (usually an A record and/or nameservers)
4. Go to Namecheap → Domain List → Manage `fightbase.io` → Advanced DNS
5. Add the records Vercel gave you (or point Namecheap's nameservers to Vercel's, whichever Vercel recommends)
6. Wait 10–60 minutes for DNS to propagate — fightbase.io will then load the app live

### 4. Every future update
Just push to GitHub (`git push`) — Vercel automatically redeploys within ~1 minute. No manual redeploy needed.

## What's next (not built yet)
- Favorites currently save only in the browser (localStorage) — not synced across devices
- Event data is hand-curated, not live-fetched — needs a scraper/cron job to stay current
- No push notifications yet — that needs a backend (e.g. Supabase) + notification service
