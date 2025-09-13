-- Add cancellation fields to subscribers table
ALTER TABLE public.subscribers 
ADD COLUMN cancel_at_period_end BOOLEAN DEFAULT FALSE,
ADD COLUMN cancellation_date TIMESTAMP WITH TIME ZONE DEFAULT NULL,
ADD COLUMN cancelled_by_user BOOLEAN DEFAULT FALSE;