import crypto from "crypto";

// Initial seed mini-apps with rich presets
const INITIAL_APPS = [
  {
    id: "app_flight_scout",
    name: "Flight Scout & Fare Radar",
    slug: "flight-scout",
    category: "Travel & Logistics",
    icon: "Plane",
    description: "Autonomous agent widget that finds real-time flights, compares fares, carbon footprint and recommends optimal routes.",
    systemPrompt: `You are the Flight Scout Agent. Analyze the travel request, execute the 'flight_search' tool, and present a structured summary highlighting the best deal, fastest flight, and carbon-efficient options with a friendly travel advisor tone.`,
    tools: ["flight_search"],
    inputs: [
      { id: "origin", label: "Origin City / Airport", type: "text", placeholder: "e.g. Buenos Aires (EZE)", required: true, default: "Buenos Aires (EZE)" },
      { id: "destination", label: "Destination", type: "text", placeholder: "e.g. Madrid (MAD)", required: true, default: "Madrid (MAD)" },
      { id: "departure_date", label: "Departure Date", type: "date", required: false, default: "2026-09-15" },
      { id: "cabin_class", label: "Class", type: "select", options: ["economy", "premium_economy", "business"], required: false, default: "economy" }
    ],
    theme: {
      primaryColor: "#38bdf8",
      mode: "dark",
      badge: "Fastest Flights",
      widgetLayout: "card"
    },
    sampleQuery: "Find direct flights from Buenos Aires to Madrid for next month in economy",
    webhookUrl: "",
    createdAt: "2026-08-30T10:00:00.000Z"
  },
  {
    id: "app_world_clock",
    name: "Global Time & Meeting Sync",
    slug: "world-clock-sync",
    category: "Productivity",
    icon: "Clock",
    description: "Calculates precise local times across worldwide teams, flags working hours and pinpoints optimal meeting overlap windows.",
    systemPrompt: `You are the Global Time & Meeting Sync Agent. When the user specifies locations or a team meeting scenario, invoke the 'world_clock' tool. Output an organized time comparison table and suggest the best overlap window.`,
    tools: ["world_clock"],
    inputs: [
      { id: "locations", label: "Team Locations / Cities", type: "text", placeholder: "e.g. Buenos Aires, London, Tokyo, San Francisco", required: true, default: "Buenos Aires, London, San Francisco" },
      { id: "purpose", label: "Goal", type: "select", options: ["current_time", "find_meeting_slot"], required: true, default: "find_meeting_slot" }
    ],
    theme: {
      primaryColor: "#10B981",
      mode: "dark",
      badge: "Team Sync",
      widgetLayout: "card"
    },
    sampleQuery: "What is the time right now in Buenos Aires, London and San Francisco, and when can we sync for a 1-hour meeting?",
    webhookUrl: "",
    createdAt: "2026-08-30T10:30:00.000Z"
  },
  {
    id: "app_currency_radar",
    name: "Smart FX & Currency Radar",
    slug: "currency-radar",
    category: "Finance",
    icon: "TrendingUp",
    description: "Instant currency exchange calculator with AI financial context, 24h trends and rate explanations.",
    systemPrompt: `You are the Smart FX Agent. Convert the requested amount between currencies using the 'currency_converter' tool. Present the conversion, current rate, 24h stability insight, and helpful travel/business budget tips.`,
    tools: ["currency_converter"],
    inputs: [
      { id: "amount", label: "Amount", type: "number", placeholder: "1000", required: true, default: "1500" },
      { id: "from_currency", label: "From Currency", type: "text", placeholder: "USD", required: true, default: "USD" },
      { id: "to_currency", label: "To Currency", type: "text", placeholder: "EUR", required: true, default: "EUR" }
    ],
    theme: {
      primaryColor: "#8B5CF6",
      mode: "dark",
      badge: "Live FX Rates",
      widgetLayout: "card"
    },
    sampleQuery: "Convert 1500 USD to EUR with exchange breakdown",
    webhookUrl: "",
    createdAt: "2026-08-30T11:00:00.000Z"
  },
  {
    id: "app_lead_qualifier",
    name: "AI Lead Qualifier & Concierge",
    slug: "lead-qualifier",
    category: "Sales & Growth",
    icon: "Target",
    description: "Embeddable smart concierge that qualifies inbound prospective clients and generates instant tier scoring and next-step actions.",
    systemPrompt: `You are the AI Lead Concierge. Take the client inquiry and run the 'lead_qualifier' tool. Provide an executive summary of the lead tier, business rationale, and scheduled onboarding step.`,
    tools: ["lead_qualifier"],
    inputs: [
      { id: "company_name", label: "Company Name", type: "text", placeholder: "Acme Corp", required: true, default: "Apex Logistics" },
      { id: "industry", label: "Industry", type: "text", placeholder: "Fintech / SaaS", required: false, default: "Supply Chain & Logistics" },
      { id: "budget_range", label: "Budget Range", type: "select", options: ["$5k-$10k", "$10k-$50k", "$50k-$100k+"], required: true, default: "$10k-$50k" },
      { id: "use_case", label: "Primary Pain Point", type: "textarea", placeholder: "Automating customer booking workflows", required: true, default: "Need automated agents to handle delivery exception routing" }
    ],
    theme: {
      primaryColor: "#F59E0B",
      mode: "dark",
      badge: "Lead Concierge",
      widgetLayout: "floating"
    },
    sampleQuery: "Qualify Apex Logistics for an enterprise agent fleet rollout",
    webhookUrl: "",
    createdAt: "2026-08-30T11:30:00.000Z"
  },
  {
    id: "app_linux_fortune",
    name: "Linux Fortune & Quote of the Day",
    slug: "linux-fortune-quotes",
    category: "Developers & Linux",
    icon: "Sparkles",
    description: "Generates Unix/Linux fortune wisdom, hacker folklore, sysadmin humor and philosophical tech quotes with Cowsay ASCII art.",
    systemPrompt: "You are the Linux Fortune Agent. Generate inspiring, humorous, or philosophical Unix/Linux quotes, hacker folklore, or sysadmin wisdom according to user preferences.",
    tools: [],
    inputs: [
      { id: "category", label: "Fortune Topic", type: "select", options: ["Unix Philosophy", "Hacker Folklore", "Sysadmin Wisdom", "Open Source & Freedom", "Zen of Python"], required: true, default: "Unix Philosophy" },
      { id: "style", label: "Display Style", type: "select", options: ["Terminal Box", "Cowsay ASCII", "Zen Minimalist"], required: false, default: "Cowsay ASCII" }
    ],
    theme: {
      primaryColor: "#10B981",
      mode: "dark",
      badge: "Linux Fortune",
      widgetLayout: "card",
      displayMode: "result_only"
    },
    sampleQuery: "Generate a Unix philosophy quote in Cowsay ASCII style",
    webhookUrl: "",
    createdAt: "2026-08-31T00:00:00.000Z"
  },
  {
    id: "app_dev_tip",
    name: "Daily Senior Dev Tip & Kata",
    slug: "dev-tip-of-the-day",
    category: "Developers & Linux",
    icon: "Sparkles",
    description: "Instant daily engineering tip, clean code best practice, Git ninja trick, or architecture pattern (Zero-click direct output).",
    systemPrompt: "You are the Senior Staff Engineer Mentor. Provide a high-value, crisp 30-second coding tip, refactoring insight, or terminal trick with code snippet.",
    tools: [],
    inputs: [
      { id: "topic", label: "Domain", type: "select", options: ["TypeScript & React", "Git & CLI Productivity", "System Design & Cloud", "SQL & Database Indexing", "Clean Code & Refactoring"], required: true, default: "TypeScript & React" }
    ],
    theme: {
      primaryColor: "#38bdf8",
      mode: "dark",
      badge: "Senior Dev Tip",
      widgetLayout: "card",
      displayMode: "result_only"
    },
    sampleQuery: "Give me a high-impact TypeScript tip",
    webhookUrl: "",
    createdAt: "2026-08-31T00:10:00.000Z"
  },
  {
    id: "app_tech_pulse",
    name: "AI & Tech Pulse Radar",
    slug: "tech-pulse-radar",
    category: "News & Insights",
    icon: "TrendingUp",
    description: "Auto-updating 3-bullet briefing on breakthroughs in AI Agents, Google Cloud, and Open Source ecosystems.",
    systemPrompt: "You are the Tech Pulse Radar. Provide a crisp 3-bullet executive briefing on agentic AI, Google Cloud ecosystem, and cloud architecture developments.",
    tools: [],
    inputs: [
      { id: "focus", label: "Industry Focus", type: "select", options: ["Autonomous AI Agents", "Google Cloud & Vertex", "DevOps & SRE", "Web Performance"], required: true, default: "Autonomous AI Agents" }
    ],
    theme: {
      primaryColor: "#818cf8",
      mode: "dark",
      badge: "Tech Radar",
      widgetLayout: "card",
      displayMode: "result_only"
    },
    sampleQuery: "Latest autonomous agent ecosystem pulse",
    webhookUrl: "",
    createdAt: "2026-08-31T00:15:00.000Z"
  },
  {
    id: "app_shipping_calc",
    name: "Smart Shipping & Customs Duty Radar",
    slug: "shipping-customs-calc",
    category: "Logistics",
    icon: "Plane",
    description: "Interactive freight calculator that computes courier rates, estimated delivery days, and customs tax brackets based on weight and country.",
    systemPrompt: "You are the Global Shipping & Customs Estimator. Calculate international courier costs, transit days, and customs clearance advice based on weight and destination.",
    tools: [],
    inputs: [
      { id: "origin", label: "Origin Country", type: "text", placeholder: "e.g. Argentina", required: true, default: "Argentina" },
      { id: "destination", label: "Destination Country", type: "text", placeholder: "e.g. Spain", required: true, default: "Spain" },
      { id: "weight_kg", label: "Package Weight (kg)", type: "number", placeholder: "2.5", required: true, default: 3 },
      { id: "service_tier", label: "Service Speed", type: "select", options: ["Express Air (2-4 business days)", "Standard Economy (6-10 business days)", "Sea Freight (20-30 days)"], required: true, default: "Express Air (2-4 business days)" }
    ],
    theme: {
      primaryColor: "#f59e0b",
      mode: "dark",
      badge: "Freight Radar",
      widgetLayout: "card",
      displayMode: "form"
    },
    sampleQuery: "Calculate shipping 3kg from Argentina to Spain",
    webhookUrl: "",
    createdAt: "2026-08-31T00:20:00.000Z"
  },
  {
    id: "app_freelance_rate",
    name: "Freelance Project Quote & ROI Estimator",
    slug: "freelance-rate-estimator",
    category: "Finance",
    icon: "TrendingUp",
    description: "Interactive budget calculator that recommends hourly rates, fixed sprint quotes, and client value multipliers for tech projects.",
    systemPrompt: "You are the Freelance & Agency Rate Estimator. Calculate recommended fixed project price, hourly rate, and contract milestones breakdown.",
    tools: [],
    inputs: [
      { id: "project_type", label: "Project Scope", type: "select", options: ["AI Agent / LLM Integration", "Full-Stack Web Application", "Mobile App MVP", "API Backend & Cloud Architecture"], required: true, default: "AI Agent / LLM Integration" },
      { id: "estimated_hours", label: "Estimated Effort (Hours)", type: "number", placeholder: "40", required: true, default: 60 },
      { id: "seniority", label: "Engineer Seniority", type: "select", options: ["Senior Engineer ($75-$120/hr)", "Lead / Principal Architect ($120-$200/hr)", "Mid-level Developer ($45-$75/hr)"], required: true, default: "Senior Engineer ($75-$120/hr)" }
    ],
    theme: {
      primaryColor: "#ec4899",
      mode: "dark",
      badge: "Quote Estimator",
      widgetLayout: "card",
      displayMode: "form"
    },
    sampleQuery: "Estimate budget for 60 hours AI Agent integration project",
    webhookUrl: "",
    createdAt: "2026-08-31T00:25:00.000Z"
  },
  {
    id: "app_polyglot_translator",
    name: "Polyglot Phrase Translator",
    slug: "polyglot-phrase-translator",
    category: "Productivity",
    icon: "Sparkles",
    description: "Translate phrases into your chosen language with instant pronunciation guides, tone adjustments, and contextual breakdown.",
    systemPrompt: `You are a world-class AI translator and polyglot linguist. Your goal is to translate user text into the requested target language accurately while respecting the specified tone.

Structure your response clearly using Markdown format:

### 🎯 Primary Translation
Provide the main, standard translation prominently. Just respond with the phrase translated as is requested.

### 🗣️ Phonetic Pronunciation
Provide clear phonetic guide / transliteration (IPA or easy phonetic spelling) so the user can pronounce it easily.

### 🎭 Tone & Alternatives
If relevant, offer 1-2 alternate variations (e.g., Casual vs. Formal, or regional differences).

### 💡 Vocabulary & Nuance Breakdown
Break down key words or idioms used in the translation with brief explanations of cultural or grammatical context.`,
    tools: [],
    inputs: [
      { id: "phrase", label: "Text or Phrase to Translate", type: "text", placeholder: "e.g. Hello! Could you please recommend a good local restaurant nearby?", required: true, default: "Hello! Could you please recommend a good local restaurant nearby?" },
      { id: "target_language", label: "Target Language", type: "text", placeholder: "e.g. Spanish, French, Japanese, German", required: true, default: "Spanish" },
      { id: "tone", label: "Tone / Style", type: "text", placeholder: "e.g. Natural / Polite, Casual, Formal", required: false, default: "Natural / Polite" }
    ],
    theme: {
      primaryColor: "#0ea5e9",
      mode: "dark",
      badge: "Polyglot AI",
      widgetLayout: "card",
      displayMode: "form"
    },
    sampleQuery: "Translate 'Hello! Could you please recommend a good local restaurant nearby?' into Spanish with polite tone",
    webhookUrl: "",
    createdAt: "2026-08-31T01:00:00.000Z"
  }
];

