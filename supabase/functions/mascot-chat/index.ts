const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface Message {
  role: "user" | "assistant";
  content: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Always return 200 so supabase.functions.invoke puts result in data (not error)
  const ok = (body: object) =>
    new Response(JSON.stringify(body), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  try {
    const { messages, page, financialContext } = await req.json() as {
      messages: Message[];
      page: string;
      financialContext?: string | null;
    };

    const apiKey = Deno.env.get("ANTHROPIC_API_KEY");
    if (!apiKey) {
      console.error("ANTHROPIC_API_KEY secret is not set");
      return ok({ reply: "I'm not fully set up yet — please ask an admin to add the ANTHROPIC_API_KEY secret. 🙏" });
    }

    const pageLabels: Record<string, string> = {
      "/onboarding":  "Onboarding setup (goals, currency preferences, account connection)",
      "/":            "Dashboard (net worth overview, recent transactions)",
      "/income":      "Income page (log salary, freelance, rental income)",
      "/expenses":    "Expenses page (log and categorize spending)",
      "/budget":      "Budget Planner (set monthly category limits)",
      "/savings":     "Savings Goals (track progress toward targets)",
      "/investments": "Investment Tracker (stocks, crypto, real estate, gold)",
      "/debt":        "Debt Tracker (snowball and avalanche payoff plans)",
      "/trends":      "Trends page (income vs expense charts over time)",
      "/split":       "Split & Social (divide bills with friends)",
      "/ai-tools":    "AI Tools (insights, categorizer, challenge recommendations)",
      "/settings":    "Settings (profile, currency, notifications)",
    };

    const currentPage = pageLabels[page] ?? `App page (${page})`;
    const isOnboarding = page === "/onboarding";
    const navigationRule = isOnboarding
      ? "NAVIGATION RULE: Do NOT include any NAVIGATE line while the user is on onboarding."
      : `NAVIGATION RULE: If your answer naturally suggests visiting a specific app page, append exactly this on its own final line — nothing after it:
NAVIGATE:/path

Example — if you advise checking the budget: end with NAVIGATE:/budget
If no page visit is relevant, do NOT include any NAVIGATE line.`;
    const modeRules = isOnboarding
      ? "ONBOARDING MODE: The user sees your reply inside a tiny guide bubble during setup. Keep replies to 1-2 short sentences, supportive, and specific to their current step."
      : "";

    const systemPrompt = `You are Nayla, a warm and knowledgeable female financial assistant built into the YourWealthAdvisor app — a personal finance tracker for UAE residents (primary currency: AED / Dirham).

Your personality:
- Friendly, encouraging, and professional — like a knowledgeable friend
- Concise: 2–4 sentences per reply maximum
- Use 1–2 relevant emojis per response naturally
- Give specific, actionable advice with real numbers when relevant
- Never use markdown formatting (no asterisks, no hyphens as bullets, no headers)

About the app — pages the user can navigate to:
- /onboarding — New user setup (goals, currency, financial profile, account connection)
- / — Dashboard: net worth overview, recent transactions
- /income — Log salary, freelance, rental income
- /expenses — Log and categorize daily spending
- /budget — Set monthly category budgets, track variance
- /savings — Create savings goals with deadline and progress
- /investments — Track stocks, crypto, real estate, gold, bonds
- /debt — Debt payoff plans (snowball or avalanche method)
- /trends — Income vs expense charts and spending patterns
- /split — Split bills and track group expenses
- /ai-tools — AI-powered insights, auto-categorization, financial challenges
- /settings — Profile, preferred currency, notifications

The user is currently on: ${currentPage}

${modeRules}

${financialContext
  ? `Here is the user's live financial data — use it to give personalised, specific answers:\n${financialContext}\n\nWhen answering questions about their finances, always refer to these actual numbers rather than speaking in generalities. If a piece of data is missing (e.g. no transactions yet), acknowledge it warmly and suggest they add data.`
  : "No financial data is available yet for this user."}

${navigationRule}

Reply in plain conversational text only.`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 300,
        system: systemPrompt,
        messages,
      }),
    });

    if (!response.ok) {
      const status = response.status;
      const body = await response.text();
      console.error("Anthropic API error:", status, body);

      if (status === 401 || status === 403) return ok({ reply: "My API key seems invalid — ask an admin to check the ANTHROPIC_API_KEY secret. 🔑" });
      if (status === 429)                    return ok({ reply: "I'm thinking a little too hard right now — give me a moment and try again! 🙏" });
      if (status === 529)                    return ok({ reply: "Claude is very busy right now — please try again in a moment! ⏳" });

      return ok({ reply: "Something went wrong on my end. Please try again! 😊" });
    }

    const aiResult = await response.json();
    const raw = (aiResult.content?.[0]?.text ?? "").trim();

    // Extract optional NAVIGATE:/path at the end
    const navigateMatch = raw.match(/\nNAVIGATE:(\/[\w/-]*)\s*$/);
    const reply = navigateMatch ? raw.slice(0, navigateMatch.index).trim() : raw;
    const path  = navigateMatch ? navigateMatch[1] : undefined;

    return ok({ reply, path });

  } catch (error: unknown) {
    console.error("Mascot chat error:", error);
    return ok({ reply: "Oops, something went wrong on my end! Try asking me again. 😊" });
  }
});
