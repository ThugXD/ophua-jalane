-- Ensure each user can administer only one group
CREATE UNIQUE INDEX IF NOT EXISTS groups_admin_id_unique
  ON public.groups (admin_id)
  WHERE admin_id IS NOT NULL;

-- Allow group admins to update their own group
CREATE POLICY "Group admins can update their group"
ON public.groups
FOR UPDATE
TO authenticated
USING (admin_id = auth.uid())
WITH CHECK (admin_id = auth.uid());