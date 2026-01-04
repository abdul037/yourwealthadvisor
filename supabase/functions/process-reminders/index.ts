import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RecurringTransaction {
  id: string;
  user_id: string;
  type: string;
  category: string;
  amount: number;
  currency: string;
  description: string | null;
  next_due_date: string;
  reminder_days_before: number;
  frequency: string;
}

interface Milestone {
  id: string;
  user_id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  notification_milestones: number[];
}

interface Budget {
  id: string;
  user_id: string;
  category: string;
  allocated_amount: number;
  currency: string;
}

interface Transaction {
  user_id: string;
  category: string;
  amount: number;
  transaction_date: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    console.log(`[process-reminders] Starting reminder processing for ${todayStr}`);
    
    const results = {
      billReminders: 0,
      budgetAlerts: 0,
      goalMilestones: 0,
      errors: [] as string[],
    };

    // ==========================================
    // 1. BILL REMINDERS FROM RECURRING TRANSACTIONS
    // ==========================================
    
    const { data: recurringTransactions, error: rtError } = await supabase
      .from('recurring_transactions')
      .select('*')
      .eq('is_active', true);

    if (rtError) {
      console.error('[process-reminders] Error fetching recurring transactions:', rtError);
      results.errors.push(`Recurring transactions fetch error: ${rtError.message}`);
    } else {
      console.log(`[process-reminders] Found ${recurringTransactions?.length || 0} active recurring transactions`);
      
      for (const rt of (recurringTransactions || []) as RecurringTransaction[]) {
        const dueDate = new Date(rt.next_due_date);
        const reminderDate = new Date(dueDate);
        reminderDate.setDate(reminderDate.getDate() - (rt.reminder_days_before || 3));
        
        const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        
        // Check if we should send a reminder (within reminder window or overdue)
        if (today >= reminderDate && daysUntilDue <= (rt.reminder_days_before || 3)) {
          // Check if notification already exists for this due date
          const { data: existingNotif } = await supabase
            .from('notifications')
            .select('id')
            .eq('user_id', rt.user_id)
            .eq('related_id', rt.id)
            .eq('related_type', 'recurring_transaction')
            .gte('created_at', new Date(dueDate.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString())
            .single();

          if (!existingNotif) {
            let priority = 'normal';
            let title = '📅 Bill Reminder';
            let message = `${rt.description || rt.category} (${rt.amount} ${rt.currency}) is due in ${daysUntilDue} days`;

            if (daysUntilDue <= 0) {
              priority = 'urgent';
              title = '🚨 Bill Overdue!';
              message = `${rt.description || rt.category} (${rt.amount} ${rt.currency}) was due ${Math.abs(daysUntilDue)} days ago`;
            } else if (daysUntilDue === 1) {
              priority = 'high';
              title = '⚠️ Bill Due Tomorrow';
              message = `${rt.description || rt.category} (${rt.amount} ${rt.currency}) is due tomorrow`;
            }

            const { error: insertError } = await supabase
              .from('notifications')
              .insert({
                user_id: rt.user_id,
                type: 'bill_reminder',
                title,
                message,
                priority,
                related_id: rt.id,
                related_type: 'recurring_transaction',
                action_url: '/budget?tab=recurring',
              });

            if (insertError) {
              console.error(`[process-reminders] Error creating bill reminder for ${rt.id}:`, insertError);
              results.errors.push(`Bill reminder insert error: ${insertError.message}`);
            } else {
              results.billReminders++;
              console.log(`[process-reminders] Created bill reminder for ${rt.description || rt.category}`);
            }
          }
        }
      }
    }

    // ==========================================
    // 2. BUDGET THRESHOLD ALERTS
    // ==========================================
    
    const { data: budgets, error: budgetError } = await supabase
      .from('budgets')
      .select('*')
      .eq('is_active', true);

    if (budgetError) {
      console.error('[process-reminders] Error fetching budgets:', budgetError);
      results.errors.push(`Budgets fetch error: ${budgetError.message}`);
    } else {
      console.log(`[process-reminders] Found ${budgets?.length || 0} active budgets`);
      
      // Get current month's transactions
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
      const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];
      
      for (const budget of (budgets || []) as Budget[]) {
        // Get spending for this category this month
        const { data: transactions, error: txError } = await supabase
          .from('transactions')
          .select('amount')
          .eq('user_id', budget.user_id)
          .eq('category', budget.category)
          .eq('type', 'expense')
          .gte('transaction_date', startOfMonth)
          .lte('transaction_date', endOfMonth);

        if (txError) {
          console.error(`[process-reminders] Error fetching transactions for budget ${budget.id}:`, txError);
          continue;
        }

        const totalSpent = (transactions || []).reduce((sum, t) => sum + Number(t.amount), 0);
        const percentage = (totalSpent / Number(budget.allocated_amount)) * 100;
        
        // Check thresholds: 50, 75, 90, 100
        const thresholds = [
          { value: 100, priority: 'urgent', title: '🚨 Budget Exceeded!', emoji: '🚨' },
          { value: 90, priority: 'high', title: '⚠️ Budget Critical!', emoji: '⚠️' },
          { value: 75, priority: 'normal', title: '⚡ Budget Warning', emoji: '⚡' },
          { value: 50, priority: 'low', title: '📊 Budget Update', emoji: '📊' },
        ];

        for (const threshold of thresholds) {
          if (percentage >= threshold.value) {
            // Check if notification already exists for this threshold this month
            const notificationKey = `${budget.category}-${threshold.value}-${today.getMonth()}-${today.getFullYear()}`;
            
            const { data: existingNotif } = await supabase
              .from('notifications')
              .select('id')
              .eq('user_id', budget.user_id)
              .eq('related_id', budget.id)
              .eq('related_type', `budget_${threshold.value}`)
              .gte('created_at', startOfMonth)
              .single();

            if (!existingNotif) {
              const message = threshold.value === 100
                ? `${budget.category} has exceeded the budget! Spent ${totalSpent.toFixed(0)} ${budget.currency} of ${Number(budget.allocated_amount).toFixed(0)} ${budget.currency}`
                : `${budget.category} has reached ${threshold.value}% of budget. ${(Number(budget.allocated_amount) - totalSpent).toFixed(0)} ${budget.currency} remaining.`;

              const { error: insertError } = await supabase
                .from('notifications')
                .insert({
                  user_id: budget.user_id,
                  type: 'budget_alert',
                  title: threshold.title,
                  message,
                  priority: threshold.priority,
                  related_id: budget.id,
                  related_type: `budget_${threshold.value}`,
                  action_url: '/budget',
                });

              if (insertError) {
                console.error(`[process-reminders] Error creating budget alert for ${budget.category}:`, insertError);
                results.errors.push(`Budget alert insert error: ${insertError.message}`);
              } else {
                results.budgetAlerts++;
                console.log(`[process-reminders] Created budget alert for ${budget.category} at ${threshold.value}%`);
              }
            }
            break; // Only create notification for highest threshold met
          }
        }
      }
    }

    // ==========================================
    // 3. SAVINGS GOAL MILESTONES
    // ==========================================
    
    const { data: milestones, error: milestoneError } = await supabase
      .from('milestones')
      .select('*')
      .eq('is_achieved', false);

    if (milestoneError) {
      console.error('[process-reminders] Error fetching milestones:', milestoneError);
      results.errors.push(`Milestones fetch error: ${milestoneError.message}`);
    } else {
      console.log(`[process-reminders] Found ${milestones?.length || 0} active milestones`);
      
      const milestoneThresholds = [25, 50, 75, 100];
      
      for (const milestone of (milestones || []) as Milestone[]) {
        const percentage = (Number(milestone.current_amount) / Number(milestone.target_amount)) * 100;
        const notifiedMilestones: number[] = milestone.notification_milestones || [];
        
        for (const threshold of milestoneThresholds) {
          if (percentage >= threshold && !notifiedMilestones.includes(threshold)) {
            let title = `🎯 Goal Progress: ${threshold}%`;
            let priority = 'normal';
            
            if (threshold === 100) {
              title = '🎉 Goal Achieved!';
              priority = 'high';
            } else if (threshold === 75) {
              title = '🚀 Almost There!';
            }

            const message = threshold === 100
              ? `Congratulations! You've reached your "${milestone.name}" goal!`
              : `You've reached ${threshold}% of your "${milestone.name}" goal!`;

            const { error: insertError } = await supabase
              .from('notifications')
              .insert({
                user_id: milestone.user_id,
                type: 'goal_milestone',
                title,
                message,
                priority,
                related_id: milestone.id,
                related_type: 'milestone',
                action_url: '/savings',
              });

            if (insertError) {
              console.error(`[process-reminders] Error creating goal notification for ${milestone.name}:`, insertError);
              results.errors.push(`Goal notification insert error: ${insertError.message}`);
            } else {
              // Update the milestone to track that this notification was sent
              const updatedMilestones = [...notifiedMilestones, threshold];
              await supabase
                .from('milestones')
                .update({ notification_milestones: updatedMilestones })
                .eq('id', milestone.id);
              
              results.goalMilestones++;
              console.log(`[process-reminders] Created goal milestone notification for ${milestone.name} at ${threshold}%`);
            }
          }
        }
      }
    }

    console.log(`[process-reminders] Completed: ${results.billReminders} bill reminders, ${results.budgetAlerts} budget alerts, ${results.goalMilestones} goal milestones`);

    return new Response(
      JSON.stringify({
        success: true,
        processed: todayStr,
        results,
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('[process-reminders] Unexpected error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
