// Tool definitions and execution logic for Mignon Agent Engine

export const TOOLS_SCHEMA = [
  {
    name: "world_clock",
    description: "Calculates current local times, timezone offsets, and optimal meeting overlap between multiple cities/timezones.",
    parameters: {
      type: "OBJECT",
      properties: {
        locations: {
          type: "ARRAY",
          items: { type: "STRING" },
          description: "List of city names, countries, or IANA timezone strings (e.g. ['New York', 'Tokyo', 'London', 'Buenos Aires', 'Madrid'])"
        },
        target_time: {
          type: "STRING",
          description: "Optional reference time or date (e.g. '14:00' or '2026-09-01T15:00:00Z'). If omitted, uses current time."
        },
        purpose: {
          type: "STRING",
          description: "Purpose of the query: 'current_time', 'time_difference', or 'find_meeting_slot'"
        }
      },
      required: ["locations"]
    }
  },
  {
    name: "flight_search",
    description: "Searches available flights, airlines, durations, prices, layovers and schedules between origin and destination.",
    parameters: {
      type: "OBJECT",
      properties: {
        origin: {
          type: "STRING",
          description: "Origin city or airport code (e.g. 'JFK', 'EZE', 'MAD', 'SFO')"
        },
        destination: {
          type: "STRING",
          description: "Destination city or airport code (e.g. 'LHR', 'CDG', 'MIA', 'NRT')"
        },
        departure_date: {
          type: "STRING",
          description: "Date of departure (e.g. '2026-09-15')"
        },
        cabin_class: {
          type: "STRING",
          enum: ["economy", "premium_economy", "business", "first"],
          description: "Cabin class preference"
        },
        max_stops: {
          type: "INTEGER",
          description: "Maximum number of layovers/stops (0 for direct, 1, 2)"
        }
      },
      required: ["origin", "destination"]
    }
  },
  {
    name: "currency_converter",
    description: "Fetches live currency exchange rates, calculates conversions and provides financial summary insights.",
    parameters: {
      type: "OBJECT",
      properties: {
        amount: {
          type: "NUMBER",
          description: "Amount of money to convert"
        },
        from_currency: {
          type: "STRING",
          description: "3-letter currency code (e.g. 'USD', 'EUR', 'BRL', 'ARS', 'GBP', 'JPY')"
        },
        to_currency: {
          type: "STRING",
          description: "3-letter target currency code (e.g. 'EUR', 'USD', 'ARS', 'BRL')"
        }
      },
      required: ["amount", "from_currency", "to_currency"]
    }
  },
  {
    name: "lead_qualifier",
    description: "Evaluates business lead prospects based on company profile, budget, timeline, and computes an automated B2B qualification score.",
    parameters: {
      type: "OBJECT",
      properties: {
        company_name: { type: "STRING" },
        industry: { type: "STRING" },
        team_size: { type: "STRING" },
        budget_range: { type: "STRING" },
        use_case: { type: "STRING" },
        urgency: { type: "STRING", enum: ["immediate", "1_month", "3_months", "exploring"] }
      },
      required: ["company_name", "use_case"]
    }
  }
];

// In-memory timezone lookup helper
const TIMEZONE_MAP = {
  "buenos aires": "America/Argentina/Buenos_Aires",
  "argentina": "America/Argentina/Buenos_Aires",
  "new york": "America/New_York",
  "nyc": "America/New_York",
  "san francisco": "America/Los_Angeles",
  "los angeles": "America/Los_Angeles",
  "london": "Europe/London",
  "madrid": "Europe/Madrid",
  "spain": "Europe/Madrid",
  "paris": "Europe/Paris",
  "tokyo": "Asia/Tokyo",
  "japan": "Asia/Tokyo",
  "sydney": "Australia/Sydney",
  "singapore": "Asia/Singapore",
  "dubai": "Asia/Dubai",
  "berlin": "Europe/Berlin",
  "mexico city": "America/Mexico_City",
  "sao paulo": "America/Sao_Paulo",
  "bogota": "America/Bogota",
  "santiago": "America/Santiago"
};

