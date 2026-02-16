
-- Fix the overly permissive INSERT policy to require authentication
DROP POLICY IF EXISTS "Users can subscribe themselves" ON public.notification_subscribers;
CREATE POLICY "Authenticated users can subscribe"
ON public.notification_subscribers
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- Fix the overly permissive UPDATE policy  
DROP POLICY IF EXISTS "Users can update own subscription" ON public.notification_subscribers;
CREATE POLICY "Users can update own subscription"
ON public.notification_subscribers
FOR UPDATE
USING (auth.uid()::text = user_id::text);
