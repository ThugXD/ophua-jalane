-- Create contact messages table for "Contact Us" form on login page
CREATE TABLE public.contact_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  message text NOT NULL,
  read boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- Anyone (anonymous + logged-in) can submit a contact message
CREATE POLICY "Anyone can submit a contact message"
ON public.contact_messages
FOR INSERT
TO anon, authenticated
WITH CHECK (
  length(trim(name)) > 0
  AND length(name) <= 100
  AND length(trim(message)) > 0
  AND length(message) <= 2000
);

-- Only superadmins can view contact messages
CREATE POLICY "Superadmins can view contact messages"
ON public.contact_messages
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'superadmin'::app_role));

-- Only superadmins can update (mark as read)
CREATE POLICY "Superadmins can update contact messages"
ON public.contact_messages
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'superadmin'::app_role))
WITH CHECK (has_role(auth.uid(), 'superadmin'::app_role));

-- Only superadmins can delete
CREATE POLICY "Superadmins can delete contact messages"
ON public.contact_messages
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'superadmin'::app_role));

CREATE INDEX idx_contact_messages_created_at ON public.contact_messages (created_at DESC);