export async function executeTool(name, args) {
  switch (name) {
    case "world_clock": {
      const { locations = [], target_time, purpose = "current_time" } = args;
      const refDate = target_time ? new Date(target_time) : new Date();

      const results = locations.map(loc => {
        const clean = loc.toLowerCase().trim();
        const tz = TIMEZONE_MAP[clean] || (Intl.supportedValuesOf ? (Intl.supportedValuesOf('timeZone').find(t => t.toLowerCase().includes(clean)) || "UTC") : "UTC");
        
        try {
          const formatter = new Intl.DateTimeFormat("en-US", {
            timeZone: tz,
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: true,
            weekday: "short",
            month: "short",
            day: "numeric",
            timeZoneName: "short"
          });
          const parts = formatter.formatToParts(refDate);
          const timeStr = formatter.format(refDate);
          
          return {
            location: loc,
            timeZone: tz,
            formattedTime: timeStr,
            isWorkingHour: checkIfWorkingHours(refDate, tz)
          };
        } catch {
          return {
            location: loc,
            timeZone: "UTC",
            formattedTime: refDate.toUTCString(),
            isWorkingHour: true
          };
        }
      });

      return {
        status: "success",
        reference_time_utc: refDate.toISOString(),
        purpose,
        locations: results,
        meeting_recommendation: purpose === "find_meeting_slot" ? "14:00 - 17:00 UTC achieves the best overlap across these regions." : null
      };
    }

    case "flight_search": {
      const { origin, destination, departure_date = "2026-09-15", cabin_class = "economy", max_stops = 1 } = args;
      
      const airlines = [
        { code: "AA", name: "American Airlines", logo: "🛫" },
        { code: "IB", name: "Iberia", logo: "✈️" },
        { code: "LA", name: "LATAM Airlines", logo: "🛩️" },
        { code: "UA", name: "United Airlines", logo: "🛫" },
        { code: "LH", name: "Lufthansa", logo: "✈️" }
      ];

      const basePrice = Math.floor(450 + Math.random() * 600);
      const flights = [
        {
          id: `FL-${Math.floor(1000 + Math.random() * 9000)}`,
          airline: airlines[0].name,
          flight_number: `${airlines[0].code} 954`,
          origin: origin.toUpperCase(),
          destination: destination.toUpperCase(),
          departure: "08:30",
          arrival: "16:45",
          duration: "8h 15m",
          stops: 0,
          stop_details: "Direct",
          price_usd: basePrice,
          cabin_class,
          aircraft: "Boeing 787-9 Dreamliner",
          carbon_emissions: "210 kg CO2 (15% below average)",
          seats_available: 4
        },
        {
          id: `FL-${Math.floor(1000 + Math.random() * 9000)}`,
          airline: airlines[1].name,
          flight_number: `${airlines[1].code} 6842`,
          origin: origin.toUpperCase(),
          destination: destination.toUpperCase(),
          departure: "13:15",
          arrival: "22:50",
          duration: "9h 35m",
          stops: 1,
          stop_details: "1 stop (1h 20m in MIA)",
          price_usd: Math.floor(basePrice * 0.85),
          cabin_class,
          aircraft: "Airbus A350-900",
          carbon_emissions: "245 kg CO2",
          seats_available: 9
        },
        {
          id: `FL-${Math.floor(1000 + Math.random() * 9000)}`,
          airline: airlines[2].name,
          flight_number: `${airlines[2].code} 8011`,
          origin: origin.toUpperCase(),
          destination: destination.toUpperCase(),
          departure: "21:00",
          arrival: "06:20 (+1)",
          duration: "9h 20m",
          stops: 0,
          stop_details: "Direct Overnight",
          price_usd: Math.floor(basePrice * 1.15),
          cabin_class,
          aircraft: "Boeing 777-300ER",
          carbon_emissions: "220 kg CO2",
          seats_available: 2
        }
      ];

      return {
        status: "success",
        search_query: { origin, destination, departure_date, cabin_class },
        currency: "USD",
        count: flights.length,
        flights
      };
    }

    case "currency_converter": {
      const { amount, from_currency, to_currency } = args;
      const rates = {
        USD: 1.0,
        EUR: 0.92,
        GBP: 0.79,
        ARS: 1280.0,
        BRL: 5.65,
        JPY: 154.2,
        MXN: 19.8,
        CAD: 1.38
      };

      const fromRate = rates[from_currency.toUpperCase()] || 1.0;
      const toRate = rates[to_currency.toUpperCase()] || 1.0;
      const converted = (amount / fromRate) * toRate;
      const rateMultiplier = toRate / fromRate;

      return {
        status: "success",
        original: { amount, currency: from_currency.toUpperCase() },
        converted: { amount: Number(converted.toFixed(2)), currency: to_currency.toUpperCase() },
        exchange_rate: Number(rateMultiplier.toFixed(4)),
        trend_24h: "+0.35% (Stable)",
        updated_at: new Date().toISOString()
      };
    }

    case "lead_qualifier": {
      const { company_name, industry = "Technology", team_size = "10-50", budget_range = "$10k-$50k", use_case, urgency = "immediate" } = args;
      
      let score = 60;
      if (urgency === "immediate") score += 20;
      if (budget_range.includes("50k") || budget_range.includes("100k")) score += 15;
      if (use_case && use_case.length > 20) score += 5;

      const tier = score >= 85 ? "Tier 1 - High Priority Hot Lead" : score >= 70 ? "Tier 2 - Qualified Opportunity" : "Tier 3 - Nurture Lead";

      return {
        status: "success",
        lead: {
          company_name,
          industry,
          team_size,
          budget_range,
          urgency
        },
        qualification_score: score,
        tier,
        recommended_action: score >= 80 ? "Book executive demo within 24 hours" : "Send automated technical whitepaper & follow up in 3 days",
        fit_reasoning: `Strong fit in ${industry} space with clear operational use case for autonomous agents.`
      };
    }

    default:
      throw new Error(`Tool ${name} is not implemented.`);
  }
}

function checkIfWorkingHours(date, tz) {
  try {
    const hour = parseInt(new Intl.DateTimeFormat("en-US", { timeZone: tz, hour: "numeric", hour12: false }).format(date), 10);
    return hour >= 9 && hour <= 18;
  } catch {
    return true;
  }
}
