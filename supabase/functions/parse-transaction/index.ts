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
        JSON.stringify({ error: "Text input is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Parsing transaction:", text);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${Deno.env.get("LOVABLE_API_KEY")}`,
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `You are a financial transaction parser for a Dubai-based family finance app. Parse natural language into structured transaction data. Default currency is AED unless specified otherwise.`
          },
          {
            role: "user",
            content: `Parse this transaction: "${text}"`
          }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "parse_transaction",
              description: "Parse a natural language transaction into structured data",
              parameters: {
                type: "object",
                properties: {
                  type: {
                    type: "string",
                    enum: ["income", "expense"],
                    description: "Transaction type. Use 'expense' for spending, purchases, payments. Use 'income' for salary, earnings, received money."
                  },
                  amount: {
                    type: "number",
                    description: "The transaction amount as a positive number"
                  },
                  currency: {
                    type: "string",
                    enum: ["AED", "USD", "EUR", "GBP", "INR"],
                    description: "Currency code. Default to AED if not specified."
                  },
                  category: {
                    type: "string",
                    description: "For expenses: Food & Dining, Transport, Utilities, Entertainment, Shopping, Healthcare, Education, Subscriptions, Housing, Childcare, Other. For income: Salary, Bonus, Freelance, Investment, Rental, Dividend, Side Business, Other."
                  },
                  description: {
                    type: "string",
                    description: "Brief description extracted from the input (e.g., merchant name, purpose)"
                  }
                },
                required: ["type", "amount", "currency", "category", "description"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "parse_transaction" } }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const aiResult = await response.json();
    console.log("AI Response:", JSON.stringify(aiResult));

    const toolCall = aiResult.choices?.[0]?.message?.tool_calls?.[0];
    
    if (!toolCall || toolCall.function.name !== "parse_transaction") {
      throw new Error("Failed to parse transaction");
    }

    const parsed = JSON.parse(toolCall.function.arguments);
    console.log("Parsed transaction:", parsed);

    return new Response(
      JSON.stringify({ 
        success: true, 
        transaction: parsed 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Parse error:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Failed to parse transaction" 
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
