
-- Table to track site visits for live counter
CREATE TABLE public.site_visits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  visitor_id TEXT NOT NULL,
  visited_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  page TEXT DEFAULT '/'
);

-- Enable RLS
ALTER TABLE public.site_visits ENABLE ROW LEVEL SECURITY;

-- Anyone can insert a visit
CREATE POLICY "Anyone can log visits"
ON public.site_visits
FOR INSERT
WITH CHECK (true);

-- Anyone can read visit counts (for the counter)
CREATE POLICY "Anyone can read visit stats"
ON public.site_visits
FOR SELECT
USING (true);

-- Index for efficient counting
CREATE INDEX idx_site_visits_visited_at ON public.site_visits (visited_at);
CREATE INDEX idx_site_visits_visitor_id ON public.site_visits (visitor_id);