class Store {
  constructor() {
    this.apps = new Map(INITIAL_APPS.map(a => [a.id, a]));
    this.apiKeys = new Map();
    this.executionLogs = [];
    this.sessionMemory = new Map(); // sessionId -> array of conversation turns
    this.rateLimitStore = new Map(); // clientKey -> { lastRequestTime, requestCount, firstRequestTime }
    this.apiKeyUsageStore = new Map(); // keyId_date -> { count, resetTime }
    
    // Seed initial demo API Key
    this.createApiKey("Production Default Key");

    // Seed realistic baseline execution telemetry
    this.seedSampleTelemetry();
  }

  seedSampleTelemetry() {
    const appsList = Array.from(this.apps.values());
    if (appsList.length === 0) return;

    const callers = ["widget", "widget", "api", "api", "studio"];
    const now = Date.now();

    // Generate ~45 realistic historical runs across the last 36 hours
    for (let i = 45; i >= 1; i--) {
      const app = appsList[Math.floor(Math.random() * appsList.length)];
      const callerType = callers[Math.floor(Math.random() * callers.length)];
      const isError = Math.random() < 0.04; // 4% error rate
      const latencyMs = isError ? 0 : Math.floor(280 + Math.random() * 850);
      const tokensTotal = isError ? 0 : Math.floor(190 + Math.random() * 680);
      const toolExecuted = app.tools && app.tools.length > 0 && !isError
        ? app.tools[Math.floor(Math.random() * app.tools.length)]
        : null;

      // Distribute back in time from 36 hours ago to now
      const timeOffsetMs = (i * 48 * 60 * 1000) + Math.floor(Math.random() * 10 * 60 * 1000);
      const timestamp = new Date(now - timeOffsetMs).toISOString();

      this.executionLogs.push({
        id: `run_${Date.now() - timeOffsetMs}_${Math.random().toString(36).substring(2, 6)}`,
        timestamp,
        appId: app.id,
        appName: app.name,
        callerType,
        latencyMs,
        tokensTotal,
        toolExecuted,
        status: isError ? "error" : "success",
        queryPreview: app.sampleQuery ? app.sampleQuery.substring(0, 75) : `Execution for ${app.name}`,
        error: isError ? "Upstream network timeout from external provider" : undefined
      });
    }
  }

