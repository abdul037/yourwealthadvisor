import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text } = await req.json();

    if (!text || typeof text !== "string") {
      return new Response(
        JSON.stringify({ error: "Missing or invalid 'text' field" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are a financial asset parser. Parse natural language descriptions of assets into structured data.

Extract the following information:
- name: The asset name/description (e.g., "Sarwa Portfolio", "Gold Coins", "Tesla Stock")
- category: One of: Cash, Stocks, Bonds, Crypto, Gold, Real Estate, Car, Land Asset, Insurance/PF, Other
- amount: The current value as a number (no currency symbols)
- currency: The currency code (AED, USD, EUR, GBP, INR, SAR). Default to AED if not specified.
- liquidity_level: One of: L1 (instant), L2 (1 week), L3 (1 month+), NL (non-liquid). Infer based on asset type:
  - Cash, Stocks, Crypto: L1
  - Bonds, Gold: L2  
  - Real Estate, Land: L3
  - Car, Insurance/PF: NL
- appreciation_rate: Expected annual return percentage as a number. Infer based on category:
  - Cash: 2-3%
  - Stocks: 8-12%
  - Bonds: 4-6%
  - Crypto: 10-20%
  - Gold: 5-8%
  - Real Estate: 5-10%
  - Car: -10 to -15% (depreciation)
  - Land: 3-5%
  - Insurance/PF: 6-8%

Examples:
"My Sarwa portfolio is worth 50000 dirhams" → {name: "Sarwa Portfolio", category: "Stocks", amount: 50000, currency: "AED", liquidity_level: "L1", appreciation_rate: 10}
"Gold 2oz valued at 15000 AED" → {name: "Gold 2oz", category: "Gold", amount: 15000, currency: "AED", liquidity_level: "L2", appreciation_rate: 6}
"Tesla stock worth $5000" → {name: "Tesla Stock", category: "Stocks", amount: 5000, currency: "USD", liquidity_level: "L1", appreciation_rate: 12}
"My car is worth 80000" → {name: "Car", category: "Car", amount: 80000, currency: "AED", liquidity_level: "NL", appreciation_rate: -12}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Parse this asset description: "${text}"` },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "parse_asset",
              description: "Parse an asset description into structured data",
              parameters: {
                type: "object",
                properties: {
                  name: { type: "string", description: "Asset name/description" },
                  category: { 
                    type: "string", 
                    enum: ["Cash", "Stocks", "Bonds", "Crypto", "Gold", "Real Estate", "Car", "Land Asset", "Insurance/PF", "Other"],
                    description: "Asset category" 
                  },
                  amount: { type: "number", description: "Current value as a number" },
                  currency: { 
                    type: "string", 
                    enum: ["AED", "USD", "EUR", "GBP", "INR", "SAR"],
                    description: "Currency code" 
                  },
                  liquidity_level: {
                    type: "string",
                    enum: ["L1", "L2", "L3", "NL"],
                    description: "Liquidity level"
                  },
                  appreciation_rate: { 
                    type: "number", 
                    description: "Expected annual return percentage" 
                  },
                },
                required: ["name", "category", "amount", "currency", "liquidity_level"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "parse_asset" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall || toolCall.function.name !== "parse_asset") {
      throw new Error("Failed to parse asset from AI response");
    }

    const parsedAsset = JSON.parse(toolCall.function.arguments);

    return new Response(
      JSON.stringify({ asset: parsedAsset }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("parse-asset error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
