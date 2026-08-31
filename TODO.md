# 📋 Mignon - Roadmap & Task Tracker

## ✅ Completed Task: Rapid Request Prevention, Burst Cooldown & Usage Quotas (Implemented 2026-08-31)

### 🎯 Completed Objectives
1. **Prevent spam / rapid clicks:** Block immediate consecutive requests using active backend cooldown / debounce and visual countdown timer on widgets.
2. **Establish usage limits (Quotas):** Configurable free query limit per session/IP and per API Key with standard HTTP headers and user-friendly error banners.

---

### 🛠️ Implementation Summary

#### 1. Anti-Spam Burst Cooldown & Debounce (Time between requests) ✅
* **Widget / Frontend:**
  - Immediate submission button disable on click to prevent duplicate in-flight requests.
  - Visual cooling countdown timer with real-time seconds counter (`⏳ Cooldown (3s)...`) before re-enabling the button.
  - Redundant in-flight request cancellation.
* **Backend:**
  - Burst protection: minimum configurable time enforcement between requests from the same IP / `sessionId` (returns HTTP 429 `COOLDOWN_ACTIVE`).

#### 2. Usage Quota Limits per Session / IP / Mini-App ✅
* **Free Query Limits:**
  - Execution counter per `sessionId` and IP for each Mini-App.
  - When the quota limit is reached, an informative banner is displayed in the widget:
    > *"You have reached the free query limit for this session. Please check back later or contact the administrator."*
* **Mini-App Editor Configuration (`AppEditorPage.tsx`):**
  - `Burst Cooldown (Seconds)`: customizable per app (default: 3s).
  - `Max Requests Per Session / IP`: customizable per app (default: 10 queries, 0 = unlimited).
  - `Custom Quota Exceeded Message`: customizable error notification string.
* **API Gateway Protection:**
  - Configurable daily quota per API Key (default: 500 req/day with daily reset at midnight UTC).
  - Standard HTTP headers in every response:
    - `X-RateLimit-Limit`
    - `X-RateLimit-Remaining`
    - `X-RateLimit-Reset`
    - `X-RateLimit-Cooldown`