  // Mini-Apps
  getAllApps() {
    return Array.from(this.apps.values());
  }

  getAppById(id) {
    return this.apps.get(id) || Array.from(this.apps.values()).find(a => a.slug === id);
  }

  createApp(data) {
    const id = data.id || `app_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const newApp = {
      id,
      slug: data.slug || (data.name ? data.name.toLowerCase().replace(/[^a-z0-9]+/g, "-") : "mini-app"),
      name: data.name || "Untitled Mini-App",
      category: data.category || "General",
      icon: data.icon || "Sparkles",
      description: data.description || "",
      systemPrompt: data.systemPrompt || "You are a helpful AI Agent Mini-App.",
      tools: data.tools || [],
      inputs: data.inputs || [],
      theme: data.theme || { primaryColor: "#38bdf8", mode: "dark", badge: "AI Mini-App", widgetLayout: "card" },
      sampleQuery: data.sampleQuery || "",
      webhookUrl: data.webhookUrl || "",
      cooldownSeconds: data.cooldownSeconds !== undefined ? Number(data.cooldownSeconds) : 3,
      maxRequestsPerSession: data.maxRequestsPerSession !== undefined ? Number(data.maxRequestsPerSession) : 10,
      quotaExceededMessage: data.quotaExceededMessage || "You have reached the free query limit for this session. Please check back later or contact the administrator.",
      createdAt: data.createdAt || new Date().toISOString()
    };
    this.apps.set(id, newApp);
    return newApp;
  }

  updateApp(id, updates) {
    const existing = this.apps.get(id);
    if (!existing) return null;
    const updated = { 
      ...existing, 
      ...updates, 
      cooldownSeconds: updates.cooldownSeconds !== undefined ? Number(updates.cooldownSeconds) : existing.cooldownSeconds ?? 3,
      maxRequestsPerSession: updates.maxRequestsPerSession !== undefined ? Number(updates.maxRequestsPerSession) : existing.maxRequestsPerSession ?? 10,
      quotaExceededMessage: updates.quotaExceededMessage !== undefined ? updates.quotaExceededMessage : existing.quotaExceededMessage,
      updatedAt: new Date().toISOString() 
    };
    this.apps.set(id, updated);
    return updated;
  }

  deleteApp(id) {
    return this.apps.delete(id);
  }

  // Rate Limiting, Cooldown & Quota Checking
  checkRateLimit({ app, clientKey, callerInfo }) {
    const now = Date.now();

    // If API Key caller, track per-day usage (configurable daily quota)
    if (callerInfo.type === "api") {
      const keyId = callerInfo.keyId || "default";
      const keyRecord = callerInfo.keyId ? this.apiKeys.get(callerInfo.keyId) : null;
      const limit = keyRecord && keyRecord.dailyQuota !== undefined ? Number(keyRecord.dailyQuota) : 500;
      const currentDay = new Date().toISOString().slice(0, 10);
      const usageKey = `${keyId}_${currentDay}`;
      const record = this.apiKeyUsageStore.get(usageKey) || { 
        count: 0, 
        resetTime: new Date(new Date().setHours(24, 0, 0, 0)).getTime() 
      };

      if (limit > 0 && record.count >= limit) {
        return {
          allowed: false,
          code: "API_QUOTA_EXCEEDED",
          error: `API Key daily quota of ${limit} requests exceeded. Resets at midnight UTC.`,
          headers: {
            "X-RateLimit-Limit": String(limit),
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": String(Math.max(1, Math.ceil((record.resetTime - now) / 1000))),
            "X-RateLimit-Cooldown": "0"
          }
        };
      }

      record.count++;
      this.apiKeyUsageStore.set(usageKey, record);

      return {
        allowed: true,
        headers: {
          "X-RateLimit-Limit": limit > 0 ? String(limit) : "unlimited",
          "X-RateLimit-Remaining": limit > 0 ? String(Math.max(0, limit - record.count)) : "9999",
          "X-RateLimit-Reset": String(Math.max(1, Math.ceil((record.resetTime - now) / 1000))),
          "X-RateLimit-Cooldown": "0"
        }
      };
    }

    // Widget / Studio session & IP rate limiting
    const cooldownSec = app.cooldownSeconds !== undefined ? Number(app.cooldownSeconds) : 3;
    const maxRequests = app.maxRequestsPerSession !== undefined ? Number(app.maxRequestsPerSession) : 10;
    const quotaMsg = app.quotaExceededMessage || "You have reached the free query limit for this session. Please check back later or contact the administrator.";

    const sessionData = this.rateLimitStore.get(clientKey) || {
      lastRequestTime: 0,
      requestCount: 0,
      firstRequestTime: now
    };

    // 1. Check burst cooldown (Anti-spam)
    if (cooldownSec > 0 && sessionData.lastRequestTime > 0) {
      const elapsedMs = now - sessionData.lastRequestTime;
      const cooldownMs = cooldownSec * 1000;
      if (elapsedMs < cooldownMs) {
        const remainingSeconds = Math.ceil((cooldownMs - elapsedMs) / 1000);
        return {
          allowed: false,
          code: "COOLDOWN_ACTIVE",
          error: `Please wait ${remainingSeconds} second${remainingSeconds === 1 ? '' : 's'} before submitting another request.`,
          cooldownRemaining: remainingSeconds,
          headers: {
            "X-RateLimit-Limit": maxRequests > 0 ? String(maxRequests) : "unlimited",
            "X-RateLimit-Remaining": maxRequests > 0 ? String(Math.max(0, maxRequests - sessionData.requestCount)) : "999",
            "X-RateLimit-Reset": "3600",
            "X-RateLimit-Cooldown": String(remainingSeconds)
          }
        };
      }
    }

    // 2. Check session quota limit (if maxRequests > 0)
    if (maxRequests > 0 && sessionData.requestCount >= maxRequests) {
      return {
        allowed: false,
        code: "QUOTA_EXCEEDED",
        error: quotaMsg,
        headers: {
          "X-RateLimit-Limit": String(maxRequests),
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": "3600",
          "X-RateLimit-Cooldown": "0"
        }
      };
    }

    // Passed: update tracking
    sessionData.requestCount++;
    sessionData.lastRequestTime = now;
    this.rateLimitStore.set(clientKey, sessionData);

    return {
      allowed: true,
      headers: {
        "X-RateLimit-Limit": maxRequests > 0 ? String(maxRequests) : "unlimited",
        "X-RateLimit-Remaining": maxRequests > 0 ? String(Math.max(0, maxRequests - sessionData.requestCount)) : "999",
        "X-RateLimit-Reset": "3600",
        "X-RateLimit-Cooldown": String(cooldownSec)
      }
    };
  }

  // Session Memory Bank
  getSessionHistory(sessionId) {
    if (!sessionId) return [];
    return this.sessionMemory.get(sessionId) || [];
  }

  appendSessionTurn(sessionId, userMessage, modelMessage) {
    if (!sessionId) return;
    const history = this.getSessionHistory(sessionId);
    history.push({ role: "user", parts: [{ text: userMessage }] });
    history.push({ role: "model", parts: [{ text: modelMessage }] });
    // Keep max 10 turns
    if (history.length > 20) {
      history.splice(0, history.length - 20);
    }
    this.sessionMemory.set(sessionId, history);
  }

  clearSession(sessionId) {
    if (sessionId) this.sessionMemory.delete(sessionId);
  }

  // API Keys
  hashKey(rawKey) {
    return crypto.createHash("sha256").update(rawKey).digest("hex");
  }

  createApiKey(name = "Default API Key", dailyQuota = 500) {
    const id = `key_${Date.now()}`;
    const rawSecret = `mgn_live_${crypto.randomBytes(18).toString("hex")}`;
    const keyHash = this.hashKey(rawSecret);
    const prefix = rawSecret.substring(0, 14) + "..." + rawSecret.substring(rawSecret.length - 4);

    const record = {
      id,
      name,
      dailyQuota: Number(dailyQuota) || 500,
      keyHash,
      prefix,
      createdAt: new Date().toISOString(),
      lastUsedAt: null,
      isRevoked: false
    };

    this.apiKeys.set(id, record);

    return {
      ...record,
      rawSecret
    };
  }

  updateApiKey(id, updates = {}) {
    const existing = this.apiKeys.get(id);
    if (!existing) return null;
    const updated = {
      ...existing,
      name: updates.name !== undefined ? updates.name : existing.name,
      dailyQuota: updates.dailyQuota !== undefined ? Number(updates.dailyQuota) : existing.dailyQuota
    };
    this.apiKeys.set(id, updated);
    return updated;
  }

  listApiKeys() {
    return Array.from(this.apiKeys.values()).map(k => ({
      id: k.id,
      name: k.name,
      dailyQuota: k.dailyQuota ?? 500,
      prefix: k.prefix,
      createdAt: k.createdAt,
      lastUsedAt: k.lastUsedAt,
      isRevoked: k.isRevoked
    }));
  }

  validateApiKey(rawKey) {
    if (!rawKey) return null;
    const cleanToken = rawKey.replace(/^Bearer\s+/i, "").trim();
    const hash = this.hashKey(cleanToken);

    for (const key of this.apiKeys.values()) {
      if (key.keyHash === hash) {
        if (key.isRevoked) return { error: "REVOKED_API_KEY" };
        key.lastUsedAt = new Date().toISOString();
        return { keyId: key.id, name: key.name };
      }
    }
    return null;
  }

  revokeApiKey(id) {
    const key = this.apiKeys.get(id);
    if (!key) return false;
    key.isRevoked = true;
    return true;
  }

  // Analytics & Logs
  logExecution(logEntry) {
    const entry = {
      id: `run_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      ...logEntry
    };
    this.executionLogs.unshift(entry);
    if (this.executionLogs.length > 500) {
      this.executionLogs.pop();
    }
    return entry;
  }

  simulateTraffic(count = 5) {
    const appsList = Array.from(this.apps.values());
    if (appsList.length === 0) return [];

    const callers = ["widget", "widget", "api", "api", "studio"];
    const generated = [];

    for (let i = 0; i < count; i++) {
      const app = appsList[Math.floor(Math.random() * appsList.length)];
      const callerType = callers[Math.floor(Math.random() * callers.length)];
      const isError = Math.random() < 0.05;
      const latencyMs = isError ? 0 : Math.floor(250 + Math.random() * 950);
      const tokensTotal = isError ? 0 : Math.floor(210 + Math.random() * 700);
      const toolExecuted = app.tools && app.tools.length > 0 && !isError
        ? app.tools[Math.floor(Math.random() * app.tools.length)]
        : null;

      const log = this.logExecution({
        appId: app.id,
        appName: app.name,
        callerType,
        latencyMs,
        tokensTotal,
        toolExecuted,
        status: isError ? "error" : "success",
        queryPreview: app.sampleQuery ? app.sampleQuery.substring(0, 75) : `Simulated trigger for ${app.name}`,
        error: isError ? "Rate limit reached from client source" : undefined
      });
      generated.push(log);
    }
    return generated;
  }

  clearLogs() {
    this.executionLogs = [];
    return true;
  }

  getAnalytics() {
    const totalRuns = this.executionLogs.length;
    const successfulRuns = this.executionLogs.filter(l => l.status === "success").length;
    const errorRuns = totalRuns - successfulRuns;
    
    // Latency calculations
    const validLatencies = this.executionLogs
      .filter(l => l.status === "success" && l.latencyMs > 0)
      .map(l => l.latencyMs)
      .sort((a, b) => a - b);

    const avgLatency = validLatencies.length > 0 
      ? Math.round(validLatencies.reduce((acc, l) => acc + l, 0) / validLatencies.length)
      : 0;

    const p95Index = Math.floor(validLatencies.length * 0.95);
    const p95LatencyMs = validLatencies.length > 0 ? validLatencies[Math.min(p95Index, validLatencies.length - 1)] : 0;
    const minLatencyMs = validLatencies.length > 0 ? validLatencies[0] : 0;
    const maxLatencyMs = validLatencies.length > 0 ? validLatencies[validLatencies.length - 1] : 0;

    const totalTokens = this.executionLogs.reduce((acc, l) => acc + (l.tokensTotal || 0), 0);
    const avgTokensPerRun = totalRuns > 0 ? Math.round(totalTokens / totalRuns) : 0;

    // Channel breakdown
    const channelCounts = { widget: 0, api: 0, studio: 0 };
    for (const log of this.executionLogs) {
      const channel = log.callerType || "widget";
      channelCounts[channel] = (channelCounts[channel] || 0) + 1;
    }
    const channelBreakdown = {
      widget: {
        count: channelCounts.widget,
        percent: totalRuns > 0 ? Math.round((channelCounts.widget / totalRuns) * 100) : 0
      },
      api: {
        count: channelCounts.api,
        percent: totalRuns > 0 ? Math.round((channelCounts.api / totalRuns) * 100) : 0
      },
      studio: {
        count: channelCounts.studio,
        percent: totalRuns > 0 ? Math.round((channelCounts.studio / totalRuns) * 100) : 0
      }
    };

    // Tool breakdown
    const toolCounts = {};
    let directReasoningCount = 0;
    for (const log of this.executionLogs) {
      if (log.toolExecuted) {
        toolCounts[log.toolExecuted] = (toolCounts[log.toolExecuted] || 0) + 1;
      } else {
        directReasoningCount++;
      }
    }
    const toolBreakdown = [
      ...Object.entries(toolCounts).map(([tool, count]) => ({
        tool,
        count,
        percent: totalRuns > 0 ? Math.round((count / totalRuns) * 100) : 0
      })),
      {
        tool: "direct_reasoning",
        count: directReasoningCount,
        percent: totalRuns > 0 ? Math.round((directReasoningCount / totalRuns) * 100) : 0
      }
    ].sort((a, b) => b.count - a.count);

    // Latency distribution buckets
    const latencyDistribution = {
      under500ms: 0,
      between500and1000ms: 0,
      between1000and2000ms: 0,
      over2000ms: 0
    };
    for (const lat of validLatencies) {
      if (lat < 500) latencyDistribution.under500ms++;
      else if (lat <= 1000) latencyDistribution.between500and1000ms++;
      else if (lat <= 2000) latencyDistribution.between1000and2000ms++;
      else latencyDistribution.over2000ms++;
    }

    // Per-app detailed breakdown
    const appMap = {};
    for (const log of this.executionLogs) {
      const key = log.appId || log.appName;
      if (!appMap[key]) {
        const appObj = this.apps.get(log.appId);
        appMap[key] = {
          id: log.appId,
          name: log.appName,
          category: appObj ? appObj.category : "General",
          icon: appObj ? appObj.icon : "Sparkles",
          runs: 0,
          successCount: 0,
          errorCount: 0,
          latencies: [],
          tokens: 0,
          lastActive: log.timestamp
        };
      }
      appMap[key].runs++;
      if (log.status === "success") {
        appMap[key].successCount++;
        if (log.latencyMs > 0) appMap[key].latencies.push(log.latencyMs);
      } else {
        appMap[key].errorCount++;
      }
      appMap[key].tokens += (log.tokensTotal || 0);
    }

    const appBreakdown = Object.values(appMap).map(app => ({
      id: app.id,
      name: app.name,
      category: app.category,
      icon: app.icon,
      runs: app.runs,
      percentOfTotal: totalRuns > 0 ? Math.round((app.runs / totalRuns) * 100) : 0,
      avgLatencyMs: app.latencies.length > 0
        ? Math.round(app.latencies.reduce((a, b) => a + b, 0) / app.latencies.length)
        : 0,
      totalTokens: app.tokens,
      successRate: app.runs > 0 ? Number(((app.successCount / app.runs) * 100).toFixed(1)) : 100,
      lastActive: app.lastActive
    })).sort((a, b) => b.runs - a.runs);

    // Timeline series (grouped chronologically into 12 buckets)
    const timeline = this.generateTimelineBuckets(12);

    return {
      totalRuns,
      successfulRuns,
      errorRuns,
      successRate: totalRuns > 0 ? Number(((successfulRuns / totalRuns) * 100).toFixed(1)) : 100,
      avgLatencyMs: avgLatency,
      p95LatencyMs,
      minLatencyMs,
      maxLatencyMs,
      totalTokens,
      avgTokensPerRun,
      activeAppsCount: appBreakdown.length,
      channelBreakdown,
      toolBreakdown,
      latencyDistribution,
      appBreakdown,
      timeline,
      recentLogs: this.executionLogs.slice(0, 50)
    };
  }

  generateTimelineBuckets(bucketCount = 12) {
    if (this.executionLogs.length === 0) return [];
    
    // Sort logs from oldest to newest
    const sorted = [...this.executionLogs].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    const minTime = new Date(sorted[0].timestamp).getTime();
    const maxTime = Math.max(Date.now(), new Date(sorted[sorted.length - 1].timestamp).getTime() + 1000);
    const interval = Math.max((maxTime - minTime) / bucketCount, 60000); // at least 1 min per bucket

    const buckets = [];
    for (let i = 0; i < bucketCount; i++) {
      const bucketStart = minTime + (i * interval);
      const bucketEnd = bucketStart + interval;
      const bucketDate = new Date(bucketStart);
      const label = `${bucketDate.getHours().toString().padStart(2, '0')}:${bucketDate.getMinutes().toString().padStart(2, '0')}`;

      const logsInBucket = sorted.filter(l => {
        const t = new Date(l.timestamp).getTime();
        return t >= bucketStart && t < bucketEnd;
      });

      const runs = logsInBucket.length;
      const successCount = logsInBucket.filter(l => l.status === "success").length;
      const errorCount = runs - successCount;
      const validLats = logsInBucket.filter(l => l.status === "success" && l.latencyMs > 0);
      const avgLatency = validLats.length > 0 
        ? Math.round(validLats.reduce((a, b) => a + b.latencyMs, 0) / validLats.length)
        : 0;
      const tokens = logsInBucket.reduce((a, b) => a + (b.tokensTotal || 0), 0);

      buckets.push({
        timestamp: new Date(bucketStart).toISOString(),
        label,
        runs,
        successCount,
        errorCount,
        avgLatency,
        tokens
      });
    }

    return buckets;
  }
}

export const store = new Store();

