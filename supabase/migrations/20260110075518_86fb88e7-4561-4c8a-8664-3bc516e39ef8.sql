-- Create linked_accounts table for persisting bank connections with opening balances
CREATE TABLE public.linked_accounts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  platform_id TEXT NOT NULL,
  platform_name TEXT NOT NULL,
  platform_logo TEXT,
  account_number TEXT,
  account_type TEXT NOT NULL DEFAULT 'current',
  opening_balance NUMERIC NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'AED',
  last_synced TIMESTAMP WITH TIME ZONE DEFAULT now(),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.linked_accounts ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own linked accounts" 
ON public.linked_accounts 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own linked accounts" 
ON public.linked_accounts 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own linked accounts" 
ON public.linked_accounts 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own linked accounts" 
ON public.linked_accounts 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_linked_accounts_updated_at
BEFORE UPDATE ON public.linked_accounts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();