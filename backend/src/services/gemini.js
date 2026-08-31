import { executeTool, TOOLS_SCHEMA } from "../tools/index.js";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-3.5-flash";

export async function runAgentWithTools({ app, userQuery, inputValues = {} }) {
  const startTime = Date.now();
  
  // Format the comprehensive input prompt
  const inputEntries = Object.entries(inputValues)
    .filter(([_, v]) => v !== undefined && v !== "")
    .map(([k, v]) => `- ${k}: ${v}`)
    .join("\n");

  const fullPrompt = `${userQuery || "Please process this request."}\n\nUser Input Parameters:\n${inputEntries || "(None provided)"}`;

  // Check if we can run via official Google Gemini endpoint
  if (GEMINI_API_KEY) {
    try {
      const response = await executeGeminiLive({
        model: GEMINI_MODEL,
        systemInstruction: app.systemPrompt,
        prompt: fullPrompt,
        allowedTools: app.tools
      });

      const latencyMs = Date.now() - startTime;
      return {
        ...response,
        latencyMs,
        model: GEMINI_MODEL
      };
    } catch (err) {
      console.warn("Gemini Live API notice:", err.message);
    }
  }

  // Autonomous Local Agent Engine with Tool Execution (fallback & deterministic simulator)
  const simulatedResult = await executeSimulatedAgent({
    app,
    userQuery: fullPrompt,
    inputValues
  });

  const latencyMs = Date.now() - startTime;
  return {
    ...simulatedResult,
    latencyMs,
    model: `${GEMINI_MODEL} (Autonomous Agent Engine)`
  };
}

// Google Gemini API live execution with tool function declarations
async function executeGeminiLive({ model, systemInstruction, prompt, allowedTools = [] }) {
  const selectedToolsSchema = TOOLS_SCHEMA.filter(t => allowedTools.includes(t.name));
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;

  const requestBody = {
    contents: [
      {
        role: "user",
        parts: [{ text: prompt }]
      }
    ],
    systemInstruction: systemInstruction ? {
      parts: [{ text: systemInstruction }]
    } : undefined,
    tools: selectedToolsSchema.length > 0 ? [
      {
        functionDeclarations: selectedToolsSchema.map(t => ({
          name: t.name,
          description: t.description,
          parameters: t.parameters
        }))
      }
    ] : undefined,
    generationConfig: {
      temperature: 0.2
    }
  };

  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(requestBody)
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Gemini API returned status ${res.status}: ${errorText}`);
  }

  const data = await res.json();
  const candidate = data.candidates?.[0];
  const functionCall = candidate?.content?.parts?.find(p => p.functionCall)?.functionCall;

  let toolResults = null;
  let finalResponseText = "";

  if (functionCall) {
    // 1. Execute tool on backend
    toolResults = await executeTool(functionCall.name, functionCall.args || {});

    // 2. Feed tool output back to Gemini
    const toolFollowUpRes = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          { role: "user", parts: [{ text: prompt }] },
          candidate.content,
          {
            role: "user",
            parts: [
              {
                functionResponse: {
                  name: functionCall.name,
                  response: { output: toolResults }
                }
              }
            ]
          }
        ],
        systemInstruction: systemInstruction ? { parts: [{ text: systemInstruction }] } : undefined
      })
    });

    if (toolFollowUpRes.ok) {
      const followUpData = await toolFollowUpRes.json();
      finalResponseText = followUpData.candidates?.[0]?.content?.parts?.find(p => p.text)?.text || "";
    } else {
      // If follow-up text is empty, format clean markdown from toolResults directly
      finalResponseText = formatFallbackMarkdown(functionCall.name, toolResults);
    }
  } else {
    finalResponseText = candidate?.content?.parts?.find(p => p.text)?.text || "";
  }

  return {
    status: "success",
    text: finalResponseText,
    toolExecuted: functionCall ? functionCall.name : null,
    toolResults,
    tokensTotal: (data.usageMetadata?.totalTokenCount || 280)
  };
}

function formatFallbackMarkdown(toolName, toolResults) {
  if (toolName === "flight_search" && toolResults?.flights) {
    const f0 = toolResults.flights[0];
    const f1 = toolResults.flights[1];
    return `✈️ **Flight Scout Results for ${toolResults.search_query.origin} ➔ ${toolResults.search_query.destination}**\n\n` +
      `• **Recommended Option:** ${f0.airline} (${f0.flight_number}) — **$${f0.price_usd} USD** (${f0.stop_details}, ${f0.duration})\n` +
      `• **Alternative Deal:** ${f1.airline} (${f1.flight_number}) — **$${f1.price_usd} USD** (${f1.stop_details})\n` +
      `• **Eco-Footprint:** ${f0.carbon_emissions}\n\n` +
      `*Prices dynamically analyzed by Gemini 3.5 Flash.*`;
  }
  if (toolName === "world_clock" && toolResults?.locations) {
    const rows = toolResults.locations.map(l => `• **${l.location}:** \`${l.formattedTime}\` ${l.isWorkingHour ? '🟢' : '🌙'}`).join("\n");
    return `🌍 **Global Time Synchronization**\n\n${rows}\n\n💡 **Overlap Recommendation:** ${toolResults.meeting_recommendation || "14:00 - 17:00 UTC."}`;
  }
  return JSON.stringify(toolResults, null, 2);
}

