import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface TransactionToCategorize {
  description: string;
  amount: number;
  type?: 'income' | 'expense';
}

interface CategorizedResult {
  description: string;
  suggestedCategory: string;
  confidence: number;
  reasoning: string;
}

const EXPENSE_CATEGORIES = [
  'Food & Dining', 'Transport', 'Utilities', 'Entertainment', 'Shopping',
  'Healthcare', 'Education', 'Subscriptions', 'Housing', 'Childcare', 'Other'
];

const INCOME_CATEGORIES = [
  'Salary', 'Bonus', 'Freelance', 'Investment', 'Rental', 'Dividend', 'Side Business', 'Other'
];

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { transactions, type = 'expense' } = await req.json() as { 
      transactions: TransactionToCategorize[];
      type?: 'income' | 'expense';
    };

    if (!transactions || !Array.isArray(transactions) || transactions.length === 0) {
      return new Response(
        JSON.stringify({ error: "No transactions provided" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Categorizing ${transactions.length} transactions of type: ${type}`);

    const categories = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
    
    const prompt = `You are a financial transaction categorizer for a Dubai-based family wealth management app.

Categorize each transaction into ONE of these ${type} categories: ${categories.join(', ')}

For each transaction, provide:
1. The suggested category (must be exactly one from the list above)
2. A confidence score (0.0 to 1.0)
3. Brief reasoning (max 15 words)

Transactions to categorize:
${transactions.map((t, i) => `${i + 1}. "${t.description}" - Amount: ${t.amount}`).join('\n')}

Respond ONLY with a JSON array in this exact format:
[
  {"index": 0, "category": "Food & Dining", "confidence": 0.95, "reasoning": "Restaurant name indicates dining expense"},
  ...
]`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${Deno.env.get("LOVABLE_API_KEY")}`,
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "You are a precise financial categorization assistant. Always respond with valid JSON only." },
          { role: "user", content: prompt }
        ],
        temperature: 0.2,
      }),
    });

    if (!response.ok) {
      console.error("AI Gateway error:", response.status, await response.text());
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const aiResult = await response.json();
    const content = aiResult.choices?.[0]?.message?.content || "";
    
    console.log("AI Response:", content);

    // Parse the AI response
    let categorizations: any[];
    try {
      // Extract JSON from response (handle markdown code blocks)
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error("No JSON array found in response");
      }
      categorizations = JSON.parse(jsonMatch[0]);
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      // Return default categorization if parsing fails
      categorizations = transactions.map((_, i) => ({
        index: i,
        category: "Other",
        confidence: 0.5,
        reasoning: "Unable to determine category automatically"
      }));
    }

    // Map results back to transactions
    const results: CategorizedResult[] = transactions.map((t, i) => {
      const cat = categorizations.find((c: any) => c.index === i) || categorizations[i];
      return {
        description: t.description,
        suggestedCategory: cat?.category || "Other",
        confidence: cat?.confidence || 0.5,
        reasoning: cat?.reasoning || "No reasoning provided"
      };
    });

    console.log(`Successfully categorized ${results.length} transactions`);

    return new Response(
      JSON.stringify({ results }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: unknown) {
    console.error("Categorization error:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to categorize transactions";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
