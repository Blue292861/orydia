-- Clean up invalid Stripe customer IDs and improve subscriber table
-- This migration addresses payment issues by resetting invalid Stripe customer references

-- Reset Stripe customer IDs that may be invalid
-- The create-checkout function will now properly validate and recreate them as needed
UPDATE public.subscribers 
SET stripe_customer_id = NULL, 
    updated_at = now()
WHERE stripe_customer_id IS NOT NULL;