import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    
    if (!lovableApiKey) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify the user
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch user's financial data for analysis
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [transactionsResult, budgetsResult, goalsResult, challengesResult] = await Promise.all([
      supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .gte('transaction_date', thirtyDaysAgo.toISOString().split('T')[0])
        .order('transaction_date', { ascending: false }),
      supabase
        .from('budgets')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true),
      supabase
        .from('milestones')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_achieved', false),
      supabase
        .from('challenge_participants')
        .select('challenge_id')
        .eq('user_id', user.id),
    ]);

    const transactions = transactionsResult.data || [];
    const budgets = budgetsResult.data || [];
    const goals = goalsResult.data || [];
    const activeChallengIds = (challengesResult.data || []).map(c => c.challenge_id);

    // Calculate spending patterns
    const expenses = transactions.filter(t => t.type === 'expense');
    const income = transactions.filter(t => t.type === 'income');
    
    const totalExpenses = expenses.reduce((sum, t) => sum + Number(t.amount), 0);
    const totalIncome = income.reduce((sum, t) => sum + Number(t.amount), 0);
    const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome * 100).toFixed(1) : 0;

    // Group expenses by category
    const categorySpending: Record<string, number> = {};
    expenses.forEach(t => {
      categorySpending[t.category] = (categorySpending[t.category] || 0) + Number(t.amount);
    });

    const topCategories = Object.entries(categorySpending)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([category, amount]) => ({ category, amount }));

    // Find budget overruns
    const budgetStatus = budgets.map(b => {
      const spent = categorySpending[b.category] || 0;
      const percentage = (spent / Number(b.allocated_amount)) * 100;
      return { category: b.category, allocated: b.allocated_amount, spent, percentage };
    });

    const overBudgetCategories = budgetStatus.filter(b => b.percentage > 100);
    const nearBudgetCategories = budgetStatus.filter(b => b.percentage >= 80 && b.percentage <= 100);

    // Build context for AI
    const financialContext = {
      period: 'last 30 days',
      totalExpenses,
      totalIncome,
      savingsRate: `${savingsRate}%`,
      topSpendingCategories: topCategories,
      budgetOverruns: overBudgetCategories,
      nearBudgetLimit: nearBudgetCategories,
      activeGoals: goals.map(g => ({ name: g.name, target: g.target_amount, current: g.current_amount })),
      currentChallengesCount: activeChallengIds.length,
    };

    const systemPrompt = `You are a personal finance coach AI for Tharwa, a wealth-building app. 
Analyze the user's spending patterns and recommend personalized financial challenges.

Guidelines:
- Suggest 3-4 challenges that are achievable but motivating
- Focus on areas where the user can improve (overspending categories, low savings rate, etc.)
- Make challenges specific with clear targets and timeframes
- Consider their active goals when making recommendations
- Be encouraging and positive in tone
- Challenges should be fun and gamified

Challenge types available:
- savings: Save a specific amount
- no_spend: Avoid spending in a category for X days
- budget: Stay under budget for a category
- reduce: Reduce spending by a percentage
- streak: Maintain a habit for X days`;

    const userPrompt = `Based on this user's financial data, recommend personalized challenges:

${JSON.stringify(financialContext, null, 2)}

Return recommendations using the suggest_challenges function.`;

    // Call Lovable AI Gateway with tool calling
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        tools: [
          {
            type: 'function',
            function: {
              name: 'suggest_challenges',
              description: 'Return personalized challenge recommendations based on spending analysis',
              parameters: {
                type: 'object',
                properties: {
                  summary: {
                    type: 'string',
                    description: 'A brief 1-2 sentence summary of the user\'s spending patterns',
                  },
                  challenges: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        name: { type: 'string', description: 'Challenge name (catchy and motivating)' },
                        description: { type: 'string', description: 'Brief description of the challenge' },
                        type: { 
                          type: 'string', 
                          enum: ['savings', 'no_spend', 'budget', 'reduce', 'streak'],
                          description: 'Type of challenge' 
                        },
                        target_value: { type: 'number', description: 'Target amount or percentage' },
                        duration_days: { type: 'number', description: 'Challenge duration in days' },
                        difficulty: { 
                          type: 'string', 
                          enum: ['easy', 'medium', 'hard'],
                          description: 'Difficulty level' 
                        },
                        category: { type: 'string', description: 'Spending category this challenge targets (if applicable)' },
                        reasoning: { type: 'string', description: 'Why this challenge is recommended for this user' },
                        potential_savings: { type: 'number', description: 'Estimated savings from completing this challenge' },
                      },
                      required: ['name', 'description', 'type', 'target_value', 'duration_days', 'difficulty', 'reasoning'],
                    },
                  },
                },
                required: ['summary', 'challenges'],
              },
            },
          },
        ],
        tool_choice: { type: 'function', function: { name: 'suggest_challenges' } },
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI credits exhausted. Please add funds.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const errorText = await aiResponse.text();
      console.error('AI Gateway error:', aiResponse.status, errorText);
      throw new Error('Failed to get AI recommendations');
    }

    const aiData = await aiResponse.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    
    if (!toolCall?.function?.arguments) {
      throw new Error('Invalid AI response format');
    }

    const recommendations = JSON.parse(toolCall.function.arguments);

    return new Response(
      JSON.stringify({
        success: true,
        recommendations,
        context: {
          analyzedPeriod: '30 days',
          totalTransactions: transactions.length,
          topCategory: topCategories[0]?.category || 'N/A',
        },
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
