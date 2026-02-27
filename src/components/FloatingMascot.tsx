import { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { X, Send, ChevronRight } from 'lucide-react';
import { NaylaMascot, MascotState } from '@/components/NaylaMascot';
import { useOnboardingTour } from '@/hooks/useOnboardingTour';
import { useOnboardingProgress, OnboardingProgress } from '@/hooks/useOnboardingProgress';
import { useUserProfile } from '@/hooks/useUserProfile';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

// ─── Financial context builder ────────────────────────────────────────────────
async function buildFinancialContext(userId: string): Promise<string> {
  const now = new Date();
  const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
  const monthEnd   = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    .toISOString().split('T')[0];

  const [txRes, assetRes, debtRes, goalRes] = await Promise.all([
    supabase
      .from('transactions')
      .select('type, amount, category, description, transaction_date')
      .eq('user_id', userId)
      .gte('transaction_date', monthStart)
      .lte('transaction_date', monthEnd)
      .order('transaction_date', { ascending: false }),
    supabase
      .from('assets')
      .select('name, category, amount, currency')
      .eq('user_id', userId)
      .eq('is_active', true),
    supabase
      .from('debts')
      .select('name, type, current_balance, currency')
      .eq('user_id', userId)
      .eq('is_active', true),
    supabase
      .from('milestones')
      .select('name, target_amount, current_amount, target_date, is_achieved')
      .eq('user_id', userId)
      .eq('is_achieved', false),
  ]);

  const transactions = txRes.data ?? [];
  const assets       = assetRes.data ?? [];
  const debts        = debtRes.data ?? [];
  const goals        = goalRes.data ?? [];

  // Monthly totals
  const monthlyIncome  = transactions
    .filter(t => t.type === 'income')
    .reduce((s, t) => s + t.amount, 0);
  const monthlyExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((s, t) => s + t.amount, 0);

  // Top 3 spending categories this month
  const catMap: Record<string, number> = {};
  transactions.filter(t => t.type === 'expense').forEach(t => {
    catMap[t.category] = (catMap[t.category] ?? 0) + t.amount;
  });
  const topCategories = Object.entries(catMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([cat, amt]) => `${cat} (${amt.toFixed(0)} AED)`);

  // Net worth
  const totalAssets = assets.reduce((s, a) => s + a.amount, 0);
  const totalDebts  = debts.reduce((s, d) => s + d.current_balance, 0);
  const netWorth    = totalAssets - totalDebts;

  // Recent transactions (last 5)
  const recent = transactions.slice(0, 5).map(t =>
    `${t.transaction_date} ${t.type === 'income' ? '+' : '-'}${t.amount} AED (${t.category}${t.description ? ': ' + t.description : ''})`
  );

  const lines: string[] = [
    `=== USER FINANCIAL SNAPSHOT (${now.toLocaleString('en-AE', { month: 'long', year: 'numeric' })}) ===`,
    `Net Worth: ${netWorth.toFixed(0)} AED (Assets ${totalAssets.toFixed(0)} − Debts ${totalDebts.toFixed(0)})`,
    `This month income: ${monthlyIncome.toFixed(0)} AED`,
    `This month expenses: ${monthlyExpense.toFixed(0)} AED`,
    `Net this month: ${(monthlyIncome - monthlyExpense).toFixed(0)} AED`,
  ];

  if (topCategories.length)
    lines.push(`Top spending categories: ${topCategories.join(', ')}`);

  if (assets.length) {
    const assetLines = assets.map(a => `${a.name} (${a.category}): ${a.amount.toFixed(0)} ${a.currency}`);
    lines.push(`Assets: ${assetLines.join(' | ')}`);
  }

  if (debts.length) {
    const debtLines = debts.map(d => `${d.name} (${d.type}): ${d.current_balance.toFixed(0)} ${d.currency}`);
    lines.push(`Active debts: ${debtLines.join(' | ')}`);
  }

  if (goals.length) {
    const goalLines = goals.map(g => {
      const pct = g.target_amount > 0
        ? Math.round(((g.current_amount ?? 0) / g.target_amount) * 100)
        : 0;
      return `${g.name}: ${(g.current_amount ?? 0).toFixed(0)}/${g.target_amount.toFixed(0)} AED (${pct}%)${g.target_date ? ' by ' + g.target_date : ''}`;
    });
    lines.push(`Savings goals: ${goalLines.join(' | ')}`);
  }

  if (recent.length)
    lines.push(`Recent transactions: ${recent.join('; ')}`);

  lines.push('=== END SNAPSHOT ===');
  return lines.join('\n');
}

// ─── Page-specific context ─────────────────────────────────────────────────────
const PAGE_GREETINGS: Record<string, string> = {
  '/':            "Your financial command center! 🎯 What can I help with today?",
  '/income':      "Income tracking keeps your net worth accurate! 💰",
  '/expenses':    "Understanding spending is the first step to saving more! 🧾",
  '/budget':      "Budgeting is a superpower — let me help! 📊",
  '/savings':     "Every goal starts with a plan. Let's build yours! 🎯",
  '/investments': "Smart investing = long-term freedom. 📈",
  '/debt':        "Debt-free is a superpower — let's plan your path! 🏦",
  '/trends':      "Data tells the story of your financial journey! 📊",
  '/split':       "No more awkward money talks with friends! 👥",
  '/ai-tools':    "AI-powered insights, just for you! ✨",
};

const PAGE_SUGGESTIONS: Record<string, string[]> = {
  '/':            ['What is net worth?', 'Add a transaction', 'Set a savings goal', 'Start the tour'],
  '/income':      ['How to add income?', 'Set up recurring income', 'What income types exist?'],
  '/expenses':    ['How to categorize expenses?', 'What is my top spending category?', 'Set a spending limit'],
  '/budget':      ['Explain 50/30/20 rule', 'How to set a budget?', 'What is budget variance?'],
  '/savings':     ['How much should I save?', 'Emergency fund tips', 'Create a savings goal'],
  '/investments': ['Explain diversification', 'How to track crypto?', 'What is my portfolio value?'],
  '/debt':        ['Snowball vs avalanche method', 'How to pay off debt faster?', 'What is my debt ratio?'],
  '/trends':      ['Explain the trend charts', 'What do spending patterns show?', 'Best time to review finances'],
  '/split':       ['How do group splits work?', 'Create a group expense', 'Invite someone to a group'],
  '/ai-tools':    ['What can AI Tools do?', 'How is my financial health?', 'Give me a tip'],
};

const DEFAULT_SUGGESTIONS = ['What is net worth?', 'Budgeting tips', 'Start the tour'];

// ─── Tip when chat is closed ───────────────────────────────────────────────────
function getHoverTip(progress: OnboardingProgress, path: string): string {
  if (!progress.income_added && !progress.expense_added)
    return "Add your first income or expense to get started! 💡";
  if (!progress.budget_created)
    return "Set a monthly budget to track where your money goes. 📊";
  if (!progress.goal_created)
    return "Create a savings goal — small milestones keep you motivated! 🎯";
  const tips: Record<string, string> = {
    '/':            "Your net worth updates as you add data. Keep logging! 💎",
    '/expenses':    "Categorizing expenses reveals your biggest spending habits. 🧾",
    '/budget':      "Compare actual vs planned spending to stay on track! 📊",
    '/savings':     "Even saving 5% of income makes a big long-term difference! 🌱",
    '/investments': "Diversification reduces risk across your portfolio. 📈",
    '/debt':        "Paying extra on high-interest debt first saves the most. 💪",
  };
  return tips[path] ?? "Click me to ask anything about your finances! 😊";
}

// ─── Types ─────────────────────────────────────────────────────────────────────
interface ChatMessage {
  id: number;
  from: 'user' | 'nayla';
  text: string;
  path?: string;  // navigable link
}

let msgId = 0;

// ─── Component ─────────────────────────────────────────────────────────────────
export function FloatingMascot() {
  const { isActive: tourActive } = useOnboardingTour();
  const { progress } = useOnboardingProgress();
  const { user } = useUserProfile();
  const location = useLocation();
  const navigate = useNavigate();

  const [chatOpen, setChatOpen]             = useState(false);
  const [hovered, setHovered]               = useState(false);
  const [mascotState, setMascotState]       = useState<MascotState>('waving');
  const [input, setInput]                   = useState('');
  const [thinking, setThinking]             = useState(false);
  const [messages, setMessages]             = useState<ChatMessage[]>([]);
  const [financialContext, setFinancialContext] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef       = useRef<HTMLInputElement>(null);

  // Pre-fetch financial context as soon as we have a user (runs once)
  const fetchFinancialContext = useCallback(async () => {
    if (!user?.id) return;
    try {
      const ctx = await buildFinancialContext(user.id);
      setFinancialContext(ctx);
    } catch {
      // Non-critical — mascot still works without it
    }
  }, [user?.id]);

  useEffect(() => {
    fetchFinancialContext();
  }, [fetchFinancialContext]);

  // Initial wave greeting → idle after 2.5 s
  useEffect(() => {
    const timer = setTimeout(() => setMascotState('idle'), 2500);
    return () => clearTimeout(timer);
  }, []);

  // Scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Seed greeting when chat opens
  useEffect(() => {
    if (!chatOpen) return;
    const page    = location.pathname;
    const greeting = PAGE_GREETINGS[page] ?? "Hi! How can I help with your finances? 😊";
    setMessages([{ id: ++msgId, from: 'nayla', text: greeting }]);
    setMascotState('talking');
    inputRef.current?.focus();
  }, [chatOpen, location.pathname]);

  // When chat closes, reset mascot
  useEffect(() => {
    if (!chatOpen) setMascotState('idle');
  }, [chatOpen]);

  const handleSend = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || thinking) return;
    setInput('');

    setMessages(prev => [...prev, { id: ++msgId, from: 'user', text: trimmed }]);
    setMascotState('thinking');
    setThinking(true);

    // Build conversation history for the AI (skip the initial greeting at index 0)
    const apiMessages = [
      ...messages.slice(1).map(m => ({
        role: m.from === 'user' ? 'user' as const : 'assistant' as const,
        content: m.text,
      })),
      { role: 'user' as const, content: trimmed },
    ];

    try {
      const { data, error } = await supabase.functions.invoke('mascot-chat', {
        body: { messages: apiMessages, page: location.pathname, financialContext },
      });
      if (error) throw error;
      setMessages(prev => [...prev, { id: ++msgId, from: 'nayla', text: data.reply, path: data.path }]);
      setMascotState('talking');
    } catch {
      setMessages(prev => [...prev, {
        id: ++msgId, from: 'nayla',
        text: "Oops, something went wrong! Try asking me again. 😊",
      }]);
      setMascotState('idle');
    } finally {
      setThinking(false);
    }
  };

  const handleNavigate = (path: string) => {
    navigate(path);
    setChatOpen(false);
  };

  const page        = location.pathname;
  const suggestions = PAGE_SUGGESTIONS[page] ?? DEFAULT_SUGGESTIONS;
  const hoverTip    = getHoverTip(progress, page);

  // Floating mascot state (when chat is closed)
  const floatState: MascotState = chatOpen ? mascotState : hovered ? 'talking' : mascotState;

  // Hide when tour is running (tour has its own mascot)
  if (tourActive) return null;

  return (
    <>
      {/* ── Chat panel ──────────────────────────────────────────────── */}
      {chatOpen && (
        <div
          className="fixed bottom-24 right-4 md:bottom-28 md:right-6 z-50 w-72 sm:w-80 flex flex-col bg-card border border-border/80 rounded-2xl shadow-2xl overflow-hidden"
          style={{ animation: 'mascot-enter 0.2s ease-out forwards', maxHeight: '70vh' }}
        >
          {/* Header */}
          <div className="flex items-center gap-2.5 px-4 py-3 border-b border-border/50 bg-muted/30 flex-shrink-0">
            <NaylaMascot state={mascotState} size="sm" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold leading-none">Nayla</p>
              <p className={cn("text-xs mt-0.5", thinking ? "text-amber-400" : "text-wealth-positive")}>
                {thinking ? "thinking..." : "● Online"}
              </p>
            </div>
            <button
              onClick={() => setChatOpen(false)}
              className="text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2.5" style={{ minHeight: 160 }}>
            {messages.map(msg => (
              <div
                key={msg.id}
                className={cn('flex', msg.from === 'user' ? 'justify-end' : 'justify-start')}
              >
                <div
                  className={cn(
                    'rounded-2xl px-3 py-2 text-xs leading-relaxed max-w-[82%]',
                    msg.from === 'user'
                      ? 'bg-primary text-primary-foreground rounded-br-none'
                      : 'bg-muted rounded-bl-none',
                  )}
                >
                  {msg.text}
                  {msg.path && (
                    <button
                      onClick={() => handleNavigate(msg.path!)}
                      className="flex items-center gap-1 mt-1.5 text-primary font-medium hover:underline"
                    >
                      Take me there <ChevronRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            ))}
            {/* Typing indicator */}
            {thinking && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-2xl rounded-bl-none px-4 py-2.5 flex gap-1 items-center">
                  {[0, 1, 2].map(i => (
                    <span
                      key={i}
                      className="w-1.5 h-1.5 rounded-full bg-muted-foreground"
                      style={{ animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite` }}
                    />
                  ))}
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick suggestions */}
          <div className="px-3 pt-2 pb-1 flex flex-wrap gap-1.5 border-t border-border/50 flex-shrink-0">
            {suggestions.slice(0, 3).map(s => (
              <button
                key={s}
                onClick={() => handleSend(s)}
                className="text-[11px] px-2.5 py-1 bg-muted hover:bg-primary/10 hover:text-primary rounded-full transition-colors border border-border/50"
              >
                {s}
              </button>
            ))}
          </div>

          {/* Input */}
          <div className="flex items-center gap-2 px-3 py-2.5 border-t border-border/50 flex-shrink-0">
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(input); } }}
              placeholder="Ask Nayla anything..."
              className="flex-1 text-xs bg-muted rounded-lg px-3 py-2 outline-none placeholder:text-muted-foreground focus:ring-1 focus:ring-primary/50"
            />
            <button
              onClick={() => handleSend(input)}
              disabled={!input.trim() || thinking}
              className="text-primary disabled:opacity-40 hover:text-primary/80 transition-colors"
              aria-label="Send"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ── Floating mascot button ──────────────────────────────────── */}
      <div
        className="fixed z-50 bottom-20 right-16 md:bottom-20 md:right-6"
        onMouseEnter={() => { if (!chatOpen) setHovered(true); }}
        onMouseLeave={() => setHovered(false)}
      >
        {/* Hover tip bubble (shows when not in chat) */}
        {hovered && !chatOpen && (
          <div className="absolute bottom-full mb-3 right-0 w-52 bg-card border border-border/80 rounded-2xl rounded-br-none shadow-lg px-3 py-2.5"
            style={{ animation: 'mascot-enter 0.15s ease-out forwards' }}>
            <p className="text-xs text-muted-foreground leading-relaxed">{hoverTip}</p>
            <p className="text-[11px] text-primary mt-1 font-medium">Click to chat →</p>
          </div>
        )}

        {/* The mascot itself */}
        <button
          onClick={() => { setChatOpen(v => !v); setHovered(false); }}
          aria-label={chatOpen ? 'Close Nayla' : 'Chat with Nayla'}
          className="relative focus:outline-none group"
        >
          <NaylaMascot
            state={floatState}
            size="sm"
            className="drop-shadow-lg transition-transform group-hover:scale-105"
          />
          {/* Unread badge when chat is closed and new tip is ready */}
          {!chatOpen && (
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-primary rounded-full ring-2 ring-background flex items-center justify-center">
              <span className="text-[8px] text-primary-foreground font-bold">?</span>
            </span>
          )}
        </button>
      </div>
    </>
  );
}