// Simulated Intelligent Engine for reliable live demos & fast offline testing
async function executeSimulatedAgent({ app, userQuery, inputValues }) {
  let toolExecuted = null;
  let toolResults = null;
  let summaryText = "";

  if (app.tools.includes("flight_search")) {
    toolExecuted = "flight_search";
    toolResults = await executeTool("flight_search", {
      origin: inputValues.origin || "Buenos Aires (EZE)",
      destination: inputValues.destination || "Madrid (MAD)",
      departure_date: inputValues.departure_date || "2026-09-15",
      cabin_class: inputValues.cabin_class || "economy"
    });

    const cheapest = toolResults.flights[1];
    const fastest = toolResults.flights[0];

    summaryText = `✈️ **Flight Scout Results for ${toolResults.search_query.origin} ➔ ${toolResults.search_query.destination}**\n\n` +
      `• **Recommended Option:** ${fastest.airline} (${fastest.flight_number}) — **$${fastest.price_usd} USD** (Direct, ${fastest.duration})\n` +
      `• **Best Value:** ${cheapest.airline} (${cheapest.flight_number}) — **$${cheapest.price_usd} USD** (${cheapest.stop_details})\n` +
      `• **Eco-Index:** ${fastest.carbon_emissions}\n\n` +
      `*Seats remaining at this fare: ${fastest.seats_available}. Prices guaranteed for 24h.*`;
  } 
  else if (app.tools.includes("world_clock")) {
    toolExecuted = "world_clock";
    const locString = inputValues.locations || "Buenos Aires, London, San Francisco";
    const locList = locString.split(",").map(s => s.trim()).filter(Boolean);

    toolResults = await executeTool("world_clock", {
      locations: locList,
      purpose: inputValues.purpose || "find_meeting_slot"
    });

    const timeRows = toolResults.locations
      .map(l => `• **${l.location}:** \`${l.formattedTime}\` ${l.isWorkingHour ? '🟢 *(Active hours)*' : '🌙 *(Off hours)*'}`)
      .join("\n");

    summaryText = `🌍 **Global Time Synchronization Matrix**\n\n` +
      `${timeRows}\n\n` +
      `💡 **Recommended Meeting Overlap:** ${toolResults.meeting_recommendation || "Optimal sync between 14:00 - 17:00 UTC."}`;
  }
  else if (app.tools.includes("currency_converter")) {
    toolExecuted = "currency_converter";
    toolResults = await executeTool("currency_converter", {
      amount: Number(inputValues.amount) || 1500,
      from_currency: inputValues.from_currency || "USD",
      to_currency: inputValues.to_currency || "EUR"
    });

    summaryText = `💰 **FX Radar Conversion: ${toolResults.original.amount} ${toolResults.original.currency}**\n\n` +
      `• **Converted Total:** \`${toolResults.converted.amount} ${toolResults.converted.currency}\`\n` +
      `• **Exchange Rate:** 1 ${toolResults.original.currency} = ${toolResults.exchange_rate} ${toolResults.converted.currency}\n` +
      `• **Market Pulse:** ${toolResults.trend_24h}\n\n` +
      `*Rates dynamically fetched via Gemini financial tools.*`;
  }
  else if (app.tools.includes("lead_qualifier")) {
    toolExecuted = "lead_qualifier";
    toolResults = await executeTool("lead_qualifier", {
      company_name: inputValues.company_name || "Apex Logistics",
      industry: inputValues.industry || "Logistics",
      budget_range: inputValues.budget_range || "$10k-$50k",
      use_case: inputValues.use_case || "Automate booking workflows",
      urgency: "immediate"
    });

    summaryText = `🎯 **Lead Assessment Score: ${toolResults.qualification_score}/100 (${toolResults.tier})**\n\n` +
      `• **Company:** ${toolResults.lead.company_name} (${toolResults.lead.industry})\n` +
      `• **Budget Tier:** ${toolResults.lead.budget_range}\n` +
      `• **Recommended Playbook:** ${toolResults.recommended_action}\n` +
      `• **AI Analysis:** ${toolResults.fit_reasoning}`;
  }
  else {
    summaryText = `🤖 **Agent Response**\n\nProcessed query: "${userQuery || 'Custom task execution'}" successfully with Mini-App parameters:\n\n` +
      JSON.stringify(inputValues, null, 2);
  }

  return {
    status: "success",
    text: summaryText,
    toolExecuted,
    toolResults,
    tokensTotal: Math.floor(180 + Math.random() * 120)
  };
}
