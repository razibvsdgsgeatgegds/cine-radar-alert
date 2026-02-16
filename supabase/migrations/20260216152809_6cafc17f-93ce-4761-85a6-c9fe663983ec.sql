
-- Create notification_subscribers table
CREATE TABLE public.notification_subscribers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  name TEXT,
  user_id UUID,
  subscribed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_active BOOLEAN NOT NULL DEFAULT true,
  notification_type TEXT NOT NULL DEFAULT 'all',
  UNIQUE(email)
);

-- Enable RLS
ALTER TABLE public.notification_subscribers ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can subscribe
CREATE POLICY "Users can subscribe themselves"
ON public.notification_subscribers
FOR INSERT
WITH CHECK (true);

-- Users can view their own subscription
CREATE POLICY "Users can view own subscription"
ON public.notification_subscribers
FOR SELECT
USING (true);

-- Users can update their own subscription
CREATE POLICY "Users can update own subscription"
ON public.notification_subscribers
FOR UPDATE
USING (auth.uid() = user_id OR user_id IS NULL);

-- Admins can view all for sending emails
CREATE POLICY "Admins can view all subscribers"
ON public.notification_subscribers
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));
