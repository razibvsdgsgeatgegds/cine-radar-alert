
-- Add unique constraint on email for upsert to work
ALTER TABLE public.notification_subscribers ADD CONSTRAINT notification_subscribers_email_unique UNIQUE (email);

-- Drop the restrictive INSERT policy
DROP POLICY IF EXISTS "Authenticated users can subscribe" ON public.notification_subscribers;

-- Allow anyone (even anonymous) to subscribe
CREATE POLICY "Anyone can subscribe"
ON public.notification_subscribers
FOR INSERT
WITH CHECK (true);

-- Fix the SELECT policy that exposes all data
DROP POLICY IF EXISTS "Users can view own subscription" ON public.notification_subscribers;

CREATE POLICY "Users can view own subscription"
ON public.notification_subscribers
FOR SELECT
USING (auth.uid()::text = user_id::text);
