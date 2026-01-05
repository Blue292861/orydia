-- Drop view first (depends on other tables)
DROP VIEW IF EXISTS public.book_translation_status CASCADE;

-- Drop functions
DROP FUNCTION IF EXISTS public.check_and_create_budget_alert() CASCADE;
DROP FUNCTION IF EXISTS public.update_translation_budget_spent(NUMERIC) CASCADE;
DROP FUNCTION IF EXISTS public.get_current_month_budget() CASCADE;
DROP FUNCTION IF EXISTS public.update_translation_jobs_updated_at() CASCADE;

-- Drop tables (order matters due to foreign keys)
DROP TABLE IF EXISTS public.translation_alerts CASCADE;
DROP TABLE IF EXISTS public.translation_metrics CASCADE;
DROP TABLE IF EXISTS public.translation_budget CASCADE;
DROP TABLE IF EXISTS public.translation_jobs CASCADE;
DROP TABLE IF EXISTS public.chapter_translations CASCADE;