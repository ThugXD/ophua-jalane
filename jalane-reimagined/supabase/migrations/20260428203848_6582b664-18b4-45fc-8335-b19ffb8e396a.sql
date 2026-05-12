CREATE TABLE public.contact_exchanges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL DEFAULT '',
  company TEXT NOT NULL DEFAULT '',
  message TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_contact_exchanges_owner ON public.contact_exchanges(owner_id, created_at DESC);

ALTER TABLE public.contact_exchanges ENABLE ROW LEVEL SECURITY;

-- Anyone (including anonymous visitors) can submit a contact to a card owner
CREATE POLICY "Anyone can submit a contact exchange"
ON public.contact_exchanges
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Only the owner can see contacts shared with them
CREATE POLICY "Owners can view their received contacts"
ON public.contact_exchanges
FOR SELECT
TO authenticated
USING (auth.uid() = owner_id);

-- Only the owner can delete entries
CREATE POLICY "Owners can delete their received contacts"
ON public.contact_exchanges
FOR DELETE
TO authenticated
USING (auth.uid() = owner_id);