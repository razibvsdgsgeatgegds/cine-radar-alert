-- Step 1: Create app_role enum for role management
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Step 2: Create user_roles table to store user roles separately
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  role public.app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Step 3: Create security definer function to check roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Step 4: Add RLS policies for user_roles table
-- Only admins can manage roles
CREATE POLICY "Admins can view all roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert roles"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update roles"
ON public.user_roles
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete roles"
ON public.user_roles
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Step 5: Add column constraints to feedback table for input validation
ALTER TABLE public.feedback
ADD CONSTRAINT feedback_name_length CHECK (char_length(name) <= 100),
ADD CONSTRAINT feedback_email_length CHECK (char_length(email) <= 255),
ADD CONSTRAINT feedback_message_length CHECK (char_length(message) <= 2000);

-- Step 6: Add SELECT policy to feedback - only admins can read customer data
CREATE POLICY "Only admins can read feedback"
ON public.feedback
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Step 7: Add explicit DENY policies for UPDATE and DELETE on feedback
CREATE POLICY "No one can update feedback"
ON public.feedback
FOR UPDATE
TO authenticated
USING (false);

CREATE POLICY "No one can delete feedback"
ON public.feedback
FOR DELETE
TO authenticated
USING (false);

-- Step 8: Create trigger to auto-update updated_at on user_roles
CREATE TRIGGER update_user_roles_updated_at
BEFORE UPDATE ON public.user_roles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();