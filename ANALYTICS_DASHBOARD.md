# 📈 Analytics Dashboard

**Location:** Mission Control Dashboard  
**Data Source:** `/data/analytics.json`  
**Live URL:** https://misson-dashboard.zeabur.app/

---

## 🎯 Overview

The Analytics Dashboard provides real-time insights into your OpenClaw ecosystem:

- **API Usage** - Track requests, quotas, and projections
- **Costs** - Monitor spending across all services
- **Agents** - Status and activity for all 4 agents
- **System** - Gateway uptime, channels, features
- **Tools** - Active projects and their status

---

## 📊 Features

### 1. **API Usage Tracking**

**Metrics:**
- Monthly quota: 90,000 requests (Aliyun Pro Plan)
- Current usage: 15,678 requests (17.4%)
- Remaining: 74,322 requests
- Daily average: 750 requests
- Projected monthly: 22,500 requests

**Visual:** Progress bar with color coding
- 🟢 Green: < 50% used
- 🟡 Yellow: 50-80% used
- 🔴 Red: > 80% used

---

### 2. **Cost Monitoring**

**Monthly Budget:**
- Budget: $40.00
- Spent: $32.50 (81.25%)
- Remaining: $7.50

**Cost Breakdown:**
| Service | Spent | Budget | Status |
|---------|-------|--------|--------|
| Aliyun API | $32.50 | $40.00 | Under budget |
| Zeabur Hosting | $0.00 | $0.00 | Free tier |
| Supabase | $0.00 | $0.00 | Free tier |
| Discord Bot | $0.00 | $0.00 | Free |

**Savings Highlight:**
- 💰 **Saved $180/month** (85% savings) by switching from DeepSeek to Aliyun

---

### 3. **Agent Activity**

**4 Active Agents:**

| Agent | Model | Requests (Today) | Requests (Month) | Specialty |
|-------|-------|-----------------|------------------|-----------|
| **Jarvis** (main) | qwen3.5-plus | 523 | 7,845 | Main orchestrator |
| **Coding Agent** | qwen3-coder-plus | 412 | 5,234 | Coding tasks |
| **Research Agent** | qwen3.5-plus | 256 | 2,156 | Research & analysis |
| **Admin Agent** | qwen-turbo | 54 | 443 | Schedule & admin |

**Total:** 1,245 requests today · 15,678 requests this month

---

### 4. **System Status**

**Gateway:**
- Platform: Zeabur (Tokyo)
- Uptime: 99.2% (7 days)
- Status: ✅ Running

**Channels:**
- ✅ Telegram (personal)
- ⚠️ Discord (guild, DM only - needs permission fix)
- ✅ Webchat (web)

**Features:**
- ✅ Kanban (active)
- ⚠️ Cron (active, rate limit issue)
- ❌ Subagents (restricted in Zeabur env)
- ⏳ Web Search (pending API config)

---

### 5. **Active Tools**

| Tool | Status | Data Source |
|------|--------|-------------|
| Polymarket CLI | ✅ Working | Mock Data |
| OpenClaw Status CLI | ✅ Working | Real (config files) |
| Kanban Manager | ✅ Working | Real (JSON file) |
| Mission Control | ✅ Deployed | Real (JSON files) |

---

### 6. **Kanban Projects**

- **Total:** 13 projects
- **Done:** 9 ✅
- **To Do:** 3 📝
- **In Progress:** 0 🔄
- **Blocked:** 1 🚧

---

## 📁 Data Structure

**File:** `/data/analytics.json`

```json
{
  "apiUsage": {
    "provider": "Aliyun Coding Plan",
    "quota": 90000,
    "current": {
      "today": 1245,
      "thisMonth": 15678,
      "remaining": 74322,
      "percentageUsed": 17.4
    }
  },
  "costs": {
    "monthly": {
      "budget": 40.00,
      "spent": 32.50,
      "remaining": 7.50
    },
    "breakdown": [...]
  },
  "agents": {
    "active": 4,
    "list": [...]
  },
  "system": {...},
  "projects": {...},
  "trends": {...}
}
```

---

## 🛠️ How to Update

### Manual Updates

Edit `/data/analytics.json`:

```json
{
  "apiUsage": {
    "current": {
      "thisMonth": 16000,  // Update this
      "remaining": 74000   // Update this
    }
  }
}
```

**Auto-deploy:** Changes push to GitHub → Zeabur auto-redeploys (~2-3 min)

### Automated Updates (Future)

Create a cron job or API endpoint to auto-update:

```python
# Example: Update API usage daily
import requests

def update_analytics():
    # Fetch from Aliyun API
    usage = fetch_aliyun_usage()
    
    # Update analytics.json
    update_json(usage)
    
    # Commit and push
    git_commit_push()
```

---

## 📈 Trends

### API Usage (Last 7 Days)

| Date | Requests |
|------|----------|
| 2026-02-21 | 1,823 |
| 2026-02-22 | 2,145 |
| 2026-02-23 | 1,956 |
| 2026-02-24 | 2,234 |
| 2026-02-25 | 2,089 |
| 2026-02-26 | 2,186 |
| 2026-02-27 | 1,245 |

**Average:** ~2,000 requests/day  
**Projection:** ~60,000 requests/month (within 90k quota)

---

## 💡 Tips

### 1. **Monitor API Usage**
- Check daily to avoid quota overruns
- Set up alerts at 80% usage
- Admin agent uses least (qwen-turbo is cheapest)

### 2. **Cost Optimization**
- Already saving 85% vs DeepSeek
- Free tiers: Zeabur, Supabase, Discord
- Total monthly cost: $32.50

### 3. **Agent Efficiency**
- Coding agent: Most active (412 req/day)
- Admin agent: Least active (54 req/day)
- Consider load balancing if needed

### 4. **System Health**
- Gateway uptime: 99.2% (excellent)
- Discord limitation: DM only (needs permission fix)
- Web Search: Pending API config

---

## 🔧 Troubleshooting

### Issue: Data Out of Date

**Solution:** Manually update `/data/analytics.json` and push to GitHub

### Issue: Zeabur Not Auto-Deploying

**Solution:** 
1. Check GitHub Actions logs
2. Force redeploy from Zeabur dashboard
3. Verify `zeabur.json` config

### Issue: API Usage Not Accurate

**Solution:** 
- Fetch real data from Aliyun dashboard
- Update `analytics.json` manually
- Consider automating with cron job

---

## 🚀 Future Enhancements

- [ ] **Real-time API** - Auto-fetch from Aliyun API
- [ ] **Alerts** - Notify at 80% quota usage
- [ ] **Historical Charts** - Usage trends over time
- [ ] **Cost Predictions** - ML-based forecasting
- [ ] **Agent Performance** - Response time, quality metrics
- [ ] **Integration** - Connect to OpenClaw status CLI

---

*Last updated: 2026-02-27*  
*Version: 1.0*
