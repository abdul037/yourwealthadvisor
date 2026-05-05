DROP POLICY IF EXISTS "Anyone can view comments" ON public.comments;

CREATE POLICY "Users can view comments on accessible posts"
ON public.comments
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.posts p
    WHERE p.id = comments.post_id
      AND (
        EXISTS (
          SELECT 1 FROM public.circles c
          WHERE c.id = p.circle_id
            AND (c.is_private = false OR c.created_by = auth.uid())
        )
        OR EXISTS (
          SELECT 1 FROM public.circle_memberships cm
          WHERE cm.circle_id = p.circle_id
            AND cm.user_id = auth.uid()
        )
      )
  )
);