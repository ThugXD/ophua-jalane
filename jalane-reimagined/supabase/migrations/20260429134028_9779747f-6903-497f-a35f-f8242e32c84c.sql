
CREATE POLICY "Superadmins and group admins manage covers"
ON storage.objects FOR ALL
TO authenticated
USING (
  bucket_id = 'covers' AND (
    public.has_role(auth.uid(), 'superadmin') OR
    EXISTS (SELECT 1 FROM public.groups WHERE admin_id = auth.uid())
  )
)
WITH CHECK (
  bucket_id = 'covers' AND (
    public.has_role(auth.uid(), 'superadmin') OR
    EXISTS (SELECT 1 FROM public.groups WHERE admin_id = auth.uid())
  )
);
