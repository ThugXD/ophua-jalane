DROP POLICY IF EXISTS "Anyone can submit a contact exchange" ON public.contact_exchanges;

CREATE POLICY "Anyone can submit a contact exchange to a real profile"
ON public.contact_exchanges
FOR INSERT
TO anon, authenticated
WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = owner_id)
);