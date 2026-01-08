-- Function to update challenge progress based on transactions
CREATE OR REPLACE FUNCTION public.update_challenge_progress()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  challenge_record RECORD;
  new_progress NUMERIC;
  challenge_start DATE;
  challenge_end DATE;
  user_id_val UUID;
  total_expenses NUMERIC;
  total_income NUMERIC;
  no_spend_days INTEGER;
BEGIN
  -- Determine which user's progress to update
  IF TG_OP = 'DELETE' THEN
    user_id_val := OLD.user_id;
  ELSE
    user_id_val := NEW.user_id;
  END IF;

  -- Loop through all active challenges the user is participating in
  FOR challenge_record IN 
    SELECT c.*, cp.id as participant_id
    FROM challenges c
    JOIN challenge_participants cp ON cp.challenge_id = c.id
    WHERE cp.user_id = user_id_val
    AND c.is_active = true
    AND c.end_date >= CURRENT_DATE
  LOOP
    challenge_start := challenge_record.start_date::DATE;
    challenge_end := LEAST(challenge_record.end_date::DATE, CURRENT_DATE);
    new_progress := 0;
    
    -- Calculate progress based on challenge type
    IF challenge_record.challenge_type = 'savings' THEN
      -- Total savings = income - expenses during challenge period
      SELECT COALESCE(SUM(amount), 0) INTO total_income
      FROM transactions 
      WHERE user_id = user_id_val 
      AND type = 'income'
      AND date >= challenge_start 
      AND date <= challenge_end;
      
      SELECT COALESCE(SUM(amount), 0) INTO total_expenses
      FROM transactions 
      WHERE user_id = user_id_val 
      AND type = 'expense'
      AND date >= challenge_start 
      AND date <= challenge_end;
      
      new_progress := GREATEST(0, total_income - total_expenses);
      
    ELSIF challenge_record.challenge_type = 'no_spend' THEN
      -- Count days without any expenses
      SELECT COUNT(*)::INTEGER INTO no_spend_days
      FROM generate_series(challenge_start, challenge_end, '1 day'::interval) d(day)
      WHERE NOT EXISTS (
        SELECT 1 FROM transactions 
        WHERE user_id = user_id_val 
        AND type = 'expense'
        AND date::DATE = d.day::DATE
      );
      new_progress := no_spend_days;
      
    ELSIF challenge_record.challenge_type = 'budget' THEN
      -- Calculate percentage of budget remaining (higher = better)
      SELECT COALESCE(SUM(amount), 0) INTO total_expenses
      FROM transactions
      WHERE user_id = user_id_val
      AND type = 'expense'
      AND date >= challenge_start
      AND date <= challenge_end;
      
      IF challenge_record.target_value > 0 THEN
        -- Progress = how much saved vs target (can exceed 100%)
        new_progress := GREATEST(0, challenge_record.target_value - total_expenses);
      END IF;
      
    ELSIF challenge_record.challenge_type = 'streak' THEN
      -- Count current consecutive days with activity
      WITH daily_activity AS (
        SELECT DISTINCT date::DATE as activity_date
        FROM transactions
        WHERE user_id = user_id_val
        AND date >= challenge_start
        AND date <= challenge_end
      ),
      numbered_days AS (
        SELECT activity_date,
               activity_date - (ROW_NUMBER() OVER (ORDER BY activity_date))::INTEGER as grp
        FROM daily_activity
      ),
      streaks AS (
        SELECT grp, COUNT(*) as streak_length, MAX(activity_date) as last_date
        FROM numbered_days
        GROUP BY grp
      )
      SELECT COALESCE(streak_length, 0) INTO new_progress
      FROM streaks
      WHERE last_date = challenge_end
      LIMIT 1;
      
      IF new_progress IS NULL THEN
        new_progress := 0;
      END IF;
    END IF;
    
    -- Update the participant's progress
    UPDATE challenge_participants
    SET progress = COALESCE(new_progress, 0)
    WHERE id = challenge_record.participant_id;
    
  END LOOP;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Create trigger on transactions table
DROP TRIGGER IF EXISTS update_challenge_progress_trigger ON public.transactions;
CREATE TRIGGER update_challenge_progress_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.transactions
FOR EACH ROW
EXECUTE FUNCTION public.update_challenge_progress();