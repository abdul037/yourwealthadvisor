-- Add notification_milestones column to track which milestone notifications have been sent
ALTER TABLE milestones 
ADD COLUMN notification_milestones jsonb DEFAULT '[]'::jsonb;