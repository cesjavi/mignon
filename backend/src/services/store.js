import crypto from "crypto";

// Initial seed mini-apps
const INITIAL_APPS = [
  {
    id: "app_flight_scout",
    name: "Flight Scout & Fare Radar",
    slug: "flight-scout",
    category: "Travel & Logistics",
    icon: "Plane",
    description: "Autonomous agent widget that finds real-time flights, compares fares, carbon footprint and recommends optimal routes.",
    systemPrompt: `You are the Flight Scout Agent. Analyze the user's travel request, extract or ask for origin, destination, preferred dates, and cabin class. Then execute the 'flight_search' tool. Provide a crisp, structured summary highlighting the best deal, fastest flight, and carbon-efficient options with a friendly travel advisor tone.`,
    tools: ["flight_search"],
    inputs: [
      { id: "origin", label: "Origin City / Airport", type: "text", placeholder: "e.g. Buenos Aires (EZE)", required: true, default: "Buenos Aires (EZE)" },
      { id: "destination", label: "Destination", type: "text", placeholder: "e.g. Madrid (MAD)", required: true, default: "Madrid (MAD)" },
      { id: "departure_date", label: "Departure Date", type: "date", required: false, default: "2026-09-15" },
      { id: "cabin_class", label: "Class", type: "select", options: ["economy", "premium_economy", "business"], required: false, default: "economy" }
    ],
    theme: {
      primaryColor: "#3B82F6",
      mode: "dark",
      badge: "Fastest Flights",
      widgetLayout: "card"
    },
    sampleQuery: "Find direct flights from Buenos Aires to Madrid for next month in economy",
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
    createdAt: "2026-08-30T11:00:00.000Z"
  },
  {
    id: "app_lead_qualifier",
    name: "AI Lead Qualifier & Form Concierge",
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
    createdAt: "2026-08-30T11:30:00.000Z"
  }
];

class Store {
  constructor() {
    this.apps = new Map(INITIAL_APPS.map(a => [a.id, a]));
    this.apiKeys = new Map();
    this.executionLogs = [];
    
    // Seed an initial demo API Key
    this.createApiKey("Production Default Key");
  }

  // Mini-Apps
  getAllApps() {
    return Array.from(this.apps.values());
  }

  getAppById(id) {
    return this.apps.get(id) || Array.from(this.apps.values()).find(a => a.slug === id);
  }

  createApp(data) {
    const id = `app_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const newApp = {
      id,
      slug: data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      name: data.name || "Untitled Mini-App",
      category: data.category || "General",
      icon: data.icon || "Sparkles",
      description: data.description || "",
      systemPrompt: data.systemPrompt || "You are a helpful AI Agent Mini-App.",
      tools: data.tools || [],
      inputs: data.inputs || [],
      theme: data.theme || { primaryColor: "#3B82F6", mode: "dark", badge: "AI Mini-App", widgetLayout: "card" },
      sampleQuery: data.sampleQuery || "",
      createdAt: new Date().toISOString()
    };
    this.apps.set(id, newApp);
    return newApp;
  }

  updateApp(id, updates) {
    const existing = this.apps.get(id);
    if (!existing) return null;
    const updated = { ...existing, ...updates, updatedAt: new Date().toISOString() };
    this.apps.set(id, updated);
    return updated;
  }

  deleteApp(id) {
    return this.apps.delete(id);
  }

  // API Keys
  hashKey(rawKey) {
    return crypto.createHash("sha256").update(rawKey).digest("hex");
  }

  createApiKey(name = "Default API Key") {
    const id = `key_${Date.now()}`;
    const rawSecret = `mgn_live_${crypto.randomBytes(18).toString("hex")}`;
    const keyHash = this.hashKey(rawSecret);
    const prefix = rawSecret.substring(0, 14) + "..." + rawSecret.substring(rawSecret.length - 4);

    const record = {
      id,
      name,
      keyHash,
      prefix,
      createdAt: new Date().toISOString(),
      lastUsedAt: null,
      isRevoked: false
    };

    this.apiKeys.set(id, record);

    return {
      ...record,
      rawSecret // only returned on creation!
    };
  }

  listApiKeys() {
    return Array.from(this.apiKeys.values()).map(k => ({
      id: k.id,
      name: k.name,
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

  getAnalytics() {
    const totalRuns = this.executionLogs.length;
    const successfulRuns = this.executionLogs.filter(l => l.status === "success").length;
    const avgLatency = totalRuns > 0 
      ? Math.round(this.executionLogs.reduce((acc, l) => acc + (l.latencyMs || 0), 0) / totalRuns)
      : 0;
    const totalTokens = this.executionLogs.reduce((acc, l) => acc + (l.tokensTotal || 0), 0);

    // Group by App
    const appUsage = {};
    for (const log of this.executionLogs) {
      appUsage[log.appName] = (appUsage[log.appName] || 0) + 1;
    }

    return {
      totalRuns,
      successRate: totalRuns > 0 ? Number(((successfulRuns / totalRuns) * 100).toFixed(1)) : 100,
      avgLatencyMs: avgLatency,
      totalTokens,
      appUsage,
      recentLogs: this.executionLogs.slice(0, 15)
    };
  }
}

export const store = new Store();
