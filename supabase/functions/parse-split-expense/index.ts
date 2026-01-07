import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, memberNames, currency } = await req.json();

    if (!text || typeof text !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Text is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const systemPrompt = `You are a financial expense parser for group expense splitting. Parse user input into structured expense data.

Available group members: ${memberNames?.join(', ') || 'Unknown'}
Group currency: ${currency || 'USD'}

Parse the input text and extract:
1. description: What the expense is for (e.g., "Dinner", "Uber", "Groceries")
2. amount: The numeric amount (just the number, no currency symbol)
3. paid_by: The member name who paid (must match one of the available members, or null if not specified)
4. split_type: How to split - "equal" (default), "percentage", or "custom"
5. notes: Any additional context from the input

Examples:
- "Dinner 250 Ahmed paid" → description: "Dinner", amount: 250, paid_by: "Ahmed", split_type: "equal"
- "Uber 85" → description: "Uber", amount: 85, paid_by: null, split_type: "equal"
- "Groceries 320 split with Sara only" → description: "Groceries", amount: 320, paid_by: null, split_type: "custom", notes: "split with Sara only"
- "Netflix subscription 55" → description: "Netflix subscription", amount: 55, paid_by: null, split_type: "equal"`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: text }
        ],
        tools: [
          {
            type: 'function',
            function: {
              name: 'parse_expense',
              description: 'Parse expense text into structured data',
              parameters: {
                type: 'object',
                properties: {
                  description: { type: 'string', description: 'What the expense is for' },
                  amount: { type: 'number', description: 'The expense amount as a number' },
                  paid_by: { type: 'string', nullable: true, description: 'Name of member who paid, or null if not specified' },
                  split_type: { type: 'string', enum: ['equal', 'percentage', 'custom'], description: 'How to split the expense' },
                  notes: { type: 'string', nullable: true, description: 'Any additional context' }
                },
                required: ['description', 'amount', 'split_type'],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: 'function', function: { name: 'parse_expense' } }
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI credits exhausted. Please add funds.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const errorText = await response.text();
      console.error('AI API error:', response.status, errorText);
      throw new Error('Failed to parse expense');
    }

    const data = await response.json();
    console.log('AI Response:', JSON.stringify(data));

    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall || toolCall.function.name !== 'parse_expense') {
      throw new Error('Invalid AI response format');
    }

    const parsed = JSON.parse(toolCall.function.arguments);

    return new Response(
      JSON.stringify({ 
        success: true,
        data: {
          description: parsed.description || '',
          amount: parsed.amount || 0,
          paid_by: parsed.paid_by || null,
          split_type: parsed.split_type || 'equal',
          notes: parsed.notes || null
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: unknown) {
    console.error('Error in parse-split-expense:', error);
    const message = error instanceof Error ? error.message : 'Failed to parse expense';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
