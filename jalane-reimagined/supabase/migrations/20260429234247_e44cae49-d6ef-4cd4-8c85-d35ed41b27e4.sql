ALTER TABLE public.contact_messages
  ADD COLUMN IF NOT EXISTS email text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS phone text NOT NULL DEFAULT '';

DROP POLICY IF EXISTS "Anyone can submit a contact message" ON public.contact_messages;

CREATE POLICY "Anyone can submit a contact message"
ON public.contact_messages
FOR INSERT
TO anon, authenticated
WITH CHECK (
  length(trim(name)) > 0 AND length(name) <= 100
  AND length(trim(message)) > 0 AND length(message) <= 2000
  AND length(email) <= 255
  AND length(phone) <= 50
);