import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface FinancialData {
  totalIncome: number;
  totalExpenses: number;
  expensesByCategory: Record<string, number>;
  savingsRate: number;
  topSpendingCategories: string[];
  monthOverMonthChange: number;
  budgetUtilization: Record<string, number>;
  upcomingBills: number;
  netWorth?: number;
  debtTotal?: number;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { financialData } = await req.json() as { financialData: FinancialData };

    if (!financialData) {
      return new Response(
        JSON.stringify({ error: "No financial data provided" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Generating insights for financial data:", JSON.stringify(financialData));

    const prompt = `You are a personal financial advisor for a family in Dubai. Analyze their financial data and provide actionable insights.

FINANCIAL DATA:
- Monthly Income: AED ${financialData.totalIncome.toLocaleString()}
- Monthly Expenses: AED ${financialData.totalExpenses.toLocaleString()}
- Savings Rate: ${financialData.savingsRate.toFixed(1)}%
- Month-over-Month Expense Change: ${financialData.monthOverMonthChange >= 0 ? '+' : ''}${financialData.monthOverMonthChange.toFixed(1)}%
- Top Spending Categories: ${financialData.topSpendingCategories.join(', ')}
- Upcoming Bills (next 7 days): ${financialData.upcomingBills}
${financialData.netWorth ? `- Net Worth: AED ${financialData.netWorth.toLocaleString()}` : ''}
${financialData.debtTotal ? `- Total Debt: AED ${financialData.debtTotal.toLocaleString()}` : ''}

EXPENSE BREAKDOWN:
${Object.entries(financialData.expensesByCategory)
  .sort(([,a], [,b]) => b - a)
  .slice(0, 8)
  .map(([cat, amt]) => `- ${cat}: AED ${amt.toLocaleString()}`)
  .join('\n')}

BUDGET UTILIZATION:
${Object.entries(financialData.budgetUtilization)
  .map(([cat, pct]) => `- ${cat}: ${pct.toFixed(0)}% used`)
  .join('\n')}

Provide exactly 5 insights in the following JSON format. Each insight should be specific, actionable, and relevant to Dubai family finances:

{
  "insights": [
    {
      "type": "warning" | "success" | "tip" | "alert",
      "title": "Brief title (max 8 words)",
      "description": "Detailed insight with specific numbers and actionable advice (2-3 sentences)",
      "priority": "high" | "medium" | "low",
      "category": "spending" | "saving" | "budget" | "debt" | "investment" | "lifestyle"
    }
  ],
  "summary": "One sentence overall financial health summary",
  "savingsOpportunity": "Estimated monthly savings potential in AED if recommendations followed"
}

Focus on:
1. Unusual spending patterns or overspending categories
2. Budget categories at risk of being exceeded
3. Savings opportunities based on Dubai cost of living
4. Positive financial behaviors to reinforce
5. Actionable next steps for the coming week`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${Deno.env.get("LOVABLE_API_KEY")}`,
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "You are a precise financial analyst. Always respond with valid JSON only, no markdown." },
          { role: "user", content: prompt }
        ],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const status = response.status;
      const errorText = await response.text();
      console.error("AI Gateway error:", status, errorText);
      
      if (status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      throw new Error(`AI Gateway error: ${status}`);
    }

    const aiResult = await response.json();
    const content = aiResult.choices?.[0]?.message?.content || "";
    
    console.log("AI Response:", content);

    // Parse the AI response
    let insights;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("No JSON object found in response");
      }
      insights = JSON.parse(jsonMatch[0]);
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      // Return fallback insights
      insights = {
        insights: [
          {
            type: "tip",
            title: "Review Your Spending",
            description: `Your top spending categories are ${financialData.topSpendingCategories.slice(0, 3).join(', ')}. Consider setting specific budgets for each.`,
            priority: "medium",
            category: "spending"
          },
          {
            type: financialData.savingsRate >= 20 ? "success" : "warning",
            title: financialData.savingsRate >= 20 ? "Great Savings Rate" : "Boost Your Savings",
            description: `Your current savings rate is ${financialData.savingsRate.toFixed(1)}%. ${financialData.savingsRate >= 20 ? 'Keep up the excellent work!' : 'Aim for at least 20% to build wealth faster.'}`,
            priority: financialData.savingsRate >= 20 ? "low" : "high",
            category: "saving"
          }
        ],
        summary: "Continue monitoring your finances for optimal results.",
        savingsOpportunity: "500"
      };
    }

    // Add metadata
    insights.generatedAt = new Date().toISOString();
    insights.dataSnapshot = {
      income: financialData.totalIncome,
      expenses: financialData.totalExpenses,
      savingsRate: financialData.savingsRate
    };

    console.log(`Successfully generated ${insights.insights?.length || 0} insights`);

    return new Response(
      JSON.stringify(insights),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: unknown) {
    console.error("Insights generation error:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to generate insights";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
