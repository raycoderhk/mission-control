# 🔌 Analytics Integration Guide

**Real-time data fetching from OpenClaw Gateway**

---

## 📋 Overview

Mission Control now supports **real-time analytics** via two methods:

1. **Webhook Push** (Recommended) - Gateway pushes data to Mission Control
2. **API Polling** - Mission Control fetches from Gateway API
3. **Manual Script** - Run `node scripts/fetch-analytics.js` manually

---

## 🚀 Method 1: Webhook Push (Recommended)

### How It Works

```
OpenClaw Gateway → POST → Mission Control /api/analytics/update
                   (with usage data)
```

### Step 1: Configure Webhook Secret

**On Mission Control (Zeabur):**

1. Go to Zeabur dashboard → Project → Environment Variables
2. Add: `ANALYTICS_WEBHOOK_SECRET=your-secret-here`
3. Generate secret: `openssl rand -hex 32`

**On OpenClaw Gateway:**

Add webhook configuration to Gateway's cron job or event handler.

### Step 2: Gateway Integration

**Example: Gateway Cron Job**

```javascript
// In your OpenClaw Gateway code
const MISSION_CONTROL_URL = 'https://misson-dashboard.zeabur.app';
const WEBHOOK_SECRET = 'your-secret-here';

async function pushAnalytics() {
  const usageData = await getUsageStats(); // Your existing function
  
  const response = await fetch(
    `${MISSION_CONTROL_URL}/api/analytics/update`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${WEBHOOK_SECRET}`,
      },
      body: JSON.stringify({
        apiUsage: {
          provider: 'Aliyun Coding Plan',
          plan: 'Pro (¥39.9/month)',
          quota: 90000,
          current: {
            today: usageData.today,
            thisMonth: usageData.month,
            remaining: 90000 - usageData.month,
            percentageUsed: (usageData.month / 90000) * 100,
          },
          lastUpdated: new Date().toISOString(),
        },
        agents: {
          active: 4,
          list: usageData.agents,
          totalRequestsToday: usageData.totalToday,
          totalRequestsMonth: usageData.totalMonth,
        },
        system: {
          gateway: {
            status: 'running',
            platform: 'Zeabur',
            region: 'Tokyo',
            uptime: usageData.uptime,
            uptimeDays: usageData.uptimeDays,
          },
        },
      }),
    }
  );
  
  if (!response.ok) {
    console.error('Failed to push analytics:', await response.text());
  }
}

// Run every hour
setInterval(pushAnalytics, 60 * 60 * 1000);
```

### Step 3: Test Webhook

```bash
# Test the webhook endpoint
curl -X POST https://misson-dashboard.zeabur.app/api/analytics/update \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-secret-here" \
  -d '{
    "apiUsage": {
      "current": {
        "today": 1500,
        "thisMonth": 18000,
        "remaining": 72000,
        "percentageUsed": 20
      }
    }
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Analytics updated successfully",
  "timestamp": "2026-02-27T08:00:00.000Z"
}
```

---

## 🔄 Method 2: API Polling

### Mission Control Fetches from Gateway

**Update `/api/analytics/route.ts`:**

```typescript
async function fetchAliyunUsage() {
  const gatewayUrl = process.env.OPENCLAW_GATEWAY_URL;
  
  if (!gatewayUrl) {
    throw new Error('OPENCLAW_GATEWAY_URL not configured');
  }
  
  const response = await fetch(`${gatewayUrl}/api/usage`);
  const data = await response.json();
  
  return {
    provider: 'Aliyun Coding Plan',
    current: data.current,
    // ... map other fields
  };
}
```

**On Zeabur:**
- Add env var: `OPENCLAW_GATEWAY_URL=https://your-gateway.zeabur.app`

---

## 📝 Method 3: Manual Script

### Run Locally or via Cron

```bash
# Set environment variables
export API_USAGE_TODAY=1500
export API_USAGE_MONTH=18000
export API_USAGE_QUOTA=90000

# Run fetch script
cd /home/node/.openclaw/workspace/mission-control
node scripts/fetch-analytics.js

# Commit and push
git add data/analytics.json
git commit -m "Update analytics data"
git push origin main
```

**Zeabur will auto-redeploy with fresh data!**

---

## 📊 Data Structure

### Expected Payload

```json
{
  "apiUsage": {
    "provider": "Aliyun Coding Plan",
    "plan": "Pro (¥39.9/month)",
    "quota": 90000,
    "current": {
      "today": 1245,
      "thisMonth": 15678,
      "remaining": 74322,
      "percentageUsed": 17.4
    },
    "dailyAverage": 750,
    "projectedMonthly": 22500,
    "status": "under-budget",
    "lastUpdated": "2026-02-27T08:00:00Z"
  },
  "agents": {
    "active": 4,
    "list": [
      {
        "id": "main",
        "name": "Jarvis",
        "model": "qwen3.5-plus",
        "status": "active",
        "requestsToday": 523,
        "requestsMonth": 7845,
        "specialty": "Main orchestrator"
      }
      // ... more agents
    ],
    "totalRequestsToday": 1245,
    "totalRequestsMonth": 15678
  },
  "system": {
    "gateway": {
      "status": "running",
      "platform": "Zeabur",
      "region": "Tokyo",
      "uptime": "99.2%",
      "uptimeDays": 7
    }
  }
}
```

---

## 🔒 Security

### Webhook Authentication

- **Always use** `ANALYTICS_WEBHOOK_SECRET`
- **Verify** `Authorization: Bearer <secret>` header
- **Use HTTPS** only (Zeabur provides this)

### Environment Variables

Store secrets in Zeabur dashboard, **NOT** in code:

```bash
# ✅ Correct: In Zeabur dashboard
ANALYTICS_WEBHOOK_SECRET=abc123...

# ❌ Wrong: In code
const SECRET = 'abc123...'; // Don't do this!
```

---

## 🎯 Implementation Priority

### Phase 1: Manual Updates (Current)
- ✅ Script exists: `scripts/fetch-analytics.js`
- ✅ Run manually when needed
- ⚠️ Not real-time

### Phase 2: Webhook Integration (Next)
- [ ] Add webhook to OpenClaw Gateway
- [ ] Configure Zeabur env vars
- [ ] Test webhook delivery
- ✅ Real-time updates

### Phase 3: Direct API (Future)
- [ ] Aliyun billing API access
- [ ] Gateway usage tracking
- [ ] Automatic cost calculation
- ✅ Fully automated

---

## 📈 Current Status

| Feature | Status | Notes |
|---------|--------|-------|
| Webhook Endpoint | ✅ Ready | `/api/analytics/update` |
| Fetch Script | ✅ Ready | `scripts/fetch-analytics.js` |
| API Polling | ⏳ Pending | Needs Gateway URL |
| Aliyun Direct API | ⏳ Pending | Needs API access |
| Auto-Refresh UI | ✅ Ready | Every 5 minutes |

---

## 🛠️ Next Steps

**To enable real-time updates:**

1. **Set webhook secret** on Zeabur
2. **Add webhook to Gateway** (I can help with this!)
3. **Test with curl** command above
4. **Monitor** Mission Control dashboard

**Want me to help integrate with OpenClaw Gateway?** Just say the word! 🔌

---

*Last updated: 2026-02-27*  
*Version: 1.0*
