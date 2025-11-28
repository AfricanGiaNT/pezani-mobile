# 🚀 Pezani Mobile - Quick Deployment Reference

## 🌐 Live URL
**https://pezani-mobile.onrender.com**

## 📊 Dashboard
**https://dashboard.render.com/static/srv-d4ku0875r7bs73ckuqe0**

---

## ⚠️ IMPORTANT: Update These First

Go to dashboard → Environment tab → Update:

```bash
VITE_SUPABASE_URL = <your-supabase-project-url>
VITE_SUPABASE_ANON_KEY = <your-supabase-anon-key>
```

After updating, Render will auto-deploy (~2 minutes).

---

## 🔄 Deploy New Changes

```bash
git add .
git commit -m "Your changes"
git push origin main
```

Render automatically deploys in 1-3 minutes.

---

## 📁 Key Files

| File | Purpose |
|------|---------|
| `docs/DEPLOYMENT_SUCCESS.md` | Full deployment guide |
| `docs/ENVIRONMENT_VARIABLES.md` | Env var setup guide |
| `docs/RENDER_DEPLOYMENT.md` | Render configuration details |
| `docs/DAY_8_TASKS_1_2_3_COMPLETION.md` | Recent work summary |

---

## 🐛 Quick Fixes

**Site not loading?**
→ Check env vars in dashboard

**Changes not showing?**
→ Check "Events" tab in dashboard for build status

**Build failed?**
→ Check build logs in dashboard

**Slow loading (first time)?**
→ Free tier spins down after 15 min inactivity, takes 10-30s to wake up

---

## 📞 Support

- Dashboard: https://dashboard.render.com
- Docs: https://render.com/docs
- Status: https://status.render.com

---

**Service ID**: `srv-d4ku0875r7bs73ckuqe0`
**Status**: ✅ LIVE
**Updated**: November 28, 2025

