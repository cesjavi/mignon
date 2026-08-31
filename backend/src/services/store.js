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
  }
];

class Store {
  constructor() {
    this.apps = new Map(INITIAL_APPS.map(a => [a.id, a]));
    this.apiKeys = new Map();
    this.executionLogs = [];
    this.sessionMemory = new Map(); // sessionId -> array of conversation turns
    
    // Seed initial demo API Key
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
      createdAt: data.createdAt || new Date().toISOString()
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
      rawSecret
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
      recentLogs: this.executionLogs.slice(0, 20)
    };
  }
}

export const store = new Store();